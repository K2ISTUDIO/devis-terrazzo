import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServiceClient } from '@/lib/supabase/server'
import { distributeLeadToArtisans } from '@/lib/distribution'
import { sendLeadConfirmationToProspect } from '@/lib/emails'

const leadSchema = z.object({
  prenom: z.string().min(2),
  nom: z.string().min(2),
  email: z.string().email(),
  telephone: z.string().regex(/^(\+33|0)[1-9](\d{2}){4}$/),
  ville: z.string().min(2),
  code_postal: z.string().regex(/^\d{5}$/),
  surface: z.number().min(1).max(10000),
  type_piece: z.enum(['salon', 'salle_de_bain', 'cuisine', 'autre']),
  budget: z.enum(['moins_2000', '2000_5000', 'plus_5000']),
  delai: z.enum(['moins_1_mois', '1_3_mois', 'plus_3_mois']),
  message: z.string().optional(),
  rgpd_consent: z.literal(true),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = leadSchema.parse(body)

    const supabase = createServiceClient()

    // 1. Insérer le lead
    const { data: lead, error } = await supabase
      .from('leads')
      .insert({
        prenom: data.prenom,
        nom: data.nom,
        email: data.email,
        telephone: data.telephone,
        ville: data.ville,
        code_postal: data.code_postal,
        surface: data.surface,
        type_piece: data.type_piece,
        budget: data.budget,
        delai: data.delai,
        message: data.message,
        rgpd_consent: data.rgpd_consent,
        statut: 'nouveau',
      })
      .select()
      .single()

    if (error || !lead) {
      console.error('[API leads] Insert error:', error)
      return NextResponse.json({ error: 'Erreur lors de l\'enregistrement' }, { status: 500 })
    }

    // 2. Distribution automatique (async, ne bloque pas la réponse)
    distributeLeadToArtisans(lead.id).catch((err) => {
      console.error('[Distribution] Error:', err)
    })

    // 3. Email de confirmation prospect
    sendLeadConfirmationToProspect(lead).catch((err) => {
      console.error('[Email prospect] Error:', err)
    })

    return NextResponse.json({ success: true, lead_id: lead.id }, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Données invalides', details: err.errors }, { status: 400 })
    }
    console.error('[API leads] Unexpected error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// Lecture admin
export async function GET(request: NextRequest) {
  const adminKey = request.cookies.get('admin_key')?.value
  if (adminKey !== process.env.ADMIN_SECRET_KEY) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ leads: data })
}
