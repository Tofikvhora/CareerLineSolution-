/**
 * CareerLineSolution - Pan-India Job Search & Filter Logic
 */

let currentJobsState = {
  q: '',
  category: 'All',
  location: 'All',
  jobType: 'All',
  workMode: 'All',
  experienceRange: 'All',
  urgent: false,
  page: 1,
  limit: 9
};

let activeSelectedJob = null;

// Initialize when DOM ready
document.addEventListener('DOMContentLoaded', () => {
  // Read any query parameters from URL
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('q')) currentJobsState.q = urlParams.get('q');
  if (urlParams.has('category')) currentJobsState.category = urlParams.get('category');
  if (urlParams.has('location')) currentJobsState.location = urlParams.get('location');
  if (urlParams.has('jobType')) currentJobsState.jobType = urlParams.get('jobType');
  if (urlParams.has('workMode')) currentJobsState.workMode = urlParams.get('workMode');
  if (urlParams.has('experienceRange')) currentJobsState.experienceRange = urlParams.get('experienceRange');
  if (urlParams.has('page')) currentJobsState.page = parseInt(urlParams.get('page'), 10) || 1;

  // Sync inputs with URL state
  syncInputsWithState();

  // Load categories and locations from backend
  loadJobMetadata();

  // Fetch jobs
  fetchJobs();

  // Bind search and filter events
  bindFilterEvents();

  // Bind application form
  bindApplicationForm();
});

function syncInputsWithState() {
  const searchInput = document.getElementById('searchKeyword');
  if (searchInput && currentJobsState.q) searchInput.value = currentJobsState.q;

  const locSelect = document.getElementById('filterLocation');
  if (locSelect && currentJobsState.location) locSelect.value = currentJobsState.location;

  const catSelect = document.getElementById('filterCategory');
  if (catSelect && currentJobsState.category) catSelect.value = currentJobsState.category;

  const typeSelect = document.getElementById('filterJobType');
  if (typeSelect && currentJobsState.jobType) typeSelect.value = currentJobsState.jobType;

  const modeSelect = document.getElementById('filterWorkMode');
  if (modeSelect && currentJobsState.workMode) modeSelect.value = currentJobsState.workMode;

  const expSelect = document.getElementById('filterExperience');
  if (expSelect && currentJobsState.experienceRange) expSelect.value = currentJobsState.experienceRange;
}

// Fetch categories & locations with counts
async function loadJobMetadata() {
  try {
    const res = await fetch('/api/job-meta');
    const data = await res.json();
    if (data.success) {
      // Populate category dropdown
      const catSelect = document.getElementById('filterCategory');
      if (catSelect) {
        let html = '<option value="All">All Sectors / Industries</option>';
        data.categories.forEach(c => {
          const selected = currentJobsState.category.toLowerCase() === c.name.toLowerCase() ? 'selected' : '';
          html += `<option value="${c.name}" ${selected}>${c.name} (${c.count})</option>`;
        });
        catSelect.innerHTML = html;
      }

      // Populate location dropdown
      const locSelect = document.getElementById('filterLocation');
      if (locSelect) {
        let html = '<option value="All">All Locations (Pan-India)</option>';
        data.locations.forEach(l => {
          const selected = currentJobsState.location.toLowerCase() === l.name.toLowerCase() ? 'selected' : '';
          html += `<option value="${l.name}" ${selected}>${l.name} (${l.count})</option>`;
        });
        locSelect.innerHTML = html;
      }

      // Populate quick chips on banner
      const chipsContainer = document.getElementById('popularSectorChips');
      if (chipsContainer && data.categories.length > 0) {
        chipsContainer.innerHTML = data.categories.slice(0, 5).map(c => `
          <button class="popular-chip ${currentJobsState.category === c.name ? 'active' : ''}" 
                  onclick="selectCategoryFilter('${c.name}')">
            ${c.name}
          </button>
        `).join('');
      }
    }
  } catch (err) {
    console.error('Error loading metadata:', err);
  }
}

// Quick filter by category chip
window.selectCategoryFilter = function(categoryName) {
  currentJobsState.category = categoryName;
  currentJobsState.page = 1;
  const catSelect = document.getElementById('filterCategory');
  if (catSelect) catSelect.value = categoryName;
  fetchJobs();
};

function bindFilterEvents() {
  const searchInput = document.getElementById('searchKeyword');
  const searchForm = document.getElementById('jobsSearchFilterForm');
  const catSelect = document.getElementById('filterCategory');
  const locSelect = document.getElementById('filterLocation');
  const typeSelect = document.getElementById('filterJobType');
  const modeSelect = document.getElementById('filterWorkMode');
  const expSelect = document.getElementById('filterExperience');
  const clearBtn = document.getElementById('clearFiltersBtn');

  if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      currentJobsState.q = searchInput ? searchInput.value.trim() : '';
      currentJobsState.page = 1;
      fetchJobs();
    });
  }

  // Debounced input for live search
  let debounceTimeout;
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      clearTimeout(debounceTimeout);
      debounceTimeout = setTimeout(() => {
        currentJobsState.q = searchInput.value.trim();
        currentJobsState.page = 1;
        fetchJobs();
      }, 400);
    });
  }

  catSelect?.addEventListener('change', () => {
    currentJobsState.category = catSelect.value;
    currentJobsState.page = 1;
    fetchJobs();
  });

  locSelect?.addEventListener('change', () => {
    currentJobsState.location = locSelect.value;
    currentJobsState.page = 1;
    fetchJobs();
  });

  typeSelect?.addEventListener('change', () => {
    currentJobsState.jobType = typeSelect.value;
    currentJobsState.page = 1;
    fetchJobs();
  });

  modeSelect?.addEventListener('change', () => {
    currentJobsState.workMode = modeSelect.value;
    currentJobsState.page = 1;
    fetchJobs();
  });

  expSelect?.addEventListener('change', () => {
    currentJobsState.experienceRange = expSelect.value;
    currentJobsState.page = 1;
    fetchJobs();
  });

  clearBtn?.addEventListener('click', () => {
    currentJobsState = {
      q: '',
      category: 'All',
      location: 'All',
      jobType: 'All',
      workMode: 'All',
      experienceRange: 'All',
      urgent: false,
      page: 1,
      limit: 9
    };
    if (searchInput) searchInput.value = '';
    if (catSelect) catSelect.value = 'All';
    if (locSelect) locSelect.value = 'All';
    if (typeSelect) typeSelect.value = 'All';
    if (modeSelect) modeSelect.value = 'All';
    if (expSelect) expSelect.value = 'All';
    fetchJobs();
  });
}

// Fetch jobs from server
async function fetchJobs() {
  const container = document.getElementById('jobsListContainer');
  const countEl = document.getElementById('jobsFoundCount');
  const paginationEl = document.getElementById('jobsPagination');

  if (container) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 3rem 0;">
        <i class="fas fa-spinner fa-spin" style="font-size: 2.5rem; color: var(--primary);"></i>
        <p style="margin-top: 1rem; color: var(--text-muted); font-weight: 500;">Searching pan-india career opportunities...</p>
      </div>
    `;
  }

  const params = new URLSearchParams();
  if (currentJobsState.q) params.append('q', currentJobsState.q);
  if (currentJobsState.category && currentJobsState.category !== 'All') params.append('category', currentJobsState.category);
  if (currentJobsState.location && currentJobsState.location !== 'All') params.append('location', currentJobsState.location);
  if (currentJobsState.jobType && currentJobsState.jobType !== 'All') params.append('jobType', currentJobsState.jobType);
  if (currentJobsState.workMode && currentJobsState.workMode !== 'All') params.append('workMode', currentJobsState.workMode);
  if (currentJobsState.experienceRange && currentJobsState.experienceRange !== 'All') params.append('experienceRange', currentJobsState.experienceRange);
  params.append('page', currentJobsState.page);
  params.append('limit', currentJobsState.limit);

  try {
    const res = await fetch(`/api/jobs?${params.toString()}`);
    const data = await res.json();

    if (data.success) {
      if (countEl) {
        countEl.innerHTML = `Showing <strong>${data.jobs.length}</strong> of <strong>${data.total}</strong> active jobs in India`;
      }
      renderJobs(data.jobs, container);
      renderPagination(data.page, data.totalPages, paginationEl);
    }
  } catch (err) {
    if (container) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem 0; color: var(--danger);">
          <i class="fas fa-exclamation-triangle" style="font-size: 2.5rem;"></i>
          <p style="margin-top: 1rem; font-weight: 600;">Unable to connect to jobs database. Please check your connection.</p>
        </div>
      `;
    }
  }
}

// Render Job Cards
function renderJobs(jobs, container) {
  if (!container) return;

  if (!jobs || jobs.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; background: #FFFFFF; border-radius: 12px; padding: 4rem 2rem; text-align: center; border: 1px solid var(--border-color);">
        <div style="width: 70px; height: 70px; border-radius: 50%; background: #EFF6FF; color: var(--primary); display: flex; align-items: center; justify-content: center; font-size: 2rem; margin: 0 auto 1.5rem;">
          <i class="fas fa-briefcase"></i>
        </div>
        <h3 style="color: var(--primary); margin-bottom: 0.5rem;">No Matching Jobs Found</h3>
        <p style="color: var(--text-muted); max-width: 480px; margin: 0 auto 1.5rem;">
          We couldn't find openings matching your current search criteria. Try modifying your filters or submit a general application.
        </p>
        <button class="btn btn-primary" onclick="openApplyModal('general', 'General Candidate Profile')">
          <i class="fas fa-paper-plane"></i> Submit General Resume
        </button>
      </div>
    `;
    return;
  }

  container.innerHTML = jobs.map(job => {
    const urgentBadge = job.urgent ? `<span class="job-badge-tag badge-urgent"><i class="fas fa-bolt"></i> Urgent Hiring</span>` : '';
    const modeBadge = job.workMode ? `<span class="job-badge-tag badge-mode">${job.workMode}</span>` : '';
    const skillsChips = (job.skills || []).slice(0, 4).map(s => `<span class="skill-chip">${s}</span>`).join('');

    return `
      <div class="job-card">
        <div class="job-card-header">
          <div style="display: flex; gap: 0.4rem; flex-wrap: wrap;">
            ${urgentBadge}
            ${modeBadge}
          </div>
          <span style="font-size: 0.75rem; color: var(--text-light);"><i class="far fa-clock"></i> ${formatRelativeTime(job.createdAt)}</span>
        </div>

        <h3 class="job-title">${escapeHtml(job.title)}</h3>
        <div class="job-company">
          <i class="far fa-building"></i> ${escapeHtml(job.company || 'Client Confidential')} • <span style="color: var(--primary); font-weight: 600;">${escapeHtml(job.category)}</span>
        </div>

        <div class="job-meta-row">
          <span class="job-meta-item"><i class="fas fa-map-marker-alt"></i> ${escapeHtml(job.location)}</span>
          <span class="job-meta-item"><i class="fas fa-briefcase"></i> ${escapeHtml(job.experience)}</span>
          <span class="job-meta-item"><i class="fas fa-user-friends"></i> ${job.openings} Openings</span>
        </div>

        <div class="job-skills-wrap">
          ${skillsChips}
        </div>

        <div class="job-card-footer">
          <div class="job-salary-text">
            ${escapeHtml(job.salary || 'Negotiable')}
          </div>
          <div class="job-actions-btn-group">
            <button class="btn btn-outline btn-sm" onclick="viewJobDetails('${job.id}')">
              Details
            </button>
            <button class="btn btn-primary btn-sm" onclick="openApplyModal('${job.id}', '${escapeAttr(job.title)}')">
              Apply Now
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Render pagination buttons
function renderPagination(currentPage, totalPages, container) {
  if (!container || totalPages <= 1) {
    if (container) container.innerHTML = '';
    return;
  }

  let html = `<div style="display: flex; justify-content: center; gap: 0.5rem; margin-top: 2.5rem;">`;

  if (currentPage > 1) {
    html += `
      <button class="btn btn-outline btn-sm" onclick="goToPage(${currentPage - 1})">
        <i class="fas fa-chevron-left"></i> Prev
      </button>
    `;
  }

  for (let i = 1; i <= totalPages; i++) {
    const activeClass = i === currentPage ? 'btn-primary' : 'btn-outline';
    html += `
      <button class="btn ${activeClass} btn-sm" onclick="goToPage(${i})">
        ${i}
      </button>
    `;
  }

  if (currentPage < totalPages) {
    html += `
      <button class="btn btn-outline btn-sm" onclick="goToPage(${currentPage + 1})">
        Next <i class="fas fa-chevron-right"></i>
      </button>
    `;
  }

  html += `</div>`;
  container.innerHTML = html;
}

window.goToPage = function(page) {
  currentJobsState.page = page;
  fetchJobs();
  window.scrollTo({ top: 400, behavior: 'smooth' });
};

// View Job Details Modal
window.viewJobDetails = async function(jobId) {
  try {
    const res = await fetch(`/api/jobs/${jobId}`);
    const data = await res.json();
    if (data.success && data.job) {
      const job = data.job;
      activeSelectedJob = job;

      const modal = document.getElementById('jobDetailsModal');
      const body = document.getElementById('jobDetailsBody');

      if (modal && body) {
        body.innerHTML = `
          <div style="border-bottom: 1px solid var(--border-color); padding-bottom: 1.25rem; margin-bottom: 1.5rem;">
            <div style="display: flex; gap: 0.5rem; margin-bottom: 0.75rem;">
              ${job.urgent ? '<span class="job-badge-tag badge-urgent"><i class="fas fa-bolt"></i> Urgent Hiring</span>' : ''}
              <span class="job-badge-tag badge-mode">${job.workMode || 'On-Site'}</span>
              <span class="job-badge-tag" style="background:#E2E8F0; color:#334155;">${job.jobType || 'Full-Time'}</span>
            </div>
            <h2 style="font-size: 1.6rem; color: var(--primary); margin-bottom: 0.4rem;">${escapeHtml(job.title)}</h2>
            <div style="color: var(--text-muted); font-size: 0.95rem;">
              <strong>${escapeHtml(job.company)}</strong> • Sector: <span style="color: var(--primary); font-weight: 600;">${escapeHtml(job.category)}</span>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; background: var(--bg-light); padding: 1.25rem; border-radius: 8px; margin-bottom: 1.5rem;">
            <div>
              <span style="font-size: 0.8rem; color: var(--text-muted); display: block;">Location</span>
              <strong style="color: var(--primary);"><i class="fas fa-map-marker-alt"></i> ${escapeHtml(job.location)}</strong>
            </div>
            <div>
              <span style="font-size: 0.8rem; color: var(--text-muted); display: block;">Experience</span>
              <strong style="color: var(--primary);"><i class="fas fa-briefcase"></i> ${escapeHtml(job.experience)}</strong>
            </div>
            <div>
              <span style="font-size: 0.8rem; color: var(--text-muted); display: block;">Salary</span>
              <strong style="color: #047857;"><i class="fas fa-rupee-sign"></i> ${escapeHtml(job.salary || 'Best in Industry')}</strong>
            </div>
          </div>

          <div style="margin-bottom: 1.5rem;">
            <h4 style="color: var(--primary); font-size: 1.1rem; margin-bottom: 0.5rem;">Job Description</h4>
            <p style="color: var(--text-dark); line-height: 1.6; font-size: 0.95rem;">${escapeHtml(job.description)}</p>
          </div>

          ${job.responsibilities ? `
            <div style="margin-bottom: 1.5rem;">
              <h4 style="color: var(--primary); font-size: 1.1rem; margin-bottom: 0.5rem;">Key Responsibilities</h4>
              <p style="white-space: pre-line; color: var(--text-dark); font-size: 0.925rem; line-height: 1.6;">${escapeHtml(job.responsibilities)}</p>
            </div>
          ` : ''}

          ${job.requirements ? `
            <div style="margin-bottom: 1.5rem;">
              <h4 style="color: var(--primary); font-size: 1.1rem; margin-bottom: 0.5rem;">Candidate Requirements & Qualifications</h4>
              <p style="white-space: pre-line; color: var(--text-dark); font-size: 0.925rem; line-height: 1.6;">${escapeHtml(job.requirements)}</p>
            </div>
          ` : ''}

          <div style="margin-bottom: 2rem;">
            <h4 style="color: var(--primary); font-size: 1.1rem; margin-bottom: 0.5rem;">Key Skills</h4>
            <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
              ${(job.skills || []).map(s => `<span class="skill-chip" style="font-size: 0.85rem; padding: 0.4rem 0.8rem;">${s}</span>`).join('')}
            </div>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 1rem; border-top: 1px solid var(--border-color); padding-top: 1.5rem;">
            <button class="btn btn-outline" onclick="closeJobDetailsModal()">Close</button>
            <button class="btn btn-primary" onclick="closeJobDetailsModal(); openApplyModal('${job.id}', '${escapeAttr(job.title)}')">
              <i class="fas fa-paper-plane"></i> Apply For This Job
            </button>
          </div>
        `;
        modal.classList.add('open');
      }
    }
  } catch (err) {
    showToast('Failed to load job details', 'error');
  }
};

window.closeJobDetailsModal = function() {
  document.getElementById('jobDetailsModal')?.classList.remove('open');
};

// Open Application Form Modal
window.openApplyModal = function(jobId, jobTitle) {
  const modal = document.getElementById('applyJobModal');
  const targetJobIdInput = document.getElementById('applyJobId');
  const targetJobTitleDisplay = document.getElementById('applyJobTitleDisplay');

  if (targetJobIdInput) targetJobIdInput.value = jobId || 'general';
  if (targetJobTitleDisplay) targetJobTitleDisplay.innerText = jobTitle || 'General Application';

  if (modal) modal.classList.add('open');
};

window.closeApplyModal = function() {
  document.getElementById('applyJobModal')?.classList.remove('open');
};

// Application Form submission
function bindApplicationForm() {
  const form = document.getElementById('candidateApplyForm');
  if (!form) return;

  const fileInput = document.getElementById('candidateResume');
  const fileStatus = document.getElementById('fileUploadStatus');

  fileInput?.addEventListener('change', () => {
    if (fileInput.files.length > 0) {
      fileStatus.innerText = `Selected file: ${fileInput.files[0].name} (${(fileInput.files[0].size / (1024 * 1024)).toFixed(2)} MB)`;
      fileStatus.style.color = 'var(--primary)';
    } else {
      fileStatus.innerText = 'PDF, DOC, DOCX up to 10MB';
      fileStatus.style.color = 'var(--text-muted)';
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector('button[type="submit"]');
    const origText = submitBtn.innerHTML;
    const file = fileInput?.files?.[0];
    if (file && file.size > 10 * 1024 * 1024) {
      showToast('Selected resume file is larger than 10MB. Please upload a smaller file.', 'warning');
      submitBtn.disabled = false;
      submitBtn.innerHTML = origText;
      return;
    }

    const formData = new FormData(form);

    try {
      const res = await fetch('/api/apply', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();

      if (data.success) {
        showToast(data.message, 'success');
        form.reset();
        if (fileStatus) fileStatus.innerText = 'PDF, DOC, DOCX up to 10MB';
        closeApplyModal();
      } else {
        showToast(data.message || 'Error submitting application', 'error');
      }
    } catch (err) {
      showToast('Network error while uploading application. Please check file size or retry.', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = origText;
    }
  });
}

// Helpers
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function escapeAttr(str) {
  if (!str) return '';
  return String(str).replace(/"/g, '&quot;').replace(/'/g, "\\'");
}

function formatRelativeTime(dateStr) {
  if (!dateStr) return 'Recently';
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days} days ago`;
  return '1 month ago';
}
