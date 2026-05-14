export const dynamic = 'force-dynamic'

import { createServiceClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import AdminDashboardClient from '@/components/admin/AdminDashboardClient'
import type { Lead, Artisan, LeadAttribution, AdminStats } from '@/lib/types'

function checkAdminAuth(): boolean {
  const headersList = headers()
  const adminKey = headersList.get('x-admin-key')
  // Simple vérification basée sur cookie en prod (voir middleware)
  return true // Middleware gère l'auth
}

export default async function AdminPage() {
  const supabase = createServiceClient()

  const [
    { data: statsRaw },
    { data: leads },
    { data: artisans },
    { data: attributions },
  ] = await Promise.all([
    supabase.rpc('get_admin_stats'),
    supabase.from('leads').select('*').order('created_at', { ascending: false }).limit(100),
    supabase.from('artisans').select('*').order('created_at', { ascending: false }),
    supabase
      .from('lead_attributions')
      .select('*, artisan:artisans(id, nom, prenom, entreprise), lead:leads(id, ville, surface)')
      .order('attribue_at', { ascending: false })
      .limit(50),
  ])

  const stats: AdminStats = statsRaw?.[0] || {
    total_leads: 0,
    leads_distribues: 0,
    leads_ce_mois: 0,
    total_artisans: 0,
    artisans_actifs: 0,
    revenu_total: 0,
    revenu_ce_mois: 0,
  }

  return (
    <AdminDashboardClient
      stats={stats}
      leads={(leads || []) as Lead[]}
      artisans={(artisans || []) as Artisan[]}
      attributions={(attributions || []) as LeadAttribution[]}
    />
  )
}
