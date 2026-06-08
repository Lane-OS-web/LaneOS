-- LaneOS initial schema
-- Multi-tenant freight operations platform

-- Enums
CREATE TYPE load_status AS ENUM (
  'available', 'booked', 'dispatched', 'in_transit',
  'delivered', 'invoiced', 'paid', 'cancelled'
);

CREATE TYPE document_type AS ENUM (
  'rate_confirmation', 'bol', 'pod', 'invoice',
  'lumper_receipt', 'detention_form', 'other'
);

CREATE TYPE claim_type AS ENUM (
  'detention', 'lumper', 'tonu', 'accessorial', 'short_pay', 'other'
);

CREATE TYPE claim_status AS ENUM (
  'draft', 'submitted', 'approved', 'denied', 'paid'
);

CREATE TYPE facility_type AS ENUM ('shipper', 'receiver', 'both');

CREATE TYPE member_role AS ENUM ('owner', 'dispatcher', 'driver', 'admin');

-- Organizations (carriers / fleets)
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  mc_number TEXT,
  dot_number TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Profiles (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Organization membership
CREATE TABLE organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role member_role NOT NULL DEFAULT 'dispatcher',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (organization_id, user_id)
);

-- Brokers (CRM)
CREATE TABLE brokers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  mc_number TEXT,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  payment_terms INTEGER DEFAULT 30,
  credit_rating TEXT,
  notes TEXT,
  total_loads INTEGER DEFAULT 0,
  avg_days_to_pay NUMERIC(5,1),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE broker_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  broker_id UUID NOT NULL REFERENCES brokers(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  interaction_type TEXT NOT NULL DEFAULT 'note',
  subject TEXT,
  body TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Facilities database
CREATE TABLE facilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  facility_type facility_type NOT NULL DEFAULT 'both',
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip TEXT NOT NULL,
  latitude NUMERIC(10,7),
  longitude NUMERIC(10,7),
  dock_hours TEXT,
  appointment_required BOOLEAN DEFAULT false,
  lumper_required BOOLEAN DEFAULT false,
  detention_policy TEXT,
  notes TEXT,
  avg_wait_minutes INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Drivers
CREATE TABLE drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  cdl_number TEXT,
  cdl_expiry DATE,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trucks
CREATE TABLE trucks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  unit_number TEXT NOT NULL,
  vin TEXT,
  make TEXT,
  model TEXT,
  year INTEGER,
  trailer_type TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Loads
CREATE TABLE loads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  load_number TEXT,
  reference_number TEXT,
  status load_status NOT NULL DEFAULT 'available',
  broker_id UUID REFERENCES brokers(id),
  driver_id UUID REFERENCES drivers(id),
  truck_id UUID REFERENCES trucks(id),
  origin_facility_id UUID REFERENCES facilities(id),
  destination_facility_id UUID REFERENCES facilities(id),
  pickup_date TIMESTAMPTZ,
  delivery_date TIMESTAMPTZ,
  commodity TEXT,
  weight_lbs INTEGER,
  miles INTEGER,
  rate NUMERIC(10,2),
  rate_per_mile NUMERIC(6,2),
  fuel_surcharge NUMERIC(10,2) DEFAULT 0,
  accessorials NUMERIC(10,2) DEFAULT 0,
  total_revenue NUMERIC(10,2),
  notes TEXT,
  ai_parsed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Documents
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  load_id UUID REFERENCES loads(id) ON DELETE SET NULL,
  document_type document_type NOT NULL DEFAULT 'other',
  file_name TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  parsed_data JSONB,
  uploaded_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Parsed emails (AI email parsing)
CREATE TABLE parsed_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  load_id UUID REFERENCES loads(id) ON DELETE SET NULL,
  subject TEXT,
  sender TEXT,
  raw_body TEXT NOT NULL,
  parsed_data JSONB,
  confidence NUMERIC(3,2),
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Rate confirmations
CREATE TABLE rate_confirmations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  load_id UUID REFERENCES loads(id) ON DELETE SET NULL,
  document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
  broker_name TEXT,
  load_number TEXT,
  pickup_address TEXT,
  delivery_address TEXT,
  pickup_date TIMESTAMPTZ,
  delivery_date TIMESTAMPTZ,
  rate NUMERIC(10,2),
  commodity TEXT,
  weight_lbs INTEGER,
  parsed_data JSONB,
  raw_text TEXT,
  confidence NUMERIC(3,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Revenue recovery engine
CREATE TABLE revenue_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  load_id UUID NOT NULL REFERENCES loads(id) ON DELETE CASCADE,
  claim_type claim_type NOT NULL,
  status claim_status NOT NULL DEFAULT 'draft',
  amount NUMERIC(10,2) NOT NULL,
  description TEXT,
  detention_start TIMESTAMPTZ,
  detention_end TIMESTAMPTZ,
  detention_hours NUMERIC(5,2),
  submitted_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_loads_org_status ON loads(organization_id, status);
CREATE INDEX idx_loads_broker ON loads(broker_id);
CREATE INDEX idx_documents_load ON documents(load_id);
CREATE INDEX idx_brokers_org ON brokers(organization_id);
CREATE INDEX idx_facilities_org ON facilities(organization_id);
CREATE INDEX idx_revenue_claims_load ON revenue_claims(load_id);
CREATE INDEX idx_org_members_user ON organization_members(user_id);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER organizations_updated_at BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER brokers_updated_at BEFORE UPDATE ON brokers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER facilities_updated_at BEFORE UPDATE ON facilities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER drivers_updated_at BEFORE UPDATE ON drivers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trucks_updated_at BEFORE UPDATE ON trucks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER loads_updated_at BEFORE UPDATE ON loads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER revenue_claims_updated_at BEFORE UPDATE ON revenue_claims
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Helper: get user's organization IDs
CREATE OR REPLACE FUNCTION user_org_ids()
RETURNS SETOF UUID AS $$
  SELECT organization_id FROM organization_members WHERE user_id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Row Level Security
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE brokers ENABLE ROW LEVEL SECURITY;
ALTER TABLE broker_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE trucks ENABLE ROW LEVEL SECURITY;
ALTER TABLE loads ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE parsed_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_confirmations ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_claims ENABLE ROW LEVEL SECURITY;

-- Profiles: users see own profile
CREATE POLICY profiles_select ON profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY profiles_update ON profiles FOR UPDATE USING (id = auth.uid());

-- Organizations: members can read their orgs
CREATE POLICY orgs_select ON organizations FOR SELECT
  USING (id IN (SELECT user_org_ids()));
CREATE POLICY orgs_insert ON organizations FOR INSERT
  WITH CHECK (true);
CREATE POLICY orgs_update ON organizations FOR UPDATE
  USING (id IN (SELECT user_org_ids()));

-- Org members
CREATE POLICY org_members_select ON organization_members FOR SELECT
  USING (organization_id IN (SELECT user_org_ids()) OR user_id = auth.uid());
CREATE POLICY org_members_insert ON organization_members FOR INSERT
  WITH CHECK (organization_id IN (SELECT user_org_ids()) OR user_id = auth.uid());

-- Generic org-scoped policies
CREATE POLICY brokers_all ON brokers FOR ALL
  USING (organization_id IN (SELECT user_org_ids()))
  WITH CHECK (organization_id IN (SELECT user_org_ids()));

CREATE POLICY broker_interactions_all ON broker_interactions FOR ALL
  USING (organization_id IN (SELECT user_org_ids()))
  WITH CHECK (organization_id IN (SELECT user_org_ids()));

CREATE POLICY facilities_all ON facilities FOR ALL
  USING (organization_id IN (SELECT user_org_ids()))
  WITH CHECK (organization_id IN (SELECT user_org_ids()));

CREATE POLICY drivers_all ON drivers FOR ALL
  USING (organization_id IN (SELECT user_org_ids()))
  WITH CHECK (organization_id IN (SELECT user_org_ids()));

CREATE POLICY trucks_all ON trucks FOR ALL
  USING (organization_id IN (SELECT user_org_ids()))
  WITH CHECK (organization_id IN (SELECT user_org_ids()));

CREATE POLICY loads_all ON loads FOR ALL
  USING (organization_id IN (SELECT user_org_ids()))
  WITH CHECK (organization_id IN (SELECT user_org_ids()));

CREATE POLICY documents_all ON documents FOR ALL
  USING (organization_id IN (SELECT user_org_ids()))
  WITH CHECK (organization_id IN (SELECT user_org_ids()));

CREATE POLICY parsed_emails_all ON parsed_emails FOR ALL
  USING (organization_id IN (SELECT user_org_ids()))
  WITH CHECK (organization_id IN (SELECT user_org_ids()));

CREATE POLICY rate_confirmations_all ON rate_confirmations FOR ALL
  USING (organization_id IN (SELECT user_org_ids()))
  WITH CHECK (organization_id IN (SELECT user_org_ids()));

CREATE POLICY revenue_claims_all ON revenue_claims FOR ALL
  USING (organization_id IN (SELECT user_org_ids()))
  WITH CHECK (organization_id IN (SELECT user_org_ids()));

-- Storage bucket for documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY documents_storage_select ON storage.objects FOR SELECT
  USING (bucket_id = 'documents' AND (storage.foldername(name))[1]::uuid IN (SELECT user_org_ids()));

CREATE POLICY documents_storage_insert ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'documents' AND (storage.foldername(name))[1]::uuid IN (SELECT user_org_ids()));

CREATE POLICY documents_storage_delete ON storage.objects FOR DELETE
  USING (bucket_id = 'documents' AND (storage.foldername(name))[1]::uuid IN (SELECT user_org_ids()));
