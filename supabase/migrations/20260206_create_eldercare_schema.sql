-- Migration: Create ElderCare Connect Schema
-- Created: 2026-02-06

-- Create family_members table
CREATE TABLE family_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    whatsapp_number TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create elders table
CREATE TABLE elders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    address TEXT,
    medical_conditions TEXT,
    family_contact_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create service_providers table
CREATE TABLE service_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    specialty TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create visits table
CREATE TABLE visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    elder_id UUID NOT NULL REFERENCES elders(id) ON DELETE CASCADE,
    provider_id UUID NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
    scheduled_at TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create visit_logs table
CREATE TABLE visit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    visit_id UUID NOT NULL REFERENCES visits(id) ON DELETE CASCADE,
    photo_url TEXT,
    vitals_json JSONB,
    mood TEXT,
    notes TEXT,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for foreign keys
CREATE INDEX idx_elders_family_contact_id ON elders(family_contact_id);
CREATE INDEX idx_visits_elder_id ON visits(elder_id);
CREATE INDEX idx_visits_provider_id ON visits(provider_id);
CREATE INDEX idx_visits_scheduled_at ON visits(scheduled_at);
CREATE INDEX idx_visit_logs_visit_id ON visit_logs(visit_id);
CREATE INDEX idx_visit_logs_timestamp ON visit_logs(timestamp);

-- Enable Row Level Security
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE elders ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE visit_logs ENABLE ROW LEVEL SECURITY;

-- Row Level Security Policies for family_members
CREATE POLICY "Family members can view their own data"
    ON family_members FOR SELECT
    USING (auth.uid()::text = id::text);

CREATE POLICY "Family members can update their own data"
    ON family_members FOR UPDATE
    USING (auth.uid()::text = id::text);

CREATE POLICY "Anyone can insert family members"
    ON family_members FOR INSERT
    WITH CHECK (true);

-- Row Level Security Policies for elders
CREATE POLICY "Family members can view their elders"
    ON elders FOR SELECT
    USING (family_contact_id IN (SELECT id FROM family_members WHERE auth.uid()::text = id::text));

CREATE POLICY "Family members can manage their elders"
    ON elders FOR ALL
    USING (family_contact_id IN (SELECT id FROM family_members WHERE auth.uid()::text = id::text));

-- Row Level Security Policies for service_providers
CREATE POLICY "Service providers can view their own data"
    ON service_providers FOR SELECT
    USING (auth.uid()::text = id::text);

CREATE POLICY "Service providers can update their own data"
    ON service_providers FOR UPDATE
    USING (auth.uid()::text = id::text);

CREATE POLICY "Anyone can view service providers"
    ON service_providers FOR SELECT
    USING (true);

-- Row Level Security Policies for visits
CREATE POLICY "Family members can view visits for their elders"
    ON visits FOR SELECT
    USING (elder_id IN (SELECT id FROM elders WHERE family_contact_id IN (SELECT id FROM family_members WHERE auth.uid()::text = id::text)));

CREATE POLICY "Service providers can view their visits"
    ON visits FOR SELECT
    USING (provider_id IN (SELECT id FROM service_providers WHERE auth.uid()::text = id::text));

CREATE POLICY "Service providers can update their visits"
    ON visits FOR UPDATE
    USING (provider_id IN (SELECT id FROM service_providers WHERE auth.uid()::text = id::text));

CREATE POLICY "Family members can create visits for their elders"
    ON visits FOR INSERT
    WITH CHECK (elder_id IN (SELECT id FROM elders WHERE family_contact_id IN (SELECT id FROM family_members WHERE auth.uid()::text = id::text)));

-- Row Level Security Policies for visit_logs
CREATE POLICY "Family members can view logs for their elders' visits"
    ON visit_logs FOR SELECT
    USING (visit_id IN (SELECT id FROM visits WHERE elder_id IN (SELECT id FROM elders WHERE family_contact_id IN (SELECT id FROM family_members WHERE auth.uid()::text = id::text))));

CREATE POLICY "Service providers can manage logs for their visits"
    ON visit_logs FOR ALL
    USING (visit_id IN (SELECT id FROM visits WHERE provider_id IN (SELECT id FROM service_providers WHERE auth.uid()::text = id::text)));

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_family_members_updated_at BEFORE UPDATE ON family_members
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_elders_updated_at BEFORE UPDATE ON elders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_providers_updated_at BEFORE UPDATE ON service_providers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_visits_updated_at BEFORE UPDATE ON visits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_visit_logs_updated_at BEFORE UPDATE ON visit_logs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
