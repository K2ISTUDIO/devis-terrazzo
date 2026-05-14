import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const { key } = await request.json()

  if (key !== process.env.ADMIN_SECRET_KEY) {
    return NextResponse.json({ error: 'Clé incorrecte' }, { status: 401 })
  }

  const response = NextResponse.json({ success: true })
  response.cookies.set('admin_key', key, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 8 * 60 * 60, // 8 heures
    path: '/',
  })

  return response
}
