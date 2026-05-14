import { resend, FROM } from './resend'
import type { Lead, Artisan } from './types'
import { BUDGET_LABELS, DELAI_LABELS, PIECE_LABELS, formatDate } from './utils'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://devis-terrazzo.fr'

// ============================================================
// Email prospect : confirmation de demande
// ============================================================
export async function sendLeadConfirmationToProspect(lead: Lead) {
  const { error } = await resend.emails.send({
    from: FROM,
    to: lead.email,
    subject: 'Votre demande de devis terrazzo a bien été reçue',
    html: prospectConfirmationHtml(lead),
  })

  if (error) {
    console.error('[Email prospect confirmation] Error:', error)
    throw error
  }
}

// ============================================================
// Email artisan : nouveau lead
// ============================================================
export async function sendLeadToArtisan(artisan: Artisan, lead: Lead) {
  const subject = `Nouveau lead terrazzo — ${lead.ville} — ${lead.surface} m²`
  const { error } = await resend.emails.send({
    from: FROM,
    to: artisan.email,
    subject,
    html: artisanNewLeadHtml(artisan, lead),
  })

  if (error) {
    console.error('[Email artisan lead] Error:', error)
    throw error
  }
}

// ============================================================
// Email artisan : alerte solde faible
// ============================================================
export async function sendLowBalanceAlert(artisan: Artisan, solde: number) {
  const { error } = await resend.emails.send({
    from: FROM,
    to: artisan.email,
    subject: `⚠️ Votre solde de leads est faible (${solde} restant${solde > 1 ? 's' : ''})`,
    html: artisanLowBalanceHtml(artisan, solde),
  })

  if (error) {
    console.error('[Email low balance] Error:', error)
  }
}

// ============================================================
// Email artisan : bienvenue à l'inscription
// ============================================================
export async function sendArtisanWelcomeEmail(artisan: Artisan) {
  const { error } = await resend.emails.send({
    from: FROM,
    to: artisan.email,
    subject: 'Bienvenue sur DevisTerrazzo — Votre compte artisan',
    html: artisanWelcomeHtml(artisan),
  })

  if (error) console.error('[Email welcome] Error:', error)
}

// ============================================================
// TEMPLATES HTML
// ============================================================

function emailWrapper(content: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DevisTerrazzo</title>
</head>
<body style="margin:0;padding:0;background:#F0F9FF;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F0F9FF;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#0369A1,#0EA5E9);padding:28px 32px;text-align:center;">
            <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;letter-spacing:-0.5px;">DevisTerrazzo</h1>
            <p style="margin:4px 0 0;color:#BAE6FD;font-size:13px;">Spécialiste du sol terrazzo coulé en France</p>
          </td>
        </tr>
        <!-- Content -->
        <tr>
          <td style="padding:32px;">
            ${content}
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#F0F9FF;padding:20px 32px;text-align:center;border-top:1px solid #E0F2FE;">
            <p style="margin:0;color:#64748B;font-size:12px;">
              © ${new Date().getFullYear()} DevisTerrazzo ·
              <a href="${APP_URL}/mentions-legales" style="color:#0EA5E9;text-decoration:none;">Mentions légales</a> ·
              <a href="${APP_URL}/mentions-legales#confidentialite" style="color:#0EA5E9;text-decoration:none;">Confidentialité</a>
            </p>
            <p style="margin:6px 0 0;color:#94A3B8;font-size:11px;">
              Conformément au RGPD, vous pouvez vous désabonner à tout moment.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

function prospectConfirmationHtml(lead: Lead): string {
  return emailWrapper(`
    <div style="color:#1E293B;">
      <h2 style="margin:0 0 8px;font-size:22px;color:#0C4A6E;">Votre demande a bien été reçue !</h2>
      <p style="color:#475569;margin:0 0 24px;">Bonjour ${lead.prenom},</p>

      <p style="color:#475569;line-height:1.6;">
        Nous avons bien reçu votre demande de devis pour un sol en terrazzo coulé.
        Des artisans spécialisés de votre région vont analyser votre projet et vous contacter sous <strong>48 heures</strong>.
      </p>

      <div style="background:#F0F9FF;border:1px solid #BAE6FD;border-radius:12px;padding:20px;margin:24px 0;">
        <h3 style="margin:0 0 12px;color:#0369A1;font-size:14px;text-transform:uppercase;letter-spacing:0.5px;">Récapitulatif de votre projet</h3>
        <table width="100%" cellpadding="4" cellspacing="0" style="font-size:14px;color:#334155;">
          <tr><td style="color:#64748B;width:40%;">Localisation</td><td><strong>${lead.ville} (${lead.code_postal})</strong></td></tr>
          <tr><td style="color:#64748B;">Surface</td><td><strong>${lead.surface} m²</strong></td></tr>
          <tr><td style="color:#64748B;">Type de pièce</td><td><strong>${PIECE_LABELS[lead.type_piece]}</strong></td></tr>
          <tr><td style="color:#64748B;">Budget</td><td><strong>${BUDGET_LABELS[lead.budget]}</strong></td></tr>
          <tr><td style="color:#64748B;">Délai</td><td><strong>${DELAI_LABELS[lead.delai]}</strong></td></tr>
        </table>
      </div>

      <div style="text-align:center;margin:28px 0;">
        <a href="${APP_URL}" style="display:inline-block;background:#F97316;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:10px;font-weight:600;font-size:15px;">
          Retour au site
        </a>
      </div>

      <p style="color:#94A3B8;font-size:12px;text-align:center;line-height:1.6;">
        Vos données sont transmises à des artisans certifiés uniquement.<br>
        Elles ne sont pas vendues à des tiers. Conformité RGPD garantie.
      </p>
    </div>
  `)
}

function artisanNewLeadHtml(artisan: Artisan, lead: Lead): string {
  return emailWrapper(`
    <div style="color:#1E293B;">
      <div style="background:#FFF7ED;border-left:4px solid #F97316;padding:12px 16px;border-radius:8px;margin-bottom:24px;">
        <p style="margin:0;font-weight:700;color:#C2410C;font-size:13px;">🔔 NOUVEAU LEAD TERRAZZO</p>
      </div>

      <h2 style="margin:0 0 6px;font-size:22px;color:#0C4A6E;">
        ${lead.ville} — ${lead.surface} m²
      </h2>
      <p style="color:#475569;margin:0 0 24px;">Bonjour ${artisan.prenom}, voici votre nouveau prospect.</p>

      <div style="background:#F0F9FF;border:1px solid #BAE6FD;border-radius:12px;padding:20px;margin-bottom:20px;">
        <h3 style="margin:0 0 12px;color:#0369A1;font-size:14px;text-transform:uppercase;">Informations du projet</h3>
        <table width="100%" cellpadding="5" cellspacing="0" style="font-size:14px;color:#334155;">
          <tr><td style="color:#64748B;width:40%;">Prénom</td><td><strong>${lead.prenom}</strong></td></tr>
          <tr><td style="color:#64748B;">Email</td><td><strong>${lead.email}</strong></td></tr>
          <tr style="background:#FFF7ED;"><td style="color:#C2410C;font-weight:600;">Téléphone</td><td><strong style="color:#C2410C;">${lead.telephone}</strong></td></tr>
          <tr><td style="color:#64748B;">Ville</td><td><strong>${lead.ville} (${lead.code_postal})</strong></td></tr>
          <tr><td style="color:#64748B;">Surface</td><td><strong>${lead.surface} m²</strong></td></tr>
          <tr><td style="color:#64748B;">Pièce</td><td><strong>${PIECE_LABELS[lead.type_piece]}</strong></td></tr>
          <tr><td style="color:#64748B;">Budget</td><td><strong>${BUDGET_LABELS[lead.budget]}</strong></td></tr>
          <tr><td style="color:#64748B;">Délai</td><td><strong>${DELAI_LABELS[lead.delai]}</strong></td></tr>
          ${lead.message ? `<tr><td style="color:#64748B;">Message</td><td><em>${lead.message}</em></td></tr>` : ''}
        </table>
      </div>

      <div style="text-align:center;margin:28px 0;">
        <a href="${APP_URL}/artisans/dashboard" style="display:inline-block;background:#0EA5E9;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:10px;font-weight:600;font-size:15px;">
          Gérer ce lead dans mon espace
        </a>
      </div>

      <p style="color:#64748B;font-size:13px;text-align:center;">
        Contactez ce prospect rapidement pour maximiser vos chances de conversion.
      </p>
    </div>
  `)
}

function artisanLowBalanceHtml(artisan: Artisan, solde: number): string {
  return emailWrapper(`
    <div style="color:#1E293B;">
      <div style="background:#FFFBEB;border:1px solid #FCD34D;border-radius:12px;padding:16px;text-align:center;margin-bottom:24px;">
        <p style="margin:0;font-size:32px;">⚠️</p>
        <h2 style="margin:8px 0 0;color:#92400E;">Solde faible : ${solde} lead${solde > 1 ? 's' : ''} restant${solde > 1 ? 's' : ''}</h2>
      </div>

      <p style="color:#475569;">Bonjour ${artisan.prenom},</p>
      <p style="color:#475569;line-height:1.6;">
        Il vous reste seulement <strong>${solde} lead${solde > 1 ? 's' : ''}</strong> dans votre solde DevisTerrazzo.
        Rechargez dès maintenant pour continuer à recevoir des demandes de devis.
      </p>

      <div style="text-align:center;margin:28px 0;">
        <a href="${APP_URL}/artisans/recharger" style="display:inline-block;background:#F97316;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:10px;font-weight:600;font-size:15px;">
          Recharger mon solde
        </a>
      </div>
    </div>
  `)
}

function artisanWelcomeHtml(artisan: Artisan): string {
  return emailWrapper(`
    <div style="color:#1E293B;">
      <h2 style="margin:0 0 8px;font-size:22px;color:#0C4A6E;">Bienvenue sur DevisTerrazzo !</h2>
      <p style="color:#475569;">Bonjour ${artisan.prenom},</p>
      <p style="color:#475569;line-height:1.6;">
        Votre demande d'inscription en tant qu'artisan terrazzo a bien été reçue.
        Votre compte sera activé après validation de votre paiement.
      </p>

      <div style="background:#F0F9FF;border-radius:12px;padding:20px;margin:24px 0;">
        <h3 style="margin:0 0 8px;color:#0369A1;font-size:14px;">Récapitulatif</h3>
        <p style="margin:4px 0;color:#334155;font-size:14px;"><strong>Entreprise :</strong> ${artisan.entreprise}</p>
        <p style="margin:4px 0;color:#334155;font-size:14px;"><strong>Formule :</strong> ${artisan.formule.charAt(0).toUpperCase() + artisan.formule.slice(1)}</p>
        <p style="margin:4px 0;color:#334155;font-size:14px;"><strong>Départements :</strong> ${artisan.departements.join(', ')}</p>
      </div>

      <div style="text-align:center;margin:28px 0;">
        <a href="${APP_URL}/artisans/dashboard" style="display:inline-block;background:#0EA5E9;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:10px;font-weight:600;font-size:15px;">
          Accéder à mon espace artisan
        </a>
      </div>
    </div>
  `)
}
