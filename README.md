# DevisTerrazzo

Application web complète de génération et redistribution de leads pour le marché **sol terrazzo coulé** en France.

## Stack technique

- **Frontend** : Next.js 14 (App Router) + Tailwind CSS
- **Backend** : API Routes Next.js
- **Base de données** : Supabase (PostgreSQL)
- **Emails** : Resend
- **SMS** : Twilio
- **Paiements** : Stripe
- **Auth artisan** : Sessions JWT maison (cookie httpOnly)

---

## Structure du projet

```
src/
├── app/
│   ├── page.tsx                        # Landing page prospects
│   ├── confirmation/page.tsx           # Page après soumission lead
│   ├── mentions-legales/page.tsx       # RGPD + CGV
│   ├── artisans/
│   │   ├── page.tsx                    # Landing artisans + formules
│   │   ├── connexion/page.tsx          # Login artisan
│   │   ├── dashboard/page.tsx          # Dashboard artisan (SSR)
│   │   ├── recharger/page.tsx          # Recharge leads
│   │   └── inscription-confirmee/page.tsx
│   ├── admin/
│   │   ├── page.tsx                    # Dashboard admin (SSR)
│   │   └── login/page.tsx
│   └── api/
│       ├── leads/route.ts              # POST lead (formulaire)
│       ├── artisans/
│       │   ├── inscription/route.ts    # POST inscription artisan
│       │   ├── auth/route.ts           # POST/DELETE session artisan
│       │   ├── leads/[id]/route.ts     # PATCH statut lead
│       │   └── recharger/route.ts      # POST recharge leads
│       ├── admin/
│       │   ├── auth/route.ts           # POST login admin
│       │   ├── distribute/route.ts     # POST distribution manuelle
│       │   └── artisans/[id]/route.ts  # PATCH artisan
│       └── webhooks/stripe/route.ts    # Webhooks Stripe
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   ├── ui/
│   │   ├── Button.tsx
│   │   └── Badge.tsx
│   ├── prospect/
│   │   └── LeadForm.tsx
│   ├── artisan/
│   │   ├── ArtisanInscriptionForm.tsx
│   │   ├── DashboardArtisanClient.tsx
│   │   └── RechargerClient.tsx
│   └── admin/
│       └── AdminDashboardClient.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts                   # Client browser
│   │   └── server.ts                   # Client server + service_role
│   ├── stripe.ts
│   ├── resend.ts
│   ├── twilio.ts
│   ├── emails.ts                       # Templates email
│   ├── distribution.ts                 # Moteur de distribution
│   ├── types.ts                        # Types TypeScript
│   └── utils.ts                        # Helpers + constantes
├── middleware.ts                        # Auth guard admin + artisan
supabase/migrations/
└── 001_initial_schema.sql              # Schéma PostgreSQL complet
```

---

## Installation

### 1. Cloner et installer les dépendances

```bash
git clone <repo>
cd devis-terrazzo
npm install
```

### 2. Configurer les variables d'environnement

```bash
cp .env.local.example .env.local
```

Remplir toutes les valeurs dans `.env.local`.

### 3. Configurer Supabase

1. Créer un projet sur [supabase.com](https://supabase.com)
2. Aller dans **SQL Editor** et exécuter le fichier `supabase/migrations/001_initial_schema.sql`
3. Récupérer l'URL et les clés dans **Project Settings > API**

### 4. Configurer Stripe

1. Créer un compte sur [stripe.com](https://stripe.com)
2. En mode test, créer les produits/prix pour chaque formule :
   - Starter : 15€ (paiement unique)
   - Pro : 35€ (paiement unique)
   - Exclusif : 60€ (paiement unique)
3. Récupérer les `price_xxx` IDs et les ajouter dans `.env.local`
4. Configurer le webhook Stripe vers `https://votre-domaine.fr/api/webhooks/stripe`
5. Sélectionner les événements : `checkout.session.completed`, `invoice.paid`, `invoice.payment_failed`, `customer.subscription.deleted`

### 5. Configurer Resend

1. Créer un compte sur [resend.com](https://resend.com)
2. Ajouter et vérifier votre domaine d'envoi
3. Générer une clé API

### 6. Configurer Twilio

1. Créer un compte sur [twilio.com](https://twilio.com)
2. Acheter un numéro de téléphone français
3. Récupérer `ACCOUNT_SID`, `AUTH_TOKEN` et le numéro

### 7. Lancer le serveur de développement

```bash
npm run dev
```

L'application est accessible sur `http://localhost:3000`.

---

## Routes principales

| URL | Description |
|-----|-------------|
| `/` | Landing page prospects (formulaire devis) |
| `/confirmation` | Page de confirmation post-soumission |
| `/mentions-legales` | Mentions légales + RGPD |
| `/artisans` | Landing artisans (formules + inscription) |
| `/artisans/connexion` | Connexion espace artisan |
| `/artisans/dashboard` | Dashboard artisan (protégé) |
| `/artisans/recharger` | Recharge leads (protégé) |
| `/admin/login` | Login admin |
| `/admin` | Dashboard admin (protégé) |

---

## Règles de distribution automatique

À chaque soumission de lead :

1. Le lead est enregistré en base avec statut `nouveau`
2. Les artisans éligibles sont identifiés :
   - Département du lead couvert par l'artisan
   - `actif = true`
   - `solde_leads > 0`
3. Tri par priorité : **Exclusif** (1 max) → **Pro** (2 max) → **Starter** (3 max)
4. Attribution + snapshot du lead (avec téléphone)
5. Email + SMS envoyés à chaque artisan
6. Solde decrementé atomiquement (`decrement_solde()`)
7. Alerte email si solde < 3
8. Lead mis à jour en statut `distribue`
9. Tout est loggé dans `distribution_logs` pour audit

---

## Conformité RGPD

- Case à cocher obligatoire sur le formulaire prospect
- Téléphone du prospect masqué jusqu'à l'attribution (stocké dans `lead_snapshot` de l'attribution)
- Politique de confidentialité complète sur `/mentions-legales`
- Données de consentement horodatées en base
- Logs de distribution complets pour audit
- Aucune revente de données à des tiers

---

## Déploiement (Vercel)

```bash
npm run build
vercel deploy
```

Variables d'environnement à configurer dans Vercel Dashboard.

Penser à mettre à jour `NEXT_PUBLIC_APP_URL` avec l'URL de production.

---

## Sécurité

- Auth artisan : token aléatoire 32 bytes, cookie `httpOnly + Secure + SameSite`
- Auth admin : clé secrète en variable d'environnement
- Middleware Next.js protège les routes `/admin` et `/artisans/dashboard`
- Webhook Stripe vérifié par signature HMAC
- RLS Supabase actif sur toutes les tables
- Validation Zod sur toutes les API routes
