-- Email integrations + document scanning fields

CREATE TYPE email_provider AS ENUM ('gmail', 'outlook');

CREATE TABLE email_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  provider email_provider NOT NULL,
  email_address TEXT NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  last_sync_at TIMESTAMPTZ,
  sync_cursor TEXT,
  auto_scan BOOLEAN NOT NULL DEFAULT true,
  auto_send BOOLEAN NOT NULL DEFAULT false,
  scan_filters JSONB NOT NULL DEFAULT '{"broker_domains":[],"subject_keywords":["load","rate","pickup","freight"]}'::jsonb,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (organization_id, email_address)
);

CREATE TABLE email_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  integration_id UUID NOT NULL REFERENCES email_integrations(id) ON DELETE CASCADE,
  external_id TEXT NOT NULL,
  thread_id TEXT,
  subject TEXT,
  sender TEXT,
  recipients TEXT[],
  raw_body TEXT,
  received_at TIMESTAMPTZ,
  direction TEXT NOT NULL DEFAULT 'inbound',
  parsed_email_id UUID REFERENCES parsed_emails(id) ON DELETE SET NULL,
  auto_processed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (integration_id, external_id)
);

CREATE TABLE email_outbox (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  integration_id UUID NOT NULL REFERENCES email_integrations(id) ON DELETE CASCADE,
  to_address TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  template_type TEXT,
  load_id UUID REFERENCES loads(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'queued',
  external_id TEXT,
  sent_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE documents
  ADD COLUMN IF NOT EXISTS scan_status TEXT NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS extracted_text TEXT,
  ADD COLUMN IF NOT EXISTS scan_confidence NUMERIC(3,2);

ALTER TABLE parsed_emails
  ADD COLUMN IF NOT EXISTS integration_id UUID REFERENCES email_integrations(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS external_message_id TEXT;

-- RLS
ALTER TABLE email_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_outbox ENABLE ROW LEVEL SECURITY;

CREATE POLICY email_integrations_org ON email_integrations
  FOR ALL USING (organization_id IN (SELECT user_org_ids()));

CREATE POLICY email_messages_org ON email_messages
  FOR ALL USING (organization_id IN (SELECT user_org_ids()));

CREATE POLICY email_outbox_org ON email_outbox
  FOR ALL USING (organization_id IN (SELECT user_org_ids()));

CREATE INDEX idx_email_messages_org_received ON email_messages(organization_id, received_at DESC);
CREATE INDEX idx_email_integrations_org ON email_integrations(organization_id);
CREATE INDEX idx_documents_scan_status ON documents(organization_id, scan_status);
