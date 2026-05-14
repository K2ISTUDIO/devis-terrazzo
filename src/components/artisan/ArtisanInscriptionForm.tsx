'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import { DEPARTEMENTS_FRANCE } from '@/lib/utils'
import { AlertCircle, ChevronDown } from 'lucide-react'

const schema = z.object({
  nom: z.string().min(2, 'Nom requis'),
  prenom: z.string().min(2, 'Prénom requis'),
  entreprise: z.string().min(2, 'Raison sociale requise'),
  siret: z
    .string()
    .regex(/^\d{14}$/, 'SIRET invalide (14 chiffres sans espaces)'),
  email: z.string().email('Email invalide'),
  telephone: z
    .string()
    .regex(/^(\+33|0)[1-9](\d{2}){4}$/, 'Téléphone invalide'),
  departements: z.array(z.string()).min(1, 'Sélectionnez au moins 1 département'),
  formule: z.enum(['starter', 'pro', 'exclusif'], {
    required_error: 'Sélectionnez une formule',
  }),
  cgv_consent: z.literal(true, {
    errorMap: () => ({ message: 'Vous devez accepter les CGV' }),
  }),
})

type FormData = z.infer<typeof schema>

export default function ArtisanInscriptionForm() {
  const router = useRouter()
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [deptSearch, setDeptSearch] = useState('')
  const [deptOpen, setDeptOpen] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { departements: [] },
  })

  const selectedDepts = watch('departements') || []
  const selectedFormule = watch('formule')

  const toggleDept = (code: string) => {
    const current = selectedDepts
    if (current.includes(code)) {
      setValue('departements', current.filter((d) => d !== code), { shouldValidate: true })
    } else {
      setValue('departements', [...current, code], { shouldValidate: true })
    }
  }

  const filteredDepts = DEPARTEMENTS_FRANCE.filter(
    (d) =>
      d.nom.toLowerCase().includes(deptSearch.toLowerCase()) ||
      d.code.startsWith(deptSearch)
  )

  const onSubmit = async (data: FormData) => {
    setSubmitError(null)
    try {
      const res = await fetch('/api/artisans/inscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Erreur lors de l\'inscription')

      // Redirection vers Stripe Checkout
      if (json.checkoutUrl) {
        window.location.href = json.checkoutUrl
      } else {
        router.push('/artisans/inscription-confirmee')
      }
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Une erreur est survenue.')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      {/* Nom / Prénom */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="prenom" className="form-label">Prénom <span className="text-red-500">*</span></label>
          <input id="prenom" type="text" className="input-field" placeholder="Jean" {...register('prenom')} />
          {errors.prenom && <p className="mt-1 text-xs text-red-600">{errors.prenom.message}</p>}
        </div>
        <div>
          <label htmlFor="nom" className="form-label">Nom <span className="text-red-500">*</span></label>
          <input id="nom" type="text" className="input-field" placeholder="Dupont" {...register('nom')} />
          {errors.nom && <p className="mt-1 text-xs text-red-600">{errors.nom.message}</p>}
        </div>
      </div>

      {/* Entreprise */}
      <div>
        <label htmlFor="entreprise" className="form-label">Raison sociale / Entreprise <span className="text-red-500">*</span></label>
        <input id="entreprise" type="text" className="input-field" placeholder="Terrazzo Pro SARL" {...register('entreprise')} />
        {errors.entreprise && <p className="mt-1 text-xs text-red-600">{errors.entreprise.message}</p>}
      </div>

      {/* SIRET */}
      <div>
        <label htmlFor="siret" className="form-label">SIRET <span className="text-red-500">*</span></label>
        <input id="siret" type="text" className="input-field" placeholder="12345678900017" maxLength={14} {...register('siret')} />
        {errors.siret && <p className="mt-1 text-xs text-red-600">{errors.siret.message}</p>}
      </div>

      {/* Email / Tel */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="email-artisan" className="form-label">Email professionnel <span className="text-red-500">*</span></label>
          <input id="email-artisan" type="email" className="input-field" placeholder="jean@terrazzo-pro.fr" {...register('email')} />
          {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
        </div>
        <div>
          <label htmlFor="tel-artisan" className="form-label">Téléphone <span className="text-red-500">*</span></label>
          <input id="tel-artisan" type="tel" className="input-field" placeholder="06 12 34 56 78" {...register('telephone')} />
          {errors.telephone && <p className="mt-1 text-xs text-red-600">{errors.telephone.message}</p>}
        </div>
      </div>

      {/* Départements couverts */}
      <div>
        <label className="form-label">Départements couverts <span className="text-red-500">*</span></label>

        {/* Tags sélectionnés */}
        {selectedDepts.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {selectedDepts.map((code) => {
              const dept = DEPARTEMENTS_FRANCE.find((d) => d.code === code)
              return (
                <button
                  key={code}
                  type="button"
                  onClick={() => toggleDept(code)}
                  className="inline-flex items-center gap-1 bg-primary-100 text-primary-700 text-xs px-2.5 py-1 rounded-full hover:bg-red-100 hover:text-red-700 transition-colors cursor-pointer"
                  aria-label={`Retirer ${dept?.nom}`}
                >
                  {code} — {dept?.nom}
                  <span aria-hidden>×</span>
                </button>
              )
            })}
          </div>
        )}

        {/* Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setDeptOpen(!deptOpen)}
            className="input-field flex items-center justify-between cursor-pointer text-left"
            aria-expanded={deptOpen}
            aria-haspopup="listbox"
          >
            <span className="text-gray-500 text-sm">
              {selectedDepts.length === 0
                ? 'Sélectionnez vos départements…'
                : `${selectedDepts.length} département(s) sélectionné(s)`}
            </span>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${deptOpen ? 'rotate-180' : ''}`} aria-hidden />
          </button>

          {deptOpen && (
            <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
              <div className="p-2 border-b border-gray-100">
                <input
                  type="text"
                  placeholder="Rechercher un département…"
                  className="w-full px-3 py-2 text-sm bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary-400"
                  value={deptSearch}
                  onChange={(e) => setDeptSearch(e.target.value)}
                  autoFocus
                />
              </div>
              <ul className="max-h-48 overflow-y-auto" role="listbox" aria-label="Départements">
                {filteredDepts.map((dept) => (
                  <li key={dept.code}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={selectedDepts.includes(dept.code)}
                      onClick={() => toggleDept(dept.code)}
                      className={`w-full text-left px-4 py-2.5 text-sm cursor-pointer transition-colors ${
                        selectedDepts.includes(dept.code)
                          ? 'bg-primary-50 text-primary-700 font-medium'
                          : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <span className="font-mono text-xs mr-2 text-gray-400">{dept.code}</span>
                      {dept.nom}
                    </button>
                  </li>
                ))}
              </ul>
              <div className="p-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setDeptOpen(false)}
                  className="w-full text-center text-xs text-primary-600 font-medium py-1 hover:underline cursor-pointer"
                >
                  Valider la sélection
                </button>
              </div>
            </div>
          )}
        </div>
        {errors.departements && (
          <p className="mt-1 text-xs text-red-600">{errors.departements.message}</p>
        )}
      </div>

      {/* Formule */}
      <div>
        <fieldset>
          <legend className="form-label">Formule choisie <span className="text-red-500">*</span></legend>
          <div className="space-y-2 mt-1">
            {[
              { value: 'starter', label: 'Starter', prix: '15€/lead', desc: 'Partagé 3 artisans max · Sans engagement' },
              { value: 'pro', label: 'Pro', prix: '35€/lead', desc: 'Partagé 2 artisans max · Min. 5 leads/mois', badge: 'Recommandé' },
              { value: 'exclusif', label: 'Exclusif', prix: '60€/lead', desc: 'Lead 100% exclusif · Remplacement garanti', badge: 'Premium' },
            ].map((opt) => (
              <label key={opt.value} className="cursor-pointer block">
                <input type="radio" className="sr-only peer" value={opt.value} {...register('formule')} />
                <div className="flex items-center justify-between px-4 py-3 border-2 border-gray-200 rounded-xl
                  peer-checked:border-primary-500 peer-checked:bg-primary-50
                  hover:border-primary-300 transition-colors duration-150">
                  <div>
                    <span className="font-semibold text-gray-900 text-sm">{opt.label}</span>
                    {opt.badge && (
                      <span className="ml-2 text-xs font-medium bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full">{opt.badge}</span>
                    )}
                    <p className="text-xs text-gray-500 mt-0.5">{opt.desc}</p>
                  </div>
                  <span className="text-lg font-bold text-primary-700">{opt.prix}</span>
                </div>
              </label>
            ))}
          </div>
          {errors.formule && <p className="mt-1 text-xs text-red-600">{errors.formule.message}</p>}
        </fieldset>
      </div>

      {/* CGV */}
      <div className="bg-gray-50 rounded-xl p-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            className="mt-0.5 w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
            {...register('cgv_consent')}
          />
          <span className="text-xs text-gray-600 leading-relaxed">
            J'accepte les{' '}
            <a href="/mentions-legales#cgv" className="text-primary-600 hover:underline" target="_blank">
              Conditions Générales de Vente
            </a>{' '}
            et la{' '}
            <a href="/mentions-legales#confidentialite" className="text-primary-600 hover:underline" target="_blank">
              Politique de confidentialité
            </a>. <span className="text-red-500">*</span>
          </span>
        </label>
        {errors.cgv_consent && <p className="mt-1 text-xs text-red-600">{errors.cgv_consent.message}</p>}
      </div>

      {/* Erreur globale */}
      {submitError && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm" role="alert">
          <AlertCircle className="w-4 h-4 flex-shrink-0" aria-hidden />
          {submitError}
        </div>
      )}

      <Button type="submit" variant="cta" size="lg" loading={isSubmitting} className="w-full text-base">
        {isSubmitting ? 'Création du compte…' : 'Créer mon compte et payer'}
      </Button>

      <p className="text-center text-xs text-gray-400">
        Paiement sécurisé Stripe · Aucun frais caché · Résiliation à tout moment
      </p>
    </form>
  )
}
