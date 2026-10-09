# Cloudflare R2 Storage Guide & Pricing Reference (`R2_STORAGE_GUIDE.md`)

This document provides the complete configuration guide and pricing reference for **Cloudflare R2 Object Storage** in the CareerLine Solution platform. Any developer or AI assistant working on this project on another machine can follow this guide to configure or maintain permanent, low-cost resume storage.

---

## 1. Storage Capacity & Pricing Matrix

Cloudflare R2 includes **10 GB of free storage every month forever** with **zero egress (download) fees**.

| Total Resumes in Database | Storage Used | Monthly Cost (USD) | Monthly Cost (INR) | Billing Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Up to ~25,000 CVs** | **Up to 10 GB** | **$0.00** | **₹0 (100% Free)** | Completely free forever under Cloudflare R2 free tier. |
| **~30,000 CVs** | 12 GB (2 GB over limit) | **$0.03** | **~₹2.60 / month** | $0.015 per extra GB. No bandwidth fees. |
| **~50,000 CVs** | 20 GB (10 GB over limit) | **$0.15** | **~₹13 / month** | Extra 10 GB = 15 cents. |
| **~100,000 CVs** | 40 GB (30 GB over limit) | **$0.45** | **~₹39 / month** | Massive national talent database. |

### Crucial Storage Rule: Free Space on Deletion
* Cloudflare R2 only charges for **active storage currently occupied**.
* When an administrator clicks **"Delete Application"** in the CareerLine Solution Admin Console (`admin/index.html`), the backend automatically triggers `deleteResumeFromR2()` to permanently delete the physical PDF/DOCX file from the R2 bucket.
* **Result:** Deleting old or placed candidate applications immediately reduces storage usage back down, ensuring the monthly bill stays at **$0.00 forever**.

---

## 2. Step-by-Step Configuration on Cloudflare

### Step A: Create the R2 Bucket
1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com).
2. In the left navigation, click **R2 Object Storage**.
3. If not already subscribed, click **Get Started with R2** / **Add R2 subscription to my account** (Monthly base fee is **$0.00**).
4. Click **Create bucket**:
   * **Bucket name:** `careerline-resumes`
   * **Location:** Automatic (Default)
   * Click **Create Bucket**.

### Step B: Enable Public Access (R2.dev Subdomain)
1. In your `careerline-resumes` bucket page, click the **Settings** tab.
2. Scroll down to the **Public Access** section.
3. Locate **R2.dev subdomain** and click **Allow Access**.
4. Confirm by typing `allow`.
5. Cloudflare will generate a public URL such as:
   `https://pub-xxxxxxxxxxxxxxxxxxxxxxxx.r2.dev`
   *(Copy this URL for the `R2_PUBLIC_URL` variable).*

### Step C: Generate API Token (Access Keys)
1. Go back to the main **R2 Object Storage** overview page.
2. In the top-right header, click **Manage R2 API Tokens**.
3. Click **Create API Token**.
4. Configure the token:
   * **Token name:** `CareerLine-Storage-Token`
   * **Permissions:** Select **Object Read & Write**.
   * **Specify bucket:** Apply to all buckets OR select `careerline-resumes`.
   * Click **Create API Token** at the bottom.
5. Cloudflare will display three keys on screen:
   * **Access Key ID**
   * **Secret Access Key**
   * **Endpoint URL** (Example: `https://<ACCOUNT_ID>.r2.cloudflarestorage.com`)
   *(Your **Account ID** is the 32-character string in this endpoint URL).*

---

## 3. Environment Variables Configuration

Set these 5 variables in your hosting dashboard (**Render**, **Railway**, **VPS**, or local `.env` file):

```env
# Cloudflare R2 Credentials
R2_ACCOUNT_ID=your_32_character_account_id_here
R2_ACCESS_KEY_ID=your_access_key_id_here
R2_SECRET_ACCESS_KEY=your_secret_access_key_here
R2_BUCKET_NAME=careerline-resumes
R2_PUBLIC_URL=https://pub-xxxxxxxxxxxxxxxxxxxxxxxx.r2.dev
```

### Automatic Fallback Mechanism
* If these variables **are provided**: The server automatically uploads resumes to **Cloudflare R2** and provides permanent cloud URLs.
* If these variables **are missing** (e.g. developing locally on an offline machine): The server automatically falls back to saving files in the local `uploads/resumes/` folder. No crashes, zero configuration required for local dev.

---

## 4. Code Architecture Overview

### Upload Flow:
1. Candidate applies via `public/jobs.html` (modal form) &rarr; `POST /api/apply`.
2. `server.js` passes the file through Multer with **Magic Byte Signature Verification** (`%PDF-`, `PK\x03\x04`).
3. `services/r2Storage.js` (`uploadResumeToR2()`) streams the buffer to the S3-compatible Cloudflare R2 bucket.
4. The local temporary file is deleted from disk immediately.
5. The permanent R2 URL is saved in `database/data.json`.

### Delete Flow:
1. Recruiter deletes an application from `admin/index.html` &rarr; `DELETE /api/admin/applications/:id`.
2. `server.js` calls `deleteResumeFromR2(targetApp.resumeUrl)`.
3. The file is permanently removed from Cloudflare R2, instantly freeing storage space.
