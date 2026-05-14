'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  LayoutDashboard, List, CreditCard, LogOut,
  TrendingUp, AlertTriangle, CheckCircle, Phone
} from 'lucide-react'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import {
  formatDate, formatCurrency, formatDateTime,
  BUDGET_LABELS, DELAI_LABELS, PIECE_LABELS,
  STATUT_LEAD_LABELS, STATUT_LEAD_COLORS, FORMULE_LABELS
} from '@/lib/utils'
import type { Artisan, LeadAttribution, Facture } from '@/lib/types'
import toast from 'react-hot-toast'

interface Props {
  artisan: Artisan
  attributions: LeadAttribution[]
  factures: Facture[]
}

type Tab = 'overview' | 'leads' | 'factures'

const STATUT_OPTIONS = [
  { value: 'nouveau', label: 'Nouveau' },
  { value: 'contacte', label: 'Contacté' },
  { value: 'devis_envoye', label: 'Devis envoyé' },
  { value: 'gagne', label: 'Gagné' },
  { value: 'perdu', label: 'Perdu' },
  { value: 'injoignable', label: 'Injoignable' },
]

export default function DashboardArtisanClient({ artisan, attributions, factures }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [localAttributions, setLocalAttributions] = useState(attributions)

  const stats = {
    total: attributions.length,
    nouveau: attributions.filter((a) => a.statut_artisan === 'nouveau').length,
    gagne: attributions.filter((a) => a.statut_artisan === 'gagne').length,
    tauxConversion: attributions.length > 0
      ? Math.round((attributions.filter((a) => a.statut_artisan === 'gagne').length / attributions.length) * 100)
      : 0,
  }

  const updateStatut = async (attributionId: string, newStatut: string) => {
    try {
      const res = await fetch(`/api/artisans/leads/${attributionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statut_artisan: newStatut }),
      })
      if (!res.ok) throw new Error()
      setLocalAttributions((prev) =>
        prev.map((a) => a.id === attributionId ? { ...a, statut_artisan: newStatut as LeadAttribution['statut_artisan'] } : a)
      )
      toast.success('Statut mis à jour')
    } catch {
      toast.error('Erreur lors de la mise à jour')
    }
  }

  const handleLogout = async () => {
    await fetch('/api/artisans/auth', { method: 'DELETE' })
    window.location.href = '/artisans/connexion'
  }

  const soldeColor = artisan.solde_leads === 0
    ? 'text-red-600 bg-red-50'
    : artisan.solde_leads < 3
    ? 'text-amber-600 bg-amber-50'
    : 'text-green-600 bg-green-50'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar / Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="font-heading text-xl text-primary-800">DevisTerrazzo</Link>

          <nav className="hidden sm:flex items-center gap-1" aria-label="Navigation dashboard">
            {[
              { tab: 'overview' as Tab, label: 'Vue d\'ensemble', icon: <LayoutDashboard className="w-4 h-4" /> },
              { tab: 'leads' as Tab, label: 'Mes leads', icon: <List className="w-4 h-4" /> },
              { tab: 'factures' as Tab, label: 'Factures', icon: <CreditCard className="w-4 h-4" /> },
            ].map((item) => (
              <button
                key={item.tab}
                onClick={() => setActiveTab(item.tab)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  activeTab === item.tab
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
                aria-current={activeTab === item.tab ? 'page' : undefined}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${soldeColor}`}>
              {artisan.solde_leads} lead{artisan.solde_leads !== 1 ? 's' : ''} restant{artisan.solde_leads !== 1 ? 's' : ''}
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              aria-label="Se déconnecter"
            >
              <LogOut className="w-4 h-4" aria-hidden />
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        <div className="sm:hidden flex border-t border-gray-100">
          {[
            { tab: 'overview' as Tab, label: 'Accueil' },
            { tab: 'leads' as Tab, label: 'Leads' },
            { tab: 'factures' as Tab, label: 'Factures' },
          ].map((item) => (
            <button
              key={item.tab}
              onClick={() => setActiveTab(item.tab)}
              className={`flex-1 py-3 text-xs font-medium transition-colors cursor-pointer ${
                activeTab === item.tab
                  ? 'text-primary-700 border-b-2 border-primary-600'
                  : 'text-gray-500'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Alerte solde faible */}
        {artisan.solde_leads < 3 && artisan.solde_leads > 0 && (
          <div className="mb-6 flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-amber-800" role="alert">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" aria-hidden />
            <p className="text-sm">
              <strong>Solde faible :</strong> il vous reste {artisan.solde_leads} lead(s).{' '}
              <Link href="/artisans/recharger" className="underline font-semibold hover:text-amber-900">
                Recharger maintenant
              </Link>
            </p>
          </div>
        )}
        {artisan.solde_leads === 0 && (
          <div className="mb-6 flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-800" role="alert">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" aria-hidden />
            <p className="text-sm">
              <strong>Solde épuisé :</strong> vous ne recevez plus de leads.{' '}
              <Link href="/artisans/recharger" className="underline font-semibold">
                Recharger mon compte
              </Link>
            </p>
          </div>
        )}

        {/* VUE D'ENSEMBLE */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Bonjour, {artisan.prenom} 👋
              </h1>
              <p className="text-gray-500 text-sm mt-1">{artisan.entreprise} · Formule {FORMULE_LABELS[artisan.formule]}</p>
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total leads reçus', value: stats.total, icon: <List className="w-5 h-5 text-primary-600" />, bg: 'bg-primary-50' },
                { label: 'Leads nouveaux', value: stats.nouveau, icon: <AlertTriangle className="w-5 h-5 text-amber-600" />, bg: 'bg-amber-50' },
                { label: 'Projets gagnés', value: stats.gagne, icon: <CheckCircle className="w-5 h-5 text-green-600" />, bg: 'bg-green-50' },
                { label: 'Taux de conversion', value: `${stats.tauxConversion}%`, icon: <TrendingUp className="w-5 h-5 text-blue-600" />, bg: 'bg-blue-50' },
              ].map((stat) => (
                <div key={stat.label} className="card p-4 flex items-center gap-4">
                  <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    {stat.icon}
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-xs text-gray-500 leading-tight">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Derniers leads */}
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900">Derniers leads reçus</h2>
                <button onClick={() => setActiveTab('leads')} className="text-sm text-primary-600 hover:underline cursor-pointer">
                  Voir tout
                </button>
              </div>
              {localAttributions.slice(0, 5).length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-6">Aucun lead reçu pour le moment.</p>
              ) : (
                <div className="space-y-3">
                  {localAttributions.slice(0, 5).map((attr) => (
                    <div key={attr.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center text-primary-700 font-semibold text-sm">
                          {attr.lead?.prenom?.[0]}{attr.lead?.nom?.[0]}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {attr.lead?.ville} — {attr.lead?.surface} m²
                          </p>
                          <p className="text-xs text-gray-500">{formatDate(attr.attribue_at)}</p>
                        </div>
                      </div>
                      <span className={`badge ${STATUT_LEAD_COLORS[attr.statut_artisan]}`}>
                        {STATUT_LEAD_LABELS[attr.statut_artisan]}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Infos compte */}
            <div className="card p-5 grid sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500 mb-1">Formule actuelle</p>
                <p className="font-semibold text-gray-900">{FORMULE_LABELS[artisan.formule]} — {
                  artisan.formule === 'starter' ? '15€/lead' :
                  artisan.formule === 'pro' ? '35€/lead' : '60€/lead'
                }</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Départements couverts</p>
                <p className="font-semibold text-gray-900">{artisan.departements.join(', ')}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Solde de leads</p>
                <p className={`font-bold text-lg ${artisan.solde_leads === 0 ? 'text-red-600' : artisan.solde_leads < 3 ? 'text-amber-600' : 'text-green-600'}`}>
                  {artisan.solde_leads} lead{artisan.solde_leads !== 1 ? 's' : ''}
                </p>
              </div>
              <div>
                <Link href="/artisans/recharger" className="btn-primary text-sm py-2 px-4 inline-flex">
                  Recharger des leads
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* LISTE LEADS */}
        {activeTab === 'leads' && (
          <div className="space-y-4">
            <h1 className="text-xl font-semibold text-gray-900">Mes leads ({localAttributions.length})</h1>

            {localAttributions.length === 0 ? (
              <div className="card p-12 text-center text-gray-500">
                <List className="w-12 h-12 mx-auto mb-3 text-gray-300" aria-hidden />
                <p>Aucun lead reçu pour le moment.</p>
                <p className="text-sm mt-1">Vos prochains leads apparaîtront ici dès qu'ils seront attribués.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {localAttributions.map((attr) => (
                  <LeadCard
                    key={attr.id}
                    attribution={attr}
                    onUpdateStatut={updateStatut}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* FACTURES */}
        {activeTab === 'factures' && (
          <div className="space-y-4">
            <h1 className="text-xl font-semibold text-gray-900">Historique de facturation</h1>

            {factures.length === 0 ? (
              <div className="card p-12 text-center text-gray-500">
                <CreditCard className="w-12 h-12 mx-auto mb-3 text-gray-300" aria-hidden />
                <p>Aucune facture pour le moment.</p>
              </div>
            ) : (
              <div className="card overflow-hidden">
                <table className="w-full text-sm" aria-label="Historique des factures">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th scope="col" className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                      <th scope="col" className="text-left px-4 py-3 font-medium text-gray-600">Description</th>
                      <th scope="col" className="text-right px-4 py-3 font-medium text-gray-600">Montant</th>
                      <th scope="col" className="text-center px-4 py-3 font-medium text-gray-600">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {factures.map((f) => (
                      <tr key={f.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-gray-600">{formatDate(f.date)}</td>
                        <td className="px-4 py-3 text-gray-900">
                          {f.description || `Formule ${f.formule || artisan.formule} — ${f.nombre_leads || 1} lead(s)`}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-gray-900">{formatCurrency(f.montant)}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`badge ${
                            f.statut === 'payee' ? 'bg-green-100 text-green-800' :
                            f.statut === 'echouee' ? 'bg-red-100 text-red-800' :
                            f.statut === 'remboursee' ? 'bg-purple-100 text-purple-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {f.statut === 'payee' ? 'Payée' :
                             f.statut === 'echouee' ? 'Échouée' :
                             f.statut === 'remboursee' ? 'Remboursée' : 'En attente'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

function LeadCard({
  attribution,
  onUpdateStatut,
}: {
  attribution: LeadAttribution
  onUpdateStatut: (id: string, statut: string) => Promise<void>
}) {
  const lead = attribution.lead
  const [updating, setUpdating] = useState(false)

  const handleStatutChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    setUpdating(true)
    await onUpdateStatut(attribution.id, e.target.value)
    setUpdating(false)
  }

  return (
    <div className="card p-4 sm:p-5 hover:shadow-md transition-shadow duration-200">
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        {/* Info principale */}
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-gray-900">
              {lead?.prenom} {lead?.nom?.[0]}.
            </span>
            <span className="text-gray-400 text-sm">·</span>
            <span className="text-gray-600 text-sm">{lead?.ville} ({lead?.code_postal?.slice(0, 2)})</span>
            <span className={`badge ${STATUT_LEAD_COLORS[attribution.statut_artisan]}`}>
              {STATUT_LEAD_LABELS[attribution.statut_artisan]}
            </span>
          </div>

          <div className="flex flex-wrap gap-3 text-sm text-gray-600">
            <span className="bg-gray-100 px-2.5 py-1 rounded-lg">
              {lead?.surface} m²
            </span>
            <span className="bg-gray-100 px-2.5 py-1 rounded-lg">
              {PIECE_LABELS[lead?.type_piece || '']}
            </span>
            <span className="bg-gray-100 px-2.5 py-1 rounded-lg">
              {BUDGET_LABELS[lead?.budget || '']}
            </span>
            <span className="bg-gray-100 px-2.5 py-1 rounded-lg">
              {DELAI_LABELS[lead?.delai || '']}
            </span>
          </div>

          <p className="text-xs text-gray-400">Reçu le {formatDateTime(attribution.attribue_at)}</p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 sm:items-end">
          {/* Téléphone (visible après attribution) */}
          {attribution.lead_snapshot?.telephone ? (
            <a
              href={`tel:${attribution.lead_snapshot.telephone}`}
              className="flex items-center gap-2 text-sm font-medium text-primary-700 bg-primary-50 hover:bg-primary-100 px-3 py-2 rounded-lg transition-colors cursor-pointer"
            >
              <Phone className="w-4 h-4" aria-hidden />
              {attribution.lead_snapshot.telephone}
            </a>
          ) : (
            <span className="text-xs text-gray-400 italic">Tél. non disponible</span>
          )}

          {/* Statut */}
          <select
            value={attribution.statut_artisan}
            onChange={handleStatutChange}
            disabled={updating}
            aria-label="Modifier le statut de ce lead"
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white cursor-pointer focus:ring-2 focus:ring-primary-400 focus:border-transparent disabled:opacity-60"
          >
            {STATUT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
