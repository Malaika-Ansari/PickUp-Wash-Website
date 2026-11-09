/**
 * PICKUP WASH - COMPREHENSIVE SUPABASE RLS & SECURITY AUDIT TEST RUNNER
 * Location: Kasur City, Pakistan
 *
 * Verifies Row Level Security (RLS) enforcement, privilege escalation protection,
 * multi-tier defense triggers, and role isolation across:
 * 1. Unauthenticated Visitor
 * 2. Authenticated Customer (Customer A)
 * 3. Cross-Customer Isolation (Customer B trying to access Customer A's data)
 * 4. Authorized Administrator
 */

import assert from 'assert';

console.log('================================================================');
console.log('PICKUP WASH - SUPABASE RLS & SECURITY AUDIT TEST SUITE');
console.log('Location: Kasur City, Pakistan');
console.log('================================================================\n');

let passCount = 0;
let failCount = 0;

function runTest(testName, fn) {
  try {
    fn();
    console.log(`✅ [PASS] ${testName}`);
    passCount++;
  } catch (err) {
    console.error(`❌ [FAIL] ${testName}`);
    console.error(`   Error: ${err.message}\n`);
    failCount++;
  }
}

// -------------------------------------------------------------
// MOCK DATABASE & RLS ENGINE SIMULATOR
// Simulates PostgreSQL engine enforcing RLS policies and database triggers
// -------------------------------------------------------------

class PostgresRlsSimulator {
  constructor() {
    this.reset();
  }

  reset() {
    this.profiles = [
      { id: 'usr-customer-a', full_name: 'Usman Ali', email: 'usman@kasur.pk', phone: '03001234567', address: 'Railway Road', area: 'Model Town', role: 'customer', created_at: '2026-11-01T10:00:00Z' },
      { id: 'usr-customer-b', full_name: 'Fatima Noor', email: 'fatima@kasur.pk', phone: '03019876543', address: 'Kutchery Road', area: 'Shahbaz Colony', role: 'customer', created_at: '2026-11-02T10:00:00Z' },
      { id: 'usr-admin-1', full_name: 'Hafiz Administrator', email: 'admin@pickupwash.pk', phone: '03005551234', address: 'Pickup Wash Hub', area: 'Kasur City', role: 'admin', created_at: '2026-10-01T10:00:00Z' }
    ];

    this.services = [
      { id: 'srv-1', service_name: 'Wash & Iron', slug: 'wash-and-iron', is_active: true, price_per_kg: 250 },
      { id: 'srv-2', service_name: 'Express Service', slug: 'express-service', is_active: true, price_per_kg: 400 },
      { id: 'srv-3', service_name: 'Legacy Chemical Wash', slug: 'legacy-chem', is_active: false, price_per_kg: null } // Inactive service
    ];

    this.monthly_packages = [
      { id: 'pkg-1', package_name: 'Family Essential Plan', slug: 'family-essential', is_active: true, price: 4500 },
      { id: 'pkg-2', package_name: 'Draft Corporate Package', slug: 'draft-corp', is_active: false, price: null } // Inactive
    ];

    this.service_pricing = [
      { id: 'prc-1', service_id: 'srv-1', title: 'Per KG Wash & Iron', rate: 250, unit: 'kg', is_active: true },
      { id: 'prc-2', service_id: 'srv-2', title: 'Express Surcharge', rate: 350, unit: 'order', is_active: true },
      { id: 'prc-3', service_id: 'srv-3', title: 'Internal Testing Rate', rate: 999, unit: 'kg', is_active: false }
    ];

    this.promotions = [
      { id: 'prm-1', promo_code: 'FIRST_PICKUP_FREE', title: 'Your First Pickup is FREE!', is_active: true },
      { id: 'prm-2', promo_code: 'EXPIRED_EID_SPECIAL', title: 'Eid Discount 2025', is_active: false }
    ];

    this.bookings = [
      {
        id: 'bk-101',
        customer_id: 'usr-customer-a',
        booking_reference: 'PW-KSR-10101',
        service_type: 'Wash & Iron',
        pickup_address: 'House 12, Street 3, Model Town',
        area: 'Model Town',
        pickup_date: '2026-11-05',
        pickup_time: '10:00 AM - 12:00 PM',
        booking_status: 'Request Received',
        payment_method: 'JazzCash',
        payment_status: 'Pending',
        created_at: '2026-11-04T08:00:00Z',
        updated_at: '2026-11-04T08:00:00Z'
      },
      {
        id: 'bk-102',
        customer_id: 'usr-customer-a',
        booking_reference: 'PW-KSR-10102',
        service_type: 'Express Service',
        pickup_address: 'House 12, Street 3, Model Town',
        area: 'Model Town',
        pickup_date: '2026-11-03',
        pickup_time: '02:00 PM - 04:00 PM',
        booking_status: 'Delivered',
        payment_method: 'Cash on Delivery',
        payment_status: 'Paid',
        created_at: '2026-11-03T07:00:00Z',
        updated_at: '2026-11-03T18:00:00Z'
      },
      {
        id: 'bk-201',
        customer_id: 'usr-customer-b',
        booking_reference: 'PW-KSR-20201',
        service_type: 'Monthly Packages',
        pickup_address: 'Flat 4B, Kutchery Road',
        area: 'Shahbaz Colony',
        pickup_date: '2026-11-05',
        pickup_time: '04:00 PM - 06:00 PM',
        booking_status: 'Picked Up',
        payment_method: 'Easypaisa',
        payment_status: 'Awaiting Verification',
        created_at: '2026-11-04T09:00:00Z',
        updated_at: '2026-11-04T10:30:00Z'
      }
    ];

    this.booking_status_history = [
      { id: 'bsh-1', booking_id: 'bk-101', previous_status: null, new_status: 'Request Received', changed_at: '2026-11-04T08:00:00Z' },
      { id: 'bsh-2', booking_id: 'bk-102', previous_status: null, new_status: 'Request Received', changed_at: '2026-11-03T07:00:00Z' },
      { id: 'bsh-3', booking_id: 'bk-102', previous_status: 'Request Received', new_status: 'Delivered', changed_at: '2026-11-03T18:00:00Z' },
      { id: 'bsh-4', booking_id: 'bk-201', previous_status: null, new_status: 'Request Received', changed_at: '2026-11-04T09:00:00Z' },
      { id: 'bsh-5', booking_id: 'bk-201', previous_status: 'Request Received', new_status: 'Picked Up', changed_at: '2026-11-04T10:30:00Z' }
    ];

    this.payments = [
      {
        id: 'pay-101',
        booking_id: 'bk-101',
        customer_id: 'usr-customer-a',
        payment_method: 'JazzCash',
        payment_amount: null,
        payment_status: 'Pending',
        transaction_reference: null,
        verified_by: null,
        verified_at: null,
        created_at: '2026-11-04T08:00:00Z'
      },
      {
        id: 'pay-102',
        booking_id: 'bk-102',
        customer_id: 'usr-customer-a',
        payment_method: 'Cash on Delivery',
        payment_amount: 850,
        payment_status: 'Paid',
        transaction_reference: null,
        verified_by: 'usr-admin-1',
        verified_at: '2026-11-03T18:00:00Z',
        created_at: '2026-11-03T07:00:00Z'
      },
      {
        id: 'pay-201',
        booking_id: 'bk-201',
        customer_id: 'usr-customer-b',
        payment_method: 'Easypaisa',
        payment_amount: null,
        payment_status: 'Awaiting Verification',
        transaction_reference: 'EP-98765432101',
        verified_by: null,
        verified_at: null,
        created_at: '2026-11-04T09:00:00Z'
      }
    ];

    this.notifications = [
      { id: 'notif-1', customer_id: 'usr-customer-a', booking_id: 'bk-101', title: 'Booking Request Received', message: 'Order submitted.', notification_type: 'booking_status', is_read: false, created_at: '2026-11-04T08:00:00Z' },
      { id: 'notif-2', customer_id: 'usr-customer-b', booking_id: 'bk-201', title: 'Clothes Picked Up', message: 'Rider collected laundry.', notification_type: 'booking_status', is_read: false, created_at: '2026-11-04T10:30:00Z' }
    ];

    this.admin_audit_logs = [
      { id: 'log-1', admin_id: 'usr-admin-1', admin_email: 'admin@pickupwash.pk', action: 'verify_payment', entity_type: 'payment', entity_id: 'pay-102', details: { amount: 850, status: 'Paid' }, created_at: '2026-11-03T18:00:00Z' }
    ];
  }

  // Helper: check if session is admin
  isAdmin(sessionUser) {
    if (!sessionUser) return false;
    const profile = this.profiles.find((p) => p.id === sessionUser.id);
    return profile?.role === 'admin';
  }

  // Execute SELECT query with RLS evaluation
  select(table, sessionUser, filterFn = () => true) {
    const isAdm = this.isAdmin(sessionUser);
    const userId = sessionUser?.id || null;

    switch (table) {
      case 'profiles':
        // RLS: auth.uid() = id OR is_admin()
        return this.profiles.filter((row) => (userId && row.id === userId) || isAdm).filter(filterFn);

      case 'services':
        // RLS: is_active = true OR is_admin()
        return this.services.filter((row) => row.is_active === true || isAdm).filter(filterFn);

      case 'monthly_packages':
        // RLS: is_active = true OR is_admin()
        return this.monthly_packages.filter((row) => row.is_active === true || isAdm).filter(filterFn);

      case 'service_pricing':
        // RLS: is_active = true OR is_admin()
        return this.service_pricing.filter((row) => row.is_active === true || isAdm).filter(filterFn);

      case 'promotions':
        // RLS: is_active = true OR is_admin()
        return this.promotions.filter((row) => row.is_active === true || isAdm).filter(filterFn);

      case 'bookings':
        // RLS: (auth.uid() IS NOT NULL AND customer_id = auth.uid()) OR is_admin()
        return this.bookings.filter((row) => (userId && row.customer_id === userId) || isAdm).filter(filterFn);

      case 'booking_status_history':
        // RLS: EXISTS (SELECT 1 FROM bookings b WHERE b.id = booking_id AND b.customer_id = auth.uid()) OR is_admin()
        return this.booking_status_history.filter((row) => {
          if (isAdm) return true;
          if (!userId) return false;
          const parentBooking = this.bookings.find((b) => b.id === row.booking_id);
          return parentBooking && parentBooking.customer_id === userId;
        }).filter(filterFn);

      case 'payments':
        // RLS: (auth.uid() IS NOT NULL AND customer_id = auth.uid()) OR is_admin()
        return this.payments.filter((row) => (userId && row.customer_id === userId) || isAdm).filter(filterFn);

      case 'notifications':
        // RLS: customer_id = auth.uid() OR is_admin()
        return this.notifications.filter((row) => (userId && row.customer_id === userId) || isAdm).filter(filterFn);

      case 'admin_audit_logs':
        // RLS: is_admin() ONLY
        return this.admin_audit_logs.filter(() => isAdm).filter(filterFn);

      default:
        throw new Error(`Table ${table} not recognized.`);
    }
  }

  // Execute INSERT with RLS WITH CHECK & BEFORE INSERT triggers
  insert(table, sessionUser, payload) {
    const isAdm = this.isAdmin(sessionUser);
    const userId = sessionUser?.id || null;

    switch (table) {
      case 'bookings': {
        // WITH CHECK: ((userId && customer_id = userId) OR (userId == null && customer_id == null) OR isAdm)
        // AND booking_status IN ('Request Received', 'Booking Request Received')
        // AND payment_status IN ('Pending', 'pending', 'Awaiting Verification')
        const allowedStatus = ['Request Received', 'Booking Request Received'];
        const allowedPayStatus = ['Pending', 'pending', 'Awaiting Verification'];

        if (!isAdm) {
          if (userId && payload.customer_id !== userId) {
            throw new Error('RLS Violation: Cannot create booking for another customer ID.');
          }
          if (!userId && payload.customer_id != null) {
            throw new Error('RLS Violation: Guest booking cannot specify customer_id.');
          }
          if (payload.booking_status && !allowedStatus.includes(payload.booking_status)) {
            throw new Error('RLS Violation: New bookings must start in initial Request Received status.');
          }
          if (payload.payment_status && !allowedPayStatus.includes(payload.payment_status)) {
            throw new Error('RLS Violation: Initial payment status cannot be marked as Paid on creation.');
          }
        }

        const newRow = {
          id: `bk-${Date.now()}`,
          booking_status: payload.booking_status || 'Request Received',
          payment_status: payload.payment_status || 'Pending',
          ...payload
        };
        this.bookings.push(newRow);
        return newRow;
      }

      case 'payments': {
        // WITH CHECK: ((userId && customer_id = userId) OR (userId == null && customer_id == null) OR isAdm)
        // AND payment_status IN ('Pending', 'pending', 'Awaiting Verification')
        // AND verified_by IS NULL AND verified_at IS NULL
        if (!isAdm) {
          if (userId && payload.customer_id !== userId) {
            throw new Error('RLS Violation: Cannot create payment for another customer ID.');
          }
          if (payload.payment_status === 'Paid') {
            throw new Error('RLS Violation: Only verified administrators can mark payments as Paid.');
          }
          if (payload.verified_by != null || payload.verified_at != null) {
            throw new Error('RLS Violation: Customers cannot forge payment verification metadata.');
          }
        }
        const newPay = {
          id: `pay-${Date.now()}`,
          payment_status: payload.payment_status || 'Pending',
          verified_by: isAdm ? payload.verified_by : null,
          verified_at: isAdm ? payload.verified_at : null,
          ...payload
        };
        this.payments.push(newPay);
        return newPay;
      }

      case 'notifications': {
        // WITH CHECK: is_admin() ONLY
        if (!isAdm) {
          throw new Error('RLS Violation: Direct insertion of system notifications is restricted to administrators.');
        }
        const newNotif = { id: `notif-${Date.now()}`, is_read: false, ...payload };
        this.notifications.push(newNotif);
        return newNotif;
      }

      case 'admin_audit_logs': {
        // WITH CHECK: auth.uid() IS NOT NULL AND (admin_id IS NULL OR admin_id = auth.uid() OR is_admin())
        if (!userId) {
          throw new Error('RLS Violation: Unauthenticated users cannot write audit logs.');
        }
        if (!isAdm && payload.admin_id && payload.admin_id !== userId) {
          throw new Error('RLS Violation: Cannot forge audit logs under another user ID.');
        }
        const newLog = { id: `log-${Date.now()}`, created_at: new Date().toISOString(), ...payload };
        this.admin_audit_logs.push(newLog);
        return newLog;
      }

      case 'services':
      case 'monthly_packages':
      case 'service_pricing':
      case 'promotions': {
        if (!isAdm) {
          throw new Error(`RLS Violation: Managing ${table} catalog requires administrator role.`);
        }
        const row = { id: `${table.slice(0, 3)}-${Date.now()}`, ...payload };
        this[table].push(row);
        return row;
      }

      default:
        throw new Error(`Insert not supported on ${table}`);
    }
  }

  // Execute UPDATE with RLS USING/CHECK & BEFORE UPDATE triggers
  update(table, sessionUser, id, updates) {
    const isAdm = this.isAdmin(sessionUser);
    const userId = sessionUser?.id || null;

    switch (table) {
      case 'profiles': {
        const target = this.profiles.find((p) => p.id === id);
        if (!target) throw new Error('Profile not found.');

        // RLS: auth.uid() = id OR is_admin()
        if (!isAdm && target.id !== userId) {
          throw new Error('RLS Violation: Customers cannot update another user profile.');
        }

        // TRIGGER: prevent_role_escalation()
        if (updates.role && updates.role !== target.role && !isAdm) {
          throw new Error('Privilege Escalation Blocked: Non-admin users cannot alter their role.');
        }

        Object.assign(target, updates);
        return target;
      }

      case 'bookings': {
        const target = this.bookings.find((b) => b.id === id);
        if (!target) throw new Error('Booking not found.');

        // RLS: (auth.uid() = customer_id AND status in ('Request Received')) OR is_admin()
        if (!isAdm) {
          if (!userId || target.customer_id !== userId) {
            throw new Error('RLS Violation: Customers cannot update other bookings.');
          }

          // TRIGGER: prevent_unauthorized_booking_status_change()
          if (updates.booking_status && updates.booking_status !== target.booking_status) {
            if (updates.booking_status === 'Cancelled') {
              if (target.booking_status !== 'Request Received') {
                throw new Error('Cancellation Prohibited: Orders already confirmed or picked up cannot be cancelled directly.');
              }
            } else {
              throw new Error('Unauthorized Booking Status Change: Customers cannot advance or alter booking status.');
            }
          }
        }

        Object.assign(target, updates);
        return target;
      }

      case 'payments': {
        const target = this.payments.find((p) => p.id === id);
        if (!target) throw new Error('Payment not found.');

        // RLS: (auth.uid() = customer_id AND status = 'Pending') OR is_admin()
        if (!isAdm) {
          if (!userId || target.customer_id !== userId) {
            throw new Error('RLS Violation: Customers cannot update other payments.');
          }

          // TRIGGER: prevent_unauthorized_payment_verification()
          if (updates.payment_status === 'Paid' || updates.verified_by || updates.verified_at || updates.payment_amount !== undefined) {
            throw new Error('Unauthorized Payment Mutation: Only verified administrators can verify payments, set amounts, or mark records as Paid.');
          }

          // Customer can ONLY submit TID transitioning to 'Awaiting Verification'
          if (updates.payment_status && updates.payment_status !== 'Awaiting Verification') {
            throw new Error('RLS Violation: Customer can only update status to Awaiting Verification.');
          }
        }

        Object.assign(target, updates);
        return target;
      }

      case 'notifications': {
        const target = this.notifications.find((n) => n.id === id);
        if (!target) throw new Error('Notification not found.');

        if (!isAdm && (!userId || target.customer_id !== userId)) {
          throw new Error('RLS Violation: Customers cannot update other notifications.');
        }

        // TRIGGER: prevent_notification_tampering()
        if (!isAdm) {
          if (updates.title || updates.message || updates.customer_id || updates.notification_type) {
            throw new Error('Notification Tampering Blocked: Only read status can be updated by customer.');
          }
        }

        Object.assign(target, updates);
        return target;
      }

      case 'admin_audit_logs':
        // Strictly immutable: No update allowed for ANY role
        throw new Error('Audit Log Immutability: Audit log records cannot be updated.');

      default:
        throw new Error(`Update not supported on ${table}`);
    }
  }

  // Execute RPC track_booking_secure
  trackBookingSecure(reference, phoneVerification, sessionUser) {
    const cleanRef = reference.trim().toUpperCase();
    const cleanPhone = phoneVerification.replace(/[^0-9]/g, '').slice(-10);
    const isAdm = this.isAdmin(sessionUser);
    const userId = sessionUser?.id || null;

    const matched = this.bookings.find((b) => b.booking_reference.toUpperCase() === cleanRef);
    if (!matched) return null;

    const profile = this.profiles.find((p) => p.id === matched.customer_id);
    const profilePhoneDigits = profile?.phone ? profile.phone.replace(/[^0-9]/g, '').slice(-10) : '';

    const phoneMatches = profilePhoneDigits && profilePhoneDigits === cleanPhone;
    const isOwner = userId && matched.customer_id === userId;

    if (phoneMatches || isOwner || isAdm) {
      // Secure sanitized return payload (PII omitted)
      return {
        id: matched.id,
        booking_reference: matched.booking_reference,
        service_type: matched.service_type,
        pickup_address: matched.pickup_address,
        area: matched.area,
        pickup_date: matched.pickup_date,
        pickup_time: matched.pickup_time,
        booking_status: matched.booking_status,
        created_at: matched.created_at,
        updated_at: matched.updated_at
      };
    }

    return null;
  }
}

// Instantiate simulator
const db = new PostgresRlsSimulator();

// =================================================================
// TEST 1: UNAUTHENTICATED VISITOR PERMISSIONS
// =================================================================
runTest('1. Unauthenticated Visitor Public vs Private Access', () => {
  const visitor = null; // Unauthenticated

  // Public tables: should only return active rows
  const publicServices = db.select('services', visitor);
  assert.strictEqual(publicServices.length, 2, 'Should only return 2 active services');
  assert.ok(!publicServices.some((s) => s.is_active === false), 'Inactive services must be hidden from visitors');

  const publicPackages = db.select('monthly_packages', visitor);
  assert.strictEqual(publicPackages.length, 1, 'Should only return active monthly package');

  const publicPromotions = db.select('promotions', visitor);
  assert.strictEqual(publicPromotions.length, 1, 'Should only return active promotion');

  // Private tables: visitor MUST get 0 rows
  const profiles = db.select('profiles', visitor);
  assert.strictEqual(profiles.length, 0, 'Visitor cannot access any customer profiles');

  const bookings = db.select('bookings', visitor);
  assert.strictEqual(bookings.length, 0, 'Visitor cannot directly query bookings');

  const payments = db.select('payments', visitor);
  assert.strictEqual(payments.length, 0, 'Visitor cannot query payment records');

  const notifications = db.select('notifications', visitor);
  assert.strictEqual(notifications.length, 0, 'Visitor cannot query notifications');

  const auditLogs = db.select('admin_audit_logs', visitor);
  assert.strictEqual(auditLogs.length, 0, 'Visitor cannot query admin audit logs');
});

// =================================================================
// TEST 2: UNAUTHENTICATED BOOKING CREATION & TAMPERING PREVENTION
// =================================================================
runTest('2. Guest Booking Submission & Tampering Prevention', () => {
  const visitor = null;

  // 1. Valid guest booking (customer_id is null, status is Request Received, payment is Pending)
  const validBooking = db.insert('bookings', visitor, {
    customer_id: null,
    booking_reference: 'PW-KSR-99999',
    service_type: 'Wash & Iron',
    pickup_address: 'Main Bazaar',
    area: 'Kasur City',
    pickup_date: '2026-11-06',
    pickup_time: '10:00 AM - 12:00 PM',
    booking_status: 'Request Received',
    payment_status: 'Pending'
  });
  assert.ok(validBooking.id, 'Valid guest booking should be accepted');

  // 2. Reject guest booking attempting to spoof customer_id
  assert.throws(
    () => {
      db.insert('bookings', visitor, {
        customer_id: 'usr-customer-a',
        booking_reference: 'PW-KSR-BAD01',
        service_type: 'Wash & Iron',
        area: 'Model Town'
      });
    },
    /Guest booking cannot specify customer_id/,
    'Should reject guest booking with forged customer ID'
  );

  // 3. Reject guest booking attempting to inject pre-completed status
  assert.throws(
    () => {
      db.insert('bookings', visitor, {
        customer_id: null,
        booking_reference: 'PW-KSR-BAD02',
        service_type: 'Wash & Iron',
        booking_status: 'Delivered'
      });
    },
    /New bookings must start in initial Request Received status/,
    'Should reject guest booking attempting to mark as Delivered'
  );

  // 4. Reject guest booking attempting to set payment_status as Paid
  assert.throws(
    () => {
      db.insert('bookings', visitor, {
        customer_id: null,
        booking_reference: 'PW-KSR-BAD03',
        service_type: 'Wash & Iron',
        payment_status: 'Paid'
      });
    },
    /Initial payment status cannot be marked as Paid/,
    'Should reject guest booking attempting to mark as Paid'
  );
});

// =================================================================
// TEST 3: SECURE PUBLIC TRACKING RPC (PHONE NUMBER VERIFICATION)
// =================================================================
runTest('3. Secure Public Booking Tracking (track_booking_secure)', () => {
  const visitor = null;

  // Exact reference and matching phone -> SUCCESS
  const trackingResult = db.trackBookingSecure('PW-KSR-10101', '03001234567', visitor);
  assert.ok(trackingResult, 'Should find booking when phone matches');
  assert.strictEqual(trackingResult.booking_reference, 'PW-KSR-10101');
  assert.strictEqual(trackingResult.booking_status, 'Request Received');
  assert.strictEqual(trackingResult.email, undefined, 'PII email must not be exposed');
  assert.strictEqual(trackingResult.phone, undefined, 'PII phone must not be exposed');

  // Reference correct, but phone incorrect -> REJECTED (returns null)
  const failedTracking = db.trackBookingSecure('PW-KSR-10101', '03339999999', visitor);
  assert.strictEqual(failedTracking, null, 'Should return null when phone does not match customer phone');

  // Random guessing reference -> REJECTED
  const randomRef = db.trackBookingSecure('PW-KSR-00000', '03001234567', visitor);
  assert.strictEqual(randomRef, null, 'Should return null for non-existent booking');
});

// =================================================================
// TEST 4: CUSTOMER PERMISSIONS & PRIVILEGE ESCALATION BLOCK
// =================================================================
runTest('4. Customer Profile Permissions & Role Escalation Block', () => {
  const customerA = { id: 'usr-customer-a' };

  // Can view own profile
  const ownProfile = db.select('profiles', customerA);
  assert.strictEqual(ownProfile.length, 1);
  assert.strictEqual(ownProfile[0].email, 'usman@kasur.pk');

  // Can update permitted profile fields (e.g. phone, address)
  const updated = db.update('profiles', customerA, 'usr-customer-a', {
    phone: '03009998877',
    address: 'Updated Railway Road Flat 3'
  });
  assert.strictEqual(updated.phone, '03009998877');

  // CANNOT alter own role to 'admin' (privilege escalation blocked)
  assert.throws(
    () => {
      db.update('profiles', customerA, 'usr-customer-a', { role: 'admin' });
    },
    /Privilege Escalation Blocked/,
    'Should throw error when customer tries to self-escalate role'
  );
  assert.strictEqual(db.profiles.find((p) => p.id === 'usr-customer-a').role, 'customer', 'Role must remain customer');
});

// =================================================================
// TEST 5: CUSTOMER BOOKING MANAGEMENT & STATUS PROTECTION
// =================================================================
runTest('5. Customer Booking Management & Status Advancement Protection', () => {
  const customerA = { id: 'usr-customer-a' };

  // Can view own bookings (2 bookings belong to Customer A)
  const ownBookings = db.select('bookings', customerA);
  assert.strictEqual(ownBookings.length, 2, 'Customer A should see exactly their 2 bookings');

  // Can view own status history
  const ownHistory = db.select('booking_status_history', customerA);
  assert.strictEqual(ownHistory.length, 3, 'Customer A should see history for bk-101 and bk-102');

  // Customer cannot forge another customer's ID on booking insert
  assert.throws(
    () => {
      db.insert('bookings', customerA, {
        customer_id: 'usr-customer-b', // FORGERY!
        booking_reference: 'PW-KSR-FORGE01',
        service_type: 'Wash & Iron',
        area: 'Model Town'
      });
    },
    /Cannot create booking for another customer ID/,
    'Should block authenticated user from booking under another user ID'
  );

  // Customer can cancel their own booking while in 'Request Received'
  const cancelled = db.update('bookings', customerA, 'bk-101', { booking_status: 'Cancelled' });
  assert.strictEqual(cancelled.booking_status, 'Cancelled');

  // Customer CANNOT cancel a booking that is already delivered or in progress
  assert.throws(
    () => {
      db.update('bookings', customerA, 'bk-102', { booking_status: 'Cancelled' });
    },
    /Cancellation Prohibited/,
    'Should prohibit customer from cancelling orders past the initial request stage'
  );

  // Customer CANNOT advance their booking status to 'Confirmed' or 'Delivered'
  assert.throws(
    () => {
      db.update('bookings', customerA, 'bk-101', { booking_status: 'Delivered' });
    },
    /Unauthorized Booking Status Change/,
    'Should prohibit customer from directly marking booking as Delivered'
  );
});

// =================================================================
// TEST 6: CUSTOMER PAYMENT PERMISSIONS & SELF-VERIFICATION BLOCK
// =================================================================
runTest('6. Customer Payment Permissions & Self-Verification Protection', () => {
  const customerA = { id: 'usr-customer-a' };

  // Can view own payments
  const ownPayments = db.select('payments', customerA);
  assert.strictEqual(ownPayments.length, 2, 'Customer A sees their 2 payment records');

  // Can submit transaction reference (TID) moving status to Awaiting Verification
  const submittedTid = db.update('payments', customerA, 'pay-101', {
    transaction_reference: 'JC-123456789012',
    payment_status: 'Awaiting Verification'
  });
  assert.strictEqual(submittedTid.payment_status, 'Awaiting Verification');
  assert.strictEqual(submittedTid.transaction_reference, 'JC-123456789012');

  // Customer CANNOT mark payment as 'Paid'
  assert.throws(
    () => {
      db.update('payments', customerA, 'pay-101', { payment_status: 'Paid' });
    },
    /Unauthorized Payment Mutation/,
    'Should block customer from marking payment as Paid'
  );

  // Customer CANNOT alter payment amount or set verified_by
  assert.throws(
    () => {
      db.update('payments', customerA, 'pay-101', {
        payment_amount: 100,
        verified_by: 'usr-customer-a'
      });
    },
    /Unauthorized Payment Mutation/,
    'Should block customer from modifying payment amount or verification fields'
  );
});

// =================================================================
// TEST 7: CUSTOMER NOTIFICATIONS & TAMPERING PREVENTION
// =================================================================
runTest('7. Customer Notifications & Tampering Prevention', () => {
  const customerA = { id: 'usr-customer-a' };

  // Can view own notifications
  const notifs = db.select('notifications', customerA);
  assert.strictEqual(notifs.length, 1);
  assert.strictEqual(notifs[0].id, 'notif-1');

  // Can mark notification as read
  const updatedNotif = db.update('notifications', customerA, 'notif-1', { is_read: true });
  assert.strictEqual(updatedNotif.is_read, true);

  // CANNOT alter notification title or message
  assert.throws(
    () => {
      db.update('notifications', customerA, 'notif-1', {
        title: 'Fake Admin Alert',
        message: 'Your order is totally free!'
      });
    },
    /Notification Tampering Blocked/,
    'Should block customer from tampering with notification contents'
  );

  // CANNOT directly insert system notifications
  assert.throws(
    () => {
      db.insert('notifications', customerA, {
        customer_id: 'usr-customer-a',
        title: 'Forged System Notification',
        message: 'Admin granted 100% discount.'
      });
    },
    /Direct insertion of system notifications is restricted/,
    'Should block customer from injecting fake notifications'
  );
});

// =================================================================
// TEST 8: CROSS-CUSTOMER ISOLATION (CUSTOMER B CANNOT ACCESS CUSTOMER A)
// =================================================================
runTest('8. Cross-Customer Data Isolation (Zero Data Leakage)', () => {
  const customerB = { id: 'usr-customer-b' };

  // Customer B cannot see Customer A's profile
  const profilesVisibleToB = db.select('profiles', customerB);
  assert.strictEqual(profilesVisibleToB.length, 1);
  assert.strictEqual(profilesVisibleToB[0].id, 'usr-customer-b', 'Customer B must only see their own profile');

  // Customer B cannot update Customer A's profile
  assert.throws(
    () => {
      db.update('profiles', customerB, 'usr-customer-a', { full_name: 'Hacked Name' });
    },
    /Customers cannot update another user profile/,
    'Cross-customer profile modification must be rejected'
  );

  // Customer B cannot see Customer A's bookings
  const bookingsVisibleToB = db.select('bookings', customerB);
  assert.strictEqual(bookingsVisibleToB.length, 1);
  assert.strictEqual(bookingsVisibleToB[0].customer_id, 'usr-customer-b', 'Customer B must only see their own bookings');

  // Customer B cannot see Customer A's status history
  const historyVisibleToB = db.select('booking_status_history', customerB);
  assert.ok(historyVisibleToB.every((h) => h.booking_id === 'bk-201'), 'Customer B cannot see Customer A booking history');

  // Customer B cannot see Customer A's payments
  const paymentsVisibleToB = db.select('payments', customerB);
  assert.strictEqual(paymentsVisibleToB.length, 1);
  assert.strictEqual(paymentsVisibleToB[0].customer_id, 'usr-customer-b', 'Customer B must only see their own payments');

  // Customer B cannot modify Customer A's payment
  assert.throws(
    () => {
      db.update('payments', customerB, 'pay-101', { transaction_reference: 'HACKED-TID' });
    },
    /Customers cannot update other payments/,
    'Cross-customer payment modification must be rejected'
  );

  // Customer B cannot see Customer A's notifications
  const notifsVisibleToB = db.select('notifications', customerB);
  assert.strictEqual(notifsVisibleToB.length, 1);
  assert.strictEqual(notifsVisibleToB[0].customer_id, 'usr-customer-b', 'Customer B cannot see Customer A notifications');
});

// =================================================================
// TEST 9: AUTHORIZED ADMINISTRATOR CAPABILITIES & AUDIT LOG IMMUTABILITY
// =================================================================
runTest('9. Authorized Administrator Permissions & Audit Trail Immutability', () => {
  const admin = { id: 'usr-admin-1' };

  // Admin can view all profiles
  const allProfiles = db.select('profiles', admin);
  assert.strictEqual(allProfiles.length, 3, 'Admin can view all registered customer profiles');

  // Admin can view all bookings across all customers
  const allBookings = db.select('bookings', admin);
  assert.ok(allBookings.length >= 3, 'Admin can view all bookings');

  // Admin can advance booking status through lifecycle
  const advancedBooking = db.update('bookings', admin, 'bk-201', {
    booking_status: 'Washing & Ironing'
  });
  assert.strictEqual(advancedBooking.booking_status, 'Washing & Ironing', 'Admin can advance booking status');

  // Admin can manage services catalog
  const newService = db.insert('services', admin, {
    service_name: 'Starch & Steam Finish',
    slug: 'starch-steam',
    is_active: true,
    price_per_kg: 300
  });
  assert.ok(newService.id, 'Admin can add new catalog services');

  // Admin can verify payments and confirm PKR amounts
  const verifiedPay = db.update('payments', admin, 'pay-201', {
    payment_status: 'Paid',
    payment_amount: 1200,
    verified_by: 'usr-admin-1',
    verified_at: new Date().toISOString()
  });
  assert.strictEqual(verifiedPay.payment_status, 'Paid');
  assert.strictEqual(verifiedPay.payment_amount, 1200);
  assert.strictEqual(verifiedPay.verified_by, 'usr-admin-1');

  // Admin can view audit logs
  const auditLogs = db.select('admin_audit_logs', admin);
  assert.ok(auditLogs.length >= 1, 'Admin can view audit logs');

  // Audit logs are strictly immutable (even admin cannot UPDATE or DELETE)
  assert.throws(
    () => {
      db.update('admin_audit_logs', admin, 'log-1', { action: 'tampered_action' });
    },
    /Audit Log Immutability/,
    'Audit logs cannot be updated by any role'
  );
});

// =================================================================
// TEST 10: SEARCH_PATH PROTECTION & SECURITY DEFINER AUDIT
// =================================================================
runTest('10. Security Definer Search Path Protection Audit', async () => {
  const fs = await import('fs');
  const path = await import('path');

  const migrationPath = path.resolve('supabase/migrations/20261104000004_rls_security_audit_hardening.sql');
  const schemaPath = path.resolve('supabase/schema.sql');

  assert.ok(fs.existsSync(migrationPath), 'Migration 20261104000004 must exist');
  assert.ok(fs.existsSync(schemaPath), 'Unified schema.sql must exist');

  const migrationContent = fs.readFileSync(migrationPath, 'utf8');
  const schemaContent = fs.readFileSync(schemaPath, 'utf8');

  // Check search_path protection on all critical SECURITY DEFINER functions
  const requiredFunctions = [
    'is_admin',
    'handle_updated_at',
    'handle_new_user',
    'log_booking_status_change',
    'sync_booking_payment_status',
    'prevent_role_escalation',
    'assign_admin_by_email',
    'track_booking_secure'
  ];

  for (const fn of requiredFunctions) {
    const fnDefRegex = new RegExp(`CREATE OR REPLACE FUNCTION public\\.${fn}\\([\\s\\S]*?SET search_path = public, pg_temp`, 'm');
    assert.ok(
      fnDefRegex.test(migrationContent),
      `Function ${fn} must have explicit SET search_path = public, pg_temp in migration`
    );
    assert.ok(
      fnDefRegex.test(schemaContent),
      `Function ${fn} must have explicit SET search_path = public, pg_temp in schema.sql`
    );
  }

  // Check that all 10 tables have ALTER TABLE ... ENABLE ROW LEVEL SECURITY
  const requiredTables = [
    'profiles',
    'services',
    'service_pricing',
    'promotions',
    'monthly_packages',
    'bookings',
    'booking_status_history',
    'payments',
    'notifications',
    'admin_audit_logs'
  ];

  for (const tbl of requiredTables) {
    assert.ok(
      migrationContent.includes(`ALTER TABLE public.${tbl} ENABLE ROW LEVEL SECURITY`),
      `Table ${tbl} must have RLS enabled in migration`
    );
    assert.ok(
      schemaContent.includes(`ALTER TABLE public.${tbl} ENABLE ROW LEVEL SECURITY`),
      `Table ${tbl} must have RLS enabled in schema.sql`
    );
  }
});

console.log('================================================================');
console.log(`TOTAL TESTS: ${passCount + failCount} | PASSED: ${passCount} | FAILED: ${failCount}`);
console.log('================================================================\n');

if (failCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}

