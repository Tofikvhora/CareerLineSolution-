/**
 * CareerLineSolution - Main Client Scripts
 */

// Toast notifications system
function showToast(message, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  let iconClass = 'fa-check-circle';
  if (type === 'error') iconClass = 'fa-exclamation-circle';
  if (type === 'warning') iconClass = 'fa-exclamation-triangle';

  toast.innerHTML = `
    <i class="fas ${iconClass}" style="font-size: 1.25rem;"></i>
    <div style="flex-grow: 1; font-size: 0.925rem;">${message}</div>
    <button style="background:none;border:none;color:#94A3B8;cursor:pointer;padding:4px;" onclick="this.parentElement.remove()">
      <i class="fas fa-times"></i>
    </button>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4500);
}

document.addEventListener('DOMContentLoaded', () => {
  // Mobile Nav Toggle with Backdrop
  const toggleBtn = document.querySelector('.site-header .mobile-nav-toggle');
  const navMenu = document.querySelector('.nav-menu');
  let backdrop = document.querySelector('.nav-backdrop');
  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.className = 'nav-backdrop';
    document.body.appendChild(backdrop);
  }

  function closeMobileNav() {
    if (navMenu) navMenu.classList.remove('open');
    if (backdrop) backdrop.classList.remove('open');
    if (toggleBtn) {
      const icon = toggleBtn.querySelector('i');
      if (icon) {
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
      }
    }
  }

  function openMobileNav() {
    if (navMenu) navMenu.classList.add('open');
    if (backdrop) backdrop.classList.add('open');
    if (toggleBtn) {
      const icon = toggleBtn.querySelector('i');
      if (icon) {
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-times');
      }
    }
  }

  if (toggleBtn && navMenu) {
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (navMenu.classList.contains('open')) {
        closeMobileNav();
      } else {
        openMobileNav();
      }
    });

    if (backdrop) {
      backdrop.addEventListener('click', closeMobileNav);
    }

    // Close menu when clicking on nav link or mobile action
    document.querySelectorAll('.nav-menu .nav-link, .nav-menu .btn').forEach(link => {
      link.addEventListener('click', closeMobileNav);
    });

    // Close button inside drawer
    const drawerCloseBtn = navMenu.querySelector('.mobile-nav-toggle');
    if (drawerCloseBtn) {
      drawerCloseBtn.addEventListener('click', closeMobileNav);
    }
  }

  // Header scroll shadow
  const header = document.querySelector('.site-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }
  });

  // FAQ Accordion
  document.querySelectorAll('.faq-question').forEach(button => {
    button.addEventListener('click', () => {
      const faqItem = button.closest('.faq-item');
      const isActive = faqItem.classList.contains('active');
      
      // Close all other items
      document.querySelectorAll('.faq-item').forEach(item => {
        item.classList.remove('active');
      });

      if (!isActive) {
        faqItem.classList.add('active');
      }
    });
  });

  // Animated Numbers Counter for Stats
  const statNumbers = document.querySelectorAll('.stat-number');
  if (statNumbers.length > 0 && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const targetText = el.getAttribute('data-target') || el.innerText;
          const num = parseInt(targetText.replace(/[^0-9]/g, ''), 10);
          if (num) {
            let start = 0;
            const duration = 1500;
            const stepTime = 30;
            const steps = duration / stepTime;
            const increment = Math.ceil(num / steps);

            const timer = setInterval(() => {
              start += increment;
              if (start >= num) {
                el.innerText = targetText;
                clearInterval(timer);
              } else {
                el.innerText = start.toLocaleString('en-IN') + '+';
              }
            }, stepTime);
          }
          obs.unobserve(el);
        }
      });
    }, { threshold: 0.3 });

    statNumbers.forEach(s => observer.observe(s));
  }

  // Quick Search Form on Hero
  const heroSearchForm = document.getElementById('heroSearchForm');
  if (heroSearchForm) {
    heroSearchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const keyword = document.getElementById('heroKeyword')?.value || '';
      const location = document.getElementById('heroLocation')?.value || '';
      const category = document.getElementById('heroCategory')?.value || '';

      const params = new URLSearchParams();
      if (keyword.trim()) params.append('q', keyword.trim());
      if (location && location !== 'All') params.append('location', location);
      if (category && category !== 'All') params.append('category', category);

      window.location.href = `jobs.html?${params.toString()}`;
    });
  }

  // Employer Staffing Request Form
  const employerForm = document.getElementById('employerRequestForm');
  if (employerForm) {
    employerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = employerForm.querySelector('button[type="submit"]');
      const origText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';

      const formData = new FormData(employerForm);
      const payload = Object.fromEntries(formData.entries());

      try {
        const res = await fetch('/api/employer-request', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success) {
          showToast(data.message, 'success');
          employerForm.reset();
        } else {
          showToast(data.message || 'Error sending request', 'error');
        }
      } catch (err) {
        showToast('Network error. Please try again or WhatsApp us directly.', 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = origText;
      }
    });
  }

  // General Contact Form
  const contactForm = document.getElementById('generalContactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const origText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending message...';

      const formData = new FormData(contactForm);
      const payload = Object.fromEntries(formData.entries());

      try {
        const res = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success) {
          showToast(data.message, 'success');
          contactForm.reset();
        } else {
          showToast(data.message || 'Error submitting message', 'error');
        }
      } catch (err) {
        showToast('Network error submitting contact inquiry.', 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = origText;
      }
    });
  }

  // Load dynamic active jobs on homepage
  loadHomepageFeaturedJobs();
});

// Load real active jobs dynamically from server
async function loadHomepageFeaturedJobs() {
  const container = document.getElementById('featuredJobsPreviewContainer');
  if (!container) return;

  try {
    const res = await fetch('/api/jobs?limit=6');
    const data = await res.json();

    if (data.success && data.jobs && data.jobs.length > 0) {
      container.innerHTML = data.jobs.map(job => {
        const urgentBadge = job.urgent ? `<span class="job-badge-tag badge-urgent"><i class="fas fa-bolt"></i> Urgent Hiring</span>` : '';
        const modeBadge = job.workMode ? `<span class="job-badge-tag badge-mode">${escapeHtml(job.workMode)}</span>` : '';
        const skillsChips = (job.skills || []).slice(0, 4).map(s => `<span class="skill-chip">${escapeHtml(s)}</span>`).join('');
        const salaryDisplay = job.salary ? (isNaN(job.salary) ? escapeHtml(job.salary) : '₹' + Number(job.salary).toLocaleString('en-IN')) : 'Negotiable';

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
              <span class="job-meta-item"><i class="fas fa-briefcase"></i> ${escapeHtml(job.experience)} Yrs</span>
              <span class="job-meta-item"><i class="fas fa-user-friends"></i> ${job.openings || 1} Openings</span>
            </div>

            <div class="job-skills-wrap">
              ${skillsChips}
            </div>

            <div class="job-card-footer">
              <div class="job-salary-text">
                ${salaryDisplay}
              </div>
              <div class="job-actions-btn-group">
                <a href="jobs.html?q=${encodeURIComponent(job.title)}" class="btn btn-primary btn-sm">
                  View & Apply
                </a>
              </div>
            </div>
          </div>
        `;
      }).join('');
    } else {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; background: #FFFFFF; border-radius: 12px; padding: 3rem 2rem; text-align: center; border: 1px solid var(--border-color);">
          <div style="width: 60px; height: 60px; border-radius: 50%; background: #EFF6FF; color: var(--primary); display: flex; align-items: center; justify-content: center; font-size: 1.75rem; margin: 0 auto 1.25rem;">
            <i class="fas fa-briefcase"></i>
          </div>
          <h3 style="color: var(--primary); margin-bottom: 0.5rem;">New Openings Coming Soon</h3>
          <p style="color: var(--text-muted); max-width: 480px; margin: 0 auto 1.25rem;">
            Our recruitment consultants are actively onboarding verified employer mandates. Upload your CV to be notified immediately.
          </p>
          <a href="jobs.html" class="btn btn-primary btn-sm">
            <i class="fas fa-upload"></i> Upload CV
          </a>
        </div>
      `;
    }
  } catch (err) {
    console.error('Error loading featured jobs:', err);
  }
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

function formatRelativeTime(dateStr) {
  if (!dateStr) return 'Recently';
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days} days ago`;
  return '1 month ago';
}
