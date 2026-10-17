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

-- Disable Row Level Security (RLS) and grant permissions to server roles
ALTER TABLE cls_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE cls_jobs DISABLE ROW LEVEL SECURITY;
ALTER TABLE cls_applications DISABLE ROW LEVEL SECURITY;
ALTER TABLE cls_employer_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE cls_inquiries DISABLE ROW LEVEL SECURITY;
ALTER TABLE cls_settings DISABLE ROW LEVEL SECURITY;

-- Add permissive policies in case RLS is forced by Supabase project defaults
DROP POLICY IF EXISTS "public_users" ON cls_users;
CREATE POLICY "public_users" ON cls_users FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "public_jobs" ON cls_jobs;
CREATE POLICY "public_jobs" ON cls_jobs FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "public_applications" ON cls_applications;
CREATE POLICY "public_applications" ON cls_applications FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "public_employer_requests" ON cls_employer_requests;
CREATE POLICY "public_employer_requests" ON cls_employer_requests FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "public_inquiries" ON cls_inquiries;
CREATE POLICY "public_inquiries" ON cls_inquiries FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "public_settings" ON cls_settings;
CREATE POLICY "public_settings" ON cls_settings FOR ALL USING (true) WITH CHECK (true);

-- Grant full table access to all API roles
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

-- Create indexes for lightning-fast queries and candidate search
CREATE INDEX IF NOT EXISTS idx_cls_jobs_status ON cls_jobs(status);
CREATE INDEX IF NOT EXISTS idx_cls_jobs_category ON cls_jobs(category);
CREATE INDEX IF NOT EXISTS idx_cls_jobs_city ON cls_jobs(city);
CREATE INDEX IF NOT EXISTS idx_cls_apps_job_id ON cls_applications(job_id);
CREATE INDEX IF NOT EXISTS idx_cls_apps_status ON cls_applications(status);
CREATE INDEX IF NOT EXISTS idx_cls_apps_created_at ON cls_applications(created_at DESC);

-- Seed Initial Super Admin User (Password: HrHabib@2026)
INSERT INTO cls_users (id, name, email, password, role, phone)
VALUES (
  'usr_admin',
  'Habib (Director)',
  'admin@careerlinesolutions.com',
  '$2b$10$fZiMEfaLs//hxJY2ZsrbiOzS.cKKNUyYXcrzP7jcUVtmT8Qnq8xCO',
  'Admin',
  '+91 9601874036'
)
ON CONFLICT (id) DO UPDATE 
SET password = EXCLUDED.password,
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    phone = EXCLUDED.phone;

-- Seed Initial Site Settings
INSERT INTO cls_settings (id, data)
VALUES (
  'site_settings',
  '{
    "siteName": "CareerLine Solutions",
    "tagline": "TALENT. GROWTH. SUCCESS.",
    "phone": "+91 9601874036",
    "altPhone": "+91 9601874036",
    "whatsapp": "9601874036",
    "email": "info@careerlinesolutions.com",
    "address": "Sarkhej Jambu wala No delo Ahmedabad India 382210",
    "branchOffice": "Sarkhej Jambu wala No delo Ahmedabad India 382210",
    "panIndiaReach": "Mumbai, Delhi-NCR, Bengaluru, Hyderabad, Pune, Chennai, Kolkata, Ahmedabad, Surat, Jaipur, Indore, Chandigarh",
    "stats": {
      "placements": "15,000+",
      "clients": "500+",
      "database": "1,50,000+",
      "industries": "25+"
    }
  }'::jsonb
)
ON CONFLICT (id) DO UPDATE 
SET data = EXCLUDED.data;

-- Seed Initial Active Jobs
INSERT INTO cls_jobs (id, title, category, company, location, city, state, job_type, work_mode, experience, experience_range, salary, openings, urgent, featured, status, skills, description)
VALUES 
(
  'job_1791381924591',
  'Data Entry Specialist',
  'IT & Software',
  'Aerosol IO Ltd',
  'Mumbai',
  'Mumbai',
  'Maharashtra',
  'Full-Time',
  'On-Site',
  '1-3 Years',
  '1-3',
  '1,50,000 - 2,50,000 PA',
  3,
  TRUE,
  TRUE,
  'Active',
  '["Excel DataEntry", "Data Management", "MIS Reporting"]'::jsonb,
  'Looking for accurate and detail-oriented Data Entry Specialists for fast-growing logistics operations.'
),
(
  'job_1791376766393',
  'Senior Software Engineer',
  'IT & Software',
  'Client Confidential',
  'Ahmedabad',
  'Ahmedabad',
  'Gujarat',
  'Full-Time',
  'Hybrid',
  '3-5 Years',
  '3-5',
  '6,00,000 - 12,00,000 PA',
  2,
  TRUE,
  TRUE,
  'Active',
  '["JavaScript", "Node.js", "React", "PostgreSQL", "REST APIs"]'::jsonb,
  'We are hiring an experienced Full-Stack / Backend Engineer to scale enterprise web platforms.'
)
ON CONFLICT (id) DO NOTHING;

