import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import ArtisanInscriptionForm from '@/components/artisan/ArtisanInscriptionForm'
import { CheckCircle, Star, TrendingUp, MapPin, Zap, Shield } from 'lucide-react'
import Link from 'next/link'

const FORMULES = [
  {
    id: 'starter',
    nom: 'Starter',
    prix: '15',
    unite: '€ / lead',
    couleur: 'border-gray-200 bg-white',
    badge: '',
    partage: 'Partagé 3 artisans max',
    engagement: 'Sans engagement',
    avantages: [
      'Lead partagé avec 2 autres artisans max',
      'Infos complètes hors téléphone',
      'Téléphone débloqué après achat',
      'Sans abonnement ni minimum',
    ],
    inconvenient: 'Concurrence avec 2 autres artisans',
  },
  {
    id: 'pro',
    nom: 'Pro',
    prix: '35',
    unite: '€ / lead',
    couleur: 'border-primary-400 bg-primary-50',
    badge: 'Recommandé',
    partage: 'Partagé 2 artisans max',
    engagement: 'Min. 5 leads/mois',
    avantages: [
      'Lead partagé avec 1 seul concurrent',
      'Téléphone inclus dès réception',
      'Priorité de distribution',
      'Alerte solde faible automatique',
    ],
    inconvenient: null,
  },
  {
    id: 'exclusif',
    nom: 'Exclusif',
    prix: '60',
    unite: '€ / lead',
    couleur: 'border-amber-400 bg-amber-50',
    badge: 'Premium',
    partage: 'Lead 100% exclusif',
    engagement: 'Priorité géographique',
    avantages: [
      'Lead en exclusivité totale',
      'Priorité géographique absolue',
      'Remplacement si prospect injoignable',
      'Téléphone + toutes infos immédiatement',
    ],
    inconvenient: null,
  },
]

const AVANTAGES = [
  {
    icon: <MapPin className="w-6 h-6 text-primary-600" aria-hidden />,
    titre: 'Leads ciblés par département',
    desc: 'Recevez uniquement des leads dans les départements que vous couvrez.',
  },
  {
    icon: <Zap className="w-6 h-6 text-primary-600" aria-hidden />,
    titre: 'Notification instantanée',
    desc: 'Email et SMS dès qu\'un nouveau lead correspond à vos critères.',
  },
  {
    icon: <TrendingUp className="w-6 h-6 text-primary-600" aria-hidden />,
    titre: 'Prospects qualifiés',
    desc: 'Chaque prospect a rempli un formulaire détaillé avec surface, budget et délai.',
  },
  {
    icon: <Shield className="w-6 h-6 text-primary-600" aria-hidden />,
    titre: 'Garantie remplacement',
    desc: 'Formule Exclusif : lead remplacé si le prospect est injoignable sous 48h.',
  },
]

export const metadata = {
  title: 'Artisans terrazzo — Recevez des leads qualifiés | DevisTerrazzo',
  description: 'Développez votre activité terrazzo avec des leads qualifiés. 3 formules adaptées à votre volume.',
}

export default function ArtisansPage() {
  return (
    <>
      <Navbar />

      {/* HERO */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-white/10 text-white px-4 py-2 rounded-full text-sm font-medium">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" aria-hidden />
            Rejoignez 200+ artisans terrazzo sur la plateforme
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading">
            Développez votre activité<br />
            <span className="text-amber-400">terrazzo coulé</span>
          </h1>

          <p className="text-primary-200 text-lg max-w-2xl mx-auto leading-relaxed">
            Recevez des demandes de devis de particuliers qualifiés dans vos départements.
            Vous ne payez que pour les leads qui vous correspondent.
          </p>

          <a href="#inscription" className="btn-cta inline-flex text-base">
            Commencer à recevoir des leads
          </a>

          <div className="flex flex-wrap justify-center gap-6 pt-4">
            {[
              '2 400+ projets par an',
              'Prospects vérifiés',
              'Sans abonnement obligatoire',
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 text-primary-200 text-sm">
                <CheckCircle className="w-4 h-4 text-green-400" aria-hidden />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AVANTAGES */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {AVANTAGES.map((a) => (
              <div key={a.titre} className="card p-5 hover:shadow-md transition-shadow duration-200">
                <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center mb-4">
                  {a.icon}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 text-sm">{a.titre}</h3>
                <p className="text-gray-600 text-xs leading-relaxed">{a.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FORMULES */}
      <section className="py-20 bg-gray-50" id="tarifs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-4xl sm:text-5xl font-heading text-primary-900 mb-4">Choisissez votre formule</h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              Adaptez votre investissement à votre volume d'activité. Changez de formule à tout moment.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {FORMULES.map((f) => (
              <div
                key={f.id}
                className={`rounded-2xl border-2 p-6 relative flex flex-col ${f.couleur} ${f.badge ? 'shadow-lg' : ''}`}
              >
                {f.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full text-white ${
                      f.id === 'pro' ? 'bg-primary-600' : 'bg-amber-500'
                    }`}>
                      {f.badge}
                    </span>
                  </div>
                )}

                <div className="mb-5">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{f.nom}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-heading font-bold text-primary-800">{f.prix}</span>
                    <span className="text-gray-500 text-sm">{f.unite}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{f.partage}</p>
                  <p className="text-xs text-gray-400">{f.engagement}</p>
                </div>

                <ul className="space-y-2.5 flex-1 mb-6">
                  {f.avantages.map((av) => (
                    <li key={av} className="flex items-start gap-2 text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" aria-hidden />
                      {av}
                    </li>
                  ))}
                </ul>

                <a
                  href="#inscription"
                  className={`block text-center py-2.5 px-4 rounded-xl font-semibold text-sm transition-colors duration-200 cursor-pointer ${
                    f.id === 'pro'
                      ? 'bg-primary-600 text-white hover:bg-primary-700'
                      : f.id === 'exclusif'
                      ? 'bg-amber-500 text-white hover:bg-amber-600'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                >
                  Choisir {f.nom}
                </a>
              </div>
            ))}
          </div>

          {/* Note */}
          <p className="text-center text-sm text-gray-500 mt-8">
            Paiement sécurisé par Stripe · Facturation mensuelle · Annulation à tout moment
          </p>
        </div>
      </section>

      {/* FORMULAIRE D'INSCRIPTION */}
      <section className="py-20 bg-white" id="inscription">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-heading text-primary-900 mb-3">Rejoindre la plateforme</h2>
            <p className="text-gray-600">
              Inscription gratuite — Accès aux leads dès validation de votre compte.
            </p>
          </div>
          <div className="card p-6 sm:p-8">
            <ArtisanInscriptionForm />
          </div>
        </div>
      </section>

      {/* CONNEXION déjà inscrit */}
      <div className="bg-primary-50 py-8 text-center">
        <p className="text-gray-600 text-sm">
          Déjà inscrit ?{' '}
          <Link href="/artisans/connexion" className="text-primary-600 font-semibold hover:underline cursor-pointer">
            Accéder à votre espace artisan
          </Link>
        </p>
      </div>

      <Footer />
    </>
  )
}
