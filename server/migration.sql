-- ============================================
-- Personal App Store — Supabase Migration
-- Run this in the Supabase SQL Editor
-- ============================================

-- Apps table
CREATE TABLE IF NOT EXISTS apps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  tagline TEXT NOT NULL,
  description TEXT NOT NULL,
  whats_new TEXT DEFAULT '',
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  icon TEXT DEFAULT '',
  screenshots TEXT[] DEFAULT '{}',
  apk_file TEXT DEFAULT '',
  version TEXT DEFAULT '1.0.0',
  size TEXT DEFAULT '0 MB',
  platform TEXT NOT NULL DEFAULT 'android',
  min_os_version TEXT DEFAULT '',
  rating NUMERIC DEFAULT 0,
  downloads INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT false,
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Admins table
CREATE TABLE IF NOT EXISTS admins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create storage bucket for uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('uploads', 'uploads', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to uploads
CREATE POLICY "Public read uploads" ON storage.objects
  FOR SELECT USING (bucket_id = 'uploads');

-- Allow authenticated uploads (service role bypasses RLS anyway)
CREATE POLICY "Allow uploads" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'uploads');

-- Allow deletes
CREATE POLICY "Allow deletes" ON storage.objects
  FOR DELETE USING (bucket_id = 'uploads');

-- Allow updates
CREATE POLICY "Allow updates" ON storage.objects
  FOR UPDATE USING (bucket_id = 'uploads');

-- ============================================
-- Updates for A/B Testing & Users
-- ============================================

-- Add ab_testing_enabled to apps
ALTER TABLE apps ADD COLUMN IF NOT EXISTS ab_testing_enabled BOOLEAN DEFAULT false;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- A/B Test Enrollments table
CREATE TABLE IF NOT EXISTS ab_test_enrollments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  app_id UUID REFERENCES apps(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, app_id)
);

-- ============================================
-- Updates for Tester Hub Features
-- ============================================

-- Tester Messages (Chat)
CREATE TABLE IF NOT EXISTS tester_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  app_id UUID REFERENCES apps(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tester Bugs
CREATE TABLE IF NOT EXISTS tester_bugs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  app_id UUID REFERENCES apps(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'open', -- open, investigating, resolved
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tester Ideas
CREATE TABLE IF NOT EXISTS tester_ideas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  app_id UUID REFERENCES apps(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 2026-05-06: Tester Dashboard Extensions
-- ============================================

-- Add version_history to apps
ALTER TABLE apps ADD COLUMN IF NOT EXISTS version_history JSONB DEFAULT '[]';

-- Enhance Users with profile/device info
ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS device_model TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS manufacturer TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS os_version TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS prefs_new_releases BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS prefs_bug_updates BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS prefs_idea_updates BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS prefs_weekly_digest BOOLEAN DEFAULT false;

-- Enhance Tester Bugs
ALTER TABLE tester_bugs 
  ADD COLUMN IF NOT EXISTS steps TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS severity TEXT DEFAULT 'medium',
  ADD COLUMN IF NOT EXISTS attachments TEXT[] DEFAULT '{}';

-- Enhance Tester Ideas
ALTER TABLE tester_ideas 
  ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'feature',
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'submitted';

-- Tester Idea Upvotes
CREATE TABLE IF NOT EXISTS tester_idea_upvotes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  idea_id UUID REFERENCES tester_ideas(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(idea_id, user_id)
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- version_release, bug_update, message_reply, idea_update, broadcast
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
