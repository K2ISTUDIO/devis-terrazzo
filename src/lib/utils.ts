import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount)
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date))
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export const BUDGET_LABELS: Record<string, string> = {
  moins_2000: '< 2 000 €',
  '2000_5000': '2 000 – 5 000 €',
  plus_5000: '> 5 000 €',
}

export const DELAI_LABELS: Record<string, string> = {
  moins_1_mois: '< 1 mois',
  '1_3_mois': '1 à 3 mois',
  plus_3_mois: '+ de 3 mois',
}

export const PIECE_LABELS: Record<string, string> = {
  salon: 'Salon / Séjour',
  salle_de_bain: 'Salle de bain',
  cuisine: 'Cuisine',
  autre: 'Autre',
}

export const STATUT_LEAD_LABELS: Record<string, string> = {
  nouveau: 'Nouveau',
  contacte: 'Contacté',
  devis_envoye: 'Devis envoyé',
  gagne: 'Gagné',
  perdu: 'Perdu',
  injoignable: 'Injoignable',
}

export const STATUT_LEAD_COLORS: Record<string, string> = {
  nouveau: 'bg-blue-100 text-blue-800',
  contacte: 'bg-yellow-100 text-yellow-800',
  devis_envoye: 'bg-purple-100 text-purple-800',
  gagne: 'bg-green-100 text-green-800',
  perdu: 'bg-red-100 text-red-800',
  injoignable: 'bg-gray-100 text-gray-800',
}

export const FORMULE_LABELS: Record<string, string> = {
  starter: 'Starter',
  pro: 'Pro',
  exclusif: 'Exclusif',
}

export const FORMULE_COLORS: Record<string, string> = {
  starter: 'bg-gray-100 text-gray-800',
  pro: 'bg-blue-100 text-blue-800',
  exclusif: 'bg-amber-100 text-amber-800',
}

export const DEPARTEMENTS_FRANCE = [
  { code: '01', nom: 'Ain' }, { code: '02', nom: 'Aisne' }, { code: '03', nom: 'Allier' },
  { code: '04', nom: 'Alpes-de-Haute-Provence' }, { code: '05', nom: 'Hautes-Alpes' },
  { code: '06', nom: 'Alpes-Maritimes' }, { code: '07', nom: 'Ardèche' },
  { code: '08', nom: 'Ardennes' }, { code: '09', nom: 'Ariège' }, { code: '10', nom: 'Aube' },
  { code: '11', nom: 'Aude' }, { code: '12', nom: 'Aveyron' },
  { code: '13', nom: 'Bouches-du-Rhône' }, { code: '14', nom: 'Calvados' },
  { code: '15', nom: 'Cantal' }, { code: '16', nom: 'Charente' },
  { code: '17', nom: 'Charente-Maritime' }, { code: '18', nom: 'Cher' },
  { code: '19', nom: 'Corrèze' }, { code: '2A', nom: 'Corse-du-Sud' },
  { code: '2B', nom: 'Haute-Corse' }, { code: '21', nom: "Côte-d'Or" },
  { code: '22', nom: "Côtes-d'Armor" }, { code: '23', nom: 'Creuse' },
  { code: '24', nom: 'Dordogne' }, { code: '25', nom: 'Doubs' }, { code: '26', nom: 'Drôme' },
  { code: '27', nom: 'Eure' }, { code: '28', nom: 'Eure-et-Loir' }, { code: '29', nom: 'Finistère' },
  { code: '30', nom: 'Gard' }, { code: '31', nom: 'Haute-Garonne' }, { code: '32', nom: 'Gers' },
  { code: '33', nom: 'Gironde' }, { code: '34', nom: 'Hérault' },
  { code: '35', nom: 'Ille-et-Vilaine' }, { code: '36', nom: 'Indre' },
  { code: '37', nom: 'Indre-et-Loire' }, { code: '38', nom: 'Isère' }, { code: '39', nom: 'Jura' },
  { code: '40', nom: 'Landes' }, { code: '41', nom: 'Loir-et-Cher' }, { code: '42', nom: 'Loire' },
  { code: '43', nom: 'Haute-Loire' }, { code: '44', nom: 'Loire-Atlantique' },
  { code: '45', nom: 'Loiret' }, { code: '46', nom: 'Lot' },
  { code: '47', nom: 'Lot-et-Garonne' }, { code: '48', nom: 'Lozère' },
  { code: '49', nom: 'Maine-et-Loire' }, { code: '50', nom: 'Manche' },
  { code: '51', nom: 'Marne' }, { code: '52', nom: 'Haute-Marne' }, { code: '53', nom: 'Mayenne' },
  { code: '54', nom: 'Meurthe-et-Moselle' }, { code: '55', nom: 'Meuse' },
  { code: '56', nom: 'Morbihan' }, { code: '57', nom: 'Moselle' }, { code: '58', nom: 'Nièvre' },
  { code: '59', nom: 'Nord' }, { code: '60', nom: 'Oise' }, { code: '61', nom: 'Orne' },
  { code: '62', nom: 'Pas-de-Calais' }, { code: '63', nom: 'Puy-de-Dôme' },
  { code: '64', nom: 'Pyrénées-Atlantiques' }, { code: '65', nom: 'Hautes-Pyrénées' },
  { code: '66', nom: 'Pyrénées-Orientales' }, { code: '67', nom: 'Bas-Rhin' },
  { code: '68', nom: 'Haut-Rhin' }, { code: '69', nom: 'Rhône' },
  { code: '70', nom: 'Haute-Saône' }, { code: '71', nom: 'Saône-et-Loire' },
  { code: '72', nom: 'Sarthe' }, { code: '73', nom: 'Savoie' },
  { code: '74', nom: 'Haute-Savoie' }, { code: '75', nom: 'Paris' },
  { code: '76', nom: 'Seine-Maritime' }, { code: '77', nom: 'Seine-et-Marne' },
  { code: '78', nom: 'Yvelines' }, { code: '79', nom: 'Deux-Sèvres' },
  { code: '80', nom: 'Somme' }, { code: '81', nom: 'Tarn' },
  { code: '82', nom: 'Tarn-et-Garonne' }, { code: '83', nom: 'Var' },
  { code: '84', nom: 'Vaucluse' }, { code: '85', nom: 'Vendée' },
  { code: '86', nom: 'Vienne' }, { code: '87', nom: 'Haute-Vienne' },
  { code: '88', nom: 'Vosges' }, { code: '89', nom: 'Yonne' },
  { code: '90', nom: 'Territoire de Belfort' }, { code: '91', nom: 'Essonne' },
  { code: '92', nom: 'Hauts-de-Seine' }, { code: '93', nom: 'Seine-Saint-Denis' },
  { code: '94', nom: 'Val-de-Marne' }, { code: '95', nom: "Val-d'Oise" },
]
