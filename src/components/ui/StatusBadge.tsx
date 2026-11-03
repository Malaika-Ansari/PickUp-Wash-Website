import React from 'react';
import { OrderStatus } from '@/types';
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
  status?: OrderStatus;
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
  // If status is provided, map to semantic styling and label
  const statusConfig: Record<
    OrderStatus,
    { label: string; bg: string; text: string; border: string; dot: string }
  > = {
    pending_pickup: {
      label: 'Pickup Scheduled',
      bg: 'bg-amber-50',
      text: 'text-amber-800',
      border: 'border-amber-200',
      dot: 'bg-amber-500',
    },
    picked_up: {
      label: 'Collected from Doorstep',
      bg: 'bg-blue-50',
      text: 'text-blue-800',
      border: 'border-blue-200',
      dot: 'bg-blue-500',
    },
    processing: {
      label: 'In Washing Cycle',
      bg: 'bg-aqua-50',
      text: 'text-navy-900',
      border: 'border-aqua-200',
      dot: 'bg-aqua-500',
    },
    ironing: {
      label: 'Steam Pressing & QC',
      bg: 'bg-indigo-50',
      text: 'text-indigo-800',
      border: 'border-indigo-200',
      dot: 'bg-indigo-500',
    },
    ready_for_delivery: {
      label: 'Packaged & Ready',
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
    delivered: {
      label: 'Delivered Clean & Fresh',
      bg: 'bg-emerald-50',
      text: 'text-emerald-800',
      border: 'border-emerald-200',
      dot: 'bg-emerald-500',
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
      text: 'text-navy-700',
      border: 'border-navy-200',
      dot: 'bg-navy-500',
    },
    secondary: {
      bg: 'bg-white',
      text: 'text-darkNavy',
      border: 'border-ice-200',
      dot: 'bg-navy-400',
    },
    accent: {
      bg: 'bg-aqua-50',
      text: 'text-aqua-900',
      border: 'border-aqua-200',
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
      bg: 'bg-gray-100',
      text: 'text-gray-800',
      border: 'border-gray-200',
      dot: 'bg-gray-500',
    },
  };

  const currentTheme = status
    ? statusConfig[status]
    : variant
    ? genericVariants[variant]
    : genericVariants.primary;

  const displayLabel = label || (status ? statusConfig[status].label : 'Badge');

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 gap-1.5',
    md: 'text-xs px-2.5 py-1 gap-2',
    lg: 'text-sm px-3.5 py-1.5 gap-2.5 font-semibold',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium border select-none transition-colors',
        currentTheme.bg,
        currentTheme.text,
        currentTheme.border,
        sizeClasses[size],
        className
      )}
    >
      {pulse ? (
        <span className="relative flex h-2 w-2 shrink-0">
          <span
            className={cn(
              'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
              currentTheme.dot
            )}
          />
          <span
            className={cn('relative inline-flex rounded-full h-2 w-2', currentTheme.dot)}
          />
        </span>
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : (
        <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', currentTheme.dot)} />
      )}

      <span>{displayLabel}</span>
    </span>
  );
};
