# CareerLine Solution - Milestone & Task Matrix (`tasks.md`)

## 1. Task Completion Status Summary

| Phase | Milestone Description | Status | Verification Date |
| :---: | :--- | :---: | :---: |
| **Phase 1** | Primary Logo Selection & Purging Alternative Concepts | **COMPLETED** | 2026-10-09 |
| **Phase 2** | Fix About Section Hero Card Plaque Cropping | **COMPLETED** | 2026-10-09 |
| **Phase 3** | Background Removal & Footer 4-Column Grid Rebalancing | **COMPLETED** | 2026-10-09 |
| **Phase 4** | Privacy Policy & Terms and Conditions Pages Creation | **COMPLETED** | 2026-10-09 |
| **Phase 5** | Deep Cybersecurity, Anti-Bot & Anti-Automation Hardening | **COMPLETED** | 2026-10-09 |
| **Phase 6** | System Documentation Suite Creation (6 Core Files) | **COMPLETED** | 2026-10-09 |
| **Phase 7** | Cloudflare R2 / Object Storage Production Migration | *PLANNED* | Ready on Deployment |

---

## 2. Granular Task Breakdown

### Phase 1: Brand & Logo Unification
- [x] Audit all existing logos in `public/assets/company_logos/`.
- [x] Purge 18 obsolete/rejected alternative logo concepts (#04 to #10, legacy monograms).
- [x] Extract and isolate client-approved 3D Hexagon Talent Shield into high-res raster PNG assets:
  - [x] `careerline-logo-horizontal.png` (571×160 RGBA, transparent background for header navigation).
  - [x] `careerline-logo-emblem.png` (257×267 RGBA, transparent background for icons and badges).
- [x] Replace flat SVG logos with raster brand mark across all page headers.
- [x] Mirror assets across `assets/`, `public/assets/`, `docs/assets/`, and `images/`.

### Phase 2: Visual Cropping & Responsive Polish
- [x] Diagnose About Section hero photo cropping (`showcase-02-team-discussion.jpg`).
- [x] Adjust container styling to `height: 350px; object-fit: cover; object-position: center top;`.
- [x] Re-render showcase discussion photography with safety margin padding for wall plaque.
- [x] Verify visual display across desktop and mobile screens.

### Phase 3: Footer Grid Alignment & Dark-Theme Logo
- [x] Eliminate solid white backing pill on dark footer.
- [x] Generate `careerline-logo-footer.png` (transparent background with white lettering and gold tagline).
- [x] Identify and remove rogue duplicate `</div>` tag that broke `.footer-grid` container.
- [x] Restore balanced 4-column layout across all HTML footers.
- [x] Add responsive `.site-footer-logo` CSS rules in `style.css`.

### Phase 4: Legal & Compliance Integration
- [x] Create `public/privacy.html` with ISO 9001:2015 alignment, DPDP Act compliance, resume retention rules, and zero candidate fee policies.
- [x] Create `public/terms.html` with candidate terms, corporate client contracts, anti-scraping rules, and Ahmedabad jurisdiction.
- [x] Update footer links across all 6 core pages to point to `privacy.html` and `terms.html`.
- [x] Add `/privacy` and `/terms` clean Express routes in `server.js`.
- [x] Synchronize new pages to `docs/` and root `/`.

### Phase 5: Deep Cybersecurity & Anti-Bot Hardening
- [x] Install `helmet` and `express-rate-limit`.
- [x] Implement Helmet security headers (Content-Security-Policy, X-Frame-Options, X-Content-Type-Options: nosniff, HSTS).
- [x] Add `public/robots.txt` blocking aggressive AI scrapers (GPTBot, CCBot, ClaudeBot, Bytespider, etc.) and locking down `/admin`, `/api`, and `/uploads`.
- [x] Deploy multi-tier IP rate limiters:
  - [x] Global API: 120 reqs/min
  - [x] Job Application: 5 submissions / 15 min
  - [x] Inquiries & Employer Contact: 6 submissions / 15 min
  - [x] Recruiter Login: 5 attempts / 15 min
- [x] Build Anti-Bot Middleware (`verifyAntiBot`):
  - [x] Blacklist malicious scraper / vulnerability scanner User-Agents.
  - [x] Inject hidden honeypot fields (`_hp_website_verification`) into all forms.
  - [x] Enforce form submission velocity timing (blocks headless scripts faster than 1.5s).
- [x] Implement File Signature (Magic Bytes) Verification for resume uploads:
  - [x] Check binary header for PDF (`%PDF-`), DOCX (`PK\x03\x04`), and RTF (`{\rtf`).
  - [x] Disallow double extensions (e.g. `exploit.php.pdf`).
  - [x] Reduce upload ceiling from 10MB to 5MB to prevent memory exhaustion.
- [x] Secure static `/uploads` serving with `X-Content-Type-Options: nosniff` and `Content-Security-Policy: default-src 'none'`.

### Phase 6: System Documentation Suite
- [x] Create `architecher.md` (System Architecture Blueprint & Data Flow).
- [x] Create `desgin.md` (Brand Identity, Typography & UI Guidelines).
- [x] Create `memory.md` (Project History & Key Client Decisions).
- [x] Create `PRD.md` (Product Requirements Document).
- [x] Create `Rules.Md` (Engineering Standards & Security Invariants).
- [x] Create `tasks.md` (Milestone & Task Tracker).

### Phase 7: Production Cloudflare Deployment (Future Roadmap)
- [ ] Connect candidate resume uploads to Cloudflare R2 bucket (10 GB free forever).
- [ ] Deploy static site to Cloudflare Pages with custom domain binding.
- [ ] Migrate `data.json` to Cloudflare D1 or Supabase if moving to serverless architecture.
