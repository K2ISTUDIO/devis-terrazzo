import Link from 'next/link'
import { CheckCircle } from 'lucide-react'

export default function InscriptionConfirmeePage() {
  return (
    <div className="min-h-screen bg-primary-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-lg text-center space-y-6">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full">
          <CheckCircle className="w-12 h-12 text-green-500" aria-hidden />
        </div>
        <h1 className="text-4xl font-heading text-primary-900">Inscription confirmée !</h1>
        <p className="text-gray-600">
          Votre compte artisan a été créé. Vous allez recevoir un email de confirmation.
          Vous pouvez dès maintenant accéder à votre espace.
        </p>
        <Link href="/artisans/dashboard" className="btn-primary inline-flex">
          Accéder à mon espace
        </Link>
      </div>
    </div>
  )
}
