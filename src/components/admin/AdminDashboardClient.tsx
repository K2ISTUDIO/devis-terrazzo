'use client'

import { useState } from 'react'
import {
  LayoutDashboard, Users, List, Zap,
  TrendingUp, Euro, CheckCircle, Clock
} from 'lucide-react'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import {
  formatCurrency, formatDateTime, formatDate,
  BUDGET_LABELS, DELAI_LABELS, PIECE_LABELS,
  STATUT_LEAD_LABELS, STATUT_LEAD_COLORS,
  FORMULE_LABELS, FORMULE_COLORS
} from '@/lib/utils'
import type { Lead, Artisan, LeadAttribution, AdminStats } from '@/lib/types'
import toast from 'react-hot-toast'

interface Props {
  stats: AdminStats
  leads: Lead[]
  artisans: Artisan[]
  attributions: LeadAttribution[]
}

type Tab = 'overview' | 'leads' | 'artisans' | 'distribution'

export default function AdminDashboardClient({ stats, leads, artisans, attributions }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [filterStatut, setFilterStatut] = useState('')
  const [filterDept, setFilterDept] = useState('')
  const [distributing, setDistributing] = useState<string | null>(null)

  const filteredLeads = leads.filter((l) => {
    if (filterStatut && l.statut !== filterStatut) return false
    if (filterDept && l.departement !== filterDept) return false
    return true
  })

  const handleDistribute = async (leadId: string) => {
    setDistributing(leadId)
    try {
      const res = await fetch('/api/admin/distribute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lead_id: leadId }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      toast.success(`Lead distribué à ${json.count} artisan(s)`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur de distribution')
    } finally {
      setDistributing(null)
    }
  }

  const handleToggleArtisan = async (artisanId: string, actif: boolean) => {
    try {
      const res = await fetch(`/api/admin/artisans/${artisanId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actif: !actif }),
      })
      if (!res.ok) throw new Error()
      toast.success(actif ? 'Artisan désactivé' : 'Artisan activé')
    } catch {
      toast.error('Erreur')
    }
  }

  const navItems = [
    { tab: 'overview' as Tab, label: 'Vue globale', icon: <LayoutDashboard className="w-4 h-4" /> },
    { tab: 'leads' as Tab, label: `Leads (${leads.length})`, icon: <List className="w-4 h-4" /> },
    { tab: 'artisans' as Tab, label: `Artisans (${artisans.length})`, icon: <Users className="w-4 h-4" /> },
    { tab: 'distribution' as Tab, label: 'Distribution', icon: <Zap className="w-4 h-4" /> },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header admin */}
      <div className="bg-primary-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <h1 className="font-heading text-xl">DevisTerrazzo — Admin</h1>
          <a href="/admin/login" className="text-xs text-primary-300 hover:text-white transition-colors">
            Déconnexion
          </a>
        </div>
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-1 pb-2 overflow-x-auto" aria-label="Navigation admin">
          {navItems.map((item) => (
            <button
              key={item.tab}
              onClick={() => setActiveTab(item.tab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-t-lg text-sm font-medium whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === item.tab
                  ? 'bg-white text-primary-900'
                  : 'text-primary-300 hover:text-white hover:bg-white/10'
              }`}
              aria-current={activeTab === item.tab ? 'page' : undefined}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* VUE GLOBALE */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total leads', value: stats.total_leads, sub: `${stats.leads_ce_mois} ce mois`, icon: <List className="w-5 h-5 text-blue-600" />, bg: 'bg-blue-50' },
                { label: 'Leads distribués', value: stats.leads_distribues, sub: `${stats.total_leads > 0 ? Math.round((stats.leads_distribues / stats.total_leads) * 100) : 0}% du total`, icon: <CheckCircle className="w-5 h-5 text-green-600" />, bg: 'bg-green-50' },
                { label: 'Artisans actifs', value: stats.artisans_actifs, sub: `${stats.total_artisans} inscrits`, icon: <Users className="w-5 h-5 text-purple-600" />, bg: 'bg-purple-50' },
                { label: 'Revenus', value: formatCurrency(Number(stats.revenu_total)), sub: `${formatCurrency(Number(stats.revenu_ce_mois))} ce mois`, icon: <Euro className="w-5 h-5 text-amber-600" />, bg: 'bg-amber-50' },
              ].map((stat) => (
                <div key={stat.label} className="card p-4 flex items-center gap-4">
                  <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    {stat.icon}
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-xs text-gray-500">{stat.label}</p>
                    <p className="text-xs text-gray-400">{stat.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Dernières attributions */}
            <div className="card p-5">
              <h2 className="font-semibold text-gray-900 mb-4">Dernières distributions</h2>
              {attributions.length === 0 ? (
                <p className="text-gray-500 text-sm py-4 text-center">Aucune distribution</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="text-gray-500 border-b border-gray-100">
                      <tr>
                        <th scope="col" className="text-left pb-2">Date</th>
                        <th scope="col" className="text-left pb-2">Lead</th>
                        <th scope="col" className="text-left pb-2">Artisan</th>
                        <th scope="col" className="text-left pb-2">Statut</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {attributions.slice(0, 10).map((attr) => (
                        <tr key={attr.id} className="hover:bg-gray-50">
                          <td className="py-2.5 text-gray-500 text-xs">{formatDateTime(attr.attribue_at)}</td>
                          <td className="py-2.5 text-gray-900">
                            {(attr.lead as any)?.ville} — {(attr.lead as any)?.surface}m²
                          </td>
                          <td className="py-2.5 text-gray-700">
                            {(attr.artisan as any)?.prenom} {(attr.artisan as any)?.nom}
                          </td>
                          <td className="py-2.5">
                            <span className={`badge ${STATUT_LEAD_COLORS[attr.statut_artisan]}`}>
                              {STATUT_LEAD_LABELS[attr.statut_artisan]}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* LEADS */}
        {activeTab === 'leads' && (
          <div className="space-y-4">
            {/* Filtres */}
            <div className="flex flex-wrap gap-3">
              <select
                value={filterStatut}
                onChange={(e) => setFilterStatut(e.target.value)}
                className="input-field w-auto text-sm py-2"
                aria-label="Filtrer par statut"
              >
                <option value="">Tous les statuts</option>
                <option value="nouveau">Nouveau</option>
                <option value="distribue">Distribué</option>
                <option value="en_cours">En cours</option>
                <option value="ferme">Fermé</option>
              </select>
              <input
                type="text"
                placeholder="Filtrer par département (ex: 75)"
                value={filterDept}
                onChange={(e) => setFilterDept(e.target.value)}
                className="input-field w-auto text-sm py-2"
              />
              <span className="text-sm text-gray-500 self-center">{filteredLeads.length} résultat(s)</span>
            </div>

            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm" aria-label="Liste des leads">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th scope="col" className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                      <th scope="col" className="text-left px-4 py-3 font-medium text-gray-600">Contact</th>
                      <th scope="col" className="text-left px-4 py-3 font-medium text-gray-600">Ville</th>
                      <th scope="col" className="text-left px-4 py-3 font-medium text-gray-600">Surface</th>
                      <th scope="col" className="text-left px-4 py-3 font-medium text-gray-600">Budget</th>
                      <th scope="col" className="text-left px-4 py-3 font-medium text-gray-600">Statut</th>
                      <th scope="col" className="text-left px-4 py-3 font-medium text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredLeads.map((lead) => (
                      <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                          {formatDate(lead.created_at)}
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900">{lead.prenom} {lead.nom}</p>
                          <p className="text-xs text-gray-500">{lead.email}</p>
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {lead.ville} ({lead.departement})
                        </td>
                        <td className="px-4 py-3 text-gray-700">{lead.surface} m²</td>
                        <td className="px-4 py-3 text-xs text-gray-600">{BUDGET_LABELS[lead.budget]}</td>
                        <td className="px-4 py-3">
                          <span className={`badge ${
                            lead.statut === 'nouveau' ? 'bg-blue-100 text-blue-800' :
                            lead.statut === 'distribue' ? 'bg-green-100 text-green-800' :
                            lead.statut === 'en_cours' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {lead.statut === 'nouveau' ? 'Nouveau' :
                             lead.statut === 'distribue' ? 'Distribué' :
                             lead.statut === 'en_cours' ? 'En cours' : 'Fermé'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <Button
                            size="sm"
                            variant="primary"
                            loading={distributing === lead.id}
                            onClick={() => handleDistribute(lead.id)}
                            disabled={lead.statut === 'distribue'}
                          >
                            <Zap className="w-3 h-3" aria-hidden />
                            Distribuer
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ARTISANS */}
        {activeTab === 'artisans' && (
          <div className="space-y-4">
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm" aria-label="Liste des artisans">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th scope="col" className="text-left px-4 py-3 font-medium text-gray-600">Artisan</th>
                      <th scope="col" className="text-left px-4 py-3 font-medium text-gray-600">Formule</th>
                      <th scope="col" className="text-left px-4 py-3 font-medium text-gray-600">Départements</th>
                      <th scope="col" className="text-right px-4 py-3 font-medium text-gray-600">Solde</th>
                      <th scope="col" className="text-center px-4 py-3 font-medium text-gray-600">Statut</th>
                      <th scope="col" className="text-center px-4 py-3 font-medium text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {artisans.map((a) => (
                      <tr key={a.id} className={`hover:bg-gray-50 transition-colors ${!a.actif ? 'opacity-50' : ''}`}>
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900">{a.prenom} {a.nom}</p>
                          <p className="text-xs text-gray-500">{a.entreprise}</p>
                          <p className="text-xs text-gray-400">{a.email}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`badge ${FORMULE_COLORS[a.formule]}`}>
                            {FORMULE_LABELS[a.formule]}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600 text-xs">
                          {a.departements.join(', ')}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className={`font-bold text-sm ${
                            a.solde_leads === 0 ? 'text-red-600' :
                            a.solde_leads < 3 ? 'text-amber-600' :
                            'text-green-600'
                          }`}>
                            {a.solde_leads}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`badge ${a.actif ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                            {a.actif ? 'Actif' : 'Inactif'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleToggleArtisan(a.id, a.actif)}
                            className={`text-xs font-medium px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                              a.actif
                                ? 'bg-red-50 text-red-700 hover:bg-red-100'
                                : 'bg-green-50 text-green-700 hover:bg-green-100'
                            }`}
                          >
                            {a.actif ? 'Désactiver' : 'Activer'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* DISTRIBUTION */}
        {activeTab === 'distribution' && (
          <div className="space-y-4">
            <div className="card p-6 space-y-4">
              <h2 className="font-semibold text-gray-900">Règles de distribution automatique</h2>
              <div className="grid sm:grid-cols-2 gap-4 text-sm text-gray-700">
                {[
                  '1. Vérifier les départements couverts par l\'artisan',
                  '2. Vérifier que solde_leads > 0',
                  '3. Priorité : Exclusif → Pro → Starter',
                  '4. Respecter le nombre max de partages par formule',
                  '5. Envoyer email + SMS à l\'artisan',
                  '6. Décrémenter le solde de leads',
                ].map((rule) => (
                  <div key={rule} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" aria-hidden />
                    {rule}
                  </div>
                ))}
              </div>
            </div>

            {/* Leads à distribuer */}
            <div className="card p-5">
              <h2 className="font-semibold text-gray-900 mb-4">Leads en attente de distribution</h2>
              {leads.filter((l) => l.statut === 'nouveau').length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-6">Aucun lead en attente.</p>
              ) : (
                <div className="space-y-3">
                  {leads
                    .filter((l) => l.statut === 'nouveau')
                    .map((lead) => (
                      <div key={lead.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                        <div>
                          <p className="font-medium text-gray-900 text-sm">
                            {lead.prenom} {lead.nom} — {lead.ville} ({lead.departement})
                          </p>
                          <p className="text-xs text-gray-500">
                            {lead.surface} m² · {BUDGET_LABELS[lead.budget]} · {formatDate(lead.created_at)}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="cta"
                          loading={distributing === lead.id}
                          onClick={() => handleDistribute(lead.id)}
                        >
                          <Zap className="w-3 h-3" aria-hidden />
                          Distribuer
                        </Button>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
