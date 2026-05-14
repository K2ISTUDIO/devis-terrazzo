import Link from 'next/link'
import { Phone } from 'lucide-react'

export default function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="font-heading text-2xl text-primary-800 hover:text-primary-600 transition-colors">
          DevisTerrazzo
        </Link>

        <nav aria-label="Navigation principale" className="hidden sm:flex items-center gap-6">
          <Link href="/#comment-ca-marche" className="text-sm text-gray-600 hover:text-primary-700 transition-colors cursor-pointer">
            Comment ça marche
          </Link>
          <Link href="/#avis" className="text-sm text-gray-600 hover:text-primary-700 transition-colors cursor-pointer">
            Avis clients
          </Link>
          <Link href="/artisans" className="text-sm text-gray-600 hover:text-primary-700 transition-colors cursor-pointer">
            Vous êtes artisan ?
          </Link>
        </nav>

        <Link href="/#formulaire" className="btn-cta text-sm py-2 px-4">
          Devis gratuit
        </Link>
      </div>
    </header>
  )
}
