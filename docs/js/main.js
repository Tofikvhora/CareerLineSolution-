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
  // Mobile Nav Toggle
  const toggleBtn = document.querySelector('.mobile-nav-toggle');
  const navMenu = document.querySelector('.nav-menu');
  if (toggleBtn && navMenu) {
    toggleBtn.addEventListener('click', () => {
      navMenu.classList.toggle('open');
      const icon = toggleBtn.querySelector('i');
      if (icon) {
        if (navMenu.classList.contains('open')) {
          icon.classList.remove('fa-bars');
          icon.classList.add('fa-times');
        } else {
          icon.classList.remove('fa-times');
          icon.classList.add('fa-bars');
        }
      }
    });

    // Close menu when clicking on nav link or mobile action
    document.querySelectorAll('.nav-menu .nav-link, .nav-menu .btn').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        const icon = toggleBtn.querySelector('i');
        if (icon) {
          icon.classList.remove('fa-times');
          icon.classList.add('fa-bars');
        }
      });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (navMenu.classList.contains('open') && !navMenu.contains(e.target) && !toggleBtn.contains(e.target)) {
        navMenu.classList.remove('open');
        const icon = toggleBtn.querySelector('i');
        if (icon) {
          icon.classList.remove('fa-times');
          icon.classList.add('fa-bars');
        }
      }
    });
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
});
