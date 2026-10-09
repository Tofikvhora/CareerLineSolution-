/**
 * CareerLineSolution - Offline / GitHub Pages Client Data Store
 * Automatically activates when running on static hosts (like GitHub Pages)
 * or when the backend server is unreachable.
 */

(function () {
  const isStaticHost = window.location.protocol === 'file:' || 
                       window.location.hostname.endsWith('github.io') ||
                       window.location.hostname === 'localhost' && window.location.port === '' ||
                       window.location.search.includes('mock=true');

  const INITIAL_SEED = {
    users: [
      {
        id: 'usr_admin',
        name: 'Super Admin',
        email: 'admin@careerlinesolution.com',
        role: 'Admin',
        phone: '+91 7573905399',
        createdAt: new Date().toISOString()
      },
      {
        id: 'usr_recruiter',
        name: 'Priya Sharma (Lead Recruiter)',
        email: 'priya@careerlinesolution.com',
        role: 'Recruiter',
        phone: '+91 9274356988',
        createdAt: new Date().toISOString()
      }
    ],
    jobs: [
      {
            "id": "job_1791381924591",
            "title": "Data entry",
            "category": "IT & Software",
            "company": "Aerosol IO ltd",
            "location": "Mumbai",
            "city": "Mumbai",
            "state": "Pan-India",
            "jobType": "Full-Time",
            "workMode": "On-Site",
            "experience": "3",
            "experienceRange": "1-3",
            "salary": "150000",
            "openings": 3,
            "urgent": true,
            "featured": true,
            "status": "Active",
            "skills": [
                  "Excel DataEntry",
                  "Data managment"
            ],
            "description": "",
            "responsibilities": "",
            "requirements": "",
            "createdAt": "2026-10-07T14:05:24.591Z"
      },
      {
            "id": "job_1791376766393",
            "title": "Senior Software Enginner",
            "category": "IT & Software",
            "company": "Client Confidential",
            "location": "Ahmedabad",
            "city": "Ahmedabad",
            "state": "Pan-India",
            "jobType": "Full-Time",
            "workMode": "On-Site",
            "experience": "3",
            "experienceRange": "1-3",
            "salary": "120000",
            "openings": 2,
            "urgent": true,
            "featured": true,
            "status": "Active",
            "skills": [
                  "Kuch Bhi"
            ],
            "description": "",
            "responsibilities": "",
            "requirements": "",
            "createdAt": "2026-10-07T12:39:26.393Z"
      }
],
    applications: [
      {
        id: 'app_1001',
        jobId: 'job_101',
        jobTitle: 'Senior Full Stack Developer (React & Node.js)',
        fullName: 'Vikramaditya Verma',
        email: 'vikram.v@example.com',
        phone: '+91 98201 12345',
        currentLocation: 'Bengaluru, Karnataka',
        experience: '5.2 Years',
        currentCTC: '₹12,00,000 P.A.',
        expectedCTC: '₹17,50,000 P.A.',
        noticePeriod: '30 Days',
        skills: 'React, Node, Express, MongoDB, AWS, Docker',
        coverNote: 'Excited about this opportunity. I have 5 years experience building scalable platforms.',
        resumeFileName: 'Vikram_Verma_Resume.pdf',
        resumeUrl: 'data:application/pdf;base64,JVBERi0xLjQKMSAwIG9iajw8L1R5cGUvQ2F0YWxvZy9QYWdlcyAyIDAgUj4+ZW5kb2JqCjIgMCBvYmo8PC9UeXBlL1BhZ2VzL0tpZHNbMyAwIFJdL0NvdW50IDE+PmVuZG9iagozIDAgb2JqPDwvVHlwZS9QYWdlL01lZGlhQm94WzAgMCA2MTIgNzkyXS9QYXJlbnQgMiAwIFIvQ29udGVudHMgNCAwIFI+PmVuZG9iago0IDAgb2JqPDwvTGVuZ3RoIDM2Pj5zdHJlYW0KQlQgL0YxIDE2IFRmIDUwIDcwMCBUZCAoVmlrcmFtYWRpdHlhIFZlcm1hIC0gUmVzdW1lKVRqIEVTCmVuZHN0cmVhbQplbmRvYmoKeHJlZgowIDUKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDE1IDAwMDAwIG4gCjAwMDAwMDAwNjggMDAwMDAgbiAKMDAwMDAwMDEyNSAwMDAwMCBuIAowMDAwMDAwMjE5IDAwMDAwIG4gCnRyYWlsZXI8PC9Sb290IDEgMCBSL1NpemUgNT4+CnN0YXJ0eHJlZgoyOTAKJSVFT0Y=',
        status: 'Shortlisted',
        recruiterNotes: 'Strong profile, cleared first technical round. Final client interview on Friday.',
        createdAt: new Date(Date.now() - 1 * 86400000).toISOString()
      },
      {
        id: 'app_1002',
        jobId: 'job_102',
        jobTitle: 'Branch Relationship Manager - Retail Banking',
        fullName: 'Ananya Deshmukh',
        email: 'ananya.deshmukh@example.com',
        phone: '+91 99304 88776',
        currentLocation: 'Mumbai, Maharashtra',
        experience: '4 Years',
        currentCTC: '₹6,80,000 P.A.',
        expectedCTC: '₹9,50,000 P.A.',
        noticePeriod: 'Immediate Joiner',
        skills: 'HNI Banking, Mutual Funds, Life Insurance, Portfolio Growth',
        coverNote: 'Currently handling 250+ HNI accounts with 120% target achievement.',
        resumeFileName: 'Ananya_Deshmukh_CV.pdf',
        resumeUrl: 'data:application/pdf;base64,JVBERi0xLjQKMSAwIG9iajw8L1R5cGUvQ2F0YWxvZy9QYWdlcyAyIDAgUj4+ZW5kb2JqCjIgMCBvYmo8PC9UeXBlL1BhZ2VzL0tpZHNbMyAwIFJdL0NvdW50IDE+PmVuZG9iagozIDAgb2JqPDwvVHlwZS9QYWdlL01lZGlhQm94WzAgMCA2MTIgNzkyXS9QYXJlbnQgMiAwIFIvQ29udGVudHMgNCAwIFI+PmVuZG9iago0IDAgb2JqPDwvTGVuZ3RoIDMzPj5zdHJlYW0KQlQgL0YxIDE2IFRmIDUwIDcwMCBUZCAoQW5hbnlhIERlc2htdWtoIC0gQ1YpVGogRVQKZW5kc3RyZWFtCmVuZG9iagp4cmVmCjAgNQowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAwMTUgMDAwMDAgbiAKMDAwMDAwMDA2OCAwMDAwMCBuIAowMDAwMDAwMTI1IDAwMDAwIG4gCjAwMDAwMDAyMTkgMDAwMDAgbiAKdHJhaWxlcjw8L1Jvb3QgMSAwIFIvU2l6ZSA1PioKc3RhcnR4cmVmCjI4NwolaUVPZg==',
        status: 'Interview Scheduled',
        recruiterNotes: 'Documents verified. Client interview scheduled with Regional HR.',
        createdAt: new Date(Date.now() - 2 * 86400000).toISOString()
      }
    ],
    employerRequests: [
      {
        id: 'req_2001',
        companyName: 'Apex Cloud Technologies Pvt Ltd',
        contactPerson: 'Karan Singhal',
        designation: 'VP Engineering & HR',
        email: 'karan.singhal@apexcloud.io',
        phone: '+91 98450 77123',
        city: 'Bengaluru / Pune',
        serviceType: 'Permanent Recruitment',
        positionsNeeded: '12 Positions',
        roles: 'Full Stack Developers, DevOps Engineers',
        urgency: 'Immediate (Within 15 days)',
        details: 'Looking for fast turnaround recruitment partner with pan-india candidates pool.',
        status: 'Contacted',
        notes: 'Initial requirement call completed, shared commercial terms agreement.',
        createdAt: new Date(Date.now() - 1 * 86400000).toISOString()
      }
    ],
    inquiries: [
      {
        id: 'inq_3001',
        name: 'Rajesh Solanki',
        email: 'rajesh.solanki@example.com',
        phone: '+91 97234 11223',
        subject: 'Job Opportunities in Gujarat for Mechanical Engineers',
        message: 'Hello CareerLine Solution, I have 4 years experience in industrial automation.',
        status: 'New',
        createdAt: new Date(Date.now() - 5 * 3600000).toISOString()
      }
    ],
    settings: {
      siteName: 'CareerLine Solutions',
      tagline: 'TALENT. GROWTH. SUCCESS.',
      phone: '+91 9601874036',
      altPhone: '+91 9601874036',
      whatsapp: '9601874036',
      email: 'info@careerlinesolution.com',
      address: 'Sarkhej Jambu wala No delo Ahmedabad India 382210',
      branchOffice: 'Sarkhej Jambu wala No delo Ahmedabad India 382210',
      panIndiaReach: 'Mumbai, Delhi-NCR, Bengaluru, Hyderabad, Pune, Chennai, Kolkata, Ahmedabad, Surat, Jaipur, Indore, Chandigarh',
      customSettings: [
        {
          key: 'Working Hours',
          value: 'Mon - Sat: 9:30 AM - 7:00 PM'
        },
        {
          key: 'Notice',
          value: 'New Job in IT'
        }
      ]
    }
  };

  // Get or initialize storage
  function getDB() {
    const version = localStorage.getItem('cls_db_version');
    if (version !== 'v5') {
      localStorage.removeItem('cls_local_database');
      localStorage.setItem('cls_db_version', 'v5');
    }
    let raw = localStorage.getItem('cls_local_database');
    if (!raw) {
      localStorage.setItem('cls_local_database', JSON.stringify(INITIAL_SEED));
      return INITIAL_SEED;
    }
    try {
      return JSON.parse(raw);
    } catch (e) {
      return INITIAL_SEED;
    }
  }

  function saveDB(data) {
    try {
      localStorage.setItem('cls_local_database', JSON.stringify(data));
    } catch (e) {
      console.warn('LocalStorage quota reached, pruning large embedded base64 assets...', e);
      if (data && data.applications) {
        data.applications.forEach((app, idx) => {
          if (idx > 1 && app.resumeUrl && app.resumeUrl.startsWith('data:')) {
            app.resumeUrl = '';
          }
        });
        try {
          localStorage.setItem('cls_local_database', JSON.stringify(data));
        } catch (e2) {
          console.error('Failed to save to localStorage:', e2);
        }
      }
    }
  }

  // Intercept window.fetch for /api/* on static environments
  const origFetch = window.fetch;
  window.fetch = async function (url, options = {}) {
    const urlStr = String(url);

    // If it's not an /api call, use normal fetch
    if (!urlStr.includes('/api/')) {
      return origFetch(url, options);
    }

    // Try normal fetch first if not on static host
    if (!isStaticHost) {
      try {
        const response = await origFetch(url, options);
        if (response.ok || response.status === 401 || response.status === 400) {
          return response;
        }
      } catch (err) {
        // Fallback to client-side localStorage store
        console.warn('Backend unavailable, using client-side localStorage fallback for:', urlStr);
      }
    }

    // CLIENT-SIDE MOCK HANDLER
    const method = (options.method || 'GET').toUpperCase();
    const db = getDB();
    const urlObj = new URL(urlStr, window.location.origin);
    const pathname = urlObj.pathname;
    const searchParams = urlObj.searchParams;

    // Helper for JSON response
    const mockJson = (data, status = 200) => {
      return new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json' }
      });
    };

    // 1. GET /api/settings
    if (pathname === '/api/settings') {
      return mockJson({ success: true, settings: db.settings });
    }

    // 2. GET /api/jobs
    if (pathname === '/api/jobs' && method === 'GET') {
      let list = (db.jobs || []).filter(j => j.status === 'Active');
      const q = searchParams.get('q');
      const category = searchParams.get('category');
      const location = searchParams.get('location');
      const jobType = searchParams.get('jobType');
      const workMode = searchParams.get('workMode');
      const experienceRange = searchParams.get('experienceRange');
      const page = parseInt(searchParams.get('page') || '1', 10);
      const limit = parseInt(searchParams.get('limit') || '12', 10);

      if (q && q.trim()) {
        const term = q.trim().toLowerCase();
        list = list.filter(j => 
          j.title.toLowerCase().includes(term) ||
          (j.skills && j.skills.some(s => s.toLowerCase().includes(term))) ||
          (j.location && j.location.toLowerCase().includes(term))
        );
      }

      if (category && category !== 'All') {
        list = list.filter(j => j.category && j.category.toLowerCase() === category.toLowerCase());
      }
      if (location && location !== 'All') {
        list = list.filter(j => j.location && j.location.toLowerCase().includes(location.toLowerCase()));
      }
      if (jobType && jobType !== 'All') {
        list = list.filter(j => j.jobType === jobType);
      }
      if (workMode && workMode !== 'All') {
        list = list.filter(j => j.workMode === workMode);
      }
      if (experienceRange && experienceRange !== 'All') {
        list = list.filter(j => j.experienceRange === experienceRange);
      }

      const total = list.length;
      const startIndex = (page - 1) * limit;
      const paginated = list.slice(startIndex, startIndex + limit);

      return mockJson({
        success: true,
        total,
        page,
        totalPages: Math.ceil(total / limit) || 1,
        jobs: paginated
      });
    }

    // 3. GET /api/jobs/:id
    if (pathname.startsWith('/api/jobs/') && method === 'GET') {
      const id = pathname.replace('/api/jobs/', '');
      const job = db.jobs.find(j => j.id === id);
      return job ? mockJson({ success: true, job }) : mockJson({ success: false, message: 'Not found' }, 404);
    }

    // 4. GET /api/job-meta
    if (pathname === '/api/job-meta') {
      const activeJobs = db.jobs.filter(j => j.status === 'Active');
      const categories = {};
      const locations = {};
      activeJobs.forEach(j => {
        if (j.category) categories[j.category] = (categories[j.category] || 0) + 1;
        if (j.city) locations[j.city] = (locations[j.city] || 0) + 1;
      });
      return mockJson({
        success: true,
        categories: Object.keys(categories).map(name => ({ name, count: categories[name] })),
        locations: Object.keys(locations).map(name => ({ name, count: locations[name] })),
        totalActiveJobs: activeJobs.length
      });
    }

    // 5. POST /api/apply
    if (pathname === '/api/apply' && method === 'POST') {
      let bodyData = {};
      let resumeFileName = '';
      let resumeUrl = '';

      if (options.body instanceof FormData) {
        bodyData = Object.fromEntries(options.body.entries());
        const file = options.body.get('resume');
        if (file && typeof file === 'object' && file.size > 0) {
          resumeFileName = file.name || 'Candidate_Resume.pdf';
          try {
            // Read file into Data URL so it can be previewed and downloaded in browser storage
            resumeUrl = await new Promise((resolve) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result || '');
              reader.onerror = () => resolve('');
              reader.readAsDataURL(file);
            });
          } catch (e) {
            resumeUrl = '';
          }
        }
      } else if (typeof options.body === 'string') {
        try {
          bodyData = JSON.parse(options.body);
          resumeFileName = bodyData.resumeFileName || '';
          resumeUrl = bodyData.resumeUrl || '';
        } catch (e) {}
      }

      const newApp = {
        id: 'app_' + Date.now(),
        jobId: bodyData.jobId || 'general',
        jobTitle: bodyData.jobTitle || 'General Application',
        fullName: bodyData.fullName || 'Candidate',
        email: bodyData.email || '',
        phone: bodyData.phone || '',
        currentLocation: bodyData.currentLocation || '',
        experience: bodyData.experience || '',
        currentCTC: bodyData.currentCTC || '',
        expectedCTC: bodyData.expectedCTC || '',
        noticePeriod: bodyData.noticePeriod || '',
        skills: bodyData.skills || '',
        coverNote: bodyData.coverNote || '',
        resumeFileName: resumeFileName || (bodyData.resume ? (bodyData.resume.name || 'Resume.pdf') : 'Resume.pdf'),
        resumeUrl: resumeUrl || '',
        status: 'New',
        recruiterNotes: 'Application received via portal',
        createdAt: new Date().toISOString()
      };
      db.applications.unshift(newApp);
      saveDB(db);
      return mockJson({
        success: true,
        message: 'Your job application has been submitted successfully! Our HR team will review your profile shortly.',
        applicationId: newApp.id,
        resumeUrl: newApp.resumeUrl
      });
    }

    // 6. POST /api/employer-request
    if (pathname === '/api/employer-request' && method === 'POST') {
      let bodyData = typeof options.body === 'string' ? JSON.parse(options.body) : {};
      db.employerRequests.unshift({
        id: 'req_' + Date.now(),
        ...bodyData,
        status: 'New',
        createdAt: new Date().toISOString()
      });
      saveDB(db);
      return mockJson({
        success: true,
        message: 'Thank you! Your hiring request has been received. Our senior recruitment consultant will connect with you within 2-4 business hours.'
      });
    }

    // 7. POST /api/contact
    if (pathname === '/api/contact' && method === 'POST') {
      let bodyData = typeof options.body === 'string' ? JSON.parse(options.body) : {};
      db.inquiries.unshift({
        id: 'inq_' + Date.now(),
        ...bodyData,
        status: 'New',
        createdAt: new Date().toISOString()
      });
      saveDB(db);
      return mockJson({
        success: true,
        message: 'Thank you! Your message has been sent.'
      });
    }

    // 8. POST /api/admin/login
    if (pathname === '/api/admin/login' && method === 'POST') {
      const body = typeof options.body === 'string' ? JSON.parse(options.body) : {};
      const user = db.users.find(u => u.email.toLowerCase() === (body.email || '').trim().toLowerCase());
      if (user || body.email === 'admin@careerlinesolution.com') {
        const loggedUser = user || {
          id: 'usr_admin',
          name: 'Super Admin',
          email: 'admin@careerlinesolution.com',
          role: 'Admin'
        };
        return mockJson({
          success: true,
          token: 'demo_token_' + Date.now(),
          user: loggedUser
        });
      }
      return mockJson({ success: false, message: 'Invalid credentials. Hint: admin@careerlinesolution.com / admin123' }, 401);
    }

    // 9. GET /api/admin/me
    if (pathname === '/api/admin/me') {
      return mockJson({
        success: true,
        user: { id: 'usr_admin', name: 'Super Admin', email: 'admin@careerlinesolution.com', role: 'Admin' }
      });
    }

    // 10. GET /api/admin/dashboard-stats
    if (pathname === '/api/admin/dashboard-stats') {
      return mockJson({
        success: true,
        stats: {
          totalJobs: db.jobs.length,
          activeJobs: db.jobs.filter(j => j.status === 'Active').length,
          totalApplications: db.applications.length,
          newApplications: db.applications.filter(a => a.status === 'New').length,
          shortlistedCandidates: db.applications.filter(a => a.status === 'Shortlisted').length,
          employerRequests: db.employerRequests.length,
          newEmployerRequests: db.employerRequests.filter(r => r.status === 'New').length,
          inquiries: db.inquiries.length,
          users: db.users.length
        },
        recentApplications: db.applications.slice(0, 5),
        recentEmployerRequests: db.employerRequests.slice(0, 5)
      });
    }

    // 11. GET /api/admin/jobs
    if (pathname === '/api/admin/jobs' && method === 'GET') {
      return mockJson({ success: true, jobs: db.jobs });
    }

    // 12. POST /api/admin/jobs
    if (pathname === '/api/admin/jobs' && method === 'POST') {
      const body = JSON.parse(options.body);
      const newJob = {
        id: 'job_' + Date.now(),
        ...body,
        createdAt: new Date().toISOString()
      };
      db.jobs.unshift(newJob);
      saveDB(db);
      return mockJson({ success: true, message: 'Job posted successfully!', job: newJob });
    }

    // 13. PUT /api/admin/jobs/:id
    if (pathname.startsWith('/api/admin/jobs/') && method === 'PUT') {
      const id = pathname.replace('/api/admin/jobs/', '');
      const body = JSON.parse(options.body);
      const idx = db.jobs.findIndex(j => j.id === id);
      if (idx !== -1) {
        db.jobs[idx] = { ...db.jobs[idx], ...body };
        saveDB(db);
      }
      return mockJson({ success: true, message: 'Job updated!' });
    }

    // 14. PATCH /api/admin/jobs/:id/toggle-status
    if (pathname.includes('/toggle-status') && method === 'PATCH') {
      const id = pathname.split('/')[4];
      const job = db.jobs.find(j => j.id === id);
      if (job) {
        job.status = job.status === 'Active' ? 'Inactive' : 'Active';
        saveDB(db);
        return mockJson({ success: true, message: 'Status updated to ' + job.status, status: job.status });
      }
    }

    // 15. DELETE /api/admin/jobs/:id
    if (pathname.startsWith('/api/admin/jobs/') && method === 'DELETE') {
      const id = pathname.replace('/api/admin/jobs/', '');
      db.jobs = db.jobs.filter(j => j.id !== id);
      saveDB(db);
      return mockJson({ success: true, message: 'Job deleted' });
    }

    // 16. GET /api/admin/applications
    if (pathname === '/api/admin/applications' && method === 'GET') {
      return mockJson({ success: true, applications: db.applications });
    }

    // 17. PATCH /api/admin/applications/:id/status
    if (pathname.startsWith('/api/admin/applications/') && method === 'PATCH') {
      const id = pathname.split('/')[4];
      const body = JSON.parse(options.body);
      const app = db.applications.find(a => a.id === id);
      if (app) {
        if (body.status) app.status = body.status;
        if (body.recruiterNotes !== undefined) app.recruiterNotes = body.recruiterNotes;
        saveDB(db);
      }
      return mockJson({ success: true, message: 'Status updated' });
    }

    // 18. DELETE /api/admin/applications/:id
    if (pathname.startsWith('/api/admin/applications/') && method === 'DELETE') {
      const id = pathname.replace('/api/admin/applications/', '');
      db.applications = db.applications.filter(a => a.id !== id);
      saveDB(db);
      return mockJson({ success: true, message: 'Application deleted' });
    }

    // 19. GET /api/admin/employer-requests
    if (pathname === '/api/admin/employer-requests' && method === 'GET') {
      return mockJson({ success: true, requests: db.employerRequests });
    }

    // 20. GET /api/admin/inquiries
    if (pathname === '/api/admin/inquiries' && method === 'GET') {
      return mockJson({ success: true, inquiries: db.inquiries });
    }

    // 21. GET /api/admin/users
    if (pathname === '/api/admin/users' && method === 'GET') {
      return mockJson({ success: true, users: db.users });
    }

    // 22. POST /api/admin/users
    if (pathname === '/api/admin/users' && method === 'POST') {
      const body = JSON.parse(options.body);
      const newUser = {
        id: 'usr_' + Date.now(),
        name: body.name,
        email: body.email,
        role: body.role || 'Recruiter',
        phone: body.phone || '',
        createdAt: new Date().toISOString()
      };
      db.users.push(newUser);
      saveDB(db);
      return mockJson({ success: true, message: 'User added successfully', user: newUser });
    }

    // 23. DELETE /api/admin/users/:id
    if (pathname.startsWith('/api/admin/users/') && method === 'DELETE') {
      const id = pathname.replace('/api/admin/users/', '');
      db.users = db.users.filter(u => u.id !== id);
      saveDB(db);
      return mockJson({ success: true, message: 'User deleted' });
    }

    // 24. PUT /api/admin/settings
    if (pathname === '/api/admin/settings' && (method === 'PUT' || method === 'POST')) {
      const body = typeof options.body === 'string' ? JSON.parse(options.body) : (options.body || {});
      db.settings = {
        ...(db.settings || {}),
        ...body
      };
      saveDB(db);
      return mockJson({
        success: true,
        message: 'Settings updated successfully.',
        settings: db.settings
      });
    }

    // Default fallback
    return mockJson({ success: true, message: 'Action simulated in static mode' });
  };

  window.CareerStore = {
    getDB,
    saveDB,
    getSettings: () => getDB().settings,
    saveSettings: (settings) => {
      const db = getDB();
      db.settings = { ...(db.settings || {}), ...settings };
      saveDB(db);
      return db.settings;
    }
  };
})();
