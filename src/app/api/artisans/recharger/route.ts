import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getStripe, FORMULE_PRICES } from '@/lib/stripe'
import { cookies } from 'next/headers'

async function getArtisan() {
  const cookieStore = cookies()
  const token = cookieStore.get('artisan_token')?.value
  if (!token) return null

  const supabase = createServiceClient()
  const { data: session } = await supabase
    .from('artisan_sessions')
    .select('artisan_id')
    .eq('token', token)
    .single()

  if (!session) return null

  const { data } = await supabase
    .from('artisans')
    .select('id, prenom, nom, email, formule, stripe_customer_id')
    .eq('id', session.artisan_id)
    .single()

  return data
}

export async function POST(request: NextRequest) {
  try {
    const artisan = await getArtisan()
    if (!artisan) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

    const { nb_leads } = await request.json()
    if (!nb_leads || nb_leads < 1) {
      return NextResponse.json({ error: 'Nombre de leads invalide' }, { status: 400 })
    }

    const priceConfig = FORMULE_PRICES[artisan.formule as keyof typeof FORMULE_PRICES]
    const appUrl = process.env.NEXT_PUBLIC_APP_URL

    const session = await getStripe().checkout.sessions.create({
      customer: artisan.stripe_customer_id || undefined,
      customer_email: !artisan.stripe_customer_id ? artisan.email : undefined,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `DevisTerrazzo — Recharge ${nb_leads} leads`,
              description: `Formule ${artisan.formule} — ${priceConfig.amount / 100}€/lead`,
            },
            unit_amount: priceConfig.amount * nb_leads,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${appUrl}/artisans/dashboard?recharged=1`,
      cancel_url: `${appUrl}/artisans/recharger`,
      metadata: {
        artisan_id: artisan.id,
        formule: artisan.formule,
        nb_leads: String(nb_leads),
        type: 'recharge',
      },
    })

    return NextResponse.json({ checkoutUrl: session.url })
  } catch (err) {
    console.error('[Recharge] Error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
