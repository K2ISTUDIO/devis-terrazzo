import LeadForm from '@/components/prospect/LeadForm'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { CheckCircle, Star, Users, Clock, Shield, ArrowRight } from 'lucide-react'

const TESTIMONIALS = [
  {
    name: 'Marie D.',
    ville: 'Lyon (69)',
    note: 5,
    texte: 'Trois devis reçus en 48h, tous très professionnels. J\'ai choisi un artisan de Lyon et le résultat est magnifique.',
    surface: '45 m²',
  },
  {
    name: 'Thomas B.',
    ville: 'Bordeaux (33)',
    note: 5,
    texte: 'Service très rapide. Les artisans proposés connaissent vraiment leur métier. Mon salon en terrazzo est bluffant.',
    surface: '32 m²',
  },
  {
    name: 'Sophie L.',
    ville: 'Paris (75)',
    note: 5,
    texte: 'J\'hésitais sur le budget, mais les devis étaient clairs et détaillés. Très bonne expérience du début à la fin.',
    surface: '28 m²',
  },
]

const STATS = [
  { value: '2 400+', label: 'Projets réalisés' },
  { value: '98%', label: 'Clients satisfaits' },
  { value: '48h', label: 'Délai de réponse moyen' },
  { value: '0€', label: 'Service entièrement gratuit' },
]

const ETAPES = [
  { num: '01', titre: 'Décrivez votre projet', desc: 'Remplissez le formulaire en 2 minutes avec les détails de votre projet terrazzo.' },
  { num: '02', titre: 'Artisans sélectionnés', desc: 'Nos artisans spécialisés terrazzo de votre région reçoivent votre demande.' },
  { num: '03', titre: 'Recevez vos devis', desc: 'Comparez jusqu\'à 3 devis personnalisés et choisissez en toute liberté.' },
]

export default function HomePage() {
  return (
    <>
      <Navbar />

      {/* HERO */}
      <section className="relative bg-gradient-to-br from-primary-50 via-white to-primary-50 pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 opacity-5" aria-hidden>
          <div className="absolute top-0 left-0 w-96 h-96 bg-primary-400 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-cta rounded-full translate-x-1/2 translate-y-1/2 blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Texte gauche */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-semibold">
                <CheckCircle className="w-4 h-4" aria-hidden />
                Service 100% gratuit et sans engagement
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading text-primary-900 leading-tight">
                Votre sol en<br />
                <span className="text-cta">terrazzo coulé</span><br />
                sur mesure
              </h1>

              <p className="text-lg text-gray-600 leading-relaxed max-w-lg">
                Obtenez jusqu'à <strong>3 devis gratuits</strong> d'artisans spécialisés terrazzo
                près de chez vous. Réponse en moins de 48h, sans engagement.
              </p>

              {/* Preuves sociales rapides */}
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" aria-hidden />
                    ))}
                  </div>
                  <span className="font-semibold">4.9/5</span>
                  <span className="text-gray-400">— 847 avis</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="w-4 h-4 text-primary-500" aria-hidden />
                  <span>2 400+ projets réalisés</span>
                </div>
              </div>

              {/* Avantages */}
              <ul className="space-y-2.5">
                {[
                  'Artisans certifiés et vérifiés',
                  'Devis détaillés et transparents',
                  'Aucun engagement, aucun frais cachés',
                  'Données personnelles protégées (RGPD)',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-gray-700">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Formulaire droite */}
            <div id="formulaire" className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-heading text-primary-900 mb-1">
                  Demandez votre devis gratuit
                </h2>
                <p className="text-sm text-gray-500">Formulaire sécurisé — réponse sous 48h</p>
              </div>
              <LeadForm />
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="bg-primary-600 py-12" aria-label="Chiffres clés">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-white">
                <div className="text-3xl sm:text-4xl font-heading font-bold mb-1">{stat.value}</div>
                <div className="text-primary-200 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMMENT ÇA MARCHE */}
      <section className="py-20 bg-white" id="comment-ca-marche">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-4xl sm:text-5xl font-heading text-primary-900 mb-4">
              Comment ça marche ?
            </h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              En 3 étapes simples, trouvez l'artisan idéal pour votre projet terrazzo.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Ligne de connexion desktop */}
            <div className="hidden md:block absolute top-8 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-primary-200 via-primary-400 to-primary-200" aria-hidden />

            {ETAPES.map((etape, i) => (
              <div key={etape.num} className="relative text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 text-white rounded-2xl font-heading text-2xl font-bold mb-4 relative z-10 shadow-lg">
                  {etape.num}
                </div>
                <h3 className="text-xl font-semibold text-primary-900 mb-2">{etape.titre}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{etape.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <a href="#formulaire" className="btn-cta text-base">
              Démarrer maintenant
              <ArrowRight className="w-5 h-5" aria-hidden />
            </a>
          </div>
        </div>
      </section>

      {/* TÉMOIGNAGES */}
      <section className="py-20 bg-primary-50" id="avis">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-4xl sm:text-5xl font-heading text-primary-900 mb-4">
              Ce que disent nos clients
            </h2>
            <p className="text-gray-600">Plus de 847 avis vérifiés — Note moyenne 4.9/5</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <article key={t.name} className="card p-6 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center gap-1 mb-3" aria-label={`Note : ${t.note} sur 5`}>
                  {[...Array(t.note)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" aria-hidden />
                  ))}
                </div>
                <blockquote className="text-gray-700 text-sm leading-relaxed mb-4 italic">
                  "{t.texte}"
                </blockquote>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-primary-900 text-sm">{t.name}</p>
                    <p className="text-gray-500 text-xs">{t.ville}</p>
                  </div>
                  <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full font-medium">
                    {t.surface}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* GARANTIES */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Shield className="w-8 h-8 text-primary-600" aria-hidden />,
                titre: 'Artisans certifiés',
                desc: 'Tous nos artisans sont vérifiés, assurés et spécialisés dans le terrazzo coulé traditionnel.',
              },
              {
                icon: <Clock className="w-8 h-8 text-primary-600" aria-hidden />,
                titre: 'Réponse en 48h',
                desc: 'Recevez vos premiers devis sous 48 heures ouvrées. Vous êtes libre de comparer et choisir.',
              },
              {
                icon: <CheckCircle className="w-8 h-8 text-primary-600" aria-hidden />,
                titre: '100% Gratuit',
                desc: 'Notre service de mise en relation est entièrement gratuit pour vous. Aucun frais caché.',
              },
            ].map((g) => (
              <div key={g.titre} className="text-center space-y-3">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-50 rounded-2xl">
                  {g.icon}
                </div>
                <h3 className="text-lg font-semibold text-primary-900">{g.titre}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{g.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-700 py-16">
        <div className="max-w-3xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-4xl sm:text-5xl font-heading text-white">
            Prêt à concrétiser votre projet ?
          </h2>
          <p className="text-primary-200 text-lg">
            Rejoignez les 2 400 propriétaires qui ont trouvé leur artisan terrazzo via notre plateforme.
          </p>
          <a href="#formulaire" className="btn-cta text-base">
            Demander mes devis gratuits
            <ArrowRight className="w-5 h-5" aria-hidden />
          </a>
        </div>
      </section>

      <Footer />
    </>
  )
}
