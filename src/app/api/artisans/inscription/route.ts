import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServiceClient } from '@/lib/supabase/server'
import { getStripe, FORMULE_PRICES } from '@/lib/stripe'
import { sendArtisanWelcomeEmail } from '@/lib/emails'

const schema = z.object({
  nom: z.string().min(2),
  prenom: z.string().min(2),
  entreprise: z.string().min(2),
  siret: z.string().regex(/^\d{14}$/),
  email: z.string().email(),
  telephone: z.string().regex(/^(\+33|0)[1-9](\d{2}){4}$/),
  departements: z.array(z.string()).min(1),
  formule: z.enum(['starter', 'pro', 'exclusif']),
  cgv_consent: z.literal(true),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = schema.parse(body)

    const supabase = createServiceClient()

    // Vérifier si SIRET ou email déjà utilisé
    const { data: existing } = await supabase
      .from('artisans')
      .select('id')
      .or(`siret.eq.${data.siret},email.eq.${data.email}`)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'Un compte avec ce SIRET ou email existe déjà.' },
        { status: 409 }
      )
    }

    // Créer le client Stripe
    const customer = await getStripe().customers.create({
      email: data.email,
      name: `${data.prenom} ${data.nom}`,
      metadata: {
        siret: data.siret,
        entreprise: data.entreprise,
        formule: data.formule,
      },
    })

    // Insérer l'artisan (solde_leads = 0 jusqu'au paiement)
    const { data: artisan, error } = await supabase
      .from('artisans')
      .insert({
        nom: data.nom,
        prenom: data.prenom,
        entreprise: data.entreprise,
        siret: data.siret,
        email: data.email,
        telephone: data.telephone,
        departements: data.departements,
        formule: data.formule,
        solde_leads: 0,
        stripe_customer_id: customer.id,
        actif: false, // Activé après paiement
      })
      .select()
      .single()

    if (error || !artisan) {
      // Rollback Stripe customer
      await getStripe().customers.del(customer.id).catch(() => {})
      console.error('[Artisan inscription] DB error:', error)
      return NextResponse.json({ error: 'Erreur lors de la création du compte' }, { status: 500 })
    }

    // Créer Stripe Checkout Session
    const priceConfig = FORMULE_PRICES[data.formule]
    const appUrl = process.env.NEXT_PUBLIC_APP_URL

    const session = await getStripe().checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `DevisTerrazzo — Formule ${data.formule.charAt(0).toUpperCase() + data.formule.slice(1)}`,
              description: `Pack de 5 leads terrazzo (${priceConfig.amount / 100}€/lead)`,
            },
            unit_amount: priceConfig.amount * 5, // Pack de 5 leads
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${appUrl}/artisans/inscription-confirmee?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/artisans#inscription`,
      metadata: {
        artisan_id: artisan.id,
        formule: data.formule,
        nb_leads: '5',
      },
    })

    // Email de bienvenue (async)
    sendArtisanWelcomeEmail(artisan).catch(console.error)

    return NextResponse.json({ checkoutUrl: session.url }, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Données invalides', details: err.errors }, { status: 400 })
    }
    console.error('[Artisan inscription] Unexpected error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
