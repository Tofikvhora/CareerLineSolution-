const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { readData, writeData } = require('./database/db');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'careerline_secret_key_2026_super_secure';

// Trust proxy if hosted behind reverse proxy / CDN (Cloudflare, Render, etc.)
app.set('trust proxy', 1);

// ========================================================
// SECURITY HEADERS & DEFENSE (Helmet)
// ========================================================
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://cdnjs.cloudflare.com", "https://fonts.gstatic.com", "data:"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'"],
      frameSrc: ["'self'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: null
    }
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Ensure upload directory exists
const uploadDir = path.join(__dirname, 'uploads', 'resumes');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage configuration for candidate resumes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 20);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e6);
    cb(null, `${sanitizedName}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit prevents memory exhaustion
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.doc', '.docx', '.rtf', '.txt'];
    const ext = path.extname(file.originalname).toLowerCase();
    
    // Disallow dangerous double extension attacks (e.g. exploit.php.pdf)
    const baseWithoutExt = path.basename(file.originalname, ext);
    const dangerousExts = ['.php', '.exe', '.sh', '.bat', '.cmd', '.py', '.pl', '.jsp', '.asp', '.aspx', '.cgi', '.jar', '.vbs', '.js', '.html', '.htm'];
    for (const dExt of dangerousExts) {
      if (baseWithoutExt.toLowerCase().endsWith(dExt)) {
        return cb(new Error('Invalid filename: double extensions are prohibited for security.'));
      }
    }

    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only authentic PDF, DOC, DOCX, RTF, or TXT resumes are allowed!'));
    }
  }
});

// Middleware with payload size limits (prevents payload DOS attacks)
app.use(cors());
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

// ========================================================
// RATE LIMITERS (Brute-Force & Denial-of-Service Defense)
// ========================================================

// 1. General API Limiter (120 reqs/min per IP)
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please slow down.' }
});
app.use('/api/', apiLimiter);

// 2. Job Application Limiter (Max 5 submissions per 15 minutes per IP)
const applyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many job applications from this IP address. Please wait 15 minutes before submitting again.' }
});

// 3. Inquiry / Contact Limiter (Max 6 inquiries per 15 minutes per IP)
const inquiryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 6,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many messages sent from this IP address. Please wait a few minutes before trying again.' }
});

// 4. Admin Login Brute Force Limiter (Max 5 failed attempts per 15 mins per IP)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts. Access temporarily locked for 15 minutes for security.' }
});

// ========================================================
// ANTI-BOT & ANTI-AUTOMATION VERIFICATION MIDDLEWARE
// ========================================================
const BLOCKED_BOT_AGENTS = [
  /sqlmap/i, /nikto/i, /wpscan/i, /masscan/i, /zgrab/i,
  /acunetix/i, /havij/i, /dirbuster/i, /nmap/i,
  /scrapy/i, /aiohttp/i, /libwww-perl/i, /httpclient/i
];

function verifyAntiBot(req, res, next) {
  const ua = req.get('user-agent') || '';
  
  // 1. Check for malicious scanner / scraper User Agents
  for (const pattern of BLOCKED_BOT_AGENTS) {
    if (pattern.test(ua)) {
      console.warn(`[SECURITY] Blocked automated scanner: "${ua}" from IP: ${req.ip}`);
      return res.status(403).json({ success: false, message: 'Automated scraping and bot access is prohibited.' });
    }
  }

  // 2. Honeypot check (hidden fields filled by automated form-filling scripts)
  const honeypot = req.body._hp_website_verification || req.body._hp_company_field || req.body.fax_number;
  if (honeypot && String(honeypot).trim() !== '') {
    console.warn(`[SECURITY] Honeypot triggered by automated bot from IP: ${req.ip}`);
    return res.status(400).json({ success: false, message: 'Automated submission rejected.' });
  }

  // 3. Form submission velocity check (anti-headless-bot timing)
  if (req.body._form_render_ts) {
    const renderTs = Number(req.body._form_render_ts);
    const now = Date.now();
    // Submissions faster than 1.5s are automated bots
    if (!isNaN(renderTs) && (now - renderTs < 1500)) {
      console.warn(`[SECURITY] Velocity bot flag (${now - renderTs}ms) from IP: ${req.ip}`);
      return res.status(400).json({ success: false, message: 'Submission was too fast. Please take a moment and submit again.' });
    }
  }

  next();
}

// ========================================================
// FILE SIGNATURE (MAGIC BYTES) & SANITIZATION HELPERS
// ========================================================
function validateFileSignature(filePath, originalname) {
  try {
    const ext = path.extname(originalname).toLowerCase();
    if (!fs.existsSync(filePath)) {
      return { valid: false, reason: 'Uploaded file not found on disk.' };
    }

    const fd = fs.openSync(filePath, 'r');
    const buffer = Buffer.alloc(16);
    const bytesRead = fs.readSync(fd, buffer, 0, 16, 0);
    fs.closeSync(fd);

    if (bytesRead < 4) {
      return { valid: false, reason: 'Uploaded file is empty or corrupted.' };
    }

    // PDF Magic Bytes: %PDF- (0x25 0x50 0x44 0x46)
    if (ext === '.pdf') {
      const isPdf = buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46;
      if (!isPdf) return { valid: false, reason: 'File signature mismatch: File is not a valid PDF document.' };
    }

    // DOCX Magic Bytes: PK (ZIP container 0x50 0x4B 0x03 0x04)
    if (ext === '.docx') {
      const isZip = buffer[0] === 0x50 && buffer[1] === 0x4B && buffer[2] === 0x03 && buffer[3] === 0x04;
      if (!isZip) return { valid: false, reason: 'File signature mismatch: File is not a valid DOCX document.' };
    }

    // RTF Magic Bytes: {\\rtf (0x7B 0x5C 0x72 0x74 0x66)
    if (ext === '.rtf') {
      const isRtf = buffer[0] === 0x7B && buffer[1] === 0x5C && buffer[2] === 0x72 && buffer[3] === 0x74 && buffer[4] === 0x66;
      if (!isRtf) return { valid: false, reason: 'File signature mismatch: File is not a valid RTF document.' };
    }

    // Plain text: reject binary null bytes
    if (ext === '.txt') {
      for (let i = 0; i < bytesRead; i++) {
        if (buffer[i] === 0) return { valid: false, reason: 'Binary contents detected in plain text file.' };
      }
    }

    return { valid: true };
  } catch (err) {
    return { valid: false, reason: 'Integrity check failed: ' + err.message };
  }
}

function sanitizeInput(val) {
  if (typeof val !== 'string') return val;
  return val.replace(/[<>]/g, '').trim();
}

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'public')));

// Secure static uploads serving (strictly prevents browser script execution)
app.use('/uploads', (req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Content-Security-Policy', "default-src 'none'");
  next();
}, express.static(path.join(__dirname, 'uploads')));

// Clean page URL routes
app.get('/jobs', (req, res) => res.sendFile(path.join(__dirname, 'public', 'jobs.html')));
app.get('/about', (req, res) => res.sendFile(path.join(__dirname, 'public', 'about.html')));
app.get('/services', (req, res) => res.sendFile(path.join(__dirname, 'public', 'services.html')));
app.get('/employers', (req, res) => res.sendFile(path.join(__dirname, 'public', 'employers.html')));
app.get('/contact', (req, res) => res.sendFile(path.join(__dirname, 'public', 'contact.html')));
app.get('/privacy', (req, res) => res.sendFile(path.join(__dirname, 'public', 'privacy.html')));
app.get('/terms', (req, res) => res.sendFile(path.join(__dirname, 'public', 'terms.html')));
app.get('/logo-preview', (req, res) => res.sendFile(path.join(__dirname, 'public', 'logo-preview.html')));
app.get('/admin/login', (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin', 'login.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin', 'index.html')));

// -------------------------------------------------------------
// PUBLIC API ENDPOINTS
// -------------------------------------------------------------

// 1. Get Site Settings & Info
app.get('/api/settings', (req, res) => {
  const data = readData();
  res.json({ success: true, settings: data.settings });
});

// 2. Search & Filter Jobs (Pan-India)
app.get('/api/jobs', (req, res) => {
  const data = readData();
  let list = data.jobs || [];

  // Query parameters
  const {
    q,
    category,
    location,
    jobType,
    workMode,
    experienceRange,
    urgent,
    featured,
    page = 1,
    limit = 12
  } = req.query;

  // By default, public only sees Active jobs
  list = list.filter(j => j.status === 'Active');

  // Search keyword (matches title, skills, description, company, city)
  if (q && q.trim()) {
    const term = q.trim().toLowerCase();
    list = list.filter(j => 
      j.title.toLowerCase().includes(term) ||
      (j.skills && j.skills.some(s => s.toLowerCase().includes(term))) ||
      (j.category && j.category.toLowerCase().includes(term)) ||
      (j.location && j.location.toLowerCase().includes(term)) ||
      (j.city && j.city.toLowerCase().includes(term)) ||
      (j.description && j.description.toLowerCase().includes(term))
    );
  }

  // Category filter
  if (category && category !== 'All') {
    list = list.filter(j => j.category && j.category.toLowerCase() === category.toLowerCase());
  }

  // Location filter (city / state)
  if (location && location !== 'All') {
    const loc = location.toLowerCase();
    list = list.filter(j => 
      (j.location && j.location.toLowerCase().includes(loc)) ||
      (j.city && j.city.toLowerCase().includes(loc)) ||
      (j.state && j.state.toLowerCase().includes(loc))
    );
  }

  // Job Type filter
  if (jobType && jobType !== 'All') {
    list = list.filter(j => j.jobType && j.jobType.toLowerCase() === jobType.toLowerCase());
  }

  // Work Mode filter (On-Site, Hybrid, Remote)
  if (workMode && workMode !== 'All') {
    list = list.filter(j => j.workMode && j.workMode.toLowerCase() === workMode.toLowerCase());
  }

  // Experience filter
  if (experienceRange && experienceRange !== 'All') {
    list = list.filter(j => j.experienceRange === experienceRange);
  }

  // Urgent filter
  if (urgent === 'true') {
    list = list.filter(j => j.urgent === true);
  }

  // Featured filter
  if (featured === 'true') {
    list = list.filter(j => j.featured === true);
  }

  // Sort: newest first
  list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // Pagination
  const total = list.length;
  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 12;
  const startIndex = (pageNum - 1) * limitNum;
  const paginated = list.slice(startIndex, startIndex + limitNum);

  res.json({
    success: true,
    total,
    page: pageNum,
    totalPages: Math.ceil(total / limitNum) || 1,
    jobs: paginated
  });
});

// 3. Get Single Job Details
app.get('/api/jobs/:id', (req, res) => {
  const data = readData();
  const job = data.jobs.find(j => j.id === req.params.id);
  if (!job) {
    return res.status(404).json({ success: false, message: 'Job opening not found' });
  }
  res.json({ success: true, job });
});

// 4. Get Categories and Locations with Job Counts
app.get('/api/job-meta', (req, res) => {
  const data = readData();
  const activeJobs = data.jobs.filter(j => j.status === 'Active');

  const categories = {};
  const locations = {};

  activeJobs.forEach(j => {
    if (j.category) {
      categories[j.category] = (categories[j.category] || 0) + 1;
    }
    if (j.city) {
      locations[j.city] = (locations[j.city] || 0) + 1;
    }
  });

  res.json({
    success: true,
    categories: Object.keys(categories).map(name => ({ name, count: categories[name] })),
    locations: Object.keys(locations).map(name => ({ name, count: locations[name] })),
    totalActiveJobs: activeJobs.length
  });
});

// 5. Submit Candidate Job Application (Protected with rate limiting, anti-bot, magic byte checks)
app.post('/api/apply', applyLimiter, (req, res) => {
  upload.single('resume')(req, res, (uploadErr) => {
    if (uploadErr) {
      if (uploadErr instanceof multer.MulterError) {
        if (uploadErr.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ success: false, message: 'Resume file is too large. Maximum size allowed is 5MB.' });
        }
        return res.status(400).json({ success: false, message: `Upload error: ${uploadErr.message}` });
      }
      return res.status(400).json({ success: false, message: uploadErr.message || 'Error uploading file' });
    }

    try {
      // 1. Anti-Bot and Honeypot Verification
      const honeypot = req.body._hp_website_verification || req.body._hp_company_field || req.body.fax_number;
      if (honeypot && String(honeypot).trim() !== '') {
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        return res.status(400).json({ success: false, message: 'Automated submission rejected.' });
      }

      if (req.body._form_render_ts) {
        const renderTs = Number(req.body._form_render_ts);
        const now = Date.now();
        if (!isNaN(renderTs) && (now - renderTs < 1500)) {
          if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
          return res.status(400).json({ success: false, message: 'Submission was too fast. Please take a moment and re-submit.' });
        }
      }

      // 2. File Signature & Magic Bytes Verification
      if (req.file) {
        const check = validateFileSignature(req.file.path, req.file.originalname);
        if (!check.valid) {
          if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
          return res.status(400).json({ success: false, message: check.reason });
        }
      }

      const jobId = sanitizeInput(req.body.jobId);
      const fullName = sanitizeInput(req.body.fullName);
      const email = sanitizeInput(req.body.email);
      const phone = sanitizeInput(req.body.phone);
      const currentLocation = sanitizeInput(req.body.currentLocation);
      const experience = sanitizeInput(req.body.experience);
      const currentCTC = sanitizeInput(req.body.currentCTC);
      const expectedCTC = sanitizeInput(req.body.expectedCTC);
      const noticePeriod = sanitizeInput(req.body.noticePeriod);
      const skills = sanitizeInput(req.body.skills);
      const coverNote = sanitizeInput(req.body.coverNote);

      if (!fullName || !email || !phone) {
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        return res.status(400).json({ success: false, message: 'Please provide full name, email and phone number.' });
      }

      const data = readData();
      const job = (data.jobs || []).find(j => j.id === jobId) || { title: 'General Application' };

      const newApplication = {
        id: 'app_' + Date.now(),
        jobId: jobId || 'general',
        jobTitle: job.title || 'General Application',
        fullName,
        email,
        phone,
        currentLocation: currentLocation || 'Not Specified',
        experience: experience || 'Fresher',
        currentCTC: currentCTC || 'Not Disclosed',
        expectedCTC: expectedCTC || 'Negotiable',
        noticePeriod: noticePeriod || 'Immediate',
        skills: skills || '',
        coverNote: coverNote || '',
        resumeFileName: req.file ? req.file.originalname : '',
        resumeUrl: req.file ? `/uploads/resumes/${req.file.filename}` : '',
        status: 'New',
        recruiterNotes: 'Application received via portal',
        createdAt: new Date().toISOString()
      };

      if (!data.applications) data.applications = [];
      data.applications.unshift(newApplication);
      writeData(data);

      res.json({
        success: true,
        message: 'Your job application has been submitted successfully! Our HR team will review your profile shortly.',
        applicationId: newApplication.id,
        resumeUrl: newApplication.resumeUrl
      });
    } catch (error) {
      console.error('Apply error:', error);
      res.status(500).json({ success: false, message: 'Failed to process application. Please try again.' });
    }
  });
});

// 6. Submit Employer Staffing Requirement (Protected with inquiryLimiter & verifyAntiBot)
app.post('/api/employer-request', inquiryLimiter, verifyAntiBot, (req, res) => {
  try {
    const companyName = sanitizeInput(req.body.companyName);
    const contactPerson = sanitizeInput(req.body.contactPerson);
    const designation = sanitizeInput(req.body.designation);
    const email = sanitizeInput(req.body.email);
    const phone = sanitizeInput(req.body.phone);
    const city = sanitizeInput(req.body.city);
    const serviceType = sanitizeInput(req.body.serviceType);
    const positionsNeeded = sanitizeInput(req.body.positionsNeeded);
    const roles = sanitizeInput(req.body.roles);
    const urgency = sanitizeInput(req.body.urgency);
    const details = sanitizeInput(req.body.details);

    if (!companyName || !contactPerson || !email || !phone) {
      return res.status(400).json({ success: false, message: 'Company name, contact person, email, and phone are required.' });
    }

    const data = readData();
    const newRequest = {
      id: 'req_' + Date.now(),
      companyName,
      contactPerson,
      designation: designation || 'HR / Hiring Manager',
      email,
      phone,
      city: city || 'Pan-India',
      serviceType: serviceType || 'Permanent Recruitment',
      positionsNeeded: positionsNeeded || '1-5',
      roles: roles || 'Various positions',
      urgency: urgency || 'Standard',
      details: details || '',
      status: 'New',
      notes: '',
      createdAt: new Date().toISOString()
    };

    data.employerRequests.unshift(newRequest);
    writeData(data);

    res.json({
      success: true,
      message: 'Thank you! Your hiring request has been received. Our senior recruitment consultant will connect with you within 2-4 business hours.'
    });
  } catch (err) {
    console.error('Employer request error:', err);
    res.status(500).json({ success: false, message: 'Server error processing requirement request.' });
  }
});

// 7. General Contact Form (Protected with inquiryLimiter & verifyAntiBot)
app.post('/api/contact', inquiryLimiter, verifyAntiBot, (req, res) => {
  try {
    const name = sanitizeInput(req.body.name);
    const email = sanitizeInput(req.body.email);
    const phone = sanitizeInput(req.body.phone);
    const subject = sanitizeInput(req.body.subject);
    const message = sanitizeInput(req.body.message);

    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'Name, email and message are required.' });
    }

    const data = readData();
    const newInquiry = {
      id: 'inq_' + Date.now(),
      name,
      email,
      phone: phone || '',
      subject: subject || 'General Inquiry',
      message,
      status: 'New',
      createdAt: new Date().toISOString()
    };

    data.inquiries.unshift(newInquiry);
    writeData(data);

    res.json({
      success: true,
      message: 'Thank you! Your inquiry has been submitted. Our team will contact you shortly.'
    });
  } catch (err) {
    console.error('Contact error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// -------------------------------------------------------------
// ADMIN AUTHENTICATION
// -------------------------------------------------------------

// Admin Login (Protected with loginLimiter against brute-force attacks)
app.post('/api/admin/login', loginLimiter, (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required.' });
  }

  const data = readData();
  const user = data.users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());

  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid credentials or user not found.' });
  }

  const match = bcrypt.compareSync(password, user.password);
  if (!match) {
    return res.status(401).json({ success: false, message: 'Invalid password. Please check your credentials.' });
  }

  const token = jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({
    success: true,
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
});

// Auth Verification Middleware
function authenticateAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Unauthorized. Please login to access admin features.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Session expired or invalid token. Please log in again.' });
  }
}

// Check current user session
app.get('/api/admin/me', authenticateAdmin, (req, res) => {
  res.json({ success: true, user: req.user });
});

// -------------------------------------------------------------
// ADMIN PROTECTED APIS
// -------------------------------------------------------------

// Dashboard KPI Stats
app.get('/api/admin/dashboard-stats', authenticateAdmin, (req, res) => {
  const data = readData();
  const jobs = data.jobs || [];
  const apps = data.applications || [];
  const reqs = data.employerRequests || [];
  const inqs = data.inquiries || [];

  res.json({
    success: true,
    stats: {
      totalJobs: jobs.length,
      activeJobs: jobs.filter(j => j.status === 'Active').length,
      totalApplications: apps.length,
      newApplications: apps.filter(a => a.status === 'New').length,
      shortlistedCandidates: apps.filter(a => a.status === 'Shortlisted').length,
      employerRequests: reqs.length,
      newEmployerRequests: reqs.filter(r => r.status === 'New').length,
      inquiries: inqs.length,
      users: (data.users || []).length
    },
    recentApplications: apps.slice(0, 5),
    recentEmployerRequests: reqs.slice(0, 5)
  });
});

// Jobs Management
app.get('/api/admin/jobs', authenticateAdmin, (req, res) => {
  const data = readData();
  const { status, category, search } = req.query;
  let jobs = [...data.jobs];

  if (status && status !== 'All') {
    jobs = jobs.filter(j => j.status === status);
  }
  if (category && category !== 'All') {
    jobs = jobs.filter(j => j.category === category);
  }
  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    jobs = jobs.filter(j => 
      j.title.toLowerCase().includes(q) ||
      (j.location && j.location.toLowerCase().includes(q))
    );
  }

  jobs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json({ success: true, jobs });
});

app.post('/api/admin/jobs', authenticateAdmin, (req, res) => {
  const {
    title,
    category,
    company,
    location,
    city,
    state,
    jobType,
    workMode,
    experience,
    experienceRange,
    salary,
    openings,
    urgent,
    featured,
    status,
    skills,
    description,
    responsibilities,
    requirements
  } = req.body;

  if (!title || !category || !location) {
    return res.status(400).json({ success: false, message: 'Job title, category, and location are required.' });
  }

  const data = readData();
  const newJob = {
    id: 'job_' + Date.now(),
    title,
    category,
    company: company || 'Client Confidential',
    location,
    city: city || location.split(',')[0].trim(),
    state: state || 'Pan-India',
    jobType: jobType || 'Full-Time',
    workMode: workMode || 'On-Site',
    experience: experience || '1 - 3 Years',
    experienceRange: experienceRange || '1-3',
    salary: salary || 'Negotiable as per industry standards',
    openings: parseInt(openings, 10) || 1,
    urgent: Boolean(urgent),
    featured: Boolean(featured),
    status: status || 'Active',
    skills: Array.isArray(skills) ? skills : (skills ? skills.split(',').map(s => s.trim()).filter(Boolean) : []),
    description: description || '',
    responsibilities: responsibilities || '',
    requirements: requirements || '',
    createdAt: new Date().toISOString()
  };

  data.jobs.unshift(newJob);
  writeData(data);

  res.json({ success: true, message: 'Job opening posted successfully!', job: newJob });
});

app.put('/api/admin/jobs/:id', authenticateAdmin, (req, res) => {
  const data = readData();
  const index = data.jobs.findIndex(j => j.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Job not found.' });
  }

  const existing = data.jobs[index];
  const updated = {
    ...existing,
    ...req.body,
    id: existing.id,
    createdAt: existing.createdAt,
    skills: Array.isArray(req.body.skills) ? req.body.skills : (req.body.skills ? req.body.skills.split(',').map(s => s.trim()).filter(Boolean) : existing.skills)
  };

  data.jobs[index] = updated;
  writeData(data);

  res.json({ success: true, message: 'Job opening updated successfully!', job: updated });
});

app.patch('/api/admin/jobs/:id/toggle-status', authenticateAdmin, (req, res) => {
  const data = readData();
  const job = data.jobs.find(j => j.id === req.params.id);
  if (!job) {
    return res.status(404).json({ success: false, message: 'Job not found.' });
  }

  job.status = job.status === 'Active' ? 'Inactive' : 'Active';
  writeData(data);

  res.json({ success: true, message: `Job is now ${job.status}`, status: job.status });
});

app.delete('/api/admin/jobs/:id', authenticateAdmin, (req, res) => {
  const data = readData();
  const initialLen = data.jobs.length;
  data.jobs = data.jobs.filter(j => j.id !== req.params.id);

  if (data.jobs.length === initialLen) {
    return res.status(404).json({ success: false, message: 'Job not found.' });
  }

  writeData(data);
  res.json({ success: true, message: 'Job opening deleted successfully.' });
});

// Applications Management
app.get('/api/admin/applications', authenticateAdmin, (req, res) => {
  const data = readData();
  const { jobId, status, search } = req.query;
  let apps = [...data.applications];

  if (jobId && jobId !== 'All') {
    apps = apps.filter(a => a.jobId === jobId);
  }
  if (status && status !== 'All') {
    apps = apps.filter(a => a.status === status);
  }
  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    apps = apps.filter(a => 
      a.fullName.toLowerCase().includes(q) ||
      a.email.toLowerCase().includes(q) ||
      a.phone.toLowerCase().includes(q) ||
      a.jobTitle.toLowerCase().includes(q)
    );
  }

  apps.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json({ success: true, applications: apps });
});

app.patch('/api/admin/applications/:id/status', authenticateAdmin, (req, res) => {
  const { status, recruiterNotes } = req.body;
  const data = readData();
  const appItem = data.applications.find(a => a.id === req.params.id);

  if (!appItem) {
    return res.status(404).json({ success: false, message: 'Application not found.' });
  }

  if (status) appItem.status = status;
  if (recruiterNotes !== undefined) appItem.recruiterNotes = recruiterNotes;

  writeData(data);
  res.json({ success: true, message: 'Candidate status updated.', application: appItem });
});

app.delete('/api/admin/applications/:id', authenticateAdmin, (req, res) => {
  const data = readData();
  data.applications = data.applications.filter(a => a.id !== req.params.id);
  writeData(data);
  res.json({ success: true, message: 'Application deleted.' });
});

// Export Applications to CSV/Excel
app.get('/api/admin/applications/export', authenticateAdmin, (req, res) => {
  const data = readData();
  const apps = data.applications || [];

  const headers = [
    'Application ID',
    'Candidate Name',
    'Email',
    'Phone',
    'Position Applied',
    'Experience',
    'Current Location',
    'Current CTC',
    'Expected CTC',
    'Notice Period',
    'Skills',
    'Status',
    'Recruiter Notes',
    'Resume Filename',
    'Resume Download Link',
    'Applied Date'
  ];

  const baseUrl = req.protocol + '://' + req.get('host');

  const rows = apps.map(app => {
    let resumeUrl = 'No File Uploaded';
    if (app.resumeUrl) {
      if (app.resumeUrl.startsWith('data:')) {
        resumeUrl = 'Attached in Admin Portal (Download CV / ZIP)';
      } else if (app.resumeUrl.startsWith('http')) {
        resumeUrl = app.resumeUrl;
      } else {
        resumeUrl = baseUrl + (app.resumeUrl.startsWith('/') ? '' : '/') + app.resumeUrl;
      }
    }
    return [
      app.id || '',
      app.fullName || '',
      app.email || '',
      app.phone || '',
      app.jobTitle || 'General Application',
      app.experience || '',
      app.currentLocation || '',
      app.currentCTC || '',
      app.expectedCTC || '',
      app.noticePeriod || '',
      Array.isArray(app.skills) ? app.skills.join('; ') : (app.skills || ''),
      app.status || 'New',
      app.recruiterNotes || '',
      app.resumeFileName || (app.resumeUrl ? 'Resume.pdf' : 'No File Uploaded'),
      resumeUrl,
      app.createdAt ? new Date(app.createdAt).toLocaleString('en-IN') : ''
    ].map(val => `"${String(val).replace(/"/g, '""')}"`).join(',');
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="CareerLine_Candidate_Applications_${new Date().toISOString().split('T')[0]}.csv"`);
  res.send(csvContent);
});

// Employer Staffing Requests
app.get('/api/admin/employer-requests', authenticateAdmin, (req, res) => {
  const data = readData();
  const reqs = [...data.employerRequests];
  reqs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json({ success: true, requests: reqs });
});

app.patch('/api/admin/employer-requests/:id/status', authenticateAdmin, (req, res) => {
  const { status, notes } = req.body;
  const data = readData();
  const reqItem = data.employerRequests.find(r => r.id === req.params.id);

  if (!reqItem) {
    return res.status(404).json({ success: false, message: 'Request not found.' });
  }

  if (status) reqItem.status = status;
  if (notes !== undefined) reqItem.notes = notes;

  writeData(data);
  res.json({ success: true, message: 'Employer request updated.', request: reqItem });
});

app.delete('/api/admin/employer-requests/:id', authenticateAdmin, (req, res) => {
  const data = readData();
  data.employerRequests = data.employerRequests.filter(r => r.id !== req.params.id);
  writeData(data);
  res.json({ success: true, message: 'Request deleted.' });
});

// Inquiries
app.get('/api/admin/inquiries', authenticateAdmin, (req, res) => {
  const data = readData();
  const inqs = [...data.inquiries];
  inqs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json({ success: true, inquiries: inqs });
});

app.patch('/api/admin/inquiries/:id/status', authenticateAdmin, (req, res) => {
  const { status } = req.body;
  const data = readData();
  const inq = data.inquiries.find(i => i.id === req.params.id);

  if (!inq) {
    return res.status(404).json({ success: false, message: 'Inquiry not found.' });
  }

  if (status) inq.status = status;
  writeData(data);
  res.json({ success: true, message: 'Inquiry status updated.' });
});

app.delete('/api/admin/inquiries/:id', authenticateAdmin, (req, res) => {
  const data = readData();
  data.inquiries = data.inquiries.filter(i => i.id !== req.params.id);
  writeData(data);
  res.json({ success: true, message: 'Inquiry deleted.' });
});

// Admin User Management
app.get('/api/admin/users', authenticateAdmin, (req, res) => {
  const data = readData();
  // do not expose password hashes
  const safeUsers = data.users.map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    phone: u.phone,
    createdAt: u.createdAt
  }));
  res.json({ success: true, users: safeUsers });
});

app.post('/api/admin/users', authenticateAdmin, (req, res) => {
  const { name, email, password, role, phone } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Name, email and password are required.' });
  }

  const data = readData();
  const existing = data.users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
  if (existing) {
    return res.status(400).json({ success: false, message: 'A user with this email already exists.' });
  }

  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(password, salt);

  const newUser = {
    id: 'usr_' + Date.now(),
    name,
    email: email.trim().toLowerCase(),
    password: hashedPassword,
    role: role || 'Recruiter',
    phone: phone || '',
    createdAt: new Date().toISOString()
  };

  data.users.push(newUser);
  writeData(data);

  res.json({
    success: true,
    message: 'User added successfully.',
    user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role }
  });
});

app.delete('/api/admin/users/:id', authenticateAdmin, (req, res) => {
  const data = readData();
  if (req.params.id === 'usr_admin') {
    return res.status(400).json({ success: false, message: 'Root Super Admin account cannot be deleted.' });
  }

  data.users = data.users.filter(u => u.id !== req.params.id);
  writeData(data);
  res.json({ success: true, message: 'User deleted.' });
});

// Update Site Settings
app.put('/api/admin/settings', authenticateAdmin, (req, res) => {
  const data = readData();
  data.settings = {
    ...data.settings,
    ...req.body
  };
  writeData(data);
  res.json({ success: true, message: 'Settings updated successfully.', settings: data.settings });
});

// 404 handler for API
app.use('/api', (req, res) => {
  res.status(404).json({ success: false, message: 'API route not found' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`  CareerLineSolution Portal is running on port ${PORT}`);
  console.log(`  Website: http://localhost:${PORT}`);
  console.log(`  Jobs Portal: http://localhost:${PORT}/jobs`);
  console.log(`  Admin Panel: http://localhost:${PORT}/admin`);
  console.log(`  Admin Login: http://localhost:${PORT}/admin/login`);
  console.log(`  Default Admin: admin@careerlinesolution.com / admin123`);
  console.log(`====================================================`);
});
