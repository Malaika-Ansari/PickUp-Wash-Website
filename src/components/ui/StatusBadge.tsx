import React from 'react';
import { OrderStatus, BookingStatus } from '@/types';
import { cn } from '@/utils/cn';

export type BadgeVariant =
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'success'
  | 'warning'
  | 'info'
  | 'danger'
  | 'neutral';

export interface StatusBadgeProps {
  status?: OrderStatus | BookingStatus | string;
  variant?: BadgeVariant;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  pulse?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  variant,
  label,
  size = 'md',
  pulse = false,
  icon,
  className,
}) => {
  // Map of canonical 7 statuses + legacy/database aliases
  const statusConfig: Record<
    string,
    { label: string; bg: string; text: string; border: string; dot: string }
  > = {
    // 1. Request Received
    'Request Received': {
      label: 'Request Received',
      bg: 'bg-amber-50',
      text: 'text-amber-800',
      border: 'border-amber-200',
      dot: 'bg-amber-500',
    },
    'Booking Request Received': {
      label: 'Request Received',
      bg: 'bg-amber-50',
      text: 'text-amber-800',
      border: 'border-amber-200',
      dot: 'bg-amber-500',
    },
    pending_pickup: {
      label: 'Request Received',
      bg: 'bg-amber-50',
      text: 'text-amber-800',
      border: 'border-amber-200',
      dot: 'bg-amber-500',
    },

    // 2. Confirmed
    Confirmed: {
      label: 'Confirmed',
      bg: 'bg-blue-50',
      text: 'text-blue-800',
      border: 'border-blue-200',
      dot: 'bg-blue-500',
    },
    'Booking Confirmed': {
      label: 'Confirmed',
      bg: 'bg-blue-50',
      text: 'text-blue-800',
      border: 'border-blue-200',
      dot: 'bg-blue-500',
    },

    // 3. Picked Up
    'Picked Up': {
      label: 'Picked Up',
      bg: 'bg-indigo-50',
      text: 'text-indigo-800',
      border: 'border-indigo-200',
      dot: 'bg-indigo-500',
    },
    'Clothes Picked Up': {
      label: 'Picked Up',
      bg: 'bg-indigo-50',
      text: 'text-indigo-800',
      border: 'border-indigo-200',
      dot: 'bg-indigo-500',
    },
    picked_up: {
      label: 'Picked Up',
      bg: 'bg-indigo-50',
      text: 'text-indigo-800',
      border: 'border-indigo-200',
      dot: 'bg-indigo-500',
    },

    // 4. Washing & Ironing
    'Washing & Ironing': {
      label: 'Washing & Ironing',
      bg: 'bg-aqua-50',
      text: 'text-navy-900',
      border: 'border-aqua-200',
      dot: 'bg-aqua-500',
    },
    processing: {
      label: 'Washing & Ironing',
      bg: 'bg-aqua-50',
      text: 'text-navy-900',
      border: 'border-aqua-200',
      dot: 'bg-aqua-500',
    },
    ironing: {
      label: 'Washing & Ironing',
      bg: 'bg-aqua-50',
      text: 'text-navy-900',
      border: 'border-aqua-200',
      dot: 'bg-aqua-500',
    },

    // 5. Ready for Delivery
    'Ready for Delivery': {
      label: 'Ready for Delivery',
      bg: 'bg-teal-50',
      text: 'text-teal-800',
      border: 'border-teal-200',
      dot: 'bg-teal-500',
    },
    ready_for_delivery: {
      label: 'Ready for Delivery',
      bg: 'bg-teal-50',
      text: 'text-teal-800',
      border: 'border-teal-200',
      dot: 'bg-teal-500',
    },
    out_for_delivery: {
      label: 'Out for Delivery',
      bg: 'bg-cyan-50',
      text: 'text-cyan-800',
      border: 'border-cyan-200',
      dot: 'bg-cyan-500',
    },

    // 6. Delivered
    Delivered: {
      label: 'Delivered',
      bg: 'bg-emerald-50',
      text: 'text-emerald-800',
      border: 'border-emerald-200',
      dot: 'bg-emerald-500',
    },
    delivered: {
      label: 'Delivered',
      bg: 'bg-emerald-50',
      text: 'text-emerald-800',
      border: 'border-emerald-200',
      dot: 'bg-emerald-500',
    },

    // 7. Cancelled
    Cancelled: {
      label: 'Cancelled',
      bg: 'bg-red-50',
      text: 'text-red-800',
      border: 'border-red-200',
      dot: 'bg-red-500',
    },
    cancelled: {
      label: 'Cancelled',
      bg: 'bg-red-50',
      text: 'text-red-800',
      border: 'border-red-200',
      dot: 'bg-red-500',
    },
  };

  const genericVariants: Record<
    BadgeVariant,
    { bg: string; text: string; border: string; dot: string }
  > = {
    primary: {
      bg: 'bg-navy-50',
      text: 'text-navy-800',
      border: 'border-navy-200',
      dot: 'bg-navy-500',
    },
    secondary: {
      bg: 'bg-ice-100',
      text: 'text-darkNavy',
      border: 'border-ice-300',
      dot: 'bg-darkNavy',
    },
    accent: {
      bg: 'bg-aqua-50',
      text: 'text-aqua-900',
      border: 'border-aqua-300',
      dot: 'bg-aqua-500',
    },
    success: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-800',
      border: 'border-emerald-200',
      dot: 'bg-emerald-500',
    },
    warning: {
      bg: 'bg-amber-50',
      text: 'text-amber-800',
      border: 'border-amber-200',
      dot: 'bg-amber-500',
    },
    info: {
      bg: 'bg-blue-50',
      text: 'text-blue-800',
      border: 'border-blue-200',
      dot: 'bg-blue-500',
    },
    danger: {
      bg: 'bg-red-50',
      text: 'text-red-800',
      border: 'border-red-200',
      dot: 'bg-red-500',
    },
    neutral: {
      bg: 'bg-gray-50',
      text: 'text-gray-700',
      border: 'border-gray-200',
      dot: 'bg-gray-400',
    },
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2.5 py-0.5 gap-1.5',
    md: 'text-xs px-3 py-1 gap-2',
    lg: 'text-sm px-3.5 py-1.5 gap-2.5',
  };

  const dotSizes = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5',
  };

  // Resolve styling configuration
  const currentConfig =
    status && statusConfig[status]
      ? statusConfig[status]
      : variant
      ? genericVariants[variant]
      : genericVariants.neutral;

  const displayLabel = label || (status && statusConfig[status]?.label) || status || 'Unknown';

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full border transition-colors select-none shrink-0',
        currentConfig.bg,
        currentConfig.text,
        currentConfig.border,
        sizeStyles[size],
        className
      )}
    >
      {/* Optional Leading Icon or Status Indicator Dot */}
      {icon ? (
        <span className="shrink-0">{icon}</span>
      ) : (
        <span className="relative flex shrink-0 items-center justify-center">
          {pulse && (
            <span
              className={cn(
                'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
                currentConfig.dot
              )}
            />
          )}
          <span
            className={cn('relative inline-flex rounded-full', dotSizes[size], currentConfig.dot)}
          />
        </span>
      )}

      <span>{displayLabel}</span>
    </span>
  );
};
