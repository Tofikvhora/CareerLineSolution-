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
    document.body.classList.remove('menu-open');
    document.body.style.overflow = '';
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
    document.body.classList.add('menu-open');
    document.body.style.overflow = 'hidden';
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

  // Load and apply dynamic website settings across public site
  loadAndApplySiteSettings();

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

// ==========================================
// DYNAMIC WEBSITE SETTINGS LOADER & APPLIER
// ==========================================
async function loadAndApplySiteSettings() {
  // Never run public DOM manipulations inside the admin panel!
  if (window.location.pathname.includes('/admin') || document.querySelector('.admin-sidebar, .admin-main')) {
    return;
  }

  // Immediate pre-render if client store has settings (eliminates flicker)
  if (window.CareerStore && typeof window.CareerStore.getSettings === 'function') {
    try {
      const preSettings = window.CareerStore.getSettings();
      if (preSettings) applySettingsToDOM(preSettings);
    } catch (e) {}
  }

  try {
    const res = await fetch('/api/settings');
    const data = await res.json();
    if (data.success && data.settings) {
      applySettingsToDOM(data.settings);
      if (window.CareerStore && typeof window.CareerStore.saveSettings === 'function') {
        window.CareerStore.saveSettings(data.settings);
      }
    }
  } catch (err) {
    if (window.CareerStore && typeof window.CareerStore.getSettings === 'function') {
      try {
        const fallbackSettings = window.CareerStore.getSettings();
        if (fallbackSettings) applySettingsToDOM(fallbackSettings);
      } catch (e) {}
    }
    console.warn('Could not load dynamic website settings:', err);
  }
}

function applySettingsToDOM(settings) {
  if (!settings) return;

  const phone = (settings.phone || '').trim();
  const altPhone = (settings.altPhone || '').trim();
  const email = (settings.email || '').trim();
  const address = (settings.address || '').trim();
  const branchOffice = (settings.branchOffice || '').trim();
  const siteName = (settings.siteName || '').trim();
  const tagline = (settings.tagline || '').trim();
  let whatsapp = (settings.whatsapp || '').trim();

  // Sanitize phone for tel: protocol
  const cleanPhone = phone.replace(/[^0-9+]/g, '');
  const cleanAltPhone = altPhone.replace(/[^0-9+]/g, '');

  // Sanitize WhatsApp for wa.me URL
  let waDigits = whatsapp.replace(/[^0-9]/g, '');
  if (waDigits.length === 10) {
    waDigits = '91' + waDigits; // Default India prefix
  }

  // 1. Company Name & Tagline updates across navbar, drawer, hero, footer, and page title
  if (siteName) {
    const brandHtml = formatBrandHtml(siteName);

    // Navbar & Mobile drawer brand titles
    document.querySelectorAll('.brand-title').forEach(el => {
      el.innerHTML = brandHtml;
    });

    // Footer brand title
    document.querySelectorAll('.footer-brand h3, .footer-brand-title').forEach(el => {
      el.innerHTML = brandHtml;
    });

    // Footer copyright strong tag
    document.querySelectorAll('.footer-bottom').forEach(fb => {
      fb.querySelectorAll('strong').forEach(str => {
        str.textContent = siteName;
      });
    });

    // Document title
    if (document.title.includes('CareerLine Solution')) {
      document.title = document.title.replace(/CareerLine\s*Solution/gi, siteName);
    } else if (!document.title.includes(siteName)) {
      document.title = `${siteName} | ${tagline || 'HR & Recruitment Consultancy'}`;
    }

    // Hero subtitle text mention
    const heroSubtitle = document.querySelector('.hero-subtitle');
    if (heroSubtitle) {
      heroSubtitle.innerHTML = heroSubtitle.innerHTML.replace(/CareerLine\s*Solution/gi, escapeHtml(siteName));
    }

    // Contact placeholder
    const contactMsg = document.getElementById('contactMessage');
    if (contactMsg) {
      contactMsg.placeholder = `How can ${siteName} help you?`;
    }
  }

  if (tagline) {
    // Navbar & Mobile drawer subtitles
    document.querySelectorAll('.brand-subtitle').forEach(el => {
      el.textContent = tagline;
    });

    // Hero badge
    const heroBadge = document.querySelector('.hero-badge');
    if (heroBadge) {
      heroBadge.innerHTML = `<i class="fas fa-check-circle"></i> ${escapeHtml(tagline)}`;
    }
  }

  // 2. Elements with explicit data-setting attribute
  document.querySelectorAll('[data-setting]').forEach(el => {
    // Floating buttons must NEVER have inner text changed!
    if (el.classList.contains('float-btn') || el.closest('.floating-actions')) {
      return;
    }

    const key = el.getAttribute('data-setting');
    if (key === 'siteName') {
      if (el.classList.contains('brand-title') || el.tagName === 'H3') {
        el.innerHTML = formatBrandHtml(siteName);
      } else {
        el.textContent = siteName;
      }
    } else if (key === 'tagline') {
      el.textContent = tagline;
    } else if (key === 'phone') {
      if (el.tagName === 'A') {
        el.href = `tel:${cleanPhone}`;
        updateLinkTextPreservingIcon(el, phone);
      } else {
        el.textContent = phone;
      }
    } else if (key === 'altPhone') {
      if (el.tagName === 'A') {
        el.href = `tel:${cleanAltPhone}`;
        updateLinkTextPreservingIcon(el, altPhone);
      } else {
        el.textContent = altPhone;
      }
    } else if (key === 'email') {
      if (el.tagName === 'A') {
        el.href = `mailto:${email}`;
        updateLinkTextPreservingIcon(el, email);
      } else {
        el.textContent = email;
      }
    } else if (key === 'whatsapp') {
      if (el.tagName === 'A') {
        const textParam = el.getAttribute('data-wa-text') || `Hi ${siteName || 'CareerLine Solution'}, I am looking for recruitment support`;
        el.href = `https://wa.me/${waDigits}?text=${encodeURIComponent(textParam)}`;
      } else {
        el.textContent = whatsapp;
      }
    } else if (key === 'address') {
      el.textContent = address;
    } else if (key === 'branchOffice') {
      el.textContent = branchOffice;
    } else if (key === 'combinedPhones') {
      el.textContent = `${phone}${altPhone && altPhone !== phone ? ' / ' + altPhone : ''}`;
    }
  });

  // 2. Generic Top Bar Updates across all pages
  const topBar = document.querySelector('.top-bar');
  if (topBar) {
    const topPhoneLinks = topBar.querySelectorAll('a[href^="tel:"]');
    if (topPhoneLinks.length > 0 && phone) {
      topPhoneLinks[0].href = `tel:${cleanPhone}`;
      updateLinkTextPreservingIcon(topPhoneLinks[0], phone);
    }
    if (topPhoneLinks.length > 1 && altPhone) {
      topPhoneLinks[1].href = `tel:${cleanAltPhone}`;
      updateLinkTextPreservingIcon(topPhoneLinks[1], altPhone);
    }

    const topEmailLink = topBar.querySelector('a[href^="mailto:"]');
    if (topEmailLink && email) {
      topEmailLink.href = `mailto:${email}`;
      updateLinkTextPreservingIcon(topEmailLink, email);
    }

    const topWaLink = topBar.querySelector('a[href*="wa.me"]');
    if (topWaLink && waDigits) {
      topWaLink.href = `https://wa.me/${waDigits}?text=${encodeURIComponent(`Hi ${siteName || 'CareerLine Solution'}, I am looking for recruitment support`)}`;
    }
  }

  // 3. Floating Action Buttons (WhatsApp & Phone call) - ONLY icons, NEVER text!
  const floatWa = document.querySelector('.float-btn.float-whatsapp, .floating-actions a[href*="wa.me"]');
  if (floatWa) {
    if (waDigits) {
      floatWa.href = `https://wa.me/${waDigits}?text=${encodeURIComponent(`Hi ${siteName || 'CareerLine Solution'}, I am interested in your services. Kindly connect.`)}`;
    }
    floatWa.setAttribute('aria-label', 'Chat on WhatsApp');
    const icon = floatWa.querySelector('i');
    if (icon) {
      floatWa.innerHTML = '';
      floatWa.appendChild(icon);
    }
  }

  const floatCall = document.querySelector('.float-btn.float-call, .floating-actions a[href^="tel:"]');
  if (floatCall) {
    if (cleanPhone) {
      floatCall.href = `tel:${cleanPhone}`;
    }
    floatCall.setAttribute('aria-label', `Call ${siteName || 'CareerLine Solution'}`);
    const icon = floatCall.querySelector('i');
    if (icon) {
      floatCall.innerHTML = '';
      floatCall.appendChild(icon);
    }
  }

  // 4. Any other regular WhatsApp links across the page
  if (waDigits) {
    document.querySelectorAll('a[href*="wa.me"]').forEach(link => {
      if (link.classList.contains('float-btn') || link.closest('.floating-actions')) return;
      try {
        const url = new URL(link.href);
        const textParam = url.searchParams.get('text') || '';
        link.href = `https://wa.me/${waDigits}${textParam ? '?text=' + encodeURIComponent(textParam) : ''}`;
      } catch (e) {
        link.href = `https://wa.me/${waDigits}`;
      }
    });
  }

  // 5. Contact Cards Grid (Homepage and Contact page)
  const contactCards = document.querySelectorAll('.contact-card');
  contactCards.forEach(card => {
    // Phone card
    const phoneLinks = card.querySelectorAll('a[href^="tel:"]');
    if (phoneLinks.length > 0 && phone) {
      phoneLinks[0].href = `tel:${cleanPhone}`;
      phoneLinks[0].textContent = phone;
    }
    if (phoneLinks.length > 1 && altPhone) {
      phoneLinks[1].href = `tel:${cleanAltPhone}`;
      phoneLinks[1].textContent = altPhone;
    }

    // Email card
    const emailLinks = card.querySelectorAll('a[href^="mailto:"]');
    if (emailLinks.length > 0 && email) {
      emailLinks[0].href = `mailto:${email}`;
      emailLinks[0].textContent = email;
    }

    // Address card (contains map marker)
    if (card.querySelector('.fa-map-marker-alt')) {
      const pTags = card.querySelectorAll('p');
      if (pTags.length > 0 && address) {
        pTags[0].innerHTML = `<strong>Head Office:</strong> ${escapeHtml(address)}`;
      }
      if (pTags.length > 1 && branchOffice) {
        pTags[1].innerHTML = `<strong>Branch Office:</strong> ${escapeHtml(branchOffice)}`;
      }
    }
  });

  // 6. Footer Updates
  const footer = document.querySelector('.site-footer');
  if (footer) {
    const footerAddress = footer.querySelector('.footer-contact-list li:has(.fa-map-marker-alt) div, .footer-contact-list li i.fa-map-marker-alt + div');
    if (footerAddress && address) {
      footerAddress.innerHTML = `<strong>Head Office:</strong> ${escapeHtml(address)}${branchOffice && branchOffice !== address ? `<br><strong style="font-size:0.85rem;color:var(--text-light,#94A3B8);">Branch:</strong> <span style="font-size:0.85rem;">${escapeHtml(branchOffice)}</span>` : ''}`;
    }

    const footerPhone = footer.querySelector('.footer-contact-list li:has(.fa-phone-alt) div, .footer-contact-list li i.fa-phone-alt + div');
    if (footerPhone && phone) {
      footerPhone.textContent = `${phone}${altPhone && altPhone !== phone ? ' / ' + altPhone : ''}`;
    }

    const footerEmail = footer.querySelector('.footer-contact-list li:has(.fa-envelope) div, .footer-contact-list li i.fa-envelope + div');
    if (footerEmail && email) {
      footerEmail.textContent = email;
    }

    const footerCopyright = footer.querySelector('.footer-bottom div:first-child');
    if (footerCopyright && siteName) {
      footerCopyright.innerHTML = `© ${new Date().getFullYear()} <strong>${escapeHtml(siteName)}</strong>. All Rights Reserved.`;
    }
  }

  // 7. Custom Settings Rendering
  renderCustomSettingsOnPublicSite(settings.customSettings);
}

function formatBrandHtml(name) {
  if (!name) return 'CareerLine<span>Solution</span>';
  const trimmed = name.trim();
  const words = trimmed.split(/\s+/);
  if (words.length > 1) {
    const lastWord = words.pop();
    return `${escapeHtml(words.join(' '))} <span>${escapeHtml(lastWord)}</span>`;
  }
  if (trimmed.length > 6) {
    const mid = Math.floor(trimmed.length / 2);
    return `${escapeHtml(trimmed.slice(0, mid))}<span>${escapeHtml(trimmed.slice(mid))}</span>`;
  }
  return escapeHtml(trimmed);
}

function updateLinkTextPreservingIcon(linkEl, newText) {
  // If this is a floating button, NEVER inject text!
  if (linkEl.classList.contains('float-btn') || linkEl.closest('.floating-actions')) {
    return;
  }
  const icon = linkEl.querySelector('i');
  if (icon) {
    linkEl.innerHTML = '';
    linkEl.appendChild(icon);
    linkEl.appendChild(document.createTextNode(' ' + newText));
  } else {
    linkEl.textContent = newText;
  }
}

function renderCustomSettingsOnPublicSite(customSettings) {
  if (!customSettings || !Array.isArray(customSettings) || customSettings.length === 0) return;

  // Targeted elements matching custom keys
  customSettings.forEach(item => {
    if (!item.key) return;
    const key = item.key.toLowerCase().replace(/[^a-z0-9]/g, '');
    document.querySelectorAll(`[data-setting="${key}"]`).forEach(el => {
      el.textContent = item.value || '';
    });
  });

  // General custom settings container display (e.g. on contact section or footer)
  const containers = document.querySelectorAll('#publicCustomSettingsList, .public-custom-settings-wrap');
  containers.forEach(container => {
    container.innerHTML = `
      <div style="background: #FFFFFF; border: 1px solid var(--border-color, #E2E8F0); border-radius: 12px; padding: 1.25rem 1.5rem; margin-top: 1.5rem; box-shadow: var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.06));">
        <h4 style="font-size: 1.05rem; color: var(--primary, #0B2545); margin-bottom: 0.85rem; display: flex; align-items: center; gap: 0.5rem;">
          <i class="fas fa-info-circle" style="color: var(--accent, #FF8A00);"></i> Additional Information
        </h4>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem;">
          ${customSettings.map(s => `
            <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 0.75rem 1rem;">
              <div style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-muted, #64748B); margin-bottom: 0.25rem;">
                ${escapeHtml(s.key)}
              </div>
              <div style="font-size: 0.925rem; font-weight: 600; color: var(--text-dark, #1E293B);">
                ${escapeHtml(s.value)}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  });
}

// Expose on window for programmatic calls or testing
window.loadAndApplySiteSettings = loadAndApplySiteSettings;
window.applySettingsToDOM = applySettingsToDOM;
