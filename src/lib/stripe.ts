import Stripe from 'stripe'

let _stripe: Stripe | null = null
export function getStripe(): Stripe {
  if (!_stripe) _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16', typescript: true })
  return _stripe
}

export const FORMULE_PRICES: Record<string, { price: string; maxShares: number; amount: number }> = {
  starter: {
    price: process.env.STRIPE_PRICE_STARTER!,
    maxShares: 3,
    amount: 1500,
  },
  pro: {
    price: process.env.STRIPE_PRICE_PRO!,
    maxShares: 2,
    amount: 3500,
  },
  exclusif: {
    price: process.env.STRIPE_PRICE_EXCLUSIF!,
    maxShares: 1,
    amount: 6000,
  },
}
