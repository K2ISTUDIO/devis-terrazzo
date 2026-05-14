import { CheckCircle, Clock, Mail, Phone } from 'lucide-react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export const metadata = {
  title: 'Demande envoyée — DevisTerrazzo',
  description: 'Votre demande de devis terrazzo a bien été reçue.',
}

export default function ConfirmationPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-green-50 flex items-center py-20 px-4">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          {/* Icône succès */}
          <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full">
            <CheckCircle className="w-14 h-14 text-green-500" aria-hidden />
          </div>

          <div className="space-y-3">
            <h1 className="text-4xl sm:text-5xl font-heading text-primary-900">
              Demande envoyée avec succès !
            </h1>
            <p className="text-lg text-gray-600">
              Votre demande de devis pour un sol en terrazzo coulé a bien été reçue.
              Un email de confirmation vous a été envoyé.
            </p>
          </div>

          {/* Prochaines étapes */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 text-left space-y-5">
            <h2 className="text-xl font-semibold text-primary-900">Prochaines étapes</h2>

            <div className="space-y-4">
              {[
                {
                  icon: <Mail className="w-5 h-5 text-primary-600" aria-hidden />,
                  titre: 'Email de confirmation',
                  desc: 'Vérifiez votre boîte mail (et les spams). Vous recevrez un récapitulatif de votre demande.',
                },
                {
                  icon: <Clock className="w-5 h-5 text-primary-600" aria-hidden />,
                  titre: 'Sous 48 heures',
                  desc: 'Des artisans spécialisés terrazzo de votre région vont analyser votre projet.',
                },
                {
                  icon: <Phone className="w-5 h-5 text-primary-600" aria-hidden />,
                  titre: 'Prise de contact',
                  desc: 'Vous serez contacté directement par les artisans sélectionnés pour affiner votre devis.',
                },
              ].map((step) => (
                <div key={step.titre} className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
                    {step.icon}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{step.titre}</p>
                    <p className="text-gray-600 text-sm">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RGPD mention */}
          <p className="text-xs text-gray-400 max-w-lg mx-auto">
            Conformément au RGPD, vos données sont utilisées uniquement pour vous mettre en relation
            avec des artisans terrazzo. Aucune revente à des tiers.{' '}
            <Link href="/mentions-legales" className="text-primary-500 hover:underline">
              En savoir plus
            </Link>
          </p>

          <Link href="/" className="btn-outline inline-flex">
            Retour à l'accueil
          </Link>
        </div>
      </main>
      <Footer />
    </>
  )
}
