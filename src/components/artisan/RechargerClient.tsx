'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import { formatCurrency } from '@/lib/utils'
import { FORMULE_LABELS } from '@/lib/utils'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface Props {
  artisan: { id: string; prenom: string; nom: string; formule: string; solde_leads: number }
}

const PACKS = [
  { leads: 5, label: '5 leads' },
  { leads: 10, label: '10 leads' },
  { leads: 20, label: '20 leads' },
]

const PRIX: Record<string, number> = {
  starter: 15,
  pro: 35,
  exclusif: 60,
}

export default function RechargerClient({ artisan }: Props) {
  const [selectedPack, setSelectedPack] = useState(5)
  const [loading, setLoading] = useState(false)

  const prixUnitaire = PRIX[artisan.formule] || 15
  const total = selectedPack * prixUnitaire

  const handleRecharger = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/artisans/recharger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nb_leads: selectedPack }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      window.location.href = json.checkoutUrl
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-lg mx-auto space-y-6">
        <Link href="/artisans/dashboard" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary-700 cursor-pointer">
          <ArrowLeft className="w-4 h-4" aria-hidden />
          Retour au dashboard
        </Link>

        <div className="card p-6 sm:p-8 space-y-6">
          <div>
            <h1 className="text-2xl font-heading text-primary-900">Recharger mes leads</h1>
            <p className="text-gray-500 text-sm mt-1">
              Solde actuel : <strong>{artisan.solde_leads} lead(s)</strong> ·
              Formule : <strong>{FORMULE_LABELS[artisan.formule]}</strong>
            </p>
          </div>

          <div>
            <p className="form-label mb-3">Choisir un pack</p>
            <div className="space-y-2">
              {PACKS.map((pack) => (
                <label key={pack.leads} className="cursor-pointer block">
                  <input
                    type="radio"
                    className="sr-only peer"
                    checked={selectedPack === pack.leads}
                    onChange={() => setSelectedPack(pack.leads)}
                  />
                  <div className="flex items-center justify-between px-4 py-3 border-2 border-gray-200 rounded-xl
                    peer-checked:border-primary-500 peer-checked:bg-primary-50
                    hover:border-primary-300 transition-colors duration-150">
                    <span className="font-semibold text-gray-900">{pack.label}</span>
                    <span className="font-bold text-primary-700">{formatCurrency(pack.leads * prixUnitaire)}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 flex justify-between items-center">
            <span className="text-gray-700 font-medium">Total TTC</span>
            <span className="text-2xl font-bold text-primary-800">{formatCurrency(total)}</span>
          </div>

          <Button variant="cta" size="lg" className="w-full" loading={loading} onClick={handleRecharger}>
            Payer et créditer {selectedPack} leads
          </Button>

          <p className="text-center text-xs text-gray-400">Paiement sécurisé par Stripe</p>
        </div>
      </div>
    </div>
  )
}
