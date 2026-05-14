import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

async function getArtisanIdFromToken(): Promise<string | null> {
  const cookieStore = cookies()
  const token = cookieStore.get('artisan_token')?.value
  if (!token) return null

  const supabase = createServiceClient()
  const { data } = await supabase
    .from('artisan_sessions')
    .select('artisan_id, expires_at')
    .eq('token', token)
    .single()

  if (!data || new Date(data.expires_at) < new Date()) return null
  return data.artisan_id
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const artisanId = await getArtisanIdFromToken()
    if (!artisanId) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { statut_artisan } = await request.json()

    const validStatuts = ['nouveau', 'contacte', 'devis_envoye', 'gagne', 'perdu', 'injoignable']
    if (!validStatuts.includes(statut_artisan)) {
      return NextResponse.json({ error: 'Statut invalide' }, { status: 400 })
    }

    const supabase = createServiceClient()

    // Vérifier que l'attribution appartient bien à cet artisan
    const { data, error } = await supabase
      .from('lead_attributions')
      .update({ statut_artisan })
      .eq('id', params.id)
      .eq('artisan_id', artisanId)
      .select()
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Attribution introuvable' }, { status: 404 })
    }

    return NextResponse.json({ success: true, attribution: data })
  } catch (err) {
    console.error('[Lead statut] Error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
