# CareerLine Solution - Project Memory & Decision Log (`memory.md`)

## 1. Project Background & Client Intent
The client commissioned the complete website overhaul for **CareerLine Solution**, a premier Pan-India recruitment, staffing, and corporate HR consulting firm headquartered in Ahmedabad, Gujarat, India.

---

## 2. Chronological Milestones & Key Client Decisions

### Decision 1: Primary Logo Selection & Rejection of Alternatives
* **Client Mandate**: The client selected the **3D Hexagon Talent Shield** as the sole, official primary brand identity.
* **Action Taken**: 
  * Audited and permanently removed all rejected alternative logo concepts (#04 through #10, monograms, and legacy prototypes).
  * Isolated the primary mark into high-resolution transparent raster assets:
    * `careerline-logo-horizontal.png` (Horizontal brand mark for light navigation headers)
    * `careerline-logo-footer.png` (Transparent white & gold lettering for dark midnight navy footers)
    * `careerline-logo-emblem.png` (Isolated 3D hexagon shield icon for portal avatars & badges)

### Decision 2: Strict Prohibition of Flat SVGs & Card Enclosures
* **User Feedback**: *"i told you i want this first logo no this svg type i want same to same this logo in ourall website... make proper bg remove logo in navbar with proper visible"*
* **Rule Established**:
  * Never replace the primary raster branding with flat, simplified SVG sketches.
  * Never wrap the logo inside a white card box, white rounded pill, or drop-shadow border.
  * Enforce `background: transparent !important; border: none !important; box-shadow: none !important;` on all logo image tags.

### Decision 3: "About CareerLine Solution" Image Crop Fix
* **Problem**: In the About section hero card, the corporate office discussion image (`showcase-02-team-discussion.jpg`) was slicing off the top half of the wall plaque displaying the CareerLine Solution logo due to `overflow: hidden` and default `50% 50%` vertical centering.
* **Resolution**: Re-rendered the photo plaque with safety padding and updated CSS to `height: 350px; object-fit: cover; object-position: center top;` ensuring the wall plaque is 100% visible on all devices.

### Decision 4: Footer Grid Collapse & White Pill Box Fix
* **User Feedback**: User posted screenshot (`media_1791541047392_d1fc3ba4.png`) with `??`.
* **Root Causes Identified**:
  1. The footer was using a temporary white-pill asset (`careerline-logo-header-white.png`) which appeared as a solid white sticker against the midnight blue background.
  2. A stray duplicate `</div>` immediately following the logo anchor tag closed `<div class="footer-brand">` early, which caused the second `</div>` to close `<div class="container footer-grid">`. This dumped the three subsequent navigation columns outside the CSS grid, collapsing them into a narrow vertical column on the left.
* **Resolution**:
  * Created `careerline-logo-footer.png` with 100% transparent alpha channel, white primary text, and gold tagline.
  * Balanced and eliminated the rogue `</div>` across every HTML page in `public/`, `docs/`, and root.

### Decision 5: Legal Transparency & Compliance Pages
* Created `privacy.html` and `terms.html` featuring:
  * Full alignment with the Indian Information Technology Act, 2000, and DPDP Act.
  * Zero candidate fee policy guarantees.
  * Clear data retention, confidentiality, and candidate deletion request protocols.
  * Formal jurisdiction established in Ahmedabad, Gujarat, India.

### Decision 6: Deep Cybersecurity, Anti-Bot & Anti-Automation Suite
* Integrated `helmet` with comprehensive Content-Security-Policy (CSP), clickjacking prevention (`X-Frame-Options: SAMEORIGIN`), and MIME-sniffing prevention (`X-Content-Type-Options: nosniff`).
* Created `robots.txt` blocking aggressive AI scrapers (GPTBot, CCBot, Bytespider, ClaudeBot) and restricting `/admin/`, `/api/`, and `/uploads/`.
* Implemented multi-tier rate limiting via `express-rate-limit`:
  * API Global: 120 reqs/min per IP
  * Job Application: 5 submissions / 15 min per IP
  * Inquiries & Employer Contact: 6 messages / 15 min per IP
  * Recruiter Login: 5 attempts / 15 min per IP
* Implemented Anti-Bot Middleware:
  * Blacklisted crawler and penetration testing User-Agents (sqlmap, nikto, scrapy, etc.).
  * Form honeypot verification (`_hp_website_verification`).
  * Submission velocity checks (rejection of submissions under 1.5 seconds).
* Enforced File Upload Signature Verification (Magic Bytes) on `/api/apply`:
  * Validates `%PDF-`, `PK\x03\x04` (DOCX), and `{\rtf`.
  * Blocks double-extension attacks (e.g. `file.php.pdf`).
  * 5MB strict payload ceiling.

---

## 3. Directory Mirroring Invariant
The project operates across three mirrors:
1. `public/` (Express static root)
2. `docs/` (GitHub Pages distribution)
3. Root `/` (Direct access / preview)

**Rule**: Any modifications to HTML, CSS, JavaScript, or logos must always be synchronized across all three directories simultaneously.
