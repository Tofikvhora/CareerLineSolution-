# CareerLine Solution - Design System & Brand Guide (`desgin.md`)

## 1. Brand Identity Overview
CareerLine Solution is positioned as a premier, ISO-aligned recruitment and executive talent consultancy serving clients Pan-India. The brand language communicates **executive trust, upward momentum, stability, and high-touch professionalism**.

### Core Emblem Symbolism: The 3D Hexagon Talent Shield
* **Hexagon Outer Border (Deep Royal Blue `#0F3E7A`)**: Represents corporate integrity, structure, and enterprise stability.
* **Ascending Talent Figures (Warm Gold `#F59E0B`)**: Represents candidate career growth, talent mentoring, and step-by-step upward career advancement.
* **Ascending Highway & Arrow (White & Vibrant Gold)**: Signifies the clear career pathway connecting ambitious talent directly to enterprise leadership.
* **Tagline**: *"TALENT. GROWTH. SUCCESS."*

---

## 2. Color Palette & Semantic Tokens

```
Primary Midnight Navy  : #071E47  (Footer, Dark Banners, Hero Accents)
Corporate Royal Blue   : #0F3E7A  (Headers, Primary Buttons, Card Headings)
Secondary Accent Gold  : #F59E0B  (Badges, CTAs, Highlights)
Vibrant Gold / Accent  : #FBBF24  (Dark-Theme Subtitles, Tagline Text)
Text Dark Charcoal     : #1E293B  (Body Paragraphs, Headings on Light)
Text Muted Slate       : #64748B  (Subtitles, Meta Labels, Date Indicators)
Light Surface Gray     : #F8FAFC  (Section Alternate Backgrounds)
Card Border Light      : #E2E8F0  (Subtle Card Dividers)
Success Emerald        : #10B981  (Verified Badges, Success Toasts)
Danger Coral           : #EF4444  (Error Messages, High Priority Tags)
```

---

## 3. Typography Architecture

* **Primary Font Family**: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
* **Weights In Use**: `400` (Regular Body), `500` (Medium UI), `600` (SemiBold Buttons & Labels), `700` (Bold Headers), `800` (ExtraBold Brand Titles).

| Component | Font Size | Weight | Line Height | Letter Spacing |
| :--- | :--- | :--- | :--- | :--- |
| **Hero Display Header** | `2.8rem - 3.4rem` | `800` | `1.15` | `-0.02em` |
| **Section Title (H2)** | `2.0rem - 2.4rem` | `800` | `1.25` | `-0.01em` |
| **Card Header (H3)** | `1.25rem - 1.45rem`| `700` | `1.35` | `normal` |
| **Body Paragraph** | `0.95rem - 1.05rem`| `400` | `1.70` | `normal` |
| **Button Label** | `0.875rem - 0.95rem`| `600` | `1.00` | `0.01em` |
| **Meta Tag / Badge** | `0.75rem - 0.80rem` | `700` | `1.00` | `0.05em (Caps)`|

---

## 4. Logo Implementation Standard (Strict Rules)

### Golden Rules Established by Client:
1. **Never use generic/flat SVG outlines** for the primary brand identity in navigation. The client explicitly mandates the high-resolution raster graphic.
2. **100% Background Transparency Required**: Never place the logo inside a white rounded rectangle, white pill, card box, or drop-shadow border container.
3. **Dedicated Dark Theme Asset**: On dark navy footers (`#071E47`), dark blue text is illegible. Always use the dedicated transparent dark-background asset (`careerline-logo-footer.png`) which features crisp white brand lettering with gold tagline.

### Asset Matrix:

```
Navigation Header (Light BG):
  • File: assets/company_logos/careerline-logo-horizontal.png
  • Style: class="site-nav-logo" (height: 48px desktop / 42px mobile)
  • Background: transparent !important; box-shadow: none !important;

Footer Section (Dark Navy #071E47):
  • File: assets/company_logos/careerline-logo-footer.png
  • Style: class="site-footer-logo" (height: 48px desktop / 42px mobile)
  • Lettering: White "CAREERLINE SOLUTIONS" + Gold "TALENT. GROWTH. SUCCESS."
  • Background: 100% transparent PNG with zero borders or backing pills.

Admin Sidebar & Portal Login:
  • File: assets/company_logos/careerline-logo-emblem.png
  • Style: width: 38px - 56px, object-fit: contain
```

---

## 5. Responsive Grid & Layout Guidelines

* **Max Content Width**: `1200px` centered via `.container`.
* **Footer Grid**: Strict 4-column balanced layout (`2fr 1fr 1fr 1.5fr`).
  * Col 1: Brand Logo, Vision Statement, Social Badges
  * Col 2: Quick Navigation
  * Col 3: Industry Job Categories
  * Col 4: Corporate Contact Details & Branches
* **Breakpoints**:
  * Desktop: `> 1024px` (Full navigation menu, 4-column grids)
  * Tablet: `768px - 1024px` (2-column grids, condensed headers)
  * Mobile: `< 768px` (Slide-out drawer navigation, single column stacking, 42px logo height)
