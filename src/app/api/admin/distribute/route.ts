import { NextRequest, NextResponse } from 'next/server'
import { distributeLeadToArtisans } from '@/lib/distribution'

export async function POST(request: NextRequest) {
  const adminKey = request.cookies.get('admin_key')?.value
  if (adminKey !== process.env.ADMIN_SECRET_KEY) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const { lead_id } = await request.json()
    if (!lead_id) {
      return NextResponse.json({ error: 'lead_id requis' }, { status: 400 })
    }

    const result = await distributeLeadToArtisans(lead_id)
    return NextResponse.json({ success: true, count: result.count, artisans: result.artisanIds })
  } catch (err) {
    console.error('[Admin distribute] Error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Erreur distribution' },
      { status: 500 }
    )
  }
}
