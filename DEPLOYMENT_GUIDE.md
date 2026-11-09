# Pickup Wash - Production Deployment Guide
**Location Target:** Kasur City, Punjab, Pakistan  
**Stack Architecture:** React 18 SPA (Vite, TypeScript, Tailwind CSS) + Supabase Backend (PostgreSQL, Auth, RLS)  
**Hosting Model:** Zero-Cost Starter Deployment (Cloudflare Pages + Supabase Free Tier + GitHub)

---

## 1. Architecture Overview & Zero-Cost Strategy

Pickup Wash is engineered as a modern, high-performance Single Page Application (SPA) with direct, cryptographically authenticated communication to Supabase.

```
+-----------------------------------------------------------------------------------+
|                                  CLIENT BROWSER                                   |
|   (Mobile 3G/4G, Tablet, Laptop, Desktop across Kasur: Model Town, Steel Bagh...)  |
+-----------------------------------------+-----------------------------------------+
                                          |
                      +-------------------+-------------------+
                      |                                       |
                      v                                       v
        [ Static Web Assets: HTML/JS/CSS ]            [ Data & Auth Requests ]
                      |                                       |
                      v                                       v
        +----------------------------+        +-----------------------------------+
        |      CLOUDFLARE PAGES      |        |             SUPABASE              |
        |  - Global Anycast CDN Edge |        |  - PostgreSQL 15 Database (RLS)   |
        |  - Zero Bandwidth Costs    |        |  - GoTrue Authentication Service  |
        |  - Automatic SSL / HTTP/3  |        |  - Role-Based Access Control      |
        |  - 100% Free Starter Tier  |        |  - Immutable Admin Audit Logs     |
        +----------------------------+        +-----------------------------------+
```

### Backend Inspection Verdict
- **Separate Node.js Server Needed?** **NO.** The platform communicates directly from the client to Supabase using the `@supabase/supabase-js` SDK protected by Row Level Security (RLS) policies.
- **Can Cloudflare Pages Host It Directly?** **YES.** Because the application compiles to purely static assets (`dist/index.html`, `dist/assets/*`, `dist/_redirects`), Cloudflare Pages serves 100% of the frontend with ultra-low latency in Pakistan.
- **Total Initial Monthly Cost:** **$0.00 / month (Zero-Cost).**

---

## 2. Required Accounts

To deploy this application without any software license or hosting expenses:

| Provider | Purpose | Free Tier Allowance | Link |
|---|---|---|---|
| **GitHub** | Source code management & automated CI/CD pipeline | Unlimited public/private repositories | [github.com](https://github.com) |
| **Supabase** | Cloud PostgreSQL database, user auth, and RLS | 500 MB database, 50,000 monthly active users | [supabase.com](https://supabase.com) |
| **Cloudflare** | Global CDN edge hosting, static build runner, SSL | Unlimited bandwidth, 500 builds/month, free SSL | [pages.cloudflare.com](https://pages.cloudflare.com) |

---

## 3. GitHub Repository Preparation

### Step 3.1: Verify Git Status and Exclusion Rules
Ensure sensitive credentials in `.env` are never tracked:
```powershell
# Verify .gitignore properly excludes .env files
git status
```

Verify that `.gitignore` contains:
```gitignore
.env
.env.*
!.env.example
```

### Step 3.2: Initialize and Push to GitHub
Create a new private or public repository on GitHub named `pickup-wash`:
```powershell
git remote add origin https://github.com/<your-username>/pickup-wash.git
git branch -M main
git push -u origin main
```

---

## 4. Supabase Cloud Configuration

### Step 4.1: Create a Supabase Project
1. Log in to [supabase.com](https://supabase.com) and click **"New project"**.
2. **Name:** `pickup-wash-kasur`
3. **Database Password:** Generate and securely save a strong database password.
4. **Region:** Choose `Singapore (ap-southeast-1)` or `Mumbai (ap-south-1)` for the lowest round-trip latency to users in Pakistan.
5. **Pricing Plan:** Free ($0).

### Step 4.2: Execute Database Migrations
1. Open your Supabase Dashboard and navigate to the **SQL Editor**.
2. Click **"New query"**.
3. Open `supabase/schema.sql` from your local project repository, copy the complete contents, paste into the SQL editor, and click **"Run"**.
4. Verify that all 10 core tables are created:
   - `public.profiles`
   - `public.services`
   - `public.service_pricing`
   - `public.promotions`
   - `public.monthly_packages`
   - `public.bookings`
   - `public.booking_status_history`
   - `public.payments`
   - `public.notifications`
   - `public.admin_audit_logs`

### Step 4.3: Verify Row Level Security (RLS)
Execute the following verification query in the Supabase SQL editor:
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```
Ensure `rowsecurity` is `true` for all tables.

### Step 4.4: Authentication & URL Configuration
1. In Supabase Dashboard, go to **Authentication -> URL Configuration**.
2. **Site URL:** Enter your Cloudflare Pages production URL (e.g., `https://pickup-wash.pages.dev`).
3. **Redirect URLs:** Add:
   - `https://pickup-wash.pages.dev/*`
   - `http://localhost:3000/*` (for local development)
4. Under **Authentication -> Providers -> Email**:
   - Ensure **Enable Email provider** is turned **ON**.
   - Ensure **Confirm email** is set according to your preference (for launch testing, disabling email confirmation enables instant signup).

### Step 4.5: Provision the First Administrator
Administrative privileges cannot be registered from the public web interface.
1. Create a user account via the customer registration page (`/register`) or directly under **Authentication -> Users** in Supabase.
2. In Supabase SQL Editor, execute `supabase/assign_admin.sql` replacing the placeholder email:
```sql
UPDATE public.profiles
SET role = 'admin', updated_at = NOW()
WHERE email = 'admin@pickupwash.pk';
```
3. Verify the role:
```sql
SELECT id, email, full_name, role FROM public.profiles WHERE role = 'admin';
```

---

## 5. Environment Variables Configuration

Copy `.env.example` to review required runtime variables.

### Variables Summary

| Variable Name | Environment | Description | Sensitive? |
|---|---|---|:---:|
| `VITE_SUPABASE_URL` | Frontend & Build | Supabase Project URL (`https://<id>.supabase.co`) | No (Public) |
| `VITE_SUPABASE_ANON_KEY` | Frontend & Build | Supabase Publishable / Anon Key | No (Public) |

> [!CAUTION]
> **NEVER** expose the Supabase `service_role` secret key or database PostgreSQL password in client environment variables or GitHub repositories. Only the public `anon` key belongs in `VITE_SUPABASE_ANON_KEY`.

---

## 6. Cloudflare Pages Hosting Setup

### Step 6.1: Connect Repository
1. Log in to the [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. In the left navigation, select **Compute (Workers & Pages)** -> **Pages**.
3. Click **"Connect to Git"** and authorize your GitHub account.
4. Select the `pickup-wash` repository.

### Step 6.2: Build Settings Configuration
Configure the build pipeline with the following parameters:

| Setting | Value |
|---|---|
| **Project Name** | `pickup-wash` |
| **Production Branch** | `main` |
| **Framework Preset** | `Vite` |
| **Build Command** | `npm run build` |
| **Build Output Directory** | `dist` |
| **Root Directory** | *(leave blank / default)* |

### Step 6.3: Environment Variables in Cloudflare
Under **Environment Variables (Advanced)**, add:
- `VITE_SUPABASE_URL`: `https://your-project-id.supabase.co`
- `VITE_SUPABASE_ANON_KEY`: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpX...`
- `NODE_VERSION`: `20`

### Step 6.4: Single Page Application (SPA) Routing Rule
The project includes `public/_redirects`:
```
/*    /index.html   200
```
During `npm run build`, Vite copies this file directly into `dist/_redirects`. Cloudflare Pages natively interprets this rule and routes all deep URLs (such as `/book`, `/track`, `/account`, `/admin`) to `index.html` with HTTP 200, preventing 404 errors on browser page reloads.

---

## 7. Custom Domain Setup (Optional)

If the business owner purchases a branded domain (e.g. `pickupwash.pk` or `pickupwash.com`):

1. In Cloudflare Pages, select the `pickup-wash` project -> **Custom Domains**.
2. Click **"Set up a custom domain"** and enter your domain name.
3. If using Cloudflare DNS: Cloudflare will automatically configure the CNAME record and provision an SSL certificate at zero cost.
4. If using an external registrar (e.g., PKNIC, GoDaddy, Namecheap):
   - Add a `CNAME` record pointing to `pickup-wash.pages.dev`.
5. Update your Supabase **Authentication -> URL Configuration** Site URL to point to your new custom domain.

---

## 8. Common Deployment Errors & Solutions

### 1. Error: 404 Not Found on Route Refresh
- **Symptom:** Visiting `/` works, but refreshing `/book` or `/track` returns Cloudflare 404.
- **Cause:** Cloudflare Pages is searching for a physical file `/book/index.html`.
- **Solution:** Verify `dist/_redirects` contains `/*    /index.html   200`.

### 2. Error: "Failed to fetch" or Database Connection Error in Production
- **Symptom:** UI displays "Supabase is not configured" or database queries fail.
- **Cause:** Missing or misspelled `VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY` in Cloudflare Pages dashboard.
- **Solution:** Add both variables in **Pages -> Settings -> Environment Variables**, then trigger a **Retry Deployment**.

### 3. Error: 403 Forbidden on Customer Operations
- **Symptom:** Booking submission fails with permission error.
- **Cause:** RLS policy violation or unauthenticated session.
- **Solution:** Verify `supabase/schema.sql` was executed in full. For guests, public booking insertion is explicitly allowed by policy: `Allow public guest booking insertion`.

### 4. Error: Customer Unauthorized on Admin Route
- **Symptom:** Customer logs in and attempts to access `/admin`, receiving 403 Access Denied.
- **Cause:** Working as intended! Customer profiles have `role = 'customer'`.
- **Solution:** To elevate a trusted operator to admin, execute `supabase/assign_admin.sql` via Supabase SQL Editor.

---

## 9. Deployment Readiness Verification Checklist

- [x] TypeScript builds with 0 errors (`tsc -b`).
- [x] All 11 automated test runners pass (86 / 86 tests).
- [x] Code splitting implemented (Initial index JS: 103 kB; Home Page: 17 kB; Admin dashboard: isolated in separate chunk).
- [x] Responsive layout protected with `overflow-x-hidden` and mobile offset.
- [x] OpenGraph, Twitter Cards, and dynamic SEO document titles active.
- [x] Cloudflare `_redirects` SPA rewrite rule active in `dist/`.
- [x] `.env` excluded from Git.
- [x] Database defense triggers active for role escalation, payment verification, and notification injection prevention.

