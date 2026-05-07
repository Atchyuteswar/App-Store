-- ============================================
-- Personal App Store — Phase 3 Additions
-- Run this in the Supabase SQL Editor
-- ============================================

-- 1. Enable pg_trgm extension for duplicate detection
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2. Broadcast Announcements table
CREATE TABLE IF NOT EXISTS admin_announcements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  app_id UUID REFERENCES apps(id) ON DELETE CASCADE, -- NULL means platform-wide
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  created_by UUID REFERENCES admins(id) ON DELETE SET NULL,
  send_email BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Tester Installs table
CREATE TABLE IF NOT EXISTS tester_installs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  app_id UUID REFERENCES apps(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  version TEXT NOT NULL,
  confirmed_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(app_id, user_id, version)
);

-- 4. Tester Crashes table (if not exists, with extensions)
CREATE TABLE IF NOT EXISTS tester_crashes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  app_id UUID REFERENCES apps(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  app_version TEXT NOT NULL,
  os TEXT DEFAULT 'android',
  os_version TEXT DEFAULT '',
  device_model TEXT DEFAULT '',
  manufacturer TEXT DEFAULT '',
  description TEXT NOT NULL,
  recording_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Add status to ab_test_enrollments
-- First create the type if needed, but for simplicity we'll use TEXT with a check constraint
ALTER TABLE ab_test_enrollments ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'approved';
-- Note: User requested default 'pending' for new requests, but existing should be 'approved'
ALTER TABLE ab_test_enrollments ALTER COLUMN status SET DEFAULT 'pending';

-- 6. Add approval toggle to apps
ALTER TABLE apps ADD COLUMN IF NOT EXISTS enrolment_requires_approval BOOLEAN DEFAULT false;

-- 7. Add triage columns to tester_bugs
ALTER TABLE tester_bugs ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium';
ALTER TABLE tester_bugs ADD COLUMN IF NOT EXISTS internal_notes TEXT;
ALTER TABLE tester_bugs ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES admins(id) ON DELETE SET NULL;
ALTER TABLE tester_bugs ADD COLUMN IF NOT EXISTS recording_url TEXT;

-- 8. Storage bucket for recordings
INSERT INTO storage.buckets (id, name, public)
VALUES ('recordings', 'recordings', true)
ON CONFLICT (id) DO NOTHING;

-- Policies for recordings
CREATE POLICY "Public read recordings" ON storage.objects
  FOR SELECT USING (bucket_id = 'recordings');

CREATE POLICY "Allow recordings upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'recordings');
