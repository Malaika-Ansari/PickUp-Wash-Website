# Security Architecture & Hardening Guide

**Pickup Wash — Doorstep Laundry Service**  
**Location:** Kasur City, Punjab, Pakistan  
**Version:** 1.0.0  
**Last Updated:** November 2026  

---

## 1. Security Architecture Overview

Pickup Wash employs a multi-tiered defense-in-depth security model designed to safeguard customer privacy, financial data integrity, and operational workflows across web clients, authentication providers, and PostgreSQL database tables.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER (Browser)                         │
│  - React 18 SPA + Vite                                                 │
│  - Input Sanitization (XSS & Control Character Stripping)              │
│  - Client Rate Limiting (Login, Password Reset, Booking & TID submit)   │
│  - Zero HTML Injection (No dangerouslySetInnerHTML)                    │
│  - PII Masking in Exports & Summaries                                  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTPS (TLS 1.3)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                  AUTHENTICATION & ROUTE GUARDS                         │
│  - Supabase Auth (Argon2 / bcrypt password hashing)                    │
│  - ProtectedAdminRoute (403 Forbidden for non-admins)                  │
│  - CustomerLayout Guard (Redirects unauthenticated visitors)           │
│  - Instant Session Revocation on unauthorized role detection           │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Parameterized SQL / PostgREST
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│               DATABASE LAYER (Supabase PostgreSQL 15)                  │
│  - Explicit Row Level Security (RLS) on all 10 tables                  │
│  - Defense-in-Depth BEFORE UPDATE triggers (Role, Payment, Status)     │
│  - Search-Path Hijacking Protection (SET search_path = public, pg_temp)│
│  - Immutable Audit Trails (admin_audit_logs, booking_status_history)   │
│  - Zero Direct Anonymous Reads on sensitive tables                     │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Authentication & Authorization (RBAC)

### 2.1 Role-Based Access Control (RBAC)
Pickup Wash supports two distinct user roles stored in `public.profiles.role`:
- **`customer`**: Default role assigned to all public registrations. Customers can only view and manage their own profiles, bookings, payments, and notifications.
- **`admin`**: Verified operations manager. Possesses operational control over bookings, catalog, service pricing, payment verification, and audit logs.

### 2.2 Privilege Escalation Prevention
1. **Trigger Enforcement (`prevent_role_escalation`)**:
   A database `BEFORE UPDATE` trigger on `public.profiles` checks whether the `role` column is being altered. If the caller is not a verified administrator or running under `service_role`, the transaction is aborted with an exception:
   ```sql
   IF (OLD.role IS DISTINCT FROM NEW.role) THEN
       IF NOT (public.is_admin() OR current_setting('role', true) = 'service_role') THEN
           RAISE EXCEPTION 'Privilege Escalation Blocked: Non-admin users cannot alter their role.';
       END IF;
   END IF;
   ```
2. **Registration Enforcement (`handle_new_user`)**:
   User signup trigger hardcodes `'customer'` role regardless of raw metadata sent in the client registration payload.
3. **Dedicated Admin Provisioning**:
   Admins cannot self-register. Administrative privileges must be assigned through server-side procedure:
   ```sql
   SELECT public.assign_admin_by_email('admin@pickupwash.pk');
   ```

### 2.3 Route & Session Protection
- **Admin Console Guard (`ProtectedAdminRoute`)**:
  Inspects authenticated session. If unauthenticated, redirects to `/admin/login`. If authenticated as a customer, renders `<AdminAccessDenied />` (403 Forbidden).
- **Unauthorized Session Termination**:
  If a customer account authenticates on the `/admin/login` portal, `authService.adminSignIn` automatically terminates the session (`supabase.auth.signOut()`) and records the unauthorized attempt in `admin_audit_logs`.

---

## 3. Database Security & Row Level Security (RLS)

Row Level Security is enabled on **all 10 tables**:

| Table | RLS Policies | Public Access | Customer Access | Admin Access |
| :--- | :--- | :--- | :--- | :--- |
| `profiles` | `profiles_select_policy`<br>`profiles_update_policy` | **None** | Own profile only (`auth.uid() = id`) | Full |
| `bookings` | `bookings_select_policy`<br>`bookings_insert_policy`<br>`bookings_customer_cancel` | **None** | Own bookings only | Full |
| `booking_status_history` | `booking_status_history_select` | **None** | Own bookings only | Full |
| `payments` | `payments_select_policy`<br>`payments_insert_policy`<br>`payments_customer_tid_update` | **None** | Own payments only | Full |
| `notifications` | `notifications_select_policy`<br>`notifications_update_policy`<br>`notifications_delete_policy` | **None** | Own notifications only | Full |
| `admin_audit_logs` | `admin_audit_logs_select`<br>`admin_audit_logs_insert` | **None** | **None** | Select & Append |
| `services` | `services_select_policy`<br>`services_admin_all` | Active only (`is_active = true`) | Active only | Full |
| `monthly_packages` | `monthly_packages_select_policy`<br>`monthly_packages_admin_all` | Active only (`is_active = true`) | Active only | Full |
| `service_pricing` | `service_pricing_select_policy`<br>`service_pricing_admin_all` | Active only (`is_active = true`) | Active only | Full |
| `promotions` | `promotions_select_policy`<br>`promotions_admin_all` | Active only (`is_active = true`) | Active only | Full |

### 3.1 Defense-in-Depth Database Triggers
- **`prevent_unauthorized_payment_verification`**: Aborts any attempt by non-admins to set `payment_status = 'Paid'`, set `verified_by`, or adjust `payment_amount`.
- **`prevent_unauthorized_booking_status_change`**: Aborts attempts by customers to advance booking status or cancel bookings that have already been collected or washed.
- **`prevent_notification_tampering`**: Restricts customer updates to `is_read` only; prevents altering titles, messages, or notification types.
- **`prevent_role_escalation`**: Prohibits non-admin changes to the `role` column on profiles.

### 3.2 Security Definer Search Path Protection
All database functions defined with `SECURITY DEFINER` explicitly declare:
```sql
SET search_path = public, pg_temp;
```
This protects against search-path hijacking attacks (PostgreSQL CVE advisory).

### 3.3 Public Tracking RPC
Unauthenticated guest order tracking is restricted to the secure stored procedure `public.track_booking_secure`:
- Requires **both** exact tracking reference (`PW-KSR-XXXXX`) **and** verification of the last 10 digits of the customer's phone number.
- Excludes sensitive PII (customer email, notes, payment records) from return payload.

---

## 4. Frontend & Backend Security

### 4.1 Input Sanitization (`src/utils/securityUtils.ts`)
- `sanitizeHtml`: Strips `<script>`, `<iframe>`, `<style>`, and HTML event handlers (`onclick=`).
- `sanitizeText`: Enforces maximum character bounds (e.g. 100 chars for names, 250 for addresses) and strips ASCII control characters.
- `sanitizePhone`: Validates Pakistani mobile formats (`03001234567` or `+923001234567`).
- `sanitizeReference`: Alphanumeric whitelisting for tracking references and payment transaction IDs.

### 4.2 Information Disclosure Mitigation (`sanitizeDatabaseError`)
Raw database error codes (e.g. `23505 unique_violation`, `42P01 undefined_table`, `42501 insufficient_privilege`) are mapped to clean, user-friendly security notices. Internal schema identifiers, table names, and stack traces are never exposed in UI alerts.

### 4.3 Client-Side Abuse Prevention & Rate Limiting
`SecurityRateLimiter` enforces sliding-window rate limits:
- **Customer Login (`login`)**: Max 5 failed attempts per 5 minutes $\rightarrow$ 60-second cooldown.
- **Admin Portal (`admin_login`)**: Max 4 failed attempts per 10 minutes $\rightarrow$ 120-second lockout.
- **Password Reset (`password_reset`)**: Max 3 requests per 15 minutes $\rightarrow$ 300-second cooldown.
- **Booking Creation (`booking_submit`)**: 5-second duplicate submission debounce + max 3 submissions per 30 seconds.
- **TID Submission (`tid_submit`)**: Max 5 submissions per 10 minutes.

---

## 5. Environment Variables & Secret Hygiene

### 5.1 Permitted Client-Side Variables
Only public Supabase connection parameters are permitted in frontend `.env`:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 5.2 Strict Secret Boundaries
The following credentials **must NEVER** appear in frontend code, client `.env`, or Git repositories:
- `SUPABASE_SERVICE_ROLE_KEY`
- Database passwords (`postgresql://postgres:...`)
- Resend / SendGrid master API keys
- Meta WhatsApp Business permanent access tokens
- TeleStax / Zong / Jazz SMS Gateway API keys and secrets

### 5.3 Git Hygiene
The root `.gitignore` enforces complete exclusion of environment files:
```gitignore
.env
.env.*
!.env.example
```

---

## 6. Admin Access Requirements

1. **No Public Registration**: Administrative accounts cannot be created via the public registration form (`/register`). The database trigger `handle_new_user` hardcodes `role = 'customer'` for all public signups.
2. **Server-Side Administrative Provisioning**: The initial administrator and any future operational managers must be granted the `admin` role via a trusted, server-side procedure in the Supabase SQL Editor:
   ```sql
   SELECT public.assign_admin_by_email('operations@pickupwash.pk');
   ```
3. **Privilege Escalation Block**: Any customer attempt to change their own role or another user's role on `public.profiles` is aborted by the `prevent_role_escalation` trigger.
4. **Portal Isolation & Immediate Revocation**: Non-admin users attempting to log in through `/admin/login` are immediately signed out, denied access, and logged in `public.admin_audit_logs`.

---

## 7. Deployment Security Requirements

When deploying Pickup Wash to production (e.g. Vercel, Netlify, Cloudflare):
1. **Mandatory HTTPS**: Enforce TLS 1.3 with automatic HTTP $\rightarrow$ HTTPS redirection.
2. **Security Headers**:
   ```http
   Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
   X-Content-Type-Options: nosniff
   X-Frame-Options: DENY
   Referrer-Policy: strict-origin-when-cross-origin
   Permissions-Policy: camera=(), microphone=(), geolocation=()
   ```
3. **Content Security Policy (CSP)**:
   ```http
   Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://*.supabase.co; img-src 'self' data: https:;
   ```

---

## 8. Customer Data Protection & Privacy

1. **Minimal Data Collection**: Only operational essentials are collected (name, phone, doorstep address, and area within Kasur).
2. **Zero Payment Credential Storage**: Pickup Wash does not collect, process, or store credit card numbers, CVVs, or bank login credentials. Online payments (JazzCash / Easypaisa) are performed externally by customers; only customer-submitted reference numbers (TIDs) are recorded for verification.
3. **PII Masking in Reports & Exports**: Customer phone numbers exported to CSV or displayed in high-level analytics are masked as `0300****567`.
4. **Formula Injection Neutralization**: All CSV export functions escape leading special characters (`=`, `+`, `-`, `@`) with an apostrophe `'` to prevent spreadsheet formula injection.

---

## 9. Known Limitations & Unresolved Risks

1. **Client-Side Rate Limiting**: The current rate limiter runs in the browser memory context. A malicious user with scripting tools can bypass client-side rate limits. **Recommendation for high-volume scale**: Deploy a Cloudflare Turnstile CAPTCHA or Supabase Edge Function proxy with Upstash Redis for IP-level rate limiting.
2. **External SMS & WhatsApp Integrations**: Currently running in simulated mode. When business accounts are registered in Pakistan, dispatchers must be deployed as server-side Supabase Edge Functions with secrets stored in Supabase Vault.
