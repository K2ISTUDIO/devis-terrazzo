export const dynamic = 'force-dynamic'

import { createServiceClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import RechargerClient from '@/components/artisan/RechargerClient'

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
    .select('id, prenom, nom, formule, solde_leads')
    .eq('id', session.artisan_id)
    .single()

  return data
}

export default async function RechargerPage() {
  const artisan = await getArtisan()
  if (!artisan) redirect('/artisans/connexion')

  return <RechargerClient artisan={artisan} />
}
