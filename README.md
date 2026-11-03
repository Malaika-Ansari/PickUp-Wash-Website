# Pickup Wash — Laundry Pickup & Delivery Service

> **Location:** Kasur City, Punjab, Pakistan  
> **Mission:** Collect clothes from customers' doorsteps, wash with fabric-safe detergents, high-pressure steam press, and deliver back fresh.  
> **Audience:** Busy households, students, and working professionals in Kasur.

---

## 🎨 Design Identity & Palette

- **Primary Navy Blue:** `#173B57` (`navy-500`)
- **Background Ice Blue:** `#EAF3F8` (`ice-100`)
- **Accent Aqua:** `#65B9C5` (`aqua-400`)
- **White:** `#FFFFFF`
- **Typography:** Poppins (Headings) & Inter (Body)
- **Style:** Modern, premium, clean, colorful, friendly, and professional.

---

## 🚀 Full-Stack Architecture

### Frontend
- **Framework:** React 18 + TypeScript
- **Bundler & Dev Server:** Vite 6
- **Styling:** Tailwind CSS with custom brand extensions
- **Routing:** React Router v6 (SPA with client-side history)
- **Icons:** Lucide React

### Backend & Database (Free-Tier Ready)
- **Database:** Supabase PostgreSQL with Row Level Security (RLS)
- **Authentication:** Supabase Auth with custom user profile triggers
- **Offline / Local Dev Fallback:** Seamless in-browser persistence when Supabase credentials are in placeholder mode.

### Deployment Readiness (100% Free Tier)
- **Frontend Hosting:** Vercel (`vercel.json`) or Netlify (`public/_redirects`)
- **Database:** Supabase Free Tier (500 MB database, 50,000 monthly active users)

---

## 📁 Scalable Folder Structure

```
pickup-wash/
├── public/
│   ├── logo.svg              # Brand vector logo
│   └── _redirects            # Netlify / Cloudflare SPA routing rewrite
├── src/
│   ├── components/
│   │   └── common/           # Reusable UI components
│   │       ├── Badge.tsx
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       ├── Footer.tsx
│   │       ├── Navbar.tsx
│   │       └── SystemStatusBanner.tsx
│   ├── hooks/
│   │   └── useAuth.tsx       # Auth context and session management
│   ├── layouts/
│   │   ├── AdminLayout.tsx   # Dashboard layout for staff & admins
│   │   └── RootLayout.tsx    # Public customer-facing layout
│   ├── pages/
│   │   ├── admin/            # Admin operations & live order pipeline
│   │   │   └── AdminDashboardPage.tsx
│   │   ├── auth/             # Login & Registration
│   │   │   ├── LoginPage.tsx
│   │   │   └── RegisterPage.tsx
│   │   ├── AboutPage.tsx
│   │   ├── BookingPage.tsx   # Doorstep pickup booking form
│   │   ├── ContactPage.tsx
│   │   ├── HomePage.tsx      # High-converting landing page
│   │   ├── NotFoundPage.tsx
│   │   ├── PricingPage.tsx   # Detailed garment rate card
│   │   ├── ServicesPage.tsx  # Service descriptions & care guidelines
│   │   └── TrackOrderPage.tsx# Real-time order tracker
│   ├── services/
│   │   ├── authService.ts    # Supabase authentication integration
│   │   ├── orderService.ts   # Order booking & status tracking
│   │   └── supabase.ts       # Supabase client singleton & status helper
│   ├── types/
│   │   └── index.ts          # Domain TypeScript interfaces
│   ├── utils/
│   │   ├── cn.ts             # Tailwind class merging utility
│   │   └── constants.ts      # Kasur neighborhoods, rates & operating hours
│   ├── App.tsx               # Route declarations
│   ├── index.css             # Tailwind base & custom design tokens
│   └── main.tsx              # Application entry point
├── supabase/
│   └── schema.sql            # Complete PostgreSQL DDL, triggers & RLS policies
├── .env.example              # Template environment variables
├── .env                      # Local development keys
├── .gitignore
├── package.json
├── tailwind.config.js
├── tsconfig.json
├── vercel.json               # Vercel SPA routing rewrite
└── vite.config.ts
```

---

## ⚡ Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Local Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Connect Supabase (Optional for full cloud sync)
1. Create a free project at [supabase.com](https://supabase.com).
2. Go to **SQL Editor** in Supabase and run the script in `supabase/schema.sql`.
3. Go to **Project Settings > API** and copy your **Project URL** and **anon public key**.
4. Update your `.env` file:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

---

## 🛣️ Next Development Steps
1. **Automated SMS & WhatsApp Alerts:** Integrate free notification hooks via WhatsApp Business API or SMS gateway for order status changes.
2. **Customer Order History Portal:** Dedicated user dashboard showing repeat bookings and one-click re-ordering.
3. **Driver / Rider Mobile View:** Lightweight mobile interface for Kasur pickup drivers to mark orders picked up and upload weights.

