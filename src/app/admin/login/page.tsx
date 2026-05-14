'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import { AlertCircle } from 'lucide-react'

export default function AdminLoginPage() {
  const router = useRouter()
  const [key, setKey] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key }),
      })
      if (!res.ok) throw new Error('Clé incorrecte')
      router.push('/admin')
    } catch {
      setError('Clé d\'accès incorrecte')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-primary-900 flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="font-heading text-3xl text-white">Admin</h1>
          <p className="text-primary-300 text-sm mt-1">DevisTerrazzo — Accès réservé</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 space-y-4">
          <div>
            <label htmlFor="admin-key" className="form-label">Clé d'accès admin</label>
            <input
              id="admin-key"
              type="password"
              className="input-field"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              autoFocus
            />
          </div>
          {error && (
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4" aria-hidden />
              {error}
            </div>
          )}
          <Button type="submit" variant="primary" className="w-full" loading={loading}>
            Accéder
          </Button>
        </form>
      </div>
    </div>
  )
}
