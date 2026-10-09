-- ========================================================
-- CAREERLINE SOLUTION - SUPABASE POSTGRESQL SCHEMA
-- Run this script in your Supabase project:
-- Dashboard -> SQL Editor -> New Query -> Paste & Run
-- ========================================================

-- 1. Users Table (Admin & Recruiters)
CREATE TABLE IF NOT EXISTS cls_users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'Recruiter',
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Jobs Table (Job Postings)
CREATE TABLE IF NOT EXISTS cls_jobs (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  company TEXT,
  location TEXT NOT NULL,
  city TEXT,
  state TEXT,
  job_type TEXT DEFAULT 'Full-Time',
  work_mode TEXT DEFAULT 'On-Site',
  experience TEXT,
  experience_range TEXT,
  salary TEXT,
  openings INTEGER DEFAULT 1,
  urgent BOOLEAN DEFAULT FALSE,
  featured BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'Active',
  skills JSONB DEFAULT '[]'::jsonb,
  description TEXT,
  responsibilities TEXT,
  requirements TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Candidate Applications Table (Permanent Candidate Data)
CREATE TABLE IF NOT EXISTS cls_applications (
  id TEXT PRIMARY KEY,
  job_id TEXT,
  job_title TEXT,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  current_location TEXT,
  experience TEXT,
  current_ctc TEXT,
  expected_ctc TEXT,
  notice_period TEXT,
  skills TEXT,
  cover_note TEXT,
  resume_file_name TEXT,
  resume_url TEXT,
  status TEXT DEFAULT 'New',
  recruiter_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Employer Staffing Requests Table
CREATE TABLE IF NOT EXISTS cls_employer_requests (
  id TEXT PRIMARY KEY,
  company_name TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  designation TEXT,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  city TEXT,
  service_type TEXT,
  positions_needed TEXT,
  roles TEXT,
  urgency TEXT,
  details TEXT,
  status TEXT DEFAULT 'New',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Contact Inquiries Table
CREATE TABLE IF NOT EXISTS cls_inquiries (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'New',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Site Settings Table
CREATE TABLE IF NOT EXISTS cls_settings (
  id TEXT PRIMARY KEY DEFAULT 'site_settings',
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Disable Row Level Security (RLS) so the server API can access all tables
ALTER TABLE cls_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE cls_jobs DISABLE ROW LEVEL SECURITY;
ALTER TABLE cls_applications DISABLE ROW LEVEL SECURITY;
ALTER TABLE cls_employer_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE cls_inquiries DISABLE ROW LEVEL SECURITY;
ALTER TABLE cls_settings DISABLE ROW LEVEL SECURITY;

-- Create indexes for lightning-fast queries and candidate search
CREATE INDEX IF NOT EXISTS idx_cls_jobs_status ON cls_jobs(status);
CREATE INDEX IF NOT EXISTS idx_cls_jobs_category ON cls_jobs(category);
CREATE INDEX IF NOT EXISTS idx_cls_jobs_city ON cls_jobs(city);
CREATE INDEX IF NOT EXISTS idx_cls_apps_job_id ON cls_applications(job_id);
CREATE INDEX IF NOT EXISTS idx_cls_apps_status ON cls_applications(status);
CREATE INDEX IF NOT EXISTS idx_cls_apps_created_at ON cls_applications(created_at DESC);

-- Seed Initial Super Admin User (Password: TofikVora@2002)
INSERT INTO cls_users (id, name, email, password, role, phone)
VALUES (
  'usr_admin',
  'Super Admin',
  'admin@careerlinesolution.com',
  '$2b$10$YIs8FM4qHBv1PY7rgV.lPe2A6KjqqjDAIZ7RxquQEXfT9LXLBp8F2',
  'Admin',
  '+91 7573905399'
)
ON CONFLICT (id) DO UPDATE 
SET password = EXCLUDED.password;
