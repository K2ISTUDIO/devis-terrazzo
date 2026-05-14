import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase/server'
import { FORMULE_PRICES } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature' }, { status: 400 })
  }

  let event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('[Stripe webhook] Signature error:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = createServiceClient()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any
        const artisanId = session.metadata?.artisan_id
        const nbLeads = parseInt(session.metadata?.nb_leads || '5')
        const formule = session.metadata?.formule

        if (!artisanId) break

        const priceConfig = FORMULE_PRICES[formule as keyof typeof FORMULE_PRICES]

        // Activer l'artisan et créditer les leads
        await supabase
          .from('artisans')
          .update({
            actif: true,
            solde_leads: nbLeads,
          })
          .eq('id', artisanId)

        // Créer la facture
        await supabase.from('factures').insert({
          artisan_id: artisanId,
          stripe_payment_intent_id: session.payment_intent,
          montant: session.amount_total / 100,
          nombre_leads: nbLeads,
          formule,
          statut: 'payee',
          description: `Pack ${nbLeads} leads — Formule ${formule}`,
        })

        console.log(`[Stripe] Artisan ${artisanId} activé avec ${nbLeads} leads`)
        break
      }

      case 'invoice.paid': {
        const invoice = event.data.object as any
        const customerId = invoice.customer

        // Trouver l'artisan
        const { data: artisan } = await supabase
          .from('artisans')
          .select('id, formule, solde_leads')
          .eq('stripe_customer_id', customerId)
          .single()

        if (!artisan) break

        // Ajouter des leads selon l'abonnement
        const formule = artisan.formule
        let nbLeads = formule === 'pro' ? 5 : formule === 'exclusif' ? 1 : 0

        if (nbLeads > 0) {
          await supabase
            .from('artisans')
            .update({ solde_leads: artisan.solde_leads + nbLeads })
            .eq('id', artisan.id)

          await supabase.from('factures').insert({
            artisan_id: artisan.id,
            stripe_invoice_id: invoice.id,
            montant: invoice.amount_paid / 100,
            nombre_leads: nbLeads,
            formule,
            statut: 'payee',
            description: `Abonnement mensuel — ${nbLeads} leads`,
          })
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as any
        const customerId = invoice.customer

        const { data: artisan } = await supabase
          .from('artisans')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (!artisan) break

        await supabase.from('factures').insert({
          artisan_id: artisan.id,
          stripe_invoice_id: invoice.id,
          montant: invoice.amount_due / 100,
          statut: 'echouee',
          description: 'Paiement échoué',
        })
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as any
        const customerId = subscription.customer

        const { data: artisan } = await supabase
          .from('artisans')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (artisan) {
          await supabase
            .from('artisans')
            .update({ actif: false, stripe_subscription_id: null })
            .eq('id', artisan.id)
        }
        break
      }
    }
  } catch (err) {
    console.error('[Stripe webhook] Processing error:', err)
    return NextResponse.json({ error: 'Processing error' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}

// Désactiver le body parsing automatique de Next.js pour lire le body brut
export const config = {
  api: { bodyParser: false },
}
