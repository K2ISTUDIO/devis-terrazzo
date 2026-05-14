import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export const metadata = {
  title: 'Mentions légales — DevisTerrazzo',
}

export default function MentionsLegalesPage() {
  return (
    <>
      <Navbar />
      <main className="pt-24 pb-16 min-h-screen bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h1 className="text-4xl font-heading text-primary-900 mb-8">Mentions légales</h1>

          <div className="prose prose-gray max-w-none space-y-8 text-sm leading-relaxed text-gray-700">
            <section id="editeur">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Éditeur du site</h2>
              <p>DevisTerrazzo — SAS [Raison sociale à compléter]<br />
              Siège social : [Adresse à compléter]<br />
              SIRET : [À compléter]<br />
              Email : contact@devis-terrazzo.fr</p>
            </section>

            <section id="confidentialite">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Politique de confidentialité</h2>
              <p>Conformément au Règlement Général sur la Protection des Données (RGPD — Règlement UE 2016/679),
              nous vous informons que les données personnelles collectées via ce formulaire sont destinées
              exclusivement à mettre en relation les prospects avec des artisans spécialisés terrazzo.</p>

              <h3 className="font-semibold text-gray-800 mt-4 mb-2">Données collectées</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Nom, prénom</li>
                <li>Adresse email</li>
                <li>Numéro de téléphone</li>
                <li>Ville et code postal</li>
                <li>Détails du projet (surface, type de pièce, budget, délai)</li>
              </ul>

              <h3 className="font-semibold text-gray-800 mt-4 mb-2">Base légale</h3>
              <p>Le traitement est fondé sur le consentement explicite de l'utilisateur (Art. 6.1.a RGPD).
              Le consentement est recueilli via la case à cocher obligatoire du formulaire.</p>

              <h3 className="font-semibold text-gray-800 mt-4 mb-2">Durée de conservation</h3>
              <p>Les données sont conservées 3 ans à compter de la collecte, puis supprimées automatiquement.</p>

              <h3 className="font-semibold text-gray-800 mt-4 mb-2">Vos droits</h3>
              <p>Conformément au RGPD, vous disposez des droits suivants :</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Droit d'accès à vos données</li>
                <li>Droit de rectification</li>
                <li>Droit à l'effacement ("droit à l'oubli")</li>
                <li>Droit à la limitation du traitement</li>
                <li>Droit à la portabilité</li>
                <li>Droit d'opposition</li>
              </ul>
              <p className="mt-2">Pour exercer ces droits : <a href="mailto:rgpd@devis-terrazzo.fr" className="text-primary-600 hover:underline">rgpd@devis-terrazzo.fr</a></p>
              <p>Vous pouvez également saisir la CNIL : <a href="https://www.cnil.fr" className="text-primary-600 hover:underline" target="_blank" rel="noopener noreferrer">www.cnil.fr</a></p>
            </section>

            <section id="cgv">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Conditions Générales de Vente</h2>
              <p>Les CGV relatives aux services proposés aux artisans sont disponibles sur simple demande
              à l'adresse : <a href="mailto:contact@devis-terrazzo.fr" className="text-primary-600 hover:underline">contact@devis-terrazzo.fr</a></p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Cookies</h2>
              <p>Ce site utilise uniquement des cookies techniques nécessaires au fonctionnement de la plateforme.
              Aucun cookie de traçage ou de publicité n'est utilisé.</p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
