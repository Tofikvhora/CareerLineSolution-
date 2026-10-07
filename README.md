# CareerLineSolution - Premier Pan-India HR & Recruitment Consultancy Web Platform

A full-stack, enterprise-grade hiring consultancy web application built for **CareerLineSolution**. Replicated and enhanced with design systems, conversion mechanisms, and corporate trust factors from [Sky HR Consultancy](https://skyhrconsultancyy.in/) and [Omkar Consultancy](https://omkarconsultansy.in/).

---

## 🌟 Key Features

### 1. Customer / Candidate Side
- **Hero & Trust Architecture**:
  - Catchy headlines: *"Building Careers. Empowering Businesses."*
  - Top notification bar with direct phone numbers, WhatsApp click-to-chat, official email, and Pan-India network badge.
  - Interactive Quick Search widget directly in the Hero banner.
- **Animated Stats Counter Bar** (from Sky HR & Omkar models):
  - 15,000+ Successful Placements
  - 500+ Hiring Partner Companies
  - 1,50,000+ Resumes Processed
  - 28+ States Pan-India Reach
- **Corporate About Us & Leadership Profile**:
  - 12+ years experience badge, mission, vision, and core values.
- **Recruitment Services Showcase**:
  - Permanent Recruitment
  - Contract & Flexi Staffing
  - Executive Search & CXO Leadership
  - IT & Tech Recruitment
  - BFSI & Financial Staffing
  - Healthcare & Pharma Hiring
  - Recruitment Process Outsourcing (RPO)
- **Specialized Industry Verticals / Sectors We Serve**:
  - IT & Software, Banking & BFSI, Manufacturing & Auto, Healthcare & Pharma, BPO/KPO, FMCG & Retail Sales, Logistics, and Construction.
- **Why Choose CareerLineSolution ("Your Success, Our Commitment")**:
  - Expert recruiters, verified employers, fast turnaround (24-48 hrs), free career guidance, and 90-day free replacement warranty.
- **Moments of Success & Client Testimonials**:
  - Google 5-star style reviews with verified employer and candidate badges.
- **Recruitment Help Center (FAQ Accordion)**:
  - Transparent guidance for job seekers (100% free for candidates) and employers.
- **Contact & Location Hubs**:
  - Offices in Surat (VIP Road, Vesu) and Mehsana (Orbit Business Hub) with Pan-India recruitment reach.
  - Interactive general inquiry form.
- **Floating Contact Controls**:
  - Sticky WhatsApp floating button & phone dialer.

---

### 2. Pan-India Job Search & Filter Portal (`/jobs`)
- **Live Search & Multi-Faceted Filters**:
  - Keyword search (matches job title, skills, company, description).
  - Pan-India location filter (Mumbai, Delhi-NCR, Bengaluru, Hyderabad, Pune, Ahmedabad, Surat, Chennai, Kolkata, Remote, etc.).
  - Sector / Category filter with live job counters.
  - Work Mode filter (On-Site, Hybrid, 100% Remote / WFH).
  - Job Type filter (Full-Time, Contract, Part-Time).
  - Experience filter (Freshers 0-1 yr, 1-3 yrs, 3-5 yrs, 5+ yrs).
  - Real-time live count updates: *"Showing X of Y active jobs in India"*.
- **Interactive Job Cards & Specifications**:
  - Urgent Hiring / Featured badges, salary packages in LPA, location pin, key skills chips.
  - **Job Specification Modal**: In-depth roles & responsibilities, qualification criteria, and salary details.
  - **1-Click Candidate Apply Modal**: Candidate details (Name, Email, Phone, Location, Total Experience, Current CTC, Expected CTC, Notice Period, Skills, Cover Note) + **Resume File Upload** (`.pdf`, `.doc`, `.docx`).

---

### 3. For Employers / Hire Talent (`/employers` & `#employers`)
- Dedicated corporate mandate submission form for employers looking to hire.
- Service type selection, positions needed (1-3, 4-10, 10-25, 25+ bulk), urgency level, and job descriptions.
- Instant submission logged directly into the Admin Panel.

---

### 4. Admin Management Console (`/admin` & `/admin/login`)
- **Authentication & Security**:
  - Secure login with JWT authentication & bcrypt password hashing.
  - **Default Super Admin**:
    - **Email:** `admin@careerlinesolution.com`
    - **Password:** `admin123`
  - **Default Lead Recruiter**:
    - **Email:** `priya@careerlinesolution.com`
    - **Password:** `recruiter123`
- **Dashboard Overview**:
  - Real-time KPI statistics: Active Jobs, Total Jobs, Candidate Resumes, New Profiles, Corporate Mandates, Shortlisted Candidates.
  - Recent candidate applications stream & recent employer requests stream.
- **Job Openings Management**:
  - Post new jobs with full parameters (Title, Category, Location, Mode, Experience, Salary, Openings, Skills, JD, Responsibilities, Urgent & Featured toggles).
  - 1-Click status toggle: Active <-> Inactive.
  - Edit existing job openings.
  - Delete job openings.
- **Candidate Applications & Resume Management**:
  - Filter candidate applications by target job and recruitment pipeline status.
  - Pipeline status updater: `New` -> `Shortlisted` -> `Interview Scheduled` -> `Selected` -> `Rejected`.
  - Preview & Download candidate resumes directly.
  - Recruiter internal notes management.
- **Corporate Staffing Mandates Management**:
  - Review employer staffing requirements.
  - Track pipeline status: `New` -> `Contacted` -> `Proposal Sent` -> `Closed / Won`.
- **General Inquiries Management**:
  - Manage contact inquiries, review messages, and update status (`New` -> `Replied`).
- **User Management**:
  - Add new recruiter / admin team members with custom passwords and roles.
  - View and delete team member accounts.
- **Website Settings**:
  - Modify company phone numbers, WhatsApp number, official email, and office addresses live without touching code.

---

## 🚀 Running the Project

### Prerequisites
- Node.js (v18+)

### Steps
1. Open PowerShell or Terminal in the project directory:
   ```powershell
   cd C:\Tofik\Web\CareerLineSolution
   ```

2. Start the application:
   ```powershell
   npm.cmd start
   ```
   *(or `node server.js`)*

3. Open your browser:
   - **Main Website:** [http://localhost:5000](http://localhost:5000)
   - **Pan-India Jobs Portal:** [http://localhost:5000/jobs](http://localhost:5000/jobs)
   - **For Employers:** [http://localhost:5000/employers](http://localhost:5000/employers)
   - **Admin Console:** [http://localhost:5000/admin](http://localhost:5000/admin)
   - **Admin Login:** [http://localhost:5000/admin/login](http://localhost:5000/admin/login)

---

## 📁 Directory Structure
```
C:\Tofik\Web\CareerLineSolution\
├── package.json               # Dependencies and scripts
├── server.js                  # Express backend, APIs, Multer uploads & Auth
├── README.md                  # Documentation
├── database/
│   ├── db.js                  # Atomic JSON database operations & auto-seeding
│   └── data.json              # Persistent data (Jobs, Applications, Inquiries, Users, Settings)
├── uploads/
│   └── resumes/               # Uploaded candidate resumes (PDF, DOCX)
└── public/
    ├── index.html             # Corporate website home
    ├── jobs.html              # Pan-India job search & filter portal
    ├── about.html             # About Us page
    ├── services.html          # Recruitment services page
    ├── employers.html         # For Employers / Hire Talent page
    ├── contact.html           # Contact Us page
    ├── css/
    │   └── style.css          # Custom styling matching Sky HR & Omkar
    ├── js/
    │   ├── main.js            # Shared interactive logic & form handling
    │   └── jobs.js            # Search & filter engine, pagination & apply modal
    └── admin/
        ├── index.html         # Admin management dashboard
        ├── login.html         # Admin login console
        ├── admin.css          # Admin styling
        └── admin.js           # Admin CRUD & management scripts
```
