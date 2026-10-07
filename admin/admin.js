/**
 * CareerLineSolution - Admin Panel Logic
 */

let adminToken = localStorage.getItem('cls_admin_token');
let adminUser = null;
try {
  adminUser = JSON.parse(localStorage.getItem('cls_admin_user') || '{}');
} catch (e) {
  adminUser = {};
}

let cachedJobs = [];
let cachedApplications = [];
let cachedEmployerRequests = [];
let cachedInquiries = [];
let cachedUsers = [];

// Initialize Admin Console
document.addEventListener('DOMContentLoaded', async () => {
  if (!adminToken) {
    window.location.href = 'login.html';
    return;
  }

  // Verify token
  try {
    const res = await adminFetch('/api/admin/me');
    if (!res.success) {
      adminLogout();
      return;
    }
    adminUser = res.user;
    updateUserBadge();
  } catch (err) {
    adminLogout();
    return;
  }

  // Load Dashboard Data
  loadDashboardData();

  // Bind Form Submissions
  bindJobForm();
  bindUserForm();
  bindSettingsForm();
});

function updateUserBadge() {
  const nameEl = document.getElementById('sidebarUserName');
  const roleEl = document.getElementById('sidebarUserRole');
  const letterEl = document.getElementById('userAvatarLetter');

  if (nameEl && adminUser.name) nameEl.innerText = adminUser.name;
  if (roleEl && adminUser.role) roleEl.innerText = adminUser.role;
  if (letterEl && adminUser.name) letterEl.innerText = adminUser.name.charAt(0).toUpperCase();
}

// Fetch with Auth Header
async function adminFetch(url, options = {}) {
  const headers = options.headers || {};
  headers['Authorization'] = `Bearer ${adminToken}`;
  if (!headers['Content-Type'] && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, { ...options, headers });
  if (response.status === 401) {
    showToast('Session expired. Please log in again.', 'warning');
    setTimeout(() => adminLogout(), 1200);
    throw new Error('Unauthorized');
  }
  return response.json();
}

function adminLogout() {
  localStorage.removeItem('cls_admin_token');
  localStorage.removeItem('cls_admin_user');
  window.location.href = 'login.html';
}

// Mobile Sidebar Toggle
window.toggleAdminSidebar = function() {
  const sidebar = document.getElementById('adminSidebar');
  const backdrop = document.getElementById('adminSidebarBackdrop');
  if (sidebar) sidebar.classList.toggle('open');
  if (backdrop) backdrop.classList.toggle('open');
};

// Navigation Tab Switcher
window.switchAdminTab = function(tabName) {
  document.querySelectorAll('.admin-nav-link').forEach(link => link.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));

  const targetLink = Array.from(document.querySelectorAll('.admin-nav-link')).find(l => 
    l.getAttribute('onclick')?.includes(`'${tabName}'`)
  );
  if (targetLink) targetLink.classList.add('active');

  const targetTab = document.getElementById(`tab-${tabName}`);
  if (targetTab) targetTab.classList.add('active');

  // Close sidebar on mobile
  const sidebar = document.getElementById('adminSidebar');
  const backdrop = document.getElementById('adminSidebarBackdrop');
  if (sidebar) sidebar.classList.remove('open');
  if (backdrop) backdrop.classList.remove('open');

  const titleEl = document.getElementById('adminPageTitle');
  if (titleEl) {
    const titles = {
      dashboard: 'Dashboard Overview',
      jobs: 'Job Openings Management',
      applications: 'Candidate Applications & Resumes',
      employers: 'Corporate Hiring Mandates',
      inquiries: 'Website Inquiries',
      users: 'User Management',
      settings: 'Website Settings'
    };
    titleEl.innerText = titles[tabName] || 'Admin Console';
  }

  // Lazy load data for specific tab
  if (tabName === 'dashboard') loadDashboardData();
  if (tabName === 'jobs') loadAdminJobs();
  if (tabName === 'applications') loadAdminApplications();
  if (tabName === 'employers') loadAdminEmployerRequests();
  if (tabName === 'inquiries') loadAdminInquiries();
  if (tabName === 'users') loadAdminUsers();
  if (tabName === 'settings') loadAdminSettings();
};

// ==========================================
// 1. DASHBOARD OVERVIEW
// ==========================================
async function loadDashboardData() {
  try {
    const res = await adminFetch('/api/admin/dashboard-stats');
    if (res.success) {
      const s = res.stats;
      document.getElementById('kpiActiveJobs').innerText = s.activeJobs;
      document.getElementById('kpiTotalJobs').innerText = s.totalJobs;
      document.getElementById('kpiTotalApps').innerText = s.totalApplications;
      document.getElementById('kpiNewApps').innerText = s.newApplications;
      document.getElementById('kpiEmployerReqs').innerText = s.employerRequests;
      document.getElementById('kpiNewReqs').innerText = s.newEmployerRequests;
      document.getElementById('kpiShortlisted').innerText = s.shortlistedCandidates;

      document.getElementById('sidebarNewAppsCount').innerText = s.newApplications;
      document.getElementById('sidebarNewReqsCount').innerText = s.newEmployerRequests;

      renderRecentAppsTable(res.recentApplications);
      renderRecentReqsTable(res.recentEmployerRequests);
    }
  } catch (err) {
    console.error('Failed to load dashboard:', err);
  }
}

function renderRecentAppsTable(apps) {
  const tbody = document.getElementById('dashboardRecentAppsTableBody');
  if (!tbody) return;

  if (!apps || apps.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted);">No candidate applications received yet.</td></tr>`;
    return;
  }

  tbody.innerHTML = apps.map(app => `
    <tr>
      <td>
        <strong style="color: var(--primary);">${escapeHtml(app.fullName)}</strong>
        <div style="font-size: 0.8rem; color: var(--text-muted);">${escapeHtml(app.email)} • ${escapeHtml(app.phone)}</div>
      </td>
      <td><strong>${escapeHtml(app.jobTitle)}</strong></td>
      <td>${escapeHtml(app.experience)} | ${escapeHtml(app.currentCTC)}</td>
      <td>${escapeHtml(app.currentLocation)}</td>
      <td><span class="badge-status badge-${getStatusClass(app.status)}">${escapeHtml(app.status)}</span></td>
      <td><span style="font-size: 0.8rem; color: var(--text-muted);">${formatDate(app.createdAt)}</span></td>
      <td>
        <button class="table-action-btn" onclick="viewCandidateModal('${app.id}')" title="View Profile">
          <i class="fas fa-eye"></i> View
        </button>
      </td>
    </tr>
  `).join('');
}

function renderRecentReqsTable(reqs) {
  const tbody = document.getElementById('dashboardRecentReqsTableBody');
  if (!tbody) return;

  if (!reqs || reqs.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted);">No employer requests received yet.</td></tr>`;
    return;
  }

  tbody.innerHTML = reqs.map(r => `
    <tr>
      <td><strong style="color: var(--primary);">${escapeHtml(r.companyName)}</strong></td>
      <td>${escapeHtml(r.contactPerson)} (${escapeHtml(r.designation)})</td>
      <td>${escapeHtml(r.serviceType)}</td>
      <td><strong>${escapeHtml(r.positionsNeeded)}</strong></td>
      <td><span style="color: var(--danger); font-weight: 600;">${escapeHtml(r.urgency)}</span></td>
      <td><span class="badge-status badge-${getStatusClass(r.status)}">${escapeHtml(r.status)}</span></td>
      <td>
        <button class="table-action-btn" onclick="switchAdminTab('employers')">Manage</button>
      </td>
    </tr>
  `).join('');
}

// ==========================================
// 2. JOBS MANAGEMENT
// ==========================================
async function loadAdminJobs() {
  const tbody = document.getElementById('adminJobsTableBody');
  const search = document.getElementById('adminJobSearch')?.value || '';
  const status = document.getElementById('adminJobStatusFilter')?.value || 'All';

  try {
    const params = new URLSearchParams();
    if (search.trim()) params.append('search', search.trim());
    if (status !== 'All') params.append('status', status);

    const res = await adminFetch(`/api/admin/jobs?${params.toString()}`);
    if (res.success) {
      cachedJobs = res.jobs;
      if (res.jobs.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--text-muted);">No job openings found.</td></tr>`;
        return;
      }

      tbody.innerHTML = res.jobs.map(job => `
        <tr>
          <td>
            <strong style="color: var(--primary); font-size: 0.95rem;">${escapeHtml(job.title)}</strong>
            <div style="font-size: 0.8rem; color: var(--text-muted);">${escapeHtml(job.company || 'Client Confidential')}</div>
          </td>
          <td><span style="font-weight: 600; font-size: 0.85rem;">${escapeHtml(job.category)}</span></td>
          <td>${escapeHtml(job.location)}</td>
          <td><span class="job-badge-tag badge-mode">${escapeHtml(job.workMode || 'On-Site')}</span></td>
          <td>${escapeHtml(job.experience)}</td>
          <td><strong style="color: #047857;">${escapeHtml(job.salary || 'Negotiable')}</strong></td>
          <td>
            <button class="badge-status badge-${job.status === 'Active' ? 'active' : 'inactive'}" 
                    style="border: none; cursor: pointer;" 
                    onclick="toggleJobStatus('${job.id}')" 
                    title="Click to toggle status">
              <i class="fas fa-circle" style="font-size: 6px;"></i> ${job.status}
            </button>
          </td>
          <td>
            <div style="display: flex; gap: 0.35rem;">
              <button class="table-action-btn" onclick="openJobModal('${job.id}')" title="Edit Opening"><i class="fas fa-edit"></i></button>
              <button class="table-action-btn btn-del" onclick="deleteJob('${job.id}')" title="Delete Opening"><i class="fas fa-trash"></i></button>
            </div>
          </td>
        </tr>
      `).join('');
    }
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--danger);">Failed to load jobs.</td></tr>`;
  }
}

window.toggleJobStatus = async function(jobId) {
  try {
    const res = await adminFetch(`/api/admin/jobs/${jobId}/toggle-status`, { method: 'PATCH' });
    if (res.success) {
      showToast(res.message, 'success');
      loadAdminJobs();
    }
  } catch (err) {
    showToast('Failed to toggle status', 'error');
  }
};

window.deleteJob = async function(jobId) {
  if (!confirm('Are you sure you want to delete this job opening? This cannot be undone.')) return;
  try {
    const res = await adminFetch(`/api/admin/jobs/${jobId}`, { method: 'DELETE' });
    if (res.success) {
      showToast(res.message, 'success');
      loadAdminJobs();
    }
  } catch (err) {
    showToast('Error deleting job', 'error');
  }
};

window.openJobModal = function(jobId = null) {
  const modal = document.getElementById('jobAdminModal');
  const form = document.getElementById('jobAdminForm');
  const titleEl = document.getElementById('jobModalTitle');
  form.reset();

  if (jobId) {
    const job = cachedJobs.find(j => j.id === jobId);
    if (job) {
      titleEl.innerHTML = `<i class="fas fa-edit" style="color: var(--accent);"></i> Edit Job Opening`;
      document.getElementById('adminJobId').value = job.id;
      document.getElementById('jobTitle').value = job.title;
      document.getElementById('jobCategory').value = job.category;
      document.getElementById('jobCompany').value = job.company || '';
      document.getElementById('jobLocation').value = job.location;
      document.getElementById('jobWorkMode').value = job.workMode || 'On-Site';
      document.getElementById('jobExperience').value = job.experience || '';
      document.getElementById('jobSalary').value = job.salary || '';
      document.getElementById('jobOpenings').value = job.openings || 1;
      document.getElementById('jobStatus').value = job.status || 'Active';
      document.getElementById('jobSkills').value = (job.skills || []).join(', ');
      document.getElementById('jobDescription').value = job.description || '';
      document.getElementById('jobResponsibilities').value = job.responsibilities || '';
      document.getElementById('jobRequirements').value = job.requirements || '';
      document.getElementById('jobUrgent').checked = Boolean(job.urgent);
      document.getElementById('jobFeatured').checked = Boolean(job.featured);
    }
  } else {
    titleEl.innerHTML = `<i class="fas fa-briefcase" style="color: var(--accent);"></i> Post New Job Opening`;
    document.getElementById('adminJobId').value = '';
  }

  modal.classList.add('open');
};

window.closeJobModal = function() {
  document.getElementById('jobAdminModal')?.classList.remove('open');
};

function bindJobForm() {
  const form = document.getElementById('jobAdminForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = document.getElementById('jobModalSubmitBtn');
    const origText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

    const jobId = document.getElementById('adminJobId').value;
    const payload = {
      title: document.getElementById('jobTitle').value.trim(),
      category: document.getElementById('jobCategory').value,
      company: document.getElementById('jobCompany').value.trim(),
      location: document.getElementById('jobLocation').value.trim(),
      workMode: document.getElementById('jobWorkMode').value,
      experience: document.getElementById('jobExperience').value.trim(),
      salary: document.getElementById('jobSalary').value.trim(),
      openings: parseInt(document.getElementById('jobOpenings').value, 10) || 1,
      status: document.getElementById('jobStatus').value,
      skills: document.getElementById('jobSkills').value.split(',').map(s => s.trim()).filter(Boolean),
      description: document.getElementById('jobDescription').value.trim(),
      responsibilities: document.getElementById('jobResponsibilities').value.trim(),
      requirements: document.getElementById('jobRequirements').value.trim(),
      urgent: document.getElementById('jobUrgent').checked,
      featured: document.getElementById('jobFeatured').checked
    };

    try {
      const url = jobId ? `/api/admin/jobs/${jobId}` : '/api/admin/jobs';
      const method = jobId ? 'PUT' : 'POST';

      const res = await adminFetch(url, {
        method,
        body: JSON.stringify(payload)
      });

      if (res.success) {
        showToast(res.message, 'success');
        closeJobModal();
        loadAdminJobs();
      } else {
        showToast(res.message || 'Error saving job', 'error');
      }
    } catch (err) {
      showToast('Server error while saving job', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = origText;
    }
  });
}

// ==========================================
// 3. APPLICATIONS MANAGEMENT
// ==========================================
async function loadAdminApplications() {
  const tbody = document.getElementById('adminAppsTableBody');
  const search = document.getElementById('adminAppSearch')?.value || '';
  const status = document.getElementById('adminAppStatusFilter')?.value || 'All';

  try {
    const params = new URLSearchParams();
    if (search.trim()) params.append('search', search.trim());
    if (status !== 'All') params.append('status', status);

    const res = await adminFetch(`/api/admin/applications?${params.toString()}`);
    if (res.success) {
      cachedApplications = res.applications;
      if (res.applications.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--text-muted);">No candidate applications match criteria.</td></tr>`;
        return;
      }

      tbody.innerHTML = res.applications.map(app => `
        <tr>
          <td>
            <strong style="color: var(--primary); font-size: 0.95rem;">${escapeHtml(app.fullName)}</strong>
            <div style="font-size: 0.8rem; color: var(--text-muted);">${escapeHtml(app.email)}</div>
            <div style="font-size: 0.8rem; color: var(--text-muted);"><i class="fas fa-phone-alt"></i> ${escapeHtml(app.phone)}</div>
          </td>
          <td><strong>${escapeHtml(app.jobTitle)}</strong></td>
          <td>${escapeHtml(app.experience)}</td>
          <td>
            <div style="font-size: 0.85rem;">Cur: <strong>${escapeHtml(app.currentCTC)}</strong></div>
            <div style="font-size: 0.85rem; color: #047857;">Exp: <strong>${escapeHtml(app.expectedCTC)}</strong></div>
          </td>
          <td><span style="font-size: 0.85rem;">${escapeHtml(app.noticePeriod)}</span></td>
          <td>
            ${app.resumeUrl ? `
              <a href="${app.resumeUrl}" target="_blank" class="btn btn-outline btn-sm" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;">
                <i class="fas fa-download"></i> CV
              </a>
            ` : `<span style="color: var(--text-muted); font-size: 0.8rem;">No File</span>`}
          </td>
          <td>
            <select class="form-control" style="min-height: 32px; padding: 0.2rem 0.5rem; font-size: 0.8rem; font-weight: 600;" onchange="updateApplicationStatus('${app.id}', this.value)">
              <option value="New" ${app.status === 'New' ? 'selected' : ''}>New</option>
              <option value="Shortlisted" ${app.status === 'Shortlisted' ? 'selected' : ''}>Shortlisted</option>
              <option value="Interview Scheduled" ${app.status === 'Interview Scheduled' ? 'selected' : ''}>Interview Scheduled</option>
              <option value="Selected" ${app.status === 'Selected' ? 'selected' : ''}>Selected</option>
              <option value="Rejected" ${app.status === 'Rejected' ? 'selected' : ''}>Rejected</option>
            </select>
          </td>
          <td>
            <div style="display: flex; gap: 0.35rem;">
              <button class="table-action-btn" onclick="viewCandidateModal('${app.id}')" title="Full Profile & Notes"><i class="fas fa-user-edit"></i></button>
              <button class="table-action-btn btn-del" onclick="deleteApplication('${app.id}')" title="Delete Application"><i class="fas fa-trash"></i></button>
            </div>
          </td>
        </tr>
      `).join('');
    }
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--danger);">Error loading applications.</td></tr>`;
  }
}

window.updateApplicationStatus = async function(appId, newStatus) {
  try {
    const res = await adminFetch(`/api/admin/applications/${appId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: newStatus })
    });
    if (res.success) {
      showToast('Candidate status updated to ' + newStatus, 'success');
    }
  } catch (err) {
    showToast('Failed to update status', 'error');
  }
};

window.deleteApplication = async function(appId) {
  if (!confirm('Are you sure you want to delete this candidate application?')) return;
  try {
    const res = await adminFetch(`/api/admin/applications/${appId}`, { method: 'DELETE' });
    if (res.success) {
      showToast('Application deleted', 'success');
      loadAdminApplications();
    }
  } catch (err) {
    showToast('Failed to delete application', 'error');
  }
};

window.viewCandidateModal = function(appId) {
  const app = cachedApplications.find(a => a.id === appId);
  if (!app) return;

  const modal = document.getElementById('candidateDetailsModal');
  const body = document.getElementById('candidateModalBody');

  body.innerHTML = `
    <div style="border-bottom: 1px solid var(--border-color); padding-bottom: 1.25rem; margin-bottom: 1.25rem;">
      <h3 style="color: var(--primary); font-size: 1.4rem; margin-bottom: 0.25rem;">${escapeHtml(app.fullName)}</h3>
      <div style="color: var(--text-muted); font-size: 0.9rem;">
        Applied for: <strong>${escapeHtml(app.jobTitle)}</strong> • ${formatDate(app.createdAt)}
      </div>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.25rem; font-size: 0.9rem;">
      <div><strong>Email:</strong> <a href="mailto:${app.email}">${escapeHtml(app.email)}</a></div>
      <div><strong>Phone:</strong> <a href="tel:${app.phone}">${escapeHtml(app.phone)}</a></div>
      <div><strong>Location:</strong> ${escapeHtml(app.currentLocation)}</div>
      <div><strong>Experience:</strong> ${escapeHtml(app.experience)}</div>
      <div><strong>Current CTC:</strong> ${escapeHtml(app.currentCTC)}</div>
      <div><strong>Expected CTC:</strong> ${escapeHtml(app.expectedCTC)}</div>
      <div><strong>Notice Period:</strong> ${escapeHtml(app.noticePeriod)}</div>
      <div><strong>Skills:</strong> ${escapeHtml(app.skills || 'Not specified')}</div>
    </div>

    ${app.coverNote ? `
      <div style="margin-bottom: 1.25rem; background: var(--bg-light); padding: 1rem; border-radius: 8px;">
        <strong>Cover Note / Candidate Statement:</strong>
        <p style="margin-top: 0.35rem; color: var(--text-dark);">${escapeHtml(app.coverNote)}</p>
      </div>
    ` : ''}

    ${app.resumeUrl ? `
      <div style="margin-bottom: 1.5rem;">
        <strong>Uploaded Resume:</strong>
        <div style="margin-top: 0.5rem;">
          <a href="${app.resumeUrl}" target="_blank" class="btn btn-primary btn-sm">
            <i class="fas fa-file-pdf"></i> View / Download Resume (${escapeHtml(app.resumeFileName || 'Resume')})
          </a>
        </div>
      </div>
    ` : '<div style="margin-bottom: 1rem; color: var(--text-muted);">No resume file attached.</div>'}

    <div style="border-top: 1px solid var(--border-color); padding-top: 1.25rem;">
      <label class="form-label" for="candModalNotes">Internal Recruiter Notes</label>
      <textarea id="candModalNotes" class="form-control" rows="3" placeholder="Add screening notes, interview scores, client feedback...">${escapeHtml(app.recruiterNotes || '')}</textarea>
      
      <div style="display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1rem;">
        <button class="btn btn-outline" onclick="closeCandidateModal()">Close</button>
        <button class="btn btn-primary" onclick="saveCandidateNotes('${app.id}')">Save Notes</button>
      </div>
    </div>
  `;

  modal.classList.add('open');
};

window.saveCandidateNotes = async function(appId) {
  const notes = document.getElementById('candModalNotes').value;
  try {
    const res = await adminFetch(`/api/admin/applications/${appId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ recruiterNotes: notes })
    });
    if (res.success) {
      showToast('Recruiter notes saved', 'success');
      closeCandidateModal();
      loadAdminApplications();
    }
  } catch (err) {
    showToast('Failed to save notes', 'error');
  }
};

window.closeCandidateModal = function() {
  document.getElementById('candidateDetailsModal')?.classList.remove('open');
};

// ==========================================
// 4. EMPLOYER REQUESTS
// ==========================================
async function loadAdminEmployerRequests() {
  const tbody = document.getElementById('adminEmployerTableBody');
  try {
    const res = await adminFetch('/api/admin/employer-requests');
    if (res.success) {
      cachedEmployerRequests = res.requests;
      if (res.requests.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted);">No corporate staffing mandates received yet.</td></tr>`;
        return;
      }

      tbody.innerHTML = res.requests.map(r => `
        <tr>
          <td>
            <strong style="color: var(--primary); font-size: 0.95rem;">${escapeHtml(r.companyName)}</strong>
            <div style="font-size: 0.8rem; color: var(--text-muted);">${escapeHtml(r.city)}</div>
          </td>
          <td>
            <div><strong>${escapeHtml(r.contactPerson)}</strong></div>
            <div style="font-size: 0.8rem; color: var(--text-muted);">${escapeHtml(r.designation)}</div>
          </td>
          <td>
            <div style="font-size: 0.85rem;"><i class="fas fa-envelope"></i> ${escapeHtml(r.email)}</div>
            <div style="font-size: 0.85rem;"><i class="fas fa-phone-alt"></i> ${escapeHtml(r.phone)}</div>
          </td>
          <td>
            <div><span class="badge-status" style="background:#E0E7FF; color:#3730A3;">${escapeHtml(r.serviceType)}</span></div>
            <div style="font-size: 0.85rem; margin-top: 0.25rem;"><strong>${escapeHtml(r.positionsNeeded)}</strong> • ${escapeHtml(r.roles)}</div>
          </td>
          <td><span style="color: var(--danger); font-weight: 600;">${escapeHtml(r.urgency)}</span></td>
          <td>
            <select class="form-control" style="min-height: 32px; padding: 0.2rem 0.5rem; font-size: 0.8rem; font-weight: 600;" onchange="updateEmployerStatus('${r.id}', this.value)">
              <option value="New" ${r.status === 'New' ? 'selected' : ''}>New</option>
              <option value="Contacted" ${r.status === 'Contacted' ? 'selected' : ''}>Contacted</option>
              <option value="Proposal Sent" ${r.status === 'Proposal Sent' ? 'selected' : ''}>Proposal Sent</option>
              <option value="Closed" ${r.status === 'Closed' ? 'selected' : ''}>Closed / Won</option>
            </select>
          </td>
          <td>
            <button class="table-action-btn btn-del" onclick="deleteEmployerRequest('${r.id}')" title="Delete"><i class="fas fa-trash"></i></button>
          </td>
        </tr>
      `).join('');
    }
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--danger);">Failed to load employer requests.</td></tr>`;
  }
}

window.updateEmployerStatus = async function(reqId, newStatus) {
  try {
    const res = await adminFetch(`/api/admin/employer-requests/${reqId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: newStatus })
    });
    if (res.success) {
      showToast('Mandate status updated to ' + newStatus, 'success');
    }
  } catch (err) {
    showToast('Failed to update status', 'error');
  }
};

window.deleteEmployerRequest = async function(reqId) {
  if (!confirm('Are you sure you want to delete this employer mandate?')) return;
  try {
    const res = await adminFetch(`/api/admin/employer-requests/${reqId}`, { method: 'DELETE' });
    if (res.success) {
      showToast('Mandate deleted', 'success');
      loadAdminEmployerRequests();
    }
  } catch (err) {
    showToast('Failed to delete request', 'error');
  }
};

// ==========================================
// 5. INQUIRIES MANAGEMENT
// ==========================================
async function loadAdminInquiries() {
  const tbody = document.getElementById('adminInquiriesTableBody');
  try {
    const res = await adminFetch('/api/admin/inquiries');
    if (res.success) {
      cachedInquiries = res.inquiries;
      if (res.inquiries.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted);">No inquiries found.</td></tr>`;
        return;
      }

      tbody.innerHTML = res.inquiries.map(inq => `
        <tr>
          <td><strong style="color: var(--primary);">${escapeHtml(inq.name)}</strong></td>
          <td>
            <div>${escapeHtml(inq.email)}</div>
            <div style="font-size: 0.8rem; color: var(--text-muted);">${escapeHtml(inq.phone)}</div>
          </td>
          <td><strong>${escapeHtml(inq.subject)}</strong></td>
          <td style="max-width: 250px;">${escapeHtml(inq.message)}</td>
          <td>${formatDate(inq.createdAt)}</td>
          <td>
            <select class="form-control" style="min-height: 32px; padding: 0.2rem 0.5rem; font-size: 0.8rem;" onchange="updateInquiryStatus('${inq.id}', this.value)">
              <option value="New" ${inq.status === 'New' ? 'selected' : ''}>New</option>
              <option value="Replied" ${inq.status === 'Replied' ? 'selected' : ''}>Replied</option>
            </select>
          </td>
          <td>
            <button class="table-action-btn btn-del" onclick="deleteInquiry('${inq.id}')" title="Delete"><i class="fas fa-trash"></i></button>
          </td>
        </tr>
      `).join('');
    }
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--danger);">Failed to load inquiries.</td></tr>`;
  }
}

window.updateInquiryStatus = async function(inqId, status) {
  try {
    const res = await adminFetch(`/api/admin/inquiries/${inqId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
    if (res.success) showToast('Inquiry status updated', 'success');
  } catch (err) {
    showToast('Failed to update status', 'error');
  }
};

window.deleteInquiry = async function(inqId) {
  if (!confirm('Are you sure you want to delete this inquiry?')) return;
  try {
    const res = await adminFetch(`/api/admin/inquiries/${inqId}`, { method: 'DELETE' });
    if (res.success) {
      showToast('Inquiry deleted', 'success');
      loadAdminInquiries();
    }
  } catch (err) {
    showToast('Failed to delete inquiry', 'error');
  }
};

// ==========================================
// 6. USER MANAGEMENT
// ==========================================
async function loadAdminUsers() {
  const tbody = document.getElementById('adminUsersTableBody');
  try {
    const res = await adminFetch('/api/admin/users');
    if (res.success) {
      cachedUsers = res.users;
      tbody.innerHTML = res.users.map(u => `
        <tr>
          <td>
            <strong style="color: var(--primary); font-size: 0.95rem;">${escapeHtml(u.name)}</strong>
          </td>
          <td>${escapeHtml(u.email)}</td>
          <td>
            <span class="badge-status" style="${u.role === 'Admin' ? 'background:#FEF3C7;color:#92400E;' : 'background:#E0E7FF;color:#3730A3;'}">
              <i class="fas ${u.role === 'Admin' ? 'fa-shield-alt' : 'fa-user-tie'}"></i> ${escapeHtml(u.role)}
            </span>
          </td>
          <td>${escapeHtml(u.phone || 'N/A')}</td>
          <td>${formatDate(u.createdAt)}</td>
          <td>
            ${u.id !== 'usr_admin' ? `
              <button class="table-action-btn btn-del" onclick="deleteUser('${u.id}')" title="Delete User">
                <i class="fas fa-trash"></i>
              </button>
            ` : `<span style="font-size: 0.8rem; color: var(--text-muted);">Root SuperAdmin</span>`}
          </td>
        </tr>
      `).join('');
    }
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--danger);">Failed to load team users.</td></tr>`;
  }
}

window.openUserModal = function() {
  document.getElementById('adminUserForm').reset();
  document.getElementById('userAdminModal').classList.add('open');
};

window.closeUserModal = function() {
  document.getElementById('userAdminModal')?.classList.remove('open');
};

function bindUserForm() {
  const form = document.getElementById('adminUserForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      name: document.getElementById('newUserName').value.trim(),
      email: document.getElementById('newUserEmail').value.trim(),
      password: document.getElementById('newUserPassword').value,
      role: document.getElementById('newUserRole').value,
      phone: document.getElementById('newUserPhone').value.trim()
    };

    try {
      const res = await adminFetch('/api/admin/users', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      if (res.success) {
        showToast(res.message, 'success');
        closeUserModal();
        loadAdminUsers();
      } else {
        showToast(res.message || 'Failed to add user', 'error');
      }
    } catch (err) {
      showToast('Error creating user', 'error');
    }
  });
}

window.deleteUser = async function(userId) {
  if (!confirm('Are you sure you want to remove this user from the admin team?')) return;
  try {
    const res = await adminFetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
    if (res.success) {
      showToast(res.message, 'success');
      loadAdminUsers();
    } else {
      showToast(res.message, 'error');
    }
  } catch (err) {
    showToast('Error deleting user', 'error');
  }
};

// ==========================================
// 7. WEBSITE SETTINGS
// ==========================================
async function loadAdminSettings() {
  try {
    const res = await fetch('/api/settings');
    const data = await res.json();
    if (data.success && data.settings) {
      const s = data.settings;
      document.getElementById('setSiteName').value = s.siteName || '';
      document.getElementById('setTagline').value = s.tagline || '';
      document.getElementById('setPhone').value = s.phone || '';
      document.getElementById('setAltPhone').value = s.altPhone || '';
      document.getElementById('setWhatsapp').value = s.whatsapp || '';
      document.getElementById('setEmail').value = s.email || '';
      document.getElementById('setAddress').value = s.address || '';
      document.getElementById('setBranchOffice').value = s.branchOffice || '';
    }
  } catch (err) {
    showToast('Failed to load settings', 'error');
  }
}

function bindSettingsForm() {
  const form = document.getElementById('adminSettingsForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      siteName: document.getElementById('setSiteName').value.trim(),
      tagline: document.getElementById('setTagline').value.trim(),
      phone: document.getElementById('setPhone').value.trim(),
      altPhone: document.getElementById('setAltPhone').value.trim(),
      whatsapp: document.getElementById('setWhatsapp').value.trim(),
      email: document.getElementById('setEmail').value.trim(),
      address: document.getElementById('setAddress').value.trim(),
      branchOffice: document.getElementById('setBranchOffice').value.trim()
    };

    try {
      const res = await adminFetch('/api/admin/settings', {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
      if (res.success) {
        showToast('Website settings updated successfully!', 'success');
      } else {
        showToast('Failed to save settings', 'error');
      }
    } catch (err) {
      showToast('Error saving settings', 'error');
    }
  });
}

// Helpers
function getStatusClass(status) {
  if (!status) return 'new';
  const s = status.toLowerCase();
  if (s.includes('active') || s.includes('selected') || s.includes('won')) return 'selected';
  if (s.includes('shortlist')) return 'shortlisted';
  if (s.includes('interview')) return 'interview';
  if (s.includes('reject')) return 'rejected';
  if (s.includes('contacted') || s.includes('proposal')) return 'shortlisted';
  return 'new';
}

function formatDate(isoStr) {
  if (!isoStr) return '-';
  const d = new Date(isoStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
