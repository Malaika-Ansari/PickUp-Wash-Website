# Pickup Wash - Customer Notification System & Future Integration Architecture

**Location:** Kasur City, Pakistan  
**Stack:** React 18, TypeScript, Tailwind CSS, Supabase PostgreSQL  
**Architecture Layer:** [`src/services/notificationService.ts`](file:///c:/Users/IIS/OneDrive/Desktop/PickUp%20wash/src/services/notificationService.ts) & [`src/services/notificationChannels.ts`](file:///c:/Users/IIS/OneDrive/Desktop/PickUp%20wash/src/services/notificationChannels.ts)

---

## 1. Overview of In-App Notification System (Live & Functional)

Pickup Wash features an in-app notification center that tracks all critical customer touchpoints:
1. **Booking Request Received:** Instant notification when a doorstep pickup is requested.
2. **Booking Confirmed:** Alerts when a Pickup Wash rider is assigned and slot is locked.
3. **Clothes Picked Up:** Sent when clothes are collected from the doorstep in Kasur.
4. **Washing and Ironing Started:** Updates when garments enter specialized washing and steam pressing.
5. **Ready for Delivery:** Alerts when laundry is packaged and ready for doorstep delivery.
6. **Order Delivered:** Confirms successful doorstep handover.
7. **Booking Cancellation or Reschedule:** Immediate audit notifications if a slot is rescheduled or cancelled within the 3-hour policy window.
8. **Payment Status Updates:** Sent when manual digital transfers (JazzCash, Easypaisa, Bank Transfer) or Cash on Delivery payments are marked `Awaiting Verification`, `Paid`, `Failed`, or `Refunded`.

---

## 2. Database & Security Architecture

### 2.1 Schema Definition
- **Table:** `public.notifications`
- **Fields:**
  - `id` (UUID Primary Key)
  - `customer_id` (UUID Foreign Key referencing `public.profiles(id)`)
  - `booking_id` (UUID Optional Foreign Key referencing `public.bookings(id)`)
  - `title` (TEXT, NOT NULL)
  - `message` (TEXT, NOT NULL)
  - `notification_type` (`booking_status`, `payment_status`, `cancellation`, `reschedule`, `system`)
  - `is_read` (BOOLEAN, DEFAULT false)
  - `created_at` (TIMESTAMPTZ, DEFAULT now())

### 2.2 Row Level Security (RLS)
- **Customer Access (`SELECT`):** Only authenticated customers can view their own notifications (`customer_id = auth.uid()`).
- **Read Status Update (`UPDATE`):** Customers can only update `is_read` on their own notifications.
- **Tampering & Forgery Protection (`INSERT`):** Direct insert by non-admin users is blocked. In-app notifications are generated strictly via secure `SECURITY DEFINER` database triggers (`trg_notify_booking_created`, `trg_notify_booking_updated`, `trg_notify_payment_updated`) or authorized administrative operations.
- **Dismissal (`DELETE`):** Customers can dismiss their own notifications.

### 2.3 Automatic Deduplication
- Database trigger functions and service layer check recent notification history before creating a new record. If an identical notification for the same booking and title occurred within the last 30 seconds, duplicate creation is prevented.

---

## 3. Future External Channel Integration

The notification dispatcher in [`src/services/notificationChannels.ts`](file:///c:/Users/IIS/OneDrive/Desktop/PickUp%20wash/src/services/notificationChannels.ts) implements an adapter pattern ready to connect external paid channels when management approves contracts.

### 3.1 Pakistan Branded SMS Gateway
- **Intended Use:** Critical doorstep arrival alerts, pickup slot confirmations, and rider OTP verification for Kasur residents.
- **Recommended Gateways in Pakistan:**
  1. **TeleStax / SMS Alert PK:** HTTP REST API supporting alphanumeric mask (`PICKUPWASH`).
  2. **Jazz Business / Zong Corporate Portal:** Direct telecom SMPP / HTTP connectivity with PTA-approved sender mask.
- **Configuration Keys:**
  ```env
  VITE_SMS_GATEWAY_API_KEY="your_sms_gateway_api_key"
  VITE_PAKISTAN_SMS_SECRET="your_sms_gateway_secret"
  VITE_SMS_MASK="PICKUPWASH"
  ```
- **PTA Requirements (Pakistan Telecommunication Authority):**
  - Requires business NTN registration.
  - Alphanumeric sender ID (`PICKUPWASH`) registration with telecom operators.
  - Standard opt-out compliance.

### 3.2 WhatsApp Business Cloud API
- **Intended Use:** Detailed digital invoices, before/after laundry garment photos, and automated customer care.
- **Provider:** Meta WhatsApp Business Cloud API or Twilio WhatsApp.
- **Configuration Keys:**
  ```env
  VITE_WHATSAPP_ACCESS_TOKEN="EAAG..."
  VITE_WHATSAPP_PHONE_NUMBER_ID="100123456789012"
  VITE_WHATSAPP_BUSINESS_ACCOUNT_ID="200123456789012"
  ```
- **Integration Requirements:**
  - Meta Business Manager verified organization.
  - Dedicated business mobile number (+92 300 0000000) not registered on standard WhatsApp consumer app.
  - Template messages approved by Meta for utility updates (e.g. `booking_confirmed_v1`, `ready_for_delivery_v1`).

### 3.3 Email Notifications
- **Intended Use:** Detailed booking receipts, monthly package subscription statements, and customer registration welcomes.
- **Recommended Providers:**
  1. **Resend:** Modern developer-first transactional email API (`resend.com`).
  2. **Supabase Custom SMTP:** Configure directly in Supabase Dashboard -> Settings -> Auth -> SMTP.
- **Configuration Keys:**
  ```env
  VITE_RESEND_API_KEY="re_your_api_key"
  VITE_EMAIL_SENDER="Pickup Wash Kasur <notifications@pickupwash.pk>"
  ```
- **DNS Authentication Required:**
  - SPF record: `v=spf1 include:amazonses.com ~all` (or provider specific).
  - DKIM CNAME records.
  - DMARC record: `v=DMARC1; p=none;`.

---

## 4. Current Status Notice
- **In-App Notifications:** Fully operational, persistent, and accessible via the [Notification Center](file:///c:/Users/IIS/OneDrive/Desktop/PickUp%20wash/src/components/notifications/NotificationCenter.tsx) and Bell icons.
- **SMS / WhatsApp / Email:** Dispatched via simulated safe logger with no costs incurred until live API keys are provided.

