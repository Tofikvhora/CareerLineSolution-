require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const { readData, writeData } = require('../database/db');

// Check Supabase Environment Variables
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';

let supabase = null;
const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_KEY);

if (isSupabaseConfigured) {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
    console.log('[DATABASE] Supabase PostgreSQL Client initialized.');

    // Async self-check to verify table access & credentials
    supabase.from('cls_jobs').select('count', { count: 'exact', head: true })
      .then(({ count, error }) => {
        if (error) {
          console.error('❌ [DATABASE] Supabase connection test FAILED:', error.message);
          if (error.message.includes('cls_jobs') || error.code === '42P01') {
            console.error('👉 Tip: Table "cls_jobs" not found! Run "database/supabase_schema.sql" in your Supabase SQL Editor.');
          } else {
            console.error('👉 Tip: Check your SUPABASE_KEY permissions or service_role key.');
          }
        } else {
          console.log(`✅ [DATABASE] Supabase live connection verified! (${count ?? 0} jobs found in cls_jobs).`);
        }
      })
      .catch(err => {
        console.error('❌ [DATABASE] Supabase network check failed:', err.message);
      });
  } catch (err) {
    console.error('[DATABASE] Failed to initialize Supabase client:', err.message);
    supabase = null;
  }
} else {
  console.log('[DATABASE] Supabase credentials not found (SUPABASE_URL / SUPABASE_KEY missing). Using local JSON storage (database/data.json).');
}

// -------------------------------------------------------------
// DATA CONVERSION HELPERS
// -------------------------------------------------------------

function rowToUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    password: row.password,
    role: row.role,
    phone: row.phone,
    createdAt: row.created_at
  };
}

function userToRow(u) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    password: u.password,
    role: u.role || 'Recruiter',
    phone: u.phone || '',
    created_at: u.createdAt || new Date().toISOString()
  };
}

function rowToJob(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    company: row.company,
    location: row.location,
    city: row.city,
    state: row.state,
    jobType: row.job_type,
    workMode: row.work_mode,
    experience: row.experience,
    experienceRange: row.experience_range,
    salary: row.salary,
    openings: row.openings || 1,
    urgent: Boolean(row.urgent),
    featured: Boolean(row.featured),
    status: row.status || 'Active',
    skills: Array.isArray(row.skills) ? row.skills : [],
    description: row.description || '',
    responsibilities: row.responsibilities || '',
    requirements: row.requirements || '',
    createdAt: row.created_at
  };
}

function jobToRow(j) {
  return {
    id: j.id,
    title: j.title,
    category: j.category,
    company: j.company || 'Client Confidential',
    location: j.location,
    city: j.city || '',
    state: j.state || 'Pan-India',
    job_type: j.jobType || 'Full-Time',
    work_mode: j.workMode || 'On-Site',
    experience: j.experience || '1 - 3 Years',
    experience_range: j.experienceRange || '1-3',
    salary: j.salary || 'Negotiable',
    openings: parseInt(j.openings, 10) || 1,
    urgent: Boolean(j.urgent),
    featured: Boolean(j.featured),
    status: j.status || 'Active',
    skills: Array.isArray(j.skills) ? j.skills : [],
    description: j.description || '',
    responsibilities: j.responsibilities || '',
    requirements: j.requirements || '',
    created_at: j.createdAt || new Date().toISOString()
  };
}

function rowToApp(row) {
  if (!row) return null;
  return {
    id: row.id,
    jobId: row.job_id,
    jobTitle: row.job_title,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    currentLocation: row.current_location,
    experience: row.experience,
    currentCTC: row.current_ctc,
    expectedCTC: row.expected_ctc,
    noticePeriod: row.notice_period,
    skills: row.skills,
    coverNote: row.cover_note,
    resumeFileName: row.resume_file_name,
    resumeUrl: row.resume_url,
    status: row.status || 'New',
    recruiterNotes: row.recruiter_notes || '',
    createdAt: row.created_at
  };
}

function appToRow(a) {
  return {
    id: a.id,
    job_id: a.jobId,
    job_title: a.jobTitle,
    full_name: a.fullName,
    email: a.email,
    phone: a.phone,
    current_location: a.currentLocation || 'Not Specified',
    experience: a.experience || 'Fresher',
    current_ctc: a.currentCTC || 'Not Disclosed',
    expected_ctc: a.expectedCTC || 'Negotiable',
    notice_period: a.noticePeriod || 'Immediate',
    skills: a.skills || '',
    cover_note: a.coverNote || '',
    resume_file_name: a.resumeFileName || '',
    resume_url: a.resumeUrl || '',
    status: a.status || 'New',
    recruiter_notes: a.recruiterNotes || '',
    created_at: a.createdAt || new Date().toISOString()
  };
}

function rowToReq(row) {
  if (!row) return null;
  return {
    id: row.id,
    companyName: row.company_name,
    contactPerson: row.contact_person,
    designation: row.designation,
    email: row.email,
    phone: row.phone,
    city: row.city,
    serviceType: row.service_type,
    positionsNeeded: row.positions_needed,
    roles: row.roles,
    urgency: row.urgency,
    details: row.details,
    status: row.status || 'New',
    notes: row.notes || '',
    createdAt: row.created_at
  };
}

function reqToRow(r) {
  return {
    id: r.id,
    company_name: r.companyName,
    contact_person: r.contactPerson,
    designation: r.designation || 'HR / Hiring Manager',
    email: r.email,
    phone: r.phone,
    city: r.city || 'Pan-India',
    service_type: r.serviceType || 'Permanent Recruitment',
    positions_needed: r.positionsNeeded || '1-5',
    roles: r.roles || 'Various',
    urgency: r.urgency || 'Standard',
    details: r.details || '',
    status: r.status || 'New',
    notes: r.notes || '',
    created_at: r.createdAt || new Date().toISOString()
  };
}

function rowToInq(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    subject: row.subject,
    message: row.message,
    status: row.status || 'New',
    createdAt: row.created_at
  };
}

function inqToRow(i) {
  return {
    id: i.id,
    name: i.name,
    email: i.email,
    phone: i.phone || '',
    subject: i.subject || 'General Inquiry',
    message: i.message,
    status: i.status || 'New',
    created_at: i.createdAt || new Date().toISOString()
  };
}

// -------------------------------------------------------------
// AUTOMATIC INITIAL SEED (ONE-TIME MIGRATION TO SUPABASE)
// -------------------------------------------------------------
async function autoSeedSupabaseIfEmpty() {
  if (!supabase) return;
  try {
    const local = readData();

    // 1. Check and Seed Users
    const { count: userCount, error: userErr } = await supabase.from('cls_users').select('*', { count: 'exact', head: true });
    if (userErr) {
      console.warn('[DATABASE] cls_users access warning:', userErr.message);
    } else if (userCount === 0 && local.users && local.users.length > 0) {
      console.log('[DATABASE] Seeding initial users into Supabase...');
      const { error: insertUserErr } = await supabase.from('cls_users').insert(local.users.map(userToRow));
      if (insertUserErr) console.error('[DATABASE] Failed to seed users:', insertUserErr.message);
      else console.log('[DATABASE] Users seeded successfully.');
    }

    // 2. Check and Seed Jobs
    const { count: jobCount, error: jobErr } = await supabase.from('cls_jobs').select('*', { count: 'exact', head: true });
    if (jobErr) {
      console.warn('[DATABASE] cls_jobs access warning:', jobErr.message);
    } else if (jobCount === 0 && local.jobs && local.jobs.length > 0) {
      console.log('[DATABASE] Seeding initial jobs into Supabase...');
      const { error: insertJobErr } = await supabase.from('cls_jobs').insert(local.jobs.map(jobToRow));
      if (insertJobErr) console.error('[DATABASE] Failed to seed jobs:', insertJobErr.message);
      else console.log(`[DATABASE] Seeded ${local.jobs.length} jobs into Supabase successfully.`);
    }

    // 3. Check and Seed Settings
    const { data: settingsRow, error: settingsErr } = await supabase.from('cls_settings').select('id').eq('id', 'site_settings').maybeSingle();
    if (settingsErr) {
      console.warn('[DATABASE] cls_settings access warning:', settingsErr.message);
    } else if (!settingsRow && local.settings) {
      console.log('[DATABASE] Seeding initial settings into Supabase...');
      const { error: insertSetErr } = await supabase.from('cls_settings').upsert({
        id: 'site_settings',
        data: local.settings,
        updated_at: new Date().toISOString()
      });
      if (insertSetErr) console.error('[DATABASE] Failed to seed settings:', insertSetErr.message);
      else console.log('[DATABASE] Settings seeded successfully.');
    }
  } catch (seedErr) {
    console.error('[DATABASE] Error during automatic Supabase seed:', seedErr.message);
  }
}

// Trigger initial seed check on startup if configured
if (isSupabaseConfigured) {
  autoSeedSupabaseIfEmpty();
}

// -------------------------------------------------------------
// PUBLIC & ADMIN DATA LAYER (DUAL-MODE)
// -------------------------------------------------------------

// 1. Settings
async function getSettings() {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('cls_settings').select('data').eq('id', 'site_settings').maybeSingle();
      if (!error && data && data.data) {
        return data.data;
      }
    } catch (e) {
      console.error('[DATABASE] getSettings Supabase error, falling back to local:', e.message);
    }
  }
  const local = readData();
  return local.settings;
}

async function updateSettings(newSettings) {
  if (supabase) {
    try {
      const current = await getSettings();
      const merged = { ...current, ...newSettings };
      const { error } = await supabase.from('cls_settings').upsert({
        id: 'site_settings',
        data: merged,
        updated_at: new Date().toISOString()
      });
      if (!error) return merged;
    } catch (e) {
      console.error('[DATABASE] updateSettings Supabase error, falling back to local:', e.message);
    }
  }
  const local = readData();
  local.settings = { ...local.settings, ...newSettings };
  writeData(local);
  return local.settings;
}

// 2. Jobs
async function getJobs() {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('cls_jobs').select('*').order('created_at', { ascending: false });
      if (!error && data) {
        return data.map(rowToJob);
      }
    } catch (e) {
      console.error('[DATABASE] getJobs Supabase error, falling back to local:', e.message);
    }
  }
  const local = readData();
  return local.jobs || [];
}

async function getJobById(id) {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('cls_jobs').select('*').eq('id', id).maybeSingle();
      if (!error && data) {
        return rowToJob(data);
      }
    } catch (e) {
      console.error('[DATABASE] getJobById Supabase error, falling back to local:', e.message);
    }
  }
  const local = readData();
  return (local.jobs || []).find(j => j.id === id) || null;
}

async function createJob(jobData) {
  if (supabase) {
    try {
      const row = jobToRow(jobData);
      const { data, error } = await supabase.from('cls_jobs').insert([row]).select().single();
      if (error) {
        console.error('❌ [DATABASE] Supabase insert job failed:', error.message, error.details || '', error.hint || '');
      } else if (data) {
        console.log(`✅ [DATABASE] Job "${jobData.title}" created in Supabase (id: ${data.id})`);
        return rowToJob(data);
      }
    } catch (e) {
      console.error('[DATABASE] createJob Supabase exception, falling back to local:', e.message);
    }
  } else {
    console.warn('[DATABASE] Supabase is NOT active. Storing job in local database/data.json.');
  }
  const local = readData();
  if (!local.jobs) local.jobs = [];
  local.jobs.unshift(jobData);
  writeData(local);
  return jobData;
}

async function updateJob(id, updates) {
  if (supabase) {
    try {
      const existing = await getJobById(id);
      if (!existing) return null;
      const merged = { ...existing, ...updates, id: existing.id, createdAt: existing.createdAt };
      const row = jobToRow(merged);
      const { data, error } = await supabase.from('cls_jobs').update(row).eq('id', id).select().single();
      if (error) {
        console.error('❌ [DATABASE] Supabase update job failed:', error.message);
      } else if (data) {
        return rowToJob(data);
      }
    } catch (e) {
      console.error('[DATABASE] updateJob Supabase exception, falling back to local:', e.message);
    }
  }
  const local = readData();
  const index = (local.jobs || []).findIndex(j => j.id === id);
  if (index === -1) return null;
  const existing = local.jobs[index];
  const updated = {
    ...existing,
    ...updates,
    id: existing.id,
    createdAt: existing.createdAt,
    skills: Array.isArray(updates.skills) ? updates.skills : (updates.skills ? updates.skills.split(',').map(s => s.trim()).filter(Boolean) : existing.skills)
  };
  local.jobs[index] = updated;
  writeData(local);
  return updated;
}

async function toggleJobStatus(id) {
  const job = await getJobById(id);
  if (!job) return null;
  const newStatus = job.status === 'Active' ? 'Inactive' : 'Active';
  return await updateJob(id, { status: newStatus });
}

async function deleteJob(id) {
  if (supabase) {
    try {
      const { error } = await supabase.from('cls_jobs').delete().eq('id', id);
      if (error) {
        console.error('❌ [DATABASE] Supabase delete job failed:', error.message);
      } else {
        return true;
      }
    } catch (e) {
      console.error('[DATABASE] deleteJob Supabase exception, falling back to local:', e.message);
    }
  }
  const local = readData();
  const prevLen = (local.jobs || []).length;
  local.jobs = (local.jobs || []).filter(j => j.id !== id);
  if (local.jobs.length === prevLen) return false;
  writeData(local);
  return true;
}

// 3. Applications
async function getApplications() {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('cls_applications').select('*').order('created_at', { ascending: false });
      if (!error && data) {
        return data.map(rowToApp);
      }
    } catch (e) {
      console.error('[DATABASE] getApplications Supabase error, falling back to local:', e.message);
    }
  }
  const local = readData();
  return local.applications || [];
}

async function getApplicationById(id) {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('cls_applications').select('*').eq('id', id).maybeSingle();
      if (!error && data) {
        return rowToApp(data);
      }
    } catch (e) {
      console.error('[DATABASE] getApplicationById Supabase error, falling back to local:', e.message);
    }
  }
  const local = readData();
  return (local.applications || []).find(a => a.id === id) || null;
}

async function createApplication(appData) {
  if (supabase) {
    try {
      const row = appToRow(appData);
      const { data, error } = await supabase.from('cls_applications').insert([row]).select().single();
      if (error) {
        console.error('❌ [DATABASE] Supabase createApplication failed:', error.message, error.details || '', error.hint || '');
      } else if (data) {
        console.log(`✅ [DATABASE] Application created in Supabase for ${appData.fullName} (id: ${data.id})`);
        return rowToApp(data);
      }
    } catch (e) {
      console.error('[DATABASE] createApplication Supabase exception, falling back to local:', e.message);
    }
  } else {
    console.warn('[DATABASE] Supabase is NOT active. Storing application in local data.json.');
  }
  const local = readData();
  if (!local.applications) local.applications = [];
  local.applications.unshift(appData);
  writeData(local);
  return appData;
}

async function updateApplication(id, updates) {
  if (supabase) {
    try {
      const patch = {};
      if (updates.status !== undefined) patch.status = updates.status;
      if (updates.recruiterNotes !== undefined) patch.recruiter_notes = updates.recruiterNotes;
      const { data, error } = await supabase.from('cls_applications').update(patch).eq('id', id).select().single();
      if (error) {
        console.error('❌ [DATABASE] Supabase updateApplication failed:', error.message);
      } else if (data) {
        return rowToApp(data);
      }
    } catch (e) {
      console.error('[DATABASE] updateApplication Supabase exception, falling back to local:', e.message);
    }
  }
  const local = readData();
  const target = (local.applications || []).find(a => a.id === id);
  if (!target) return null;
  if (updates.status !== undefined) target.status = updates.status;
  if (updates.recruiterNotes !== undefined) target.recruiterNotes = updates.recruiterNotes;
  writeData(local);
  return target;
}

async function deleteApplication(id) {
  if (supabase) {
    try {
      const { error } = await supabase.from('cls_applications').delete().eq('id', id);
      if (error) {
        console.error('❌ [DATABASE] Supabase deleteApplication failed:', error.message);
      } else {
        return true;
      }
    } catch (e) {
      console.error('[DATABASE] deleteApplication Supabase exception, falling back to local:', e.message);
    }
  }
  const local = readData();
  const prevLen = (local.applications || []).length;
  local.applications = (local.applications || []).filter(a => a.id !== id);
  if (local.applications.length === prevLen) return false;
  writeData(local);
  return true;
}

// 4. Employer Requests
async function getEmployerRequests() {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('cls_employer_requests').select('*').order('created_at', { ascending: false });
      if (!error && data) {
        return data.map(rowToReq);
      }
    } catch (e) {
      console.error('[DATABASE] getEmployerRequests Supabase error, falling back to local:', e.message);
    }
  }
  const local = readData();
  return local.employerRequests || [];
}

async function createEmployerRequest(reqData) {
  if (supabase) {
    try {
      const row = reqToRow(reqData);
      const { data, error } = await supabase.from('cls_employer_requests').insert([row]).select().single();
      if (error) {
        console.error('❌ [DATABASE] Supabase createEmployerRequest failed:', error.message, error.details || '');
      } else if (data) {
        return rowToReq(data);
      }
    } catch (e) {
      console.error('[DATABASE] createEmployerRequest Supabase exception, falling back to local:', e.message);
    }
  } else {
    console.warn('[DATABASE] Supabase is NOT active. Storing employer request in local data.json.');
  }
  const local = readData();
  if (!local.employerRequests) local.employerRequests = [];
  local.employerRequests.unshift(reqData);
  writeData(local);
  return reqData;
}

async function updateEmployerRequest(id, updates) {
  if (supabase) {
    try {
      const patch = {};
      if (updates.status !== undefined) patch.status = updates.status;
      if (updates.notes !== undefined) patch.notes = updates.notes;
      const { data, error } = await supabase.from('cls_employer_requests').update(patch).eq('id', id).select().single();
      if (error) {
        console.error('❌ [DATABASE] Supabase updateEmployerRequest failed:', error.message);
      } else if (data) {
        return rowToReq(data);
      }
    } catch (e) {
      console.error('[DATABASE] updateEmployerRequest Supabase exception, falling back to local:', e.message);
    }
  }
  const local = readData();
  const target = (local.employerRequests || []).find(r => r.id === id);
  if (!target) return null;
  if (updates.status !== undefined) target.status = updates.status;
  if (updates.notes !== undefined) target.notes = updates.notes;
  writeData(local);
  return target;
}

async function deleteEmployerRequest(id) {
  if (supabase) {
    try {
      const { error } = await supabase.from('cls_employer_requests').delete().eq('id', id);
      if (error) {
        console.error('❌ [DATABASE] Supabase deleteEmployerRequest failed:', error.message);
      } else {
        return true;
      }
    } catch (e) {
      console.error('[DATABASE] deleteEmployerRequest Supabase exception, falling back to local:', e.message);
    }
  }
  const local = readData();
  const prevLen = (local.employerRequests || []).length;
  local.employerRequests = (local.employerRequests || []).filter(r => r.id !== id);
  if (local.employerRequests.length === prevLen) return false;
  writeData(local);
  return true;
}

// 5. Inquiries
async function getInquiries() {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('cls_inquiries').select('*').order('created_at', { ascending: false });
      if (!error && data) {
        return data.map(rowToInq);
      }
    } catch (e) {
      console.error('[DATABASE] getInquiries Supabase error, falling back to local:', e.message);
    }
  }
  const local = readData();
  return local.inquiries || [];
}

async function createInquiry(inqData) {
  if (supabase) {
    try {
      const row = inqToRow(inqData);
      const { data, error } = await supabase.from('cls_inquiries').insert([row]).select().single();
      if (error) {
        console.error('❌ [DATABASE] Supabase createInquiry failed:', error.message, error.details || '');
      } else if (data) {
        return rowToInq(data);
      }
    } catch (e) {
      console.error('[DATABASE] createInquiry Supabase exception, falling back to local:', e.message);
    }
  } else {
    console.warn('[DATABASE] Supabase is NOT active. Storing inquiry in local data.json.');
  }
  const local = readData();
  if (!local.inquiries) local.inquiries = [];
  local.inquiries.unshift(inqData);
  writeData(local);
  return inqData;
}

async function updateInquiry(id, updates) {
  if (supabase) {
    try {
      const patch = {};
      if (updates.status !== undefined) patch.status = updates.status;
      const { data, error } = await supabase.from('cls_inquiries').update(patch).eq('id', id).select().single();
      if (error) {
        console.error('❌ [DATABASE] Supabase updateInquiry failed:', error.message);
      } else if (data) {
        return rowToInq(data);
      }
    } catch (e) {
      console.error('[DATABASE] updateInquiry Supabase exception, falling back to local:', e.message);
    }
  }
  const local = readData();
  const target = (local.inquiries || []).find(i => i.id === id);
  if (!target) return null;
  if (updates.status !== undefined) target.status = updates.status;
  writeData(local);
  return target;
}

async function deleteInquiry(id) {
  if (supabase) {
    try {
      const { error } = await supabase.from('cls_inquiries').delete().eq('id', id);
      if (error) {
        console.error('❌ [DATABASE] Supabase deleteInquiry failed:', error.message);
      } else {
        return true;
      }
    } catch (e) {
      console.error('[DATABASE] deleteInquiry Supabase exception, falling back to local:', e.message);
    }
  }
  const local = readData();
  const prevLen = (local.inquiries || []).length;
  local.inquiries = (local.inquiries || []).filter(i => i.id !== id);
  if (local.inquiries.length === prevLen) return false;
  writeData(local);
  return true;
}

// 6. Users (Admin / Recruiters)
async function getUsers() {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('cls_users').select('*').order('created_at', { ascending: false });
      if (!error && data) {
        return data.map(rowToUser);
      }
    } catch (e) {
      console.error('[DATABASE] getUsers Supabase error, falling back to local:', e.message);
    }
  }
  const local = readData();
  return local.users || [];
}

async function findUserByEmail(email) {
  if (!email) return null;
  const cleanEmail = email.trim().toLowerCase();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('cls_users').select('*').ilike('email', cleanEmail).maybeSingle();
      if (!error && data) {
        return rowToUser(data);
      }
    } catch (e) {
      console.error('[DATABASE] findUserByEmail Supabase error, falling back to local:', e.message);
    }
  }
  const local = readData();
  return (local.users || []).find(u => u.email.toLowerCase() === cleanEmail) || null;
}

async function createUser(userData) {
  if (supabase) {
    try {
      const row = userToRow(userData);
      const { data, error } = await supabase.from('cls_users').insert([row]).select().single();
      if (error) {
        console.error('❌ [DATABASE] Supabase createUser failed:', error.message, error.details || '');
      } else if (data) {
        return rowToUser(data);
      }
    } catch (e) {
      console.error('[DATABASE] createUser Supabase exception, falling back to local:', e.message);
    }
  } else {
    console.warn('[DATABASE] Supabase is NOT active. Storing user in local data.json.');
  }
  const local = readData();
  if (!local.users) local.users = [];
  local.users.push(userData);
  writeData(local);
  return userData;
}

async function deleteUser(id) {
  if (supabase) {
    try {
      const { error } = await supabase.from('cls_users').delete().eq('id', id);
      if (error) {
        console.error('❌ [DATABASE] Supabase deleteUser failed:', error.message);
      } else {
        return true;
      }
    } catch (e) {
      console.error('[DATABASE] deleteUser Supabase exception, falling back to local:', e.message);
    }
  }
  const local = readData();
  const prevLen = (local.users || []).length;
  local.users = (local.users || []).filter(u => u.id !== id);
  if (local.users.length === prevLen) return false;
  writeData(local);
  return true;
}

// 7. Dashboard Stats Aggregator
async function getDashboardStats() {
  const jobs = await getJobs();
  const apps = await getApplications();
  const reqs = await getEmployerRequests();
  const inqs = await getInquiries();
  const users = await getUsers();

  return {
    stats: {
      totalJobs: jobs.length,
      activeJobs: jobs.filter(j => j.status === 'Active').length,
      totalApplications: apps.length,
      newApplications: apps.filter(a => a.status === 'New').length,
      shortlistedCandidates: apps.filter(a => a.status === 'Shortlisted').length,
      employerRequests: reqs.length,
      newEmployerRequests: reqs.filter(r => r.status === 'New').length,
      inquiries: inqs.length,
      users: users.length
    },
    recentApplications: apps.slice(0, 5),
    recentEmployerRequests: reqs.slice(0, 5)
  };
}

module.exports = {
  isSupabaseConfigured,
  getSettings,
  updateSettings,
  getJobs,
  getJobById,
  createJob,
  updateJob,
  toggleJobStatus,
  deleteJob,
  getApplications,
  getApplicationById,
  createApplication,
  updateApplication,
  deleteApplication,
  getEmployerRequests,
  createEmployerRequest,
  updateEmployerRequest,
  deleteEmployerRequest,
  getInquiries,
  createInquiry,
  updateInquiry,
  deleteInquiry,
  getUsers,
  findUserByEmail,
  createUser,
  deleteUser,
  getDashboardStats
};
