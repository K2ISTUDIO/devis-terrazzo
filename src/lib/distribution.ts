import { createServiceClient } from './supabase/server'
import { sendLeadToArtisan, sendLowBalanceAlert } from './emails'
import { sendSMS } from './twilio'
import type { Lead, Artisan } from './types'
import { BUDGET_LABELS, DELAI_LABELS, PIECE_LABELS } from './utils'

const FORMULE_MAX_SHARES: Record<string, number> = {
  exclusif: 1,
  pro: 2,
  starter: 3,
}

const FORMULE_PRIORITY: Record<string, number> = {
  exclusif: 1,
  pro: 2,
  starter: 3,
}

export interface DistributionResult {
  count: number
  artisanIds: string[]
}

export async function distributeLeadToArtisans(leadId: string): Promise<DistributionResult> {
  const supabase = createServiceClient()

  // 1. Récupérer le lead
  const { data: lead, error: leadError } = await supabase
    .from('leads')
    .select('*')
    .eq('id', leadId)
    .single()

  if (leadError || !lead) {
    throw new Error(`Lead introuvable: ${leadId}`)
  }

  // Extraire le département (2 premiers chiffres du CP)
  const departement = lead.code_postal.slice(0, 2)

  // Log: début distribution
  await supabase.from('distribution_logs').insert({
    lead_id: leadId,
    action: 'distribution_start',
    details: { departement, lead_statut: lead.statut },
  })

  // 2. Trouver les artisans éligibles
  const { data: artisans, error: artisansError } = await supabase
    .from('artisans')
    .select('*')
    .eq('actif', true)
    .gt('solde_leads', 0)
    .contains('departements', [departement])

  if (artisansError) {
    await logError(supabase, leadId, null, 'fetch_artisans', artisansError.message)
    throw new Error('Erreur lors de la récupération des artisans')
  }

  if (!artisans || artisans.length === 0) {
    await supabase.from('distribution_logs').insert({
      lead_id: leadId,
      action: 'no_eligible_artisans',
      details: { departement },
      success: true,
    })
    return { count: 0, artisanIds: [] }
  }

  // 3. Trier par priorité formule (exclusif > pro > starter)
  const sorted = [...artisans].sort(
    (a, b) => FORMULE_PRIORITY[a.formule] - FORMULE_PRIORITY[b.formule]
  )

  // 4. Sélectionner les artisans selon les règles
  const selected: Artisan[] = []
  const formuleCount: Record<string, number> = { exclusif: 0, pro: 0, starter: 0 }

  for (const artisan of sorted) {
    const formule = artisan.formule
    const maxForFormule = FORMULE_MAX_SHARES[formule]

    // Compte les artisans déjà sélectionnés pour cette formule ou avec priorité plus haute
    const alreadySelected = selected.length

    // Règle globale: le total ne peut dépasser le max de la formule la plus restrictive parmi les sélectionnés
    // En pratique: exclusif = 1 total, pro = 2 total, starter = 3 total
    const globalMax = selected.length === 0
      ? maxForFormule
      : Math.min(FORMULE_MAX_SHARES[selected[0].formule], maxForFormule)

    if (alreadySelected >= globalMax) break

    selected.push(artisan)
  }

  if (selected.length === 0) {
    return { count: 0, artisanIds: [] }
  }

  // 5. Attribuer le lead à chaque artisan sélectionné
  const artisanIds: string[] = []

  for (const artisan of selected) {
    try {
      // Décrémenter le solde atomiquement
      const { data: newSolde } = await supabase.rpc('decrement_solde', {
        artisan_uuid: artisan.id,
      })

      if (newSolde === -1) {
        // Solde épuisé entre-temps (race condition)
        await logError(supabase, leadId, artisan.id, 'solde_zero', 'Solde épuisé')
        continue
      }

      // Snapshot du lead (avec téléphone — visible artisan seulement)
      const leadSnapshot = {
        prenom: lead.prenom,
        nom: lead.nom,
        email: lead.email,
        telephone: lead.telephone,
        ville: lead.ville,
        code_postal: lead.code_postal,
        surface: lead.surface,
        type_piece: lead.type_piece,
        budget: lead.budget,
        delai: lead.delai,
        message: lead.message,
      }

      // Créer l'attribution
      await supabase.from('lead_attributions').insert({
        lead_id: leadId,
        artisan_id: artisan.id,
        statut_artisan: 'nouveau',
        lead_snapshot: leadSnapshot,
      })

      artisanIds.push(artisan.id)

      // 6. Notifications
      await Promise.allSettled([
        sendLeadToArtisan(artisan, lead),
        sendLeadSMSToArtisan(artisan, lead),
      ])

      // Alerte solde faible
      if (newSolde < 3 && newSolde > 0) {
        sendLowBalanceAlert(artisan, newSolde).catch(console.error)
      }

      // Log succès
      await supabase.from('distribution_logs').insert({
        lead_id: leadId,
        artisan_id: artisan.id,
        action: 'lead_attributed',
        details: { formule: artisan.formule, solde_after: newSolde },
        success: true,
      })
    } catch (err) {
      await logError(supabase, leadId, artisan.id, 'attribution_error',
        err instanceof Error ? err.message : 'Unknown error')
    }
  }

  // 7. Mettre à jour le statut du lead
  if (artisanIds.length > 0) {
    await supabase
      .from('leads')
      .update({ statut: 'distribue' })
      .eq('id', leadId)
  }

  await supabase.from('distribution_logs').insert({
    lead_id: leadId,
    action: 'distribution_complete',
    details: { nb_artisans: artisanIds.length, artisan_ids: artisanIds },
    success: true,
  })

  return { count: artisanIds.length, artisanIds }
}

async function sendLeadSMSToArtisan(artisan: Artisan, lead: Lead) {
  const msg = [
    `🔔 Nouveau lead terrazzo — DevisTerrazzo`,
    `📍 ${lead.ville} (${lead.code_postal.slice(0, 2)}) | ${lead.surface} m²`,
    `💰 Budget: ${BUDGET_LABELS[lead.budget]} | ${DELAI_LABELS[lead.delai]}`,
    `📞 ${lead.telephone}`,
    `👉 Accédez à votre espace: ${process.env.NEXT_PUBLIC_APP_URL}/artisans/dashboard`,
  ].join('\n')

  const { sendSMS: send } = await import('./twilio')
  await send(artisan.telephone, msg)
}

async function logError(
  supabase: ReturnType<typeof createServiceClient>,
  leadId: string,
  artisanId: string | null,
  action: string,
  message: string
) {
  try {
    await supabase.from('distribution_logs').insert({
      lead_id: leadId,
      artisan_id: artisanId,
      action,
      success: false,
      error_message: message,
    })
  } catch {}
}
