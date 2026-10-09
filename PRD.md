# CareerLine Solution - Product Requirements Document (`PRD.md`)

## 1. Product Vision & Value Proposition
CareerLine Solution is an enterprise-grade recruitment and human capital consulting platform designed to connect ambitious professionals with leading corporate organizations across India. The platform bridges candidate career discovery and corporate talent acquisition with maximum transparency, zero applicant fees, and high-speed recruitment workflows.

---

## 2. Target User Personas

| Persona | Profile & Objectives | Primary Actions on Platform |
| :--- | :--- | :--- |
| **1. Job Seeker (Candidate)** | Experienced professionals & fresh graduates looking for verified career opportunities across IT, BFSI, Manufacturing, Healthcare, BPO, and Sales. | Searches openings by sector/location, reads detailed role specs, submits resume (PDF/DOCX) in under 60 seconds with zero registration friction. |
| **2. Corporate Client (Employer)** | HR Directors, Talent Acquisition Leads, and CXOs seeking fast, verified, pre-screened talent mandates. | Explores recruitment service models (Permanent, Executive, Contract), submits staffing requirements with role specifications and headcount requirements. |
| **3. Recruiter (Admin)** | Internal CareerLine Solution recruitment consultants and branch managers. | Logs into secure Admin Console, posts/edits active job mandates, reviews incoming applications, downloads candidate CVs, updates pipeline statuses (New, Interview, Placed, Rejected). |

---

## 3. Core Functional Requirements (FR)

### FR-1: Brand Identity & Corporate Narrative
* **Homepage (`index.html`)**: Features verified placement metrics, sector matrices, executive boardroom showcase photos, and client testimonials.
* **About Us (`about.html`)**: Detailed corporate journey, ISO 9001:2015 alignment, mission/vision statements, leadership ethics.
* **HR Services (`services.html`)**: Breakdown of Permanent Staffing, Executive Search, Bulk Recruitment, and HR Advisory services.
* **Brand Fidelity**: Primary 3D Hexagon Talent Shield must be present across all headers and footers with 100% background transparency.

### FR-2: Pan-India Job Directory (`jobs.html`)
* **Real-Time Filtering**: Dynamic filtering by keyword, sector category (IT, BFSI, Healthcare, etc.), location/city, job type (Full-Time, Contract), work mode (On-Site, Hybrid, Remote), and experience level.
* **Job Specification Modal**: Comprehensive view displaying description, responsibilities, requirements, salary band, and openings.
* **Pagination & Instant Search**: Smooth client-side rendering with URL query synchronization for shareable job search links.

### FR-3: Candidate Application & Resume Upload Engine
* **Submission Form**: Collects candidate contact details, current city, years of experience, current & expected CTC, notice period, and key skills.
* **Resume Ingestion**: Secure intake supporting `.pdf`, `.doc`, `.docx`, `.rtf`, `.txt` up to 5MB.
* **Instant Confirmation**: Visual toast feedback and email notification trigger without requiring account creation.

### FR-4: Employer Staffing Request Portal (`employers.html`)
* **Requirement Intake**: Form capturing organization name, contact person, designation, service type, headcount needed, roles, and urgency.
* **Direct Escalation**: WhatsApp and phone consultation shortcuts for immediate staffing mandates.

### FR-5: Recruiter & Admin Management Console (`admin/`)
* **Authentication**: Token-based JSON Web Token (JWT) session management with bcrypt-hashed credentials and automatic brute-force lockout.
* **Dashboard Analytics**: Metrics on active jobs, total candidates in pipeline, pending client mandates, and recent application activity.
* **Job Management**: Create, update, toggle active status, and archive job postings.
* **Candidate Tracker**: Search and filter applicants, download submitted resumes, take internal recruiter notes, and transition hiring statuses.
* **Global Settings Editor**: Update company phone, email, branch address, and WhatsApp contact in real time without code deployment.

### FR-6: Legal Compliance & Transparency
* **Privacy Policy (`privacy.html`)**: Comprehensive data privacy policy detailing candidate resume storage, right to deletion, and zero candidate fee guarantees.
* **Terms & Conditions (`terms.html`)**: Formal service agreements, candidate integrity rules, and strict anti-scraping / anti-bot clauses under Indian law.

---

## 4. Non-Functional Requirements (NFR)

### NFR-1: Cybersecurity & Anti-Bot Defense
* **HTTP Security Headers**: Strict Content-Security-Policy (CSP), `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, and HSTS.
* **Crawler Protection**: `robots.txt` forbidding aggressive AI scrapers (GPTBot, CCBot, Bytespider, etc.) and locking down `/admin`, `/api`, and `/uploads`.
* **Anti-Automation Engine**:
  * Multi-tier IP rate limiting (API: 120/min, Applications: 5/15min, Inquiries: 6/15min, Auth: 5/15min).
  * Invisible honeypot traps on all form submissions.
  * Form velocity checks rejecting submissions faster than 1.5 seconds.
* **File Upload Hardening**: Magic byte binary signature validation, double-extension rejection, sanitized UUID filenames, and disabled execution on `/uploads/`.

### NFR-2: Performance & Scalability
* **Lighthouse Performance Score**: > 90 across Desktop and Mobile.
* **Zero Heavy Frameworks**: Vanilla JS and modular CSS eliminate large runtime JS bundles (e.g. React/Next.js overhead).
* **Total Page Weight**: Core page delivery under 250 KB (excluding photos).

### NFR-3: Cross-Device Responsiveness
* Seamless layout adaptation across mobile (360px+), tablet (768px+), laptop (1024px+), and large desktop (1440px+).
* Native mobile drawer menu with touch-friendly navigation targets (minimum 44x44px tap areas).
