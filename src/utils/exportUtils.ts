import { Order, PaymentRecord } from '@/types';

/**
 * Escapes a cell for RFC 4180 compliant CSV output.
 * Prevents formula injection and handles commas, quotes, and newlines.
 */
export function escapeCsvCell(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '""';
  let str = String(value);

  // Prevent spreadsheet formula injection (=, +, -, @)
  if (/^[=\+\-@]/.test(str)) {
    str = "'" + str;
  }

  // Escape double quotes by doubling them
  str = str.replace(/"/g, '""');

  return `"${str}"`;
}

/**
 * Triggers a browser download of a CSV file with UTF-8 BOM for Microsoft Excel compatibility.
 */
export function triggerCsvDownload(filename: string, csvContent: string): void {
  // \uFEFF is the UTF-8 Byte Order Mark (BOM) ensuring Excel displays Urdu / Unicode characters properly
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  
  if (typeof window !== 'undefined') {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

/**
 * Masks Pakistani mobile numbers to protect customer privacy in reports.
 * Example: 03001234567 -> 0300****567
 */
export function maskPhoneNumber(phone?: string | null): string {
  if (!phone) return 'N/A';
  const clean = phone.trim();
  if (clean.length < 8) return clean;
  const start = clean.slice(0, 4);
  const end = clean.slice(-3);
  return `${start}****${end}`;
}

/**
 * Exports booking records as CSV while protecting customer PII.
 */
export function exportBookingsToCsv(orders: Order[], filename = 'pickupwash-bookings-report.csv'): void {
  const headers = [
    'Booking Reference',
    'Customer Name',
    'Customer Phone (Masked)',
    'Service Type',
    'Pickup Date',
    'Pickup Area',
    'Booking Status',
    'Payment Method',
    'Created At',
  ];

  const rows = orders.map((o) => [
    escapeCsvCell(o.trackingNumber),
    escapeCsvCell(o.customerName || 'Customer'),
    escapeCsvCell(maskPhoneNumber(o.customerPhone)),
    escapeCsvCell(o.items[0]?.serviceTitle || 'Standard Laundry'),
    escapeCsvCell(o.pickupDate),
    escapeCsvCell(o.area),
    escapeCsvCell(o.status),
    escapeCsvCell(o.paymentMethod),
    escapeCsvCell(new Date(o.createdAt).toLocaleDateString('en-PK')),
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  triggerCsvDownload(filename, csvContent);
}

/**
 * Exports payment records as CSV.
 */
export function exportPaymentsToCsv(
  payments: PaymentRecord[],
  orders: Order[] = [],
  filename = 'pickupwash-payments-report.csv'
): void {
  const orderMap = new Map<string, string>();
  orders.forEach((o) => orderMap.set(o.id, o.trackingNumber));

  const headers = [
    'Payment Record ID',
    'Booking Reference',
    'Payment Method',
    'Payment Amount (PKR)',
    'Payment Status',
    'Transaction Reference (TID)',
    'Created At',
  ];

  const rows = payments.map((p) => [
    escapeCsvCell(p.id.slice(0, 8)),
    escapeCsvCell(orderMap.get(p.booking_id) || p.booking_id.slice(0, 8)),
    escapeCsvCell(p.payment_method),
    escapeCsvCell(p.payment_amount != null ? p.payment_amount : 'Pending Inspection'),
    escapeCsvCell(p.payment_status),
    escapeCsvCell(p.transaction_reference || 'N/A'),
    escapeCsvCell(new Date(p.created_at).toLocaleDateString('en-PK')),
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  triggerCsvDownload(filename, csvContent);
}

export interface ExecutiveSummaryData {
  periodLabel: string;
  startDate: string;
  endDate: string;
  totalBookings: number;
  completedBookings: number;
  pendingBookings: number;
  cancelledBookings: number;
  completionRate: string;
  totalRevenuePkr: number;
  pendingRevenuePkr: number;
  verifiedPaymentsCount: number;
  pendingPaymentsCount: number;
  topService: string;
  topArea: string;
}

/**
 * Exports an executive operational summary report.
 */
export function exportExecutiveSummaryToCsv(
  summary: ExecutiveSummaryData,
  filename = 'pickupwash-executive-summary.csv'
): void {
  const lines: string[] = [
    'PICKUP WASH KASUR - EXECUTIVE OPERATIONAL SUMMARY',
    `Generated At,${escapeCsvCell(new Date().toISOString())}`,
    `Reporting Period,${escapeCsvCell(summary.periodLabel)} (${summary.startDate} to ${summary.endDate})`,
    '',
    'KEY OPERATIONAL METRICS,VALUE',
    `Total Bookings,${summary.totalBookings}`,
    `Completed Deliveries,${summary.completedBookings}`,
    `Pending Orders in Laundry Pipeline,${summary.pendingBookings}`,
    `Cancelled Bookings,${summary.cancelledBookings}`,
    `Operational Completion Rate,${escapeCsvCell(summary.completionRate)}`,
    '',
    'REVENUE & FINANCIAL RECONCILIATION,VALUE',
    `Total Verified Revenue Collected (PKR),${summary.totalRevenuePkr}`,
    `Pending Unverified Payments (PKR),${summary.pendingRevenuePkr}`,
    `Verified Transactions Count,${summary.verifiedPaymentsCount}`,
    `Pending Transactions Count,${summary.pendingPaymentsCount}`,
    '',
    'SERVICE & LOGISTICS HIGHLIGHTS,VALUE',
    `Most Popular Service,${escapeCsvCell(summary.topService)}`,
    `Top Demand Neighborhood,${escapeCsvCell(summary.topArea)}`,
    '',
    'NOTE,Revenue strictly excludes unverified and pending amounts per financial auditing standards.',
  ];

  triggerCsvDownload(filename, lines.join('\r\n'));
}

