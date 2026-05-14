export const dynamic = 'force-dynamic'

import { createServiceClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import DashboardArtisanClient from '@/components/artisan/DashboardArtisanClient'
import type { Artisan, LeadAttribution, Facture } from '@/lib/types'

async function getArtisanFromSession(): Promise<Artisan | null> {
  const cookieStore = cookies()
  const token = cookieStore.get('artisan_token')?.value
  if (!token) return null

  const supabase = createServiceClient()
  const { data: session } = await supabase
    .from('artisan_sessions')
    .select('artisan_id, expires_at')
    .eq('token', token)
    .single()

  if (!session || new Date(session.expires_at) < new Date()) return null

  const { data: artisan } = await supabase
    .from('artisans')
    .select('*')
    .eq('id', session.artisan_id)
    .single()

  return artisan
}

export default async function DashboardArtisanPage() {
  const artisan = await getArtisanFromSession()
  if (!artisan) redirect('/artisans/connexion')

  const supabase = createServiceClient()

  // Leads attribués à cet artisan
  const { data: attributions } = await supabase
    .from('lead_attributions')
    .select(`
      *,
      lead:leads(id, created_at, prenom, nom, ville, code_postal, surface, type_piece, budget, delai, statut)
    `)
    .eq('artisan_id', artisan.id)
    .order('attribue_at', { ascending: false })
    .limit(50)

  // Factures
  const { data: factures } = await supabase
    .from('factures')
    .select('*')
    .eq('artisan_id', artisan.id)
    .order('date', { ascending: false })
    .limit(20)

  return (
    <DashboardArtisanClient
      artisan={artisan}
      attributions={(attributions || []) as LeadAttribution[]}
      factures={(factures || []) as Facture[]}
    />
  )
}
