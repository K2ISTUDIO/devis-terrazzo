import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { randomBytes } from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { email, siret } = await request.json()

    if (!email || !siret) {
      return NextResponse.json({ error: 'Email et SIRET requis' }, { status: 400 })
    }

    const supabase = createServiceClient()

    // Vérifier les identifiants
    const { data: artisan, error } = await supabase
      .from('artisans')
      .select('id, nom, prenom, actif')
      .eq('email', email.toLowerCase())
      .eq('siret', siret)
      .single()

    if (error || !artisan) {
      return NextResponse.json({ error: 'Identifiants incorrects' }, { status: 401 })
    }

    if (!artisan.actif) {
      return NextResponse.json(
        { error: 'Compte non activé. Veuillez finaliser votre paiement.' },
        { status: 403 }
      )
    }

    // Créer une session
    const token = randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 jours

    await supabase.from('artisan_sessions').insert({
      artisan_id: artisan.id,
      token,
      expires_at: expiresAt.toISOString(),
    })

    // Mettre à jour derniere_connexion
    await supabase
      .from('artisans')
      .update({ derniere_connexion: new Date().toISOString() })
      .eq('id', artisan.id)

    const response = NextResponse.json({ success: true })
    response.cookies.set('artisan_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: expiresAt,
      path: '/',
    })

    return response
  } catch (err) {
    console.error('[Artisan auth] Error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true })
  response.cookies.delete('artisan_token')
  return response
}
