export interface Lead {
  id: string
  created_at: string
  prenom: string
  nom: string
  email: string
  telephone: string
  ville: string
  code_postal: string
  departement: string
  surface: number
  type_piece: 'salon' | 'salle_de_bain' | 'cuisine' | 'autre'
  budget: 'moins_2000' | '2000_5000' | 'plus_5000'
  delai: 'moins_1_mois' | '1_3_mois' | 'plus_3_mois'
  message?: string
  rgpd_consent: boolean
  statut: 'nouveau' | 'distribue' | 'en_cours' | 'ferme'
}

export interface Artisan {
  id: string
  created_at: string
  nom: string
  prenom: string
  entreprise: string
  siret: string
  email: string
  telephone: string
  departements: string[]
  formule: 'starter' | 'pro' | 'exclusif'
  solde_leads: number
  stripe_customer_id?: string
  stripe_subscription_id?: string
  actif: boolean
  derniere_connexion?: string
}

export interface LeadAttribution {
  id: string
  lead_id: string
  artisan_id: string
  attribue_at: string
  statut_artisan: 'nouveau' | 'contacte' | 'devis_envoye' | 'gagne' | 'perdu' | 'injoignable'
  lead_snapshot?: Partial<Lead>
  // Joins
  artisan?: Artisan
  lead?: Lead
}

export interface Facture {
  id: string
  artisan_id: string
  stripe_invoice_id?: string
  stripe_payment_intent_id?: string
  montant: number
  nombre_leads?: number
  formule?: string
  date: string
  statut: 'en_attente' | 'payee' | 'echouee' | 'remboursee'
  description?: string
}

export interface AdminStats {
  total_leads: number
  leads_distribues: number
  leads_ce_mois: number
  total_artisans: number
  artisans_actifs: number
  revenu_total: number
  revenu_ce_mois: number
}

export interface LeadFormData {
  prenom: string
  nom: string
  email: string
  telephone: string
  ville: string
  code_postal: string
  surface: number
  type_piece: string
  budget: string
  delai: string
  message?: string
  rgpd_consent: boolean
}

export interface ArtisanFormData {
  nom: string
  prenom: string
  entreprise: string
  siret: string
  email: string
  telephone: string
  departements: string[]
  formule: string
}
