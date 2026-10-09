# 🚀 Supabase (PostgreSQL) Cloud Database Setup Guide

This guide explains how to connect your **Free Cloud PostgreSQL Database (Supabase)** to CareerLine Solution so that **candidate applications, job postings, client inquiries, and settings are permanently stored in the cloud** and will **never be wiped** when Render's free server spins down or restarts.

---

## 🌟 Why Supabase?
- **100% Free Forever** (No credit card required).
- **500 MB PostgreSQL Database** (Holds over **500,000 candidate applications & entries**).
- **High-Performance**: Direct SQL querying with automatic indexes.
- **Fail-Safe Dual Mode**: If Supabase keys are provided, it uses Supabase; if not, it automatically falls back to local `data.json`.
- **Zero Loss Migration**: On your first launch with Supabase, the server automatically migrates your existing admin account, jobs, and settings into Supabase!

---

## 📋 Step-by-Step Setup (Takes 2 Minutes)

### Step 1: Create a Free Supabase Project
1. Open [https://supabase.com](https://supabase.com) and click **Start your project** (Sign in with your GitHub account).
2. Click **New project**.
3. Fill in:
   - **Name**: `careerlinesolution`
   - **Database Password**: Set any strong password (store it safely).
   - **Region**: Choose **Central India (Mumbai)** or Southeast Asia (Singapore) for fastest speed.
   - **Pricing Plan**: **Free** ($0 / month).
4. Click **Create new project** (takes ~1 minute to spin up).

---

### Step 2: Create the Database Tables in Supabase
1. In your Supabase project dashboard, click on the **SQL Editor** tab (icon looking like `>_` on the left sidebar).
2. Click **New query** (or the **+** button).
3. Open the file [`database/supabase_schema.sql`](./database/supabase_schema.sql) in this repository.
4. Copy the entire SQL content and paste it into the Supabase SQL editor.
5. Click **Run** (green button at bottom right).
6. You will see `Success. No rows returned`. All 6 tables (`cls_users`, `cls_jobs`, `cls_applications`, `cls_employer_requests`, `cls_inquiries`, `cls_settings`) and indexes are now created!

---

### Step 3: Copy Your Supabase API Keys
1. In your Supabase dashboard, click the ⚙️ **Project Settings** icon at the bottom of the left sidebar.
2. Under Settings, click **API** (or **Data API**).
3. Find the following two values:
   - **Project URL**: (e.g. `https://xyzcompany.supabase.co`)
   - **Project API Keys**: Copy the **`anon` `public`** key (or the **`service_role`** key).

---

### Step 4: Add Keys to Render.com
1. Open your [Render Dashboard](https://dashboard.render.com).
2. Click on your **CareerLine Solution Web Service**.
3. In the left menu, click **Environment**.
4. Click **Add Environment Variable** and add the following two keys:

| Key Name | Value | Notes |
| :--- | :--- | :--- |
| `SUPABASE_URL` | `https://your-project-id.supabase.co` | Your Supabase Project URL |
| `SUPABASE_KEY` | `eyJhbGciOiJIUzI1NiIsInR...` | Your Supabase `anon` public or `service_role` key |

5. Click **Save Changes**.

---

## ✅ You're Done!
Render will automatically re-deploy your server with Supabase active.
- When the server starts up, it will log:
  ```
  [DATABASE] Supabase PostgreSQL Client initialized.
  [DATABASE] Connected to Supabase PostgreSQL (or auto-seeding initial data).
  ```
- **Candidate applications, inquiries, employer requests, and new jobs will now be saved permanently in Supabase forever!**
- Even if Render free tier sleeps or restarts, candidate data will remain intact in the cloud.
