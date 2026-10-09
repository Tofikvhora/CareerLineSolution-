# CareerLine Solution - Engineering Standards & Developer Rules (`Rules.Md`)

## 1. Absolute Brand & Logo Invariants

1. **Raster Graphic Exclusivity**:
   * **NEVER** replace the primary 3D Hexagon Talent Shield with flat, simplified SVG line drawings in the navigation or footer. The client specifically selected and approved the rich raster branding.
2. **100% Background Transparency**:
   * **NEVER** wrap the logo inside a white card box, white rounded pill, border-radius frame, or drop-shadow rectangle.
   * Enforce `background: transparent !important; border: none !important; box-shadow: none !important;` on all primary logo instances.
3. **Contrast-Conscious Asset Selection**:
   * On light headers: Use `assets/company_logos/careerline-logo-horizontal.png`.
   * On dark footers (`#071E47`): Use `assets/company_logos/careerline-logo-footer.png` (white lettering with gold tagline).
   * For avatars/sidebar badges: Use `assets/company_logos/careerline-logo-emblem.png`.

---

## 2. Triple-Directory Mirroring Invariant

The project structure maintains three synchronized mirrors:
* `public/` - Express web server static root.
* `docs/` - GitHub Pages deployment distribution.
* Root `/` - Direct file inspection & fallback.

**Developer Rule**: Any change made to an HTML file, stylesheet (`style.css`), client script (`main.js`, `jobs.js`, `data-store.js`), or visual asset MUST immediately be copied and verified across all three directories. Never leave one mirror out of sync.

---

## 3. Mandatory Security & Anti-Bot Standards

Whenever modifying or creating any frontend form or backend endpoint:

### A. Frontend Form Rules:
1. Every `<form>` MUST include the hidden honeypot and anti-automation timestamp block:
   ```html
   <div style="display:none !important; visibility:hidden !important; opacity:0; position:absolute; left:-9999px; height:0; width:0; overflow:hidden;" aria-hidden="true">
     <input type="text" name="_hp_website_verification" tabindex="-1" autocomplete="off" value="">
     <input type="hidden" name="_form_render_ts" class="form-render-ts" value="">
   </div>
   ```
2. The timestamp `.form-render-ts` MUST be populated via JavaScript on page load or modal trigger with `Date.now()`.

### B. Backend Endpoint Rules:
1. Every public POST mutation endpoint (`/api/apply`, `/api/contact`, `/api/employer-request`) MUST pass through:
   * **Route Rate Limiter** (`applyLimiter` or `inquiryLimiter`).
   * **Anti-Bot Verification Middleware** (`verifyAntiBot`).
   * **Input Sanitization** (`sanitizeInput()`).
2. Every file upload route MUST perform **Magic Byte Binary Header Verification** (e.g. `%PDF-` for PDFs, `PK\x03\x04` for DOCX) and immediately unlink any invalid, double-extension, or oversized files.
3. Payload sizes must be capped (`100kb` for JSON/URL-encoded bodies, `5MB` for file attachments).
4. Uploaded files served under `/uploads/` must always have `X-Content-Type-Options: nosniff` and `Content-Security-Policy: default-src 'none'` headers to prevent browser execution.

---

## 4. Code Quality & Persistence Standards

1. **Atomic Database Writes**:
   * Never write directly to `data.json`. Always write to `data.json.tmp` and execute an atomic rename (`fs.renameSync`). This prevents data corruption during unexpected server restarts or crashes.
2. **Vanilla JavaScript Standard**:
   * Do not add heavyweight client-side UI dependencies (React, Vue, jQuery). Maintain native DOM APIs for high-performance and zero build step requirements.
3. **Responsive Testing**:
   * Test all layout changes across viewports: `360px` (mobile), `768px` (tablet), `1024px` (laptop), `1440px` (desktop). Ensure all tap targets are at least `44x44px`.

---

## 5. Git & Version Control Protocol

1. Before committing, always verify working tree clean status via `git status -s`.
2. Delete any temporary test scripts, scratch files, or test outputs before staging.
3. Use descriptive, conventional commit messages:
   * `feat: ...` for new features or pages.
   * `fix: ...` for bug fixes or layout alignments.
   * `security: ...` for hardening and anti-bot measures.
   * `docs: ...` for markdown documentation updates.
