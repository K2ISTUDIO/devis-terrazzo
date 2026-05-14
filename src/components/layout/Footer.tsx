import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-primary-900 text-primary-200 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-3">
            <h2 className="font-heading text-2xl text-white">DevisTerrazzo</h2>
            <p className="text-sm leading-relaxed">
              La plateforme spécialisée pour trouver des artisans terrazzo certifiés partout en France.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-3 text-sm">Pour les particuliers</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/#formulaire" className="hover:text-white transition-colors">Demander un devis</Link></li>
              <li><Link href="/#comment-ca-marche" className="hover:text-white transition-colors">Comment ça marche</Link></li>
              <li><Link href="/#avis" className="hover:text-white transition-colors">Témoignages</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-3 text-sm">Pour les artisans</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/artisans" className="hover:text-white transition-colors">Rejoindre la plateforme</Link></li>
              <li><Link href="/artisans#tarifs" className="hover:text-white transition-colors">Nos formules</Link></li>
              <li><Link href="/artisans/connexion" className="hover:text-white transition-colors">Espace artisan</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-3 text-sm">Informations légales</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/mentions-legales" className="hover:text-white transition-colors">Mentions légales</Link></li>
              <li><Link href="/mentions-legales#confidentialite" className="hover:text-white transition-colors">Politique de confidentialité</Link></li>
              <li><Link href="/mentions-legales#cgv" className="hover:text-white transition-colors">CGV</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-primary-400">
          <p>© {new Date().getFullYear()} DevisTerrazzo. Tous droits réservés.</p>
          <p>Données protégées conformément au RGPD</p>
        </div>
      </div>
    </footer>
  )
}
