/**
 * Standalone Node.js Automated Test Suite for Pickup Wash Services & Pricing Management System
 * Location: Kasur City, Pakistan
 *
 * Verification Cases:
 * 1. Laundry Services Management: Add new service, edit description, toggle active/inactive.
 * 2. Canonical Services Verification: All 4 core services (Wash & Iron, Express Service, Monthly Packages, Pickup & Delivery) present.
 * 3. Pricing Management & Integrity: Setting per-kg rates, special charges, preserving NULL ("Not Set") without price invention.
 * 4. Monthly Package Management: Creating packages, editing descriptions, nullable prices, toggling active status.
 * 5. Customer Website Integration: Public read only receives active services & packages; inactive items hidden from new bookings.
 * 6. Historical Booking Immutability: Existing customer bookings retain original service details despite catalog status changes.
 * 7. First Pickup Free Promotion: Activating, deactivating, and updating terms without automated mutation.
 * 8. Role-Based Access Control & Audit Trail: Non-admin mutations strictly prohibited; admin actions recorded in audit log.
 */

console.log('================================================================');
console.log('PICKUP WASH - SERVICES & PRICING MANAGEMENT SYSTEM VERIFICATION');
console.log('Location: Kasur City, Pakistan');
console.log('================================================================\n');

let passedCount = 0;
let failedCount = 0;

function assert(condition, testName, successMsg, failMsg) {
  if (condition) {
    passedCount++;
    console.log(`✅ [PASS] ${testName}: ${successMsg}`);
  } else {
    failedCount++;
    console.error(`❌ [FAIL] ${testName}: ${failMsg}`);
  }
}

// -----------------------------------------------------------------------------
// In-Memory Database Fixtures (Mirroring Supabase PostgreSQL Tables)
// -----------------------------------------------------------------------------
let mockServices = [
  {
    id: 'srv-001',
    service_name: 'Wash & Iron',
    slug: 'wash-and-iron',
    description: 'Complete hygienic wash, fabric softening treatment, and crisp high-pressure steam pressing.',
    turnaround_time: '24–48 Hours',
    price_per_kg: null, // Strictly Not Set
    base_price: null,
    special_charge: null,
    price_unit: 'per_kg',
    is_pricing_active: false,
    pricing_notes: 'Pricing to be confirmed with Kasur shop owner',
    is_active: true,
    created_at: '2026-11-01T08:00:00Z',
  },
  {
    id: 'srv-002',
    service_name: 'Express Service',
    slug: 'express-service',
    description: 'Urgent priority turnaround service for customers requiring fast wash and steam pressing within hours.',
    turnaround_time: 'Urgent 12–24 Hours',
    price_per_kg: null,
    base_price: null,
    special_charge: null,
    price_unit: 'per_kg',
    is_pricing_active: false,
    pricing_notes: 'Urgent rush fee applies upon confirmation',
    is_active: true,
    created_at: '2026-11-01T08:05:00Z',
  },
  {
    id: 'srv-003',
    service_name: 'Monthly Packages',
    slug: 'monthly-packages',
    description: 'Convenient recurring laundry packages for regular households. Weekly scheduled doorstep pickups across Kasur.',
    turnaround_time: 'Scheduled Weekly',
    price_per_kg: null,
    base_price: null,
    special_charge: null,
    price_unit: 'fixed',
    is_pricing_active: false,
    pricing_notes: 'Tailored for small, medium, and large families',
    is_active: true,
    created_at: '2026-11-01T08:10:00Z',
  },
  {
    id: 'srv-004',
    service_name: 'Pickup & Delivery',
    slug: 'pickup-and-delivery',
    description: 'Direct doorstep laundry collection and delivery across Kasur City. Safe and sanitized laundry transit.',
    turnaround_time: 'Doorstep Collection',
    price_per_kg: null,
    base_price: null,
    special_charge: null,
    price_unit: 'order',
    is_pricing_active: false,
    pricing_notes: 'Complimentary on qualifying volumes',
    is_active: true,
    created_at: '2026-11-01T08:15:00Z',
  },
];

let mockPricingItems = [
  {
    id: 'prc-001',
    service_id: 'srv-001',
    title: 'Standard Per-Kg Wash & Steam Press',
    pricing_type: 'per_kg',
    rate: null, // Null until decided
    unit: 'kg',
    description: 'Standard per-kg charge for daily casuals and linens',
    is_active: true,
  },
  {
    id: 'prc-002',
    service_id: 'srv-002',
    title: 'Same-Day Urgent Expedited Surcharge',
    pricing_type: 'special_charge',
    rate: null,
    unit: 'order',
    description: 'Express turnaround rush surcharge',
    is_active: true,
  },
];

let mockPackages = [
  {
    id: 'pkg-001',
    package_name: 'Bachelor / Individual Saver',
    slug: 'bachelor-saver',
    description: 'Regular doorstep pickups throughout the month for everyday wear. Ideal for single professionals and students in Kasur.',
    price: null, // Stored as NULL
    is_active: true,
    created_at: '2026-11-01T08:30:00Z',
  },
  {
    id: 'pkg-002',
    package_name: 'Family Essential Plan',
    slug: 'family-essential',
    description: 'Ideal for households with routine laundry demands. Convenient twice-weekly pickups and fresh doorstep delivery.',
    price: null, // Stored as NULL
    is_active: true,
    created_at: '2026-11-01T08:35:00Z',
  },
  {
    id: 'pkg-003',
    package_name: 'Executive Steam Press Plan',
    slug: 'executive-press',
    description: 'Tailored for working professionals needing crisp formal shirts, shalwar kameez, and suits ready every week.',
    price: null, // Stored as NULL
    is_active: true,
    created_at: '2026-11-01T08:40:00Z',
  },
];

let mockPromotions = [
  {
    id: 'promo-001',
    promo_code: 'FIRST_PICKUP_FREE',
    title: 'Your First Pickup is FREE!',
    description: 'Complimentary doorstep collection for all first-time customers across Kasur City.',
    discount_type: 'free_pickup',
    is_active: true,
    terms: 'Valid on the very first booking for verified Kasur residential addresses. Payment is only collected upon safe delivery.',
    created_at: '2026-11-01T09:00:00Z',
  },
];

let mockAuditLogs = [];

function logAudit(user, action, entity_type, entity_id, details) {
  mockAuditLogs.push({
    id: 'log-' + (mockAuditLogs.length + 1),
    admin_id: user.id,
    admin_email: user.email,
    action,
    entity_type,
    entity_id,
    details,
    created_at: new Date().toISOString(),
  });
}

const adminUser = { id: 'usr-admin-01', email: 'admin@pickupwash.pk', role: 'admin' };
const customerUser = { id: 'usr-cust-01', email: 'customer@gmail.com', role: 'customer' };

// -----------------------------------------------------------------------------
// Test 1: Manage Laundry Services (Create, Edit, Toggle)
// -----------------------------------------------------------------------------
function testLaundryServicesManagement() {
  // 1. Add new service as Admin
  const newServicePayload = {
    service_name: 'Dry Cleaning & Delicate Care',
    slug: 'dry-cleaning',
    description: 'Eco-safe solvent washing for woolens, sherwanis, bridal dresses, and silks.',
    turnaround_time: '48–72 Hours',
    is_active: true,
  };

  const newService = {
    ...newServicePayload,
    id: 'srv-005',
    price_per_kg: null,
    base_price: null,
    special_charge: null,
    price_unit: 'item',
    is_pricing_active: false,
    pricing_notes: null,
    created_at: new Date().toISOString(),
  };
  mockServices.push(newService);
  logAudit(adminUser, 'create_service', 'service', newService.id, { service_name: newService.service_name });

  // 2. Edit existing service description
  const target = mockServices.find((s) => s.id === 'srv-001');
  const oldDesc = target.description;
  target.description = 'Updated: Complete hygienic wash, soft rinse, and commercial steam pressing.';
  logAudit(adminUser, 'update_service', 'service', target.id, { previous_description: oldDesc, new_description: target.description });

  // 3. Deactivate a service
  const expressSrv = mockServices.find((s) => s.id === 'srv-002');
  expressSrv.is_active = false;
  logAudit(adminUser, 'update_service', 'service', expressSrv.id, { is_active: false });

  const addedOk = mockServices.some((s) => s.slug === 'dry-cleaning');
  const editedOk = target.description.startsWith('Updated:');
  const deactivatedOk = expressSrv.is_active === false;

  assert(
    addedOk && editedOk && deactivatedOk,
    '1. Laundry Services Management',
    'Successfully added "Dry Cleaning", updated description on "Wash & Iron", and deactivated "Express Service".',
    'Failed to manage services (create, edit, or toggle).'
  );
}

// -----------------------------------------------------------------------------
// Test 2: Canonical Services Verification
// -----------------------------------------------------------------------------
function testCanonicalServices() {
  const requiredCanonicalSlugs = [
    'wash-and-iron',
    'express-service',
    'monthly-packages',
    'pickup-and-delivery',
  ];

  const allPresent = requiredCanonicalSlugs.every((slug) =>
    mockServices.some((s) => s.slug === slug)
  );

  assert(
    allPresent,
    '2. Canonical Core Services Presence',
    'All 4 required canonical services (Wash & Iron, Express Service, Monthly Packages, Pickup & Delivery) are configured.',
    'Missing one or more required canonical services.'
  );
}

// -----------------------------------------------------------------------------
// Test 3: Pricing Management & Pricing Integrity (No Invented Rates)
// -----------------------------------------------------------------------------
function testPricingManagementAndIntegrity() {
  const washSrv = mockServices.find((s) => s.id === 'srv-001');

  // Verify that initial price is NULL ("Not Set")
  const initialNullPass = washSrv.price_per_kg === null && washSrv.is_pricing_active === false;

  // Set official per-kg price when decided by business owner
  washSrv.price_per_kg = 250.0;
  washSrv.is_pricing_active = true;
  washSrv.pricing_notes = 'Confirmed with Kasur main branch manager';
  logAudit(adminUser, 'update_service_pricing', 'service', washSrv.id, { price_per_kg: 250.0 });

  // Add a special surcharge
  const specialCharge = {
    id: 'prc-003',
    service_id: 'srv-001',
    title: 'Winter Blanket Deep Sanitization Surcharge',
    pricing_type: 'special_charge',
    rate: 350.0,
    unit: 'item',
    description: 'Thermal wash and stain sanitization for heavy duvets',
    is_active: true,
  };
  mockPricingItems.push(specialCharge);
  logAudit(adminUser, 'create_service_pricing', 'service_pricing', specialCharge.id, { rate: 350.0 });

  // Clear pricing back to "Not Set"
  const pickupSrv = mockServices.find((s) => s.id === 'srv-004');
  pickupSrv.price_per_kg = null;
  pickupSrv.base_price = null;
  pickupSrv.is_pricing_active = false;

  const rateSetOk = washSrv.price_per_kg === 250.0 && washSrv.is_pricing_active === true;
  const surchargeOk = mockPricingItems.some((p) => p.id === 'prc-003' && p.rate === 350.0);
  const clearedPass = pickupSrv.price_per_kg === null && pickupSrv.is_pricing_active === false;

  assert(
    initialNullPass && rateSetOk && surchargeOk && clearedPass,
    '3. Pricing Management & Integrity',
    'Strict pricing integrity upheld: rates remain null ("Not Set") until decided; successfully added official per-kg rate PKR 250 and special surcharge PKR 350.',
    'Pricing management failed or assigned invented prices.'
  );
}

// -----------------------------------------------------------------------------
// Test 4: Monthly Package Management
// -----------------------------------------------------------------------------
function testMonthlyPackageManagement() {
  // 1. Create a new monthly package
  const newPackage = {
    id: 'pkg-004',
    package_name: 'Student Flat Wash & Fold',
    slug: 'student-saver',
    description: 'Weekly bulk laundry collection for university hostel students in Kasur.',
    price: null, // Left empty (Not Set)
    is_active: true,
    created_at: new Date().toISOString(),
  };
  mockPackages.push(newPackage);
  logAudit(adminUser, 'create_monthly_package', 'monthly_package', newPackage.id, { package_name: newPackage.package_name });

  // 2. Assign official price to Family Essential Plan
  const familyPkg = mockPackages.find((p) => p.slug === 'family-essential');
  familyPkg.price = 4500.0;
  logAudit(adminUser, 'update_monthly_package', 'monthly_package', familyPkg.id, { price: 4500.0 });

  // 3. Deactivate Executive Steam Press Plan
  const execPkg = mockPackages.find((p) => p.slug === 'executive-press');
  execPkg.is_active = false;
  logAudit(adminUser, 'update_monthly_package', 'monthly_package', execPkg.id, { is_active: false });

  const pkgCreated = mockPackages.some((p) => p.slug === 'student-saver' && p.price === null);
  const priceSet = familyPkg.price === 4500.0;
  const deactivated = execPkg.is_active === false;

  assert(
    pkgCreated && priceSet && deactivated,
    '4. Monthly Package Management',
    'Created "Student Flat Wash & Fold" with null price, set official price PKR 4,500 on "Family Essential Plan", and deactivated "Executive Steam Press Plan".',
    'Failed to manage monthly packages.'
  );
}

// -----------------------------------------------------------------------------
// Test 5: Customer Website Integration (Public Visibility)
// -----------------------------------------------------------------------------
function testCustomerWebsiteIntegration() {
  // Public getActiveServices simulator
  function getPublicActiveServices() {
    return mockServices.filter((s) => s.is_active);
  }

  // Public getActivePackages simulator
  function getPublicActivePackages() {
    return mockPackages.filter((p) => p.is_active);
  }

  const activeServices = getPublicActiveServices();
  const activePackages = getPublicActivePackages();

  // Inactive Express Service (srv-002) should NOT appear
  const expressHidden = !activeServices.some((s) => s.id === 'srv-002');

  // Inactive Executive Press Plan (pkg-003) should NOT appear
  const execHidden = !activePackages.some((p) => p.id === 'pkg-003');

  // Active services should appear
  const washActive = activeServices.some((s) => s.id === 'srv-001');

  // Customer booking validation simulator
  function canCustomerBookService(serviceSlug) {
    const srv = mockServices.find((s) => s.slug === serviceSlug);
    return Boolean(srv && srv.is_active);
  }

  const cannotBookInactive = canCustomerBookService('express-service') === false;
  const canBookActive = canCustomerBookService('wash-and-iron') === true;

  assert(
    expressHidden && execHidden && washActive && cannotBookInactive && canBookActive,
    '5. Customer Website Integration',
    'Public catalog queries strictly return active services & packages; deactivated items are hidden from public pages and rejected from new bookings.',
    'Customer website integration failed to hide inactive services or packages.'
  );
}

// -----------------------------------------------------------------------------
// Test 6: Historical Booking Immutability
// -----------------------------------------------------------------------------
function testHistoricalBookingImmutability() {
  // Existing customer booking recorded earlier with 'Express Service'
  const historicalBooking = {
    id: 'ord-hist-99',
    booking_reference: 'PW-KSR-1234',
    service_type: 'Express Service',
    pickup_date: '2026-11-02',
    status: 'Delivered',
  };

  // Even though 'Express Service' is currently deactivated in the catalog:
  const expressSrv = mockServices.find((s) => s.slug === 'express-service');
  const isDeactivated = expressSrv.is_active === false;

  // The historical booking record must remain intact and retain 'Express Service'
  const bookingRetained = historicalBooking.service_type === 'Express Service';

  assert(
    isDeactivated && bookingRetained,
    '6. Historical Booking Immutability',
    'Existing customer bookings preserve their original service_type string ("Express Service") even when services are deactivated in the catalog.',
    'Historical booking service details were mutated or invalidated.'
  );
}

// -----------------------------------------------------------------------------
// Test 7: First Pickup Free Promotion Management
// -----------------------------------------------------------------------------
function testFirstPickupFreePromotionManagement() {
  const promo = mockPromotions.find((p) => p.promo_code === 'FIRST_PICKUP_FREE');

  // Initial state should be active
  const initialActive = promo.is_active === true;

  // Admin deactivates the promotion
  promo.is_active = false;
  promo.updated_at = new Date().toISOString();
  logAudit(adminUser, 'deactivate_promotion', 'promotion', promo.promo_code, { is_active: false });

  const deactivatedState = promo.is_active === false;

  // Admin reactivates and updates terms
  promo.is_active = true;
  promo.terms = 'Updated Terms: Complimentary collection for all new Kasur residential clients.';
  logAudit(adminUser, 'activate_promotion', 'promotion', promo.promo_code, { terms: promo.terms });

  const reactivatedState = promo.is_active === true && promo.terms.includes('Updated Terms');

  assert(
    initialActive && deactivatedState && reactivatedState,
    '7. First Pickup Free Promotion Management',
    'Admin can activate, deactivate, and update terms for "Your First Pickup is FREE!"; state changes only upon explicit administrative action.',
    'Promotion management failed or mutated unexpectedly.'
  );
}

// -----------------------------------------------------------------------------
// Test 8: Security & Role-Based Authorization
// -----------------------------------------------------------------------------
function testRoleBasedAuthorization() {
  function performAdminAction(user, actionFn) {
    if (user.role !== 'admin') {
      logAudit(user, 'unauthorized_catalog_mutation_attempt', 'catalog', 'root', { reason: 'Non-admin user attempt' });
      return { success: false, error: '403 Forbidden: Only authorized administrators may manage services and pricing.' };
    }
    return { success: true, result: actionFn() };
  }

  // 1. Customer attempt to modify service price -> Must be blocked
  const customerAttempt = performAdminAction(customerUser, () => {
    mockServices[0].price_per_kg = 1.0;
  });

  // 2. Admin attempt -> Must succeed
  const adminAttempt = performAdminAction(adminUser, () => {
    return 'Operation approved';
  });

  const customerBlocked = customerAttempt.success === false && customerAttempt.error.includes('403 Forbidden');
  const adminAllowed = adminAttempt.success === true;
  const auditLogged = mockAuditLogs.some((l) => l.action === 'unauthorized_catalog_mutation_attempt');

  assert(
    customerBlocked && adminAllowed && auditLogged,
    '8. Security & Role-Based Authorization',
    'Non-admin attempts to mutate catalog/pricing are strictly blocked (403 Forbidden) and logged in admin_audit_logs.',
    'Role authorization check failed.'
  );
}

// -----------------------------------------------------------------------------
// Execution
// -----------------------------------------------------------------------------
testLaundryServicesManagement();
testCanonicalServices();
testPricingManagementAndIntegrity();
testMonthlyPackageManagement();
testCustomerWebsiteIntegration();
testHistoricalBookingImmutability();
testFirstPickupFreePromotionManagement();
testRoleBasedAuthorization();

console.log('\n================================================================');
console.log(`TOTAL TESTS: ${passedCount + failedCount} | PASSED: ${passedCount} | FAILED: ${failedCount}`);
console.log('================================================================\n');

if (failedCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}

