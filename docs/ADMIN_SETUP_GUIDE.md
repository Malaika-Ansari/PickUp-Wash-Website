# Pickup Wash - Admin Authentication & Authorization Guide
**Location:** Kasur City, Punjab, Pakistan  
**Platform:** Pickup Wash Laundry & Dry Cleaning Operations

---

## 1. Overview & Architecture

The Pickup Wash administrative system manages live laundry operations, order tracking transitions, payment verifications, and pricing catalogs across Kasur City. To ensure strict data privacy and platform integrity, the system implements **Role-Based Access Control (RBAC)** backed by PostgreSQL Row Level Security (RLS) in Supabase.

### Security Principles:
1. **No Public Admin Registration:** The public registration endpoint strictly assigns `role = 'customer'` for all self-signed users. Any client attempt to inject `role: 'admin'` in metadata is ignored.
2. **Privilege Escalation Prevention:** Database-level trigger `trg_prevent_role_escalation` on `public.profiles` forbids any non-admin from modifying the `role` column. Frontend profile update services also whitelist only customer-editable fields (`full_name`, `phone`, `address`, `area`).
3. **Route Guards & Access Denied Views:** Dedicated `/admin/login` page verifies credentials and explicitly requires `role === 'admin'`. Non-admin customers accessing `/admin` are intercepted by `ProtectedAdminRoute` and served a 403 Forbidden screen.
4. **Backend Operations Protection:** All sensitive backend functions (marking payments verified, updating laundry lifecycle statuses, catalog alterations) enforce admin permissions and write an immutable audit trail to `public.admin_audit_logs`.
5. **Zero Credential Hardcoding:** Admin passwords and service-role keys are never checked into source control or exposed in frontend code.

---

## 2. Roles & Permissions Matrix

| Feature / Resource | Guest / Visitor | Customer (`customer`) | Admin (`admin`) |
|--------------------|-----------------|-----------------------|-----------------|
| Browse Services & Pricing | ✅ Allowed | ✅ Allowed | ✅ Allowed |
| Book a Pickup | ✅ Allowed | ✅ Allowed | ✅ Allowed |
| Track Booking by Reference + Phone | ✅ Allowed | ✅ Allowed | ✅ Allowed |
| Access Customer Dashboard (`/account`) | ❌ Denied | ✅ Allowed (Own Data) | ✅ Allowed |
| View Customer Notifications | ❌ Denied | ✅ Allowed (Own Only) | ✅ Allowed |
| Access Admin Console (`/admin`) | ❌ Redirect to `/admin/login` | ❌ 403 Forbidden | ✅ Full Access |
| Update Laundry Booking Status | ❌ Denied | ❌ Denied | ✅ Authorized |
| Verify Payments (Cash / JazzCash / etc.) | ❌ Denied | ❌ Denied | ✅ Authorized |
| Inspect Administrative Audit Logs | ❌ Denied | ❌ Denied | ✅ Authorized |
| Alter Profile Roles | ❌ Denied | ❌ Blocked by Trigger | ✅ Authorized |

---

## 3. Provisioning the First Administrator

Initial administrator access is granted via a trusted server-side process using the Supabase SQL Editor.

### Step 1: Create the User Account
You can create the user account in either of two ways:
- **Option A (Supabase Dashboard):** Go to **Authentication > Users > Add User**, enter the admin email and password.
- **Option B (Website Signup):** Register on the site at `/register` with your staff email.

### Step 2: Run the Promotion Script in SQL Editor
Open your project in the [Supabase Dashboard](https://supabase.com/dashboard) and navigate to the **SQL Editor**. Run:

```sql
SELECT public.assign_admin_by_email('admin@pickupwash.pk');
```

Or execute the contents of [`supabase/assign_admin.sql`](file:///supabase/assign_admin.sql) with your target email.

### Step 3: Verify Admin Status
Run the following verification query in the SQL Editor:
```sql
SELECT id, full_name, email, role, created_at, updated_at
FROM public.profiles
WHERE role = 'admin';
```

---

## 4. Admin Login & Route Guarding

### Dedicated Admin Login Page: `/admin/login`
- **Location:** `src/pages/admin/AdminLoginPage.tsx`
- **Features:**
  - Email Address & Password input with show/hide password toggle.
  - "Forgot Password" modal triggering Supabase password recovery.
  - Immediate role verification upon authentication:
    - If a valid customer account attempts to log in, the session is terminated and an explicit security alert is displayed:
      *"Access Denied: This account is registered as a customer and lacks administrative privileges."*
    - If credentials belong to an administrator (`role === 'admin'`), a successful `admin_login` audit entry is created and the user is redirected to `/admin`.

### Route Guard: `ProtectedAdminRoute` (`src/App.tsx`)
- Unauthenticated requests to `/admin` redirect to `/admin/login`.
- Authenticated customer accounts attempting to navigate to `/admin` are served `AdminAccessDenied` (403 Forbidden) with clean options to return to `/account` or sign out.

---

## 5. Audit Logging Architecture

All critical administrative actions are immutably logged into `public.admin_audit_logs`:
- Table fields: `id`, `admin_id`, `admin_email`, `action`, `entity_type`, `entity_id`, `details`, `ip_address`, `created_at`.
- Actions tracked:
  - `admin_login`
  - `update_order_status`
  - `verify_payment`
  - `assign_admin_role`
  - `service_update` / `price_update`
- **Tamper-Resistance:** RLS allows only `SELECT` by admins and `INSERT` by authenticated actors. `UPDATE` and `DELETE` policies are omitted, ensuring an unalterable audit log.

