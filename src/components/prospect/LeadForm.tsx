'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import { AlertCircle } from 'lucide-react'

const schema = z.object({
  prenom: z.string().min(2, 'Prénom requis (2 caractères min.)'),
  nom: z.string().min(2, 'Nom requis (2 caractères min.)'),
  telephone: z
    .string()
    .regex(/^(\+33|0)[1-9](\d{2}){4}$/, 'Numéro de téléphone invalide'),
  email: z.string().email('Email invalide'),
  ville: z.string().min(2, 'Ville requise'),
  code_postal: z
    .string()
    .regex(/^\d{5}$/, 'Code postal invalide (5 chiffres)'),
  surface: z
    .number({ invalid_type_error: 'Surface requise' })
    .min(1, 'Surface minimum 1 m²')
    .max(10000, 'Surface maximum 10 000 m²'),
  type_piece: z.enum(['salon', 'salle_de_bain', 'cuisine', 'autre'], {
    required_error: 'Sélectionnez un type de pièce',
  }),
  budget: z.enum(['moins_2000', '2000_5000', 'plus_5000'], {
    required_error: 'Sélectionnez un budget',
  }),
  delai: z.enum(['moins_1_mois', '1_3_mois', 'plus_3_mois'], {
    required_error: 'Sélectionnez un délai',
  }),
  message: z.string().optional(),
  rgpd_consent: z.literal(true, {
    errorMap: () => ({ message: 'Vous devez accepter pour continuer' }),
  }),
})

type FormData = z.infer<typeof schema>

export default function LeadForm() {
  const router = useRouter()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setSubmitError(null)
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Erreur lors de l\'envoi')

      router.push('/confirmation')
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Une erreur est survenue. Réessayez.')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4" aria-label="Formulaire de demande de devis">
      {/* Prénom / Nom */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="prenom" className="form-label">Prénom <span className="text-red-500">*</span></label>
          <input
            id="prenom"
            type="text"
            autoComplete="given-name"
            className="input-field"
            placeholder="Jean"
            aria-invalid={!!errors.prenom}
            aria-describedby={errors.prenom ? 'prenom-error' : undefined}
            {...register('prenom')}
          />
          {errors.prenom && (
            <p id="prenom-error" className="mt-1 text-xs text-red-600" role="alert">{errors.prenom.message}</p>
          )}
        </div>
        <div>
          <label htmlFor="nom" className="form-label">Nom <span className="text-red-500">*</span></label>
          <input
            id="nom"
            type="text"
            autoComplete="family-name"
            className="input-field"
            placeholder="Dupont"
            aria-invalid={!!errors.nom}
            aria-describedby={errors.nom ? 'nom-error' : undefined}
            {...register('nom')}
          />
          {errors.nom && (
            <p id="nom-error" className="mt-1 text-xs text-red-600" role="alert">{errors.nom.message}</p>
          )}
        </div>
      </div>

      {/* Téléphone */}
      <div>
        <label htmlFor="telephone" className="form-label">Téléphone <span className="text-red-500">*</span></label>
        <input
          id="telephone"
          type="tel"
          autoComplete="tel"
          className="input-field"
          placeholder="06 12 34 56 78"
          aria-invalid={!!errors.telephone}
          aria-describedby={errors.telephone ? 'tel-error' : undefined}
          {...register('telephone')}
        />
        {errors.telephone && (
          <p id="tel-error" className="mt-1 text-xs text-red-600" role="alert">{errors.telephone.message}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="form-label">Email <span className="text-red-500">*</span></label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          className="input-field"
          placeholder="jean@exemple.fr"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'email-error' : undefined}
          {...register('email')}
        />
        {errors.email && (
          <p id="email-error" className="mt-1 text-xs text-red-600" role="alert">{errors.email.message}</p>
        )}
      </div>

      {/* Ville / CP */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="ville" className="form-label">Ville <span className="text-red-500">*</span></label>
          <input
            id="ville"
            type="text"
            autoComplete="address-level2"
            className="input-field"
            placeholder="Paris"
            aria-invalid={!!errors.ville}
            {...register('ville')}
          />
          {errors.ville && (
            <p className="mt-1 text-xs text-red-600" role="alert">{errors.ville.message}</p>
          )}
        </div>
        <div>
          <label htmlFor="code_postal" className="form-label">Code postal <span className="text-red-500">*</span></label>
          <input
            id="code_postal"
            type="text"
            autoComplete="postal-code"
            className="input-field"
            placeholder="75001"
            maxLength={5}
            aria-invalid={!!errors.code_postal}
            {...register('code_postal')}
          />
          {errors.code_postal && (
            <p className="mt-1 text-xs text-red-600" role="alert">{errors.code_postal.message}</p>
          )}
        </div>
      </div>

      {/* Surface */}
      <div>
        <label htmlFor="surface" className="form-label">Surface estimée (m²) <span className="text-red-500">*</span></label>
        <input
          id="surface"
          type="number"
          min={1}
          max={10000}
          className="input-field"
          placeholder="30"
          aria-invalid={!!errors.surface}
          {...register('surface', { valueAsNumber: true })}
        />
        {errors.surface && (
          <p className="mt-1 text-xs text-red-600" role="alert">{errors.surface.message}</p>
        )}
      </div>

      {/* Type de pièce */}
      <div>
        <label htmlFor="type_piece" className="form-label">Type de pièce <span className="text-red-500">*</span></label>
        <select
          id="type_piece"
          className="input-field"
          aria-invalid={!!errors.type_piece}
          {...register('type_piece')}
        >
          <option value="">Sélectionnez…</option>
          <option value="salon">Salon / Séjour</option>
          <option value="salle_de_bain">Salle de bain</option>
          <option value="cuisine">Cuisine</option>
          <option value="autre">Autre</option>
        </select>
        {errors.type_piece && (
          <p className="mt-1 text-xs text-red-600" role="alert">{errors.type_piece.message}</p>
        )}
      </div>

      {/* Budget */}
      <div>
        <fieldset>
          <legend className="form-label">Budget estimé <span className="text-red-500">*</span></legend>
          <div className="grid grid-cols-3 gap-2 mt-1">
            {[
              { value: 'moins_2000', label: '< 2 000 €' },
              { value: '2000_5000', label: '2 000 – 5 000 €' },
              { value: 'plus_5000', label: '> 5 000 €' },
            ].map((opt) => (
              <label key={opt.value} className="cursor-pointer">
                <input type="radio" className="sr-only peer" value={opt.value} {...register('budget')} />
                <span className="block text-center px-2 py-2.5 text-xs font-medium rounded-xl border-2 border-gray-200
                  peer-checked:border-primary-500 peer-checked:bg-primary-50 peer-checked:text-primary-700
                  hover:border-primary-300 transition-colors duration-150">
                  {opt.label}
                </span>
              </label>
            ))}
          </div>
          {errors.budget && (
            <p className="mt-1 text-xs text-red-600" role="alert">{errors.budget.message}</p>
          )}
        </fieldset>
      </div>

      {/* Délai */}
      <div>
        <fieldset>
          <legend className="form-label">Délai du projet <span className="text-red-500">*</span></legend>
          <div className="grid grid-cols-3 gap-2 mt-1">
            {[
              { value: 'moins_1_mois', label: '< 1 mois' },
              { value: '1_3_mois', label: '1 à 3 mois' },
              { value: 'plus_3_mois', label: '+ de 3 mois' },
            ].map((opt) => (
              <label key={opt.value} className="cursor-pointer">
                <input type="radio" className="sr-only peer" value={opt.value} {...register('delai')} />
                <span className="block text-center px-2 py-2.5 text-xs font-medium rounded-xl border-2 border-gray-200
                  peer-checked:border-primary-500 peer-checked:bg-primary-50 peer-checked:text-primary-700
                  hover:border-primary-300 transition-colors duration-150">
                  {opt.label}
                </span>
              </label>
            ))}
          </div>
          {errors.delai && (
            <p className="mt-1 text-xs text-red-600" role="alert">{errors.delai.message}</p>
          )}
        </fieldset>
      </div>

      {/* Message libre */}
      <div>
        <label htmlFor="message" className="form-label">Message (optionnel)</label>
        <textarea
          id="message"
          rows={3}
          className="input-field resize-none"
          placeholder="Précisions sur votre projet, contraintes particulières…"
          {...register('message')}
        />
      </div>

      {/* RGPD */}
      <div className="bg-gray-50 rounded-xl p-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            className="mt-0.5 w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer flex-shrink-0"
            aria-invalid={!!errors.rgpd_consent}
            aria-describedby={errors.rgpd_consent ? 'rgpd-error' : undefined}
            {...register('rgpd_consent')}
          />
          <span className="text-xs text-gray-600 leading-relaxed">
            J'accepte que mes données personnelles soient transmises à des artisans certifiés terrazzo
            pour la réalisation de devis. Conformément au RGPD, je dispose d'un droit d'accès,
            de rectification et de suppression.{' '}
            <a href="/mentions-legales" className="text-primary-600 hover:underline" target="_blank">
              Politique de confidentialité
            </a>{' '}
            <span className="text-red-500">*</span>
          </span>
        </label>
        {errors.rgpd_consent && (
          <p id="rgpd-error" className="mt-1.5 text-xs text-red-600" role="alert">{errors.rgpd_consent.message}</p>
        )}
      </div>

      {/* Erreur globale */}
      {submitError && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm" role="alert">
          <AlertCircle className="w-4 h-4 flex-shrink-0" aria-hidden />
          {submitError}
        </div>
      )}

      <Button type="submit" variant="cta" size="lg" loading={isSubmitting} className="w-full text-base">
        {isSubmitting ? 'Envoi en cours…' : 'Recevoir mes devis gratuits'}
      </Button>

      <p className="text-center text-xs text-gray-400">
        Service gratuit · Sans engagement · Données sécurisées
      </p>
    </form>
  )
}
