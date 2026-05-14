-- ============================================================
-- DevisTerrazzo — Schéma initial Supabase
-- ============================================================

-- Extension UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLE: leads
-- ============================================================
CREATE TABLE IF NOT EXISTS leads (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  prenom            TEXT NOT NULL,
  nom               TEXT NOT NULL,
  email             TEXT NOT NULL,
  telephone         TEXT NOT NULL,
  ville             TEXT NOT NULL,
  code_postal       TEXT NOT NULL,
  surface           NUMERIC(8,2) NOT NULL,
  type_piece        TEXT NOT NULL CHECK (type_piece IN ('salon', 'salle_de_bain', 'cuisine', 'autre')),
  budget            TEXT NOT NULL CHECK (budget IN ('moins_2000', '2000_5000', 'plus_5000')),
  delai             TEXT NOT NULL CHECK (delai IN ('moins_1_mois', '1_3_mois', 'plus_3_mois')),
  message           TEXT,
  rgpd_consent      BOOLEAN NOT NULL DEFAULT FALSE,
  statut            TEXT NOT NULL DEFAULT 'nouveau' CHECK (statut IN ('nouveau', 'distribue', 'en_cours', 'ferme')),
  departement       TEXT GENERATED ALWAYS AS (LEFT(code_postal, 2)) STORED
);

CREATE INDEX idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX idx_leads_departement ON leads(departement);
CREATE INDEX idx_leads_statut ON leads(statut);

-- ============================================================
-- TABLE: artisans
-- ============================================================
CREATE TABLE IF NOT EXISTS artisans (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  nom                  TEXT NOT NULL,
  prenom               TEXT NOT NULL,
  entreprise           TEXT NOT NULL,
  siret                TEXT NOT NULL UNIQUE,
  email                TEXT NOT NULL UNIQUE,
  telephone            TEXT NOT NULL,
  departements         TEXT[] NOT NULL DEFAULT '{}',
  formule              TEXT NOT NULL CHECK (formule IN ('starter', 'pro', 'exclusif')),
  solde_leads          INTEGER NOT NULL DEFAULT 0,
  stripe_customer_id   TEXT,
  stripe_subscription_id TEXT,
  actif                BOOLEAN NOT NULL DEFAULT TRUE,
  -- Métadonnées
  derniere_connexion   TIMESTAMPTZ
);

CREATE INDEX idx_artisans_departements ON artisans USING GIN(departements);
CREATE INDEX idx_artisans_formule ON artisans(formule);
CREATE INDEX idx_artisans_actif ON artisans(actif);

-- ============================================================
-- TABLE: lead_attributions
-- Logs de distribution pour audit RGPD
-- ============================================================
CREATE TABLE IF NOT EXISTS lead_attributions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id         UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  artisan_id      UUID NOT NULL REFERENCES artisans(id) ON DELETE CASCADE,
  attribue_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  statut_artisan  TEXT NOT NULL DEFAULT 'nouveau' CHECK (statut_artisan IN (
    'nouveau', 'contacte', 'devis_envoye', 'gagne', 'perdu', 'injoignable'
  )),
  -- Snapshot du lead au moment de l'attribution (conformité RGPD)
  lead_snapshot   JSONB,
  UNIQUE(lead_id, artisan_id)
);

CREATE INDEX idx_attributions_lead_id ON lead_attributions(lead_id);
CREATE INDEX idx_attributions_artisan_id ON lead_attributions(artisan_id);
CREATE INDEX idx_attributions_statut ON lead_attributions(statut_artisan);

-- ============================================================
-- TABLE: factures
-- ============================================================
CREATE TABLE IF NOT EXISTS factures (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artisan_id          UUID NOT NULL REFERENCES artisans(id) ON DELETE CASCADE,
  stripe_invoice_id   TEXT UNIQUE,
  stripe_payment_intent_id TEXT,
  montant             NUMERIC(10,2) NOT NULL,
  nombre_leads        INTEGER,
  formule             TEXT,
  date                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  statut              TEXT NOT NULL DEFAULT 'en_attente' CHECK (statut IN (
    'en_attente', 'payee', 'echouee', 'remboursee'
  )),
  description         TEXT
);

CREATE INDEX idx_factures_artisan_id ON factures(artisan_id);
CREATE INDEX idx_factures_statut ON factures(statut);

-- ============================================================
-- TABLE: distribution_logs
-- Audit trail complet de chaque distribution
-- ============================================================
CREATE TABLE IF NOT EXISTS distribution_logs (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  lead_id       UUID NOT NULL REFERENCES leads(id),
  artisan_id    UUID REFERENCES artisans(id),
  action        TEXT NOT NULL,
  details       JSONB,
  success       BOOLEAN NOT NULL DEFAULT TRUE,
  error_message TEXT
);

CREATE INDEX idx_dist_logs_lead_id ON distribution_logs(lead_id);
CREATE INDEX idx_dist_logs_created_at ON distribution_logs(created_at DESC);

-- ============================================================
-- TABLE: artisan_sessions (auth simple)
-- ============================================================
CREATE TABLE IF NOT EXISTS artisan_sessions (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artisan_id  UUID NOT NULL REFERENCES artisans(id) ON DELETE CASCADE,
  token       TEXT NOT NULL UNIQUE,
  expires_at  TIMESTAMPTZ NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sessions_token ON artisan_sessions(token);
CREATE INDEX idx_sessions_artisan_id ON artisan_sessions(artisan_id);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE artisans ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_attributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE factures ENABLE ROW LEVEL SECURITY;
ALTER TABLE distribution_logs ENABLE ROW LEVEL SECURITY;

-- Service role bypass (API routes avec service_role key)
CREATE POLICY "service_role_all_leads" ON leads FOR ALL TO service_role USING (true);
CREATE POLICY "service_role_all_artisans" ON artisans FOR ALL TO service_role USING (true);
CREATE POLICY "service_role_all_attributions" ON lead_attributions FOR ALL TO service_role USING (true);
CREATE POLICY "service_role_all_factures" ON factures FOR ALL TO service_role USING (true);
CREATE POLICY "service_role_all_logs" ON distribution_logs FOR ALL TO service_role USING (true);

-- Anon: insertion leads uniquement (formulaire public)
CREATE POLICY "anon_insert_leads" ON leads FOR INSERT TO anon WITH CHECK (rgpd_consent = true);

-- ============================================================
-- FONCTIONS UTILITAIRES
-- ============================================================

-- Décrémenter solde_leads et vérifier > 0
CREATE OR REPLACE FUNCTION decrement_solde(artisan_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  new_solde INTEGER;
BEGIN
  UPDATE artisans
  SET solde_leads = solde_leads - 1
  WHERE id = artisan_uuid AND solde_leads > 0
  RETURNING solde_leads INTO new_solde;
  RETURN COALESCE(new_solde, -1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Stats globales pour le dashboard admin
CREATE OR REPLACE FUNCTION get_admin_stats()
RETURNS TABLE(
  total_leads BIGINT,
  leads_distribues BIGINT,
  leads_ce_mois BIGINT,
  total_artisans BIGINT,
  artisans_actifs BIGINT,
  revenu_total NUMERIC,
  revenu_ce_mois NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM leads)::BIGINT,
    (SELECT COUNT(*) FROM leads WHERE statut != 'nouveau')::BIGINT,
    (SELECT COUNT(*) FROM leads WHERE created_at >= date_trunc('month', NOW()))::BIGINT,
    (SELECT COUNT(*) FROM artisans)::BIGINT,
    (SELECT COUNT(*) FROM artisans WHERE actif = true)::BIGINT,
    (SELECT COALESCE(SUM(montant), 0) FROM factures WHERE statut = 'payee'),
    (SELECT COALESCE(SUM(montant), 0) FROM factures WHERE statut = 'payee' AND date >= date_trunc('month', NOW()));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
