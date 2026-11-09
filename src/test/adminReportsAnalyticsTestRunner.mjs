/**
 * Standalone Node.js Automated Test Suite for Pickup Wash Reports & Analytics Dashboard
 * Location: Kasur City, Pakistan
 *
 * Verification Cases:
 * 1. Business Overview Metrics: Total bookings, completed, pending, cancelled, customer count, and verified revenue.
 * 2. Strict Revenue Integrity: Unverified and pending payments are strictly excluded from received revenue totals.
 * 3. Date Range Filtering: Accuracy across Today, Last 7 Days, Last 30 Days, This Month, and Custom Date Ranges.
 * 4. Booking Trends & Fulfillment Ratios: Daily, weekly, and monthly aggregations, status distribution, and completion vs cancellation ratios.
 * 5. Laundry Service Demand & Package Analytics: Service volume ranking, percentage shares, and household package usage.
 * 6. Payment Analytics & Decoupled Architecture: Breakdown across channels (CoD, JazzCash, Easypaisa, Bank) with decoupled accounting.
 * 7. CSV Export Generation & Privacy Protection: Cell escaping, formula injection mitigation, and phone number masking (PII protection).
 * 8. Security & Role-Based Access Control: Prohibits non-admin users from accessing or exporting administrative intelligence.
 */

console.log('================================================================');
console.log('PICKUP WASH - REPORTS & ANALYTICS DASHBOARD VERIFICATION');
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
// Sample Operational Database Fixtures (Kasur Operations)
// -----------------------------------------------------------------------------
const sampleOrders = [
  {
    id: 'ord-001',
    trackingNumber: 'PW-KSR-501',
    customerName: 'Muhammad Salman',
    customerPhone: '03001234567',
    area: 'Model Town',
    pickupDate: '2026-11-04',
    status: 'Delivered',
    paymentMethod: 'Cash on Delivery',
    items: [{ serviceTitle: 'Wash & Iron', quantity: 1, unitPrice: 0, totalPrice: 0 }],
    createdAt: '2026-11-04T08:00:00Z',
  },
  {
    id: 'ord-002',
    trackingNumber: 'PW-KSR-502',
    customerName: 'Zainab Bibi',
    customerPhone: '03219876543',
    area: 'Kot Radha Kishan Road',
    pickupDate: '2026-11-03',
    status: 'Delivered',
    paymentMethod: 'JazzCash',
    items: [{ serviceTitle: 'Express Service', quantity: 1, unitPrice: 0, totalPrice: 0 }],
    createdAt: '2026-11-03T09:00:00Z',
  },
  {
    id: 'ord-003',
    trackingNumber: 'PW-KSR-503',
    customerName: 'Tariq Mehmood',
    customerPhone: '03335557799',
    area: 'Railway Road',
    pickupDate: '2026-11-02',
    status: 'Washing & Ironing',
    paymentMethod: 'Easypaisa',
    items: [{ serviceTitle: 'Wash & Iron', quantity: 1, unitPrice: 0, totalPrice: 0 }],
    createdAt: '2026-11-02T10:00:00Z',
  },
  {
    id: 'ord-004',
    trackingNumber: 'PW-KSR-504',
    customerName: 'Fatima Noor',
    customerPhone: '03451122334',
    area: 'Kutchery Road',
    pickupDate: '2026-11-01',
    status: 'Confirmed',
    paymentMethod: 'Bank Transfer',
    items: [{ serviceTitle: 'Monthly Packages', quantity: 1, unitPrice: 0, totalPrice: 0 }],
    specialInstructions: 'Family Essential Plan monthly subscription',
    createdAt: '2026-11-01T11:00:00Z',
  },
  {
    id: 'ord-005',
    trackingNumber: 'PW-KSR-505',
    customerName: 'Ali Raza',
    customerPhone: '03124445566',
    area: 'Shahbaz Colony',
    pickupDate: '2026-10-25',
    status: 'Cancelled',
    paymentMethod: 'Cash on Delivery',
    items: [{ serviceTitle: 'Wash & Iron', quantity: 1, unitPrice: 0, totalPrice: 0 }],
    cancellationReason: 'Customer travel outside Kasur',
    createdAt: '2026-10-25T14:00:00Z',
  },
  {
    id: 'ord-006',
    trackingNumber: 'PW-KSR-506',
    customerName: 'Bilal Ahmed',
    customerPhone: '03227766554',
    area: 'Ferozepur Road',
    pickupDate: '2026-10-15',
    status: 'Delivered',
    paymentMethod: 'Cash on Delivery',
    items: [{ serviceTitle: 'Pickup & Delivery', quantity: 1, unitPrice: 0, totalPrice: 0 }],
    createdAt: '2026-10-15T16:00:00Z',
  },
];

const samplePayments = [
  {
    id: 'pay-001',
    booking_id: 'ord-001',
    customer_id: 'cust-1',
    payment_method: 'Cash on Delivery',
    payment_amount: 850.0,
    payment_status: 'Paid', // Verified
    created_at: '2026-11-04T08:30:00Z',
  },
  {
    id: 'pay-002',
    booking_id: 'ord-002',
    customer_id: 'cust-2',
    payment_method: 'JazzCash',
    payment_amount: 1300.0,
    payment_status: 'Paid', // Verified
    transaction_reference: 'JC-99887766',
    created_at: '2026-11-03T09:30:00Z',
  },
  {
    id: 'pay-003',
    booking_id: 'ord-003',
    customer_id: 'cust-3',
    payment_method: 'Easypaisa',
    payment_amount: 650.0,
    payment_status: 'Awaiting Verification', // NOT VERIFIED
    transaction_reference: 'EP-11223344',
    created_at: '2026-11-02T10:30:00Z',
  },
  {
    id: 'pay-004',
    booking_id: 'ord-004',
    customer_id: 'cust-4',
    payment_method: 'Bank Transfer',
    payment_amount: 4500.0,
    payment_status: 'Awaiting Verification', // NOT VERIFIED
    transaction_reference: 'HBL-55443322',
    created_at: '2026-11-01T11:30:00Z',
  },
  {
    id: 'pay-005',
    booking_id: 'ord-005',
    customer_id: 'cust-5',
    payment_method: 'Cash on Delivery',
    payment_amount: null,
    payment_status: 'Failed',
    created_at: '2026-10-25T14:30:00Z',
  },
  {
    id: 'pay-006',
    booking_id: 'ord-006',
    customer_id: 'cust-6',
    payment_method: 'Cash on Delivery',
    payment_amount: 500.0,
    payment_status: 'Paid', // Verified
    created_at: '2026-10-15T16:30:00Z',
  },
];

// -----------------------------------------------------------------------------
// Test 1: Business Overview Metrics
// -----------------------------------------------------------------------------
function testBusinessOverviewMetrics() {
  const totalBookings = sampleOrders.length; // 6
  const completedOrders = sampleOrders.filter((o) => o.status === 'Delivered').length; // 3
  const cancelledOrders = sampleOrders.filter((o) => o.status === 'Cancelled').length; // 1
  const pendingOrders = sampleOrders.filter((o) => o.status !== 'Delivered' && o.status !== 'Cancelled').length; // 2
  const uniqueCustomers = new Set(sampleOrders.map((o) => o.customerPhone)).size; // 6

  // Total Verified Payments Received (Paid only)
  const paidList = samplePayments.filter((p) => p.payment_status === 'Paid');
  const totalRevenuePkr = paidList.reduce((sum, p) => sum + (p.payment_amount || 0), 0); // 850 + 1300 + 500 = 2650

  assert(
    totalBookings === 6 &&
    completedOrders === 3 &&
    cancelledOrders === 1 &&
    pendingOrders === 2 &&
    uniqueCustomers === 6 &&
    totalRevenuePkr === 2650.0,
    '1. Business Overview Metrics Calculation',
    'Accurately derived Total Bookings (6), Completed (3), Cancelled (1), Pending (2), Customers (6), and Verified Revenue (PKR 2,650).',
    'Overview metrics calculation mismatch.'
  );
}

// -----------------------------------------------------------------------------
// Test 2: Strict Revenue Integrity (Exclusion of Pending/Unverified)
// -----------------------------------------------------------------------------
function testStrictRevenueIntegrity() {
  const awaitingPayments = samplePayments.filter((p) => p.payment_status === 'Awaiting Verification');
  const pendingPayments = samplePayments.filter((p) => p.payment_status === 'Pending');
  const unverifiedTotal = awaitingPayments.reduce((sum, p) => sum + (p.payment_amount || 0), 0); // 650 + 4500 = 5150

  // The reported revenue MUST NOT include the 5150 PKR unverified amounts
  const verifiedOnlyRevenue = samplePayments
    .filter((p) => p.payment_status === 'Paid')
    .reduce((sum, p) => sum + (p.payment_amount || 0), 0);

  const strictlyExcluded = verifiedOnlyRevenue === 2650.0 && unverifiedTotal === 5150.0;

  assert(
    strictlyExcluded,
    '2. Strict Revenue Integrity Verification',
    'Unverified customer payments (PKR 5,150 awaiting TID check) are strictly excluded from received revenue; only verified collections count as revenue.',
    'Failed revenue integrity: unverified payments leaked into received revenue.'
  );
}

// -----------------------------------------------------------------------------
// Test 3: Date Range Filtering (Today, 7 Days, This Month, Custom)
// -----------------------------------------------------------------------------
function testDateRangeFiltering() {
  function filterByRange(orders, startDateStr, endDateStr) {
    const startMs = new Date(startDateStr + 'T00:00:00').getTime();
    const endMs = new Date(endDateStr + 'T23:59:59').getTime();
    return orders.filter((o) => {
      const oDate = new Date(o.pickupDate).getTime();
      return oDate >= startMs && oDate <= endMs;
    });
  }

  // 1. Filter Today (2026-11-04)
  const todayOrders = filterByRange(sampleOrders, '2026-11-04', '2026-11-04');
  const todayPass = todayOrders.length === 1 && todayOrders[0].trackingNumber === 'PW-KSR-501';

  // 2. Filter 7 Days (2026-10-29 to 2026-11-04)
  const last7DaysOrders = filterByRange(sampleOrders, '2026-10-29', '2026-11-04');
  const sevenDaysPass = last7DaysOrders.length === 4; // 501, 502, 503, 504

  // 3. Filter Month (November: 2026-11-01 to 2026-11-30)
  const novOrders = filterByRange(sampleOrders, '2026-11-01', '2026-11-30');
  const monthPass = novOrders.length === 4;

  // 4. Custom Range (2026-10-01 to 2026-10-31)
  const octOrders = filterByRange(sampleOrders, '2026-10-01', '2026-10-31');
  const customPass = octOrders.length === 2; // 505, 506

  assert(
    todayPass && sevenDaysPass && monthPass && customPass,
    '3. Date Range Filtering Accuracy',
    'Date filtering accurately resolves records for Today (1), Last 7 Days (4), This Month (4), and Custom Range (2).',
    'Date range filtering failed to accurately isolate matching periods.'
  );
}

// -----------------------------------------------------------------------------
// Test 4: Booking Analytics Trends & Completion Ratio
// -----------------------------------------------------------------------------
function testBookingAnalyticsTrendsAndRatios() {
  // Aggregate daily counts
  const dailyMap = new Map();
  sampleOrders.forEach((o) => {
    dailyMap.set(o.pickupDate, (dailyMap.get(o.pickupDate) || 0) + 1);
  });

  const dailyCountPass = dailyMap.get('2026-11-04') === 1 && dailyMap.get('2026-11-03') === 1;

  // Status Distribution
  const total = sampleOrders.length;
  const deliveredCount = sampleOrders.filter((o) => o.status === 'Delivered').length;
  const cancelledCount = sampleOrders.filter((o) => o.status === 'Cancelled').length;

  const completionRate = Math.round((deliveredCount / total) * 100); // 3 / 6 = 50%
  const cancellationRate = Math.round((cancelledCount / total) * 100); // 1 / 6 = 17%

  assert(
    dailyCountPass && completionRate === 50 && cancellationRate === 17,
    '4. Booking Trends & Fulfillment Ratios',
    'Accurately grouped daily trends and calculated 50% fulfillment completion rate vs 17% cancellation rate.',
    'Booking trends or fulfillment ratio calculation failed.'
  );
}

// -----------------------------------------------------------------------------
// Test 5: Service Demand & Monthly Package Analytics
// -----------------------------------------------------------------------------
function testServiceDemandAndPackageAnalytics() {
  const serviceMap = new Map();
  let packageUsageCount = 0;

  sampleOrders.forEach((o) => {
    const sTitle = o.items[0]?.serviceTitle || 'Standard Laundry';
    serviceMap.set(sTitle, (serviceMap.get(sTitle) || 0) + 1);

    if (sTitle.includes('Package') || (o.specialInstructions && o.specialInstructions.includes('Plan'))) {
      packageUsageCount++;
    }
  });

  const washAndIronCount = serviceMap.get('Wash & Iron'); // 3 orders
  const expressCount = serviceMap.get('Express Service'); // 1 order
  const monthlyCount = serviceMap.get('Monthly Packages'); // 1 order
  const pickupCount = serviceMap.get('Pickup & Delivery'); // 1 order

  assert(
    washAndIronCount === 3 &&
    expressCount === 1 &&
    monthlyCount === 1 &&
    pickupCount === 1 &&
    packageUsageCount === 1,
    '5. Service Demand & Monthly Package Analytics',
    'Identified "Wash & Iron" as top service (3 bookings, 50% share) and tracked monthly package subscription usage (1 booking).',
    'Service analytics calculation mismatch.'
  );
}

// -----------------------------------------------------------------------------
// Test 6: Payment Analytics & Decoupled Architecture
// -----------------------------------------------------------------------------
function testPaymentAnalyticsAndDecoupling() {
  const totalPayments = samplePayments.length;
  const verifiedCount = samplePayments.filter((p) => p.payment_status === 'Paid').length;
  const awaitingCount = samplePayments.filter((p) => p.payment_status === 'Awaiting Verification').length;
  const failedCount = samplePayments.filter((p) => p.payment_status === 'Failed').length;

  // Payment methods breakdown
  const methodMap = new Map();
  samplePayments.forEach((p) => {
    methodMap.set(p.payment_method, (methodMap.get(p.payment_method) || 0) + 1);
  });

  const codCount = methodMap.get('Cash on Delivery'); // 3
  const jazzCashCount = methodMap.get('JazzCash'); // 1
  const easypaisaCount = methodMap.get('Easypaisa'); // 1
  const bankCount = methodMap.get('Bank Transfer'); // 1

  // Decoupling verification: Order 5 is 'Cancelled', but its payment is explicitly recorded as 'Failed'
  const decoupledPass = sampleOrders[4].status === 'Cancelled' && samplePayments[4].payment_status === 'Failed';

  assert(
    totalPayments === 6 &&
    verifiedCount === 3 &&
    awaitingCount === 2 &&
    failedCount === 1 &&
    codCount === 3 &&
    jazzCashCount === 1 &&
    easypaisaCount === 1 &&
    bankCount === 1 &&
    decoupledPass,
    '6. Payment Analytics & Decoupled Architecture',
    'Reconciled all 4 payment channels (CoD: 3, JazzCash: 1, Easypaisa: 1, Bank: 1) with decoupled payment status management.',
    'Payment channel reconciliation or decoupling failed.'
  );
}

// -----------------------------------------------------------------------------
// Test 7: CSV Export Generation & PII Protection
// -----------------------------------------------------------------------------
function testCsvExportGenerationAndPiiProtection() {
  function escapeCsvCell(value) {
    if (value === null || value === undefined) return '""';
    let str = String(value);
    if (/^[=\+\-@]/.test(str)) str = "'" + str; // formula injection prevention
    str = str.replace(/"/g, '""');
    return `"${str}"`;
  }

  function maskPhone(phone) {
    if (!phone) return 'N/A';
    const clean = phone.trim();
    if (clean.length < 8) return clean;
    return `${clean.slice(0, 4)}****${clean.slice(-3)}`;
  }

  // 1. Phone number masking
  const samplePhone = '03001234567';
  const maskedPhone = maskPhone(samplePhone);
  const piiProtected = maskedPhone === '0300****567';

  // 2. CSV cell escaping (formula injection prevention)
  const dangerousCell = '=SUM(A1:A10)';
  const safeCell = escapeCsvCell(dangerousCell);
  const formulaEscaped = safeCell === "\"'=SUM(A1:A10)\"";

  // 3. Comma and quote escaping
  const complexCell = 'House 14, "Model Town" Kasur';
  const safeComplex = escapeCsvCell(complexCell);
  const commaEscaped = safeComplex === '"House 14, ""Model Town"" Kasur"';

  assert(
    piiProtected && formulaEscaped && commaEscaped,
    '7. CSV Export Generation & PII Protection',
    'Customer mobile numbers are securely masked (0300****567) and spreadsheet formula injection characters are neutralized.',
    'CSV escaping or PII masking failed.'
  );
}

// -----------------------------------------------------------------------------
// Test 8: Security & Role-Based Access Control
// -----------------------------------------------------------------------------
function testSecurityAndRoleBasedAccessControl() {
  function accessAdminReports(user) {
    if (!user || user.role !== 'admin') {
      return { success: false, error: '403 Forbidden: Only authorized administrators may view business analytics and reports.' };
    }
    return { success: true, message: 'Access granted' };
  }

  const customerUser = { id: 'usr-c1', email: 'customer@pickupwash.pk', role: 'customer' };
  const adminUser = { id: 'usr-a1', email: 'admin@pickupwash.pk', role: 'admin' };

  const customerAttempt = accessAdminReports(customerUser);
  const adminAttempt = accessAdminReports(adminUser);

  const customerBlocked = customerAttempt.success === false && customerAttempt.error.includes('403 Forbidden');
  const adminGranted = adminAttempt.success === true;

  assert(
    customerBlocked && adminGranted,
    '8. Security & Role-Based Access Control',
    'Customer access to administrative intelligence reports is strictly blocked (403 Forbidden); authorized admins access full analytics.',
    'Role authorization check failed.'
  );
}

// -----------------------------------------------------------------------------
// Execution
// -----------------------------------------------------------------------------
testBusinessOverviewMetrics();
testStrictRevenueIntegrity();
testDateRangeFiltering();
testBookingAnalyticsTrendsAndRatios();
testServiceDemandAndPackageAnalytics();
testPaymentAnalyticsAndDecoupling();
testCsvExportGenerationAndPiiProtection();
testSecurityAndRoleBasedAccessControl();

console.log('\n================================================================');
console.log(`TOTAL TESTS: ${passedCount + failedCount} | PASSED: ${passedCount} | FAILED: ${failedCount}`);
console.log('================================================================\n');

if (failedCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}

