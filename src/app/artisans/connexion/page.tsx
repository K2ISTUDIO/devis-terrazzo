'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import { AlertCircle } from 'lucide-react'

const schema = z.object({
  email: z.string().email('Email invalide'),
  siret: z.string().regex(/^\d{14}$/, 'SIRET invalide (14 chiffres)'),
})

type FormData = z.infer<typeof schema>

export default function ConnexionPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    setError(null)
    try {
      const res = await fetch('/api/artisans/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Identifiants incorrects')
      router.push('/artisans/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de connexion')
    }
  }

  return (
    <div className="min-h-screen bg-primary-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <Link href="/" className="font-heading text-3xl text-primary-800 hover:text-primary-600 transition-colors">
            DevisTerrazzo
          </Link>
          <h1 className="mt-4 text-2xl font-semibold text-gray-900">Espace artisan</h1>
          <p className="mt-1 text-sm text-gray-500">Connectez-vous avec votre email et SIRET</p>
        </div>

        <div className="card p-6 sm:p-8">
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            <div>
              <label htmlFor="email" className="form-label">Email professionnel</label>
              <input id="email" type="email" className="input-field" placeholder="vous@votre-entreprise.fr" {...register('email')} />
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
            </div>

            <div>
              <label htmlFor="siret" className="form-label">SIRET (14 chiffres)</label>
              <input id="siret" type="text" className="input-field" placeholder="12345678900017" maxLength={14} {...register('siret')} />
              {errors.siret && <p className="mt-1 text-xs text-red-600">{errors.siret.message}</p>}
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm" role="alert">
                <AlertCircle className="w-4 h-4 flex-shrink-0" aria-hidden />
                {error}
              </div>
            )}

            <Button type="submit" variant="primary" size="lg" loading={isSubmitting} className="w-full">
              Se connecter
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500">
          Pas encore inscrit ?{' '}
          <Link href="/artisans#inscription" className="text-primary-600 font-semibold hover:underline">
            Rejoindre la plateforme
          </Link>
        </p>
      </div>
    </div>
  )
}
