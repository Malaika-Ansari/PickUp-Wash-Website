import React from 'react';
import { LucideIcon, ArrowRight, AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';
import { cn } from '@/utils/cn';

// 1. General Info Card
export interface InfoCardProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  badge?: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export const InfoCard: React.FC<InfoCardProps> = ({
  title,
  description,
  icon,
  badge,
  actionText,
  onAction,
  className,
}) => {
  return (
    <div
      className={cn(
        'bg-white rounded-3xl p-6 border border-ice-200 shadow-soft hover:shadow-soft-hover hover:border-ice-300 transition-all duration-300 relative overflow-hidden group',
        className
      )}
    >
      <div className="flex items-start justify-between mb-4">
        {icon && (
          <div className="w-12 h-12 rounded-2xl bg-ice-100 text-navy-500 border border-ice-200 flex items-center justify-center shrink-0 group-hover:bg-aqua-100 group-hover:text-aqua-800 transition-colors">
            {icon}
          </div>
        )}
        {badge && (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-aqua-100 text-aqua-800 border border-aqua-200">
            {badge}
          </span>
        )}
      </div>

      <h4 className="font-poppins font-bold text-lg text-navy-500 mb-2">{title}</h4>
      <p className="text-xs sm:text-sm text-darkNavy/70 leading-relaxed mb-4">{description}</p>

      {actionText && (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-navy-500 hover:text-aqua-600 transition-colors"
        >
          <span>{actionText}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};

// 2. Metrics / Stat Card
export interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  variant?: 'white' | 'ice' | 'navy';
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtext,
  icon,
  trend,
  variant = 'white',
  className,
}) => {
  const variants = {
    white: 'bg-white text-darkNavy border-ice-200 shadow-soft',
    ice: 'bg-ice-50 text-darkNavy border-ice-200 shadow-card',
    navy: 'bg-navy-500 text-white border-navy-600 shadow-soft-hover',
  };

  return (
    <div
      className={cn(
        'rounded-3xl p-6 border transition-all duration-300 relative overflow-hidden',
        variants[variant],
        className
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <span
          className={cn(
            'text-xs font-semibold uppercase tracking-wider',
            variant === 'navy' ? 'text-ice-200' : 'text-navy-400'
          )}
        >
          {label}
        </span>
        {icon && (
          <div
            className={cn(
              'w-9 h-9 rounded-xl flex items-center justify-center shrink-0',
              variant === 'navy'
                ? 'bg-white/10 text-aqua-300'
                : 'bg-ice-100 text-navy-500'
            )}
          >
            {icon}
          </div>
        )}
      </div>

      <div
        className={cn(
          'font-poppins font-extrabold text-3xl sm:text-4xl tracking-tight mb-1',
          variant === 'navy' ? 'text-white' : 'text-navy-500'
        )}
      >
        {value}
      </div>

      <div className="flex items-center justify-between gap-2 mt-2">
        {subtext && (
          <span
            className={cn(
              'text-xs',
              variant === 'navy' ? 'text-ice-200/80' : 'text-darkNavy/60'
            )}
          >
            {subtext}
          </span>
        )}

        {trend && (
          <span
            className={cn(
              'px-2 py-0.5 rounded-full text-[11px] font-bold',
              trend.isPositive
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-red-100 text-red-800'
            )}
          >
            {trend.value}
          </span>
        )}
      </div>
    </div>
  );
};

// 3. Step Process Card (01-04)
export interface StepCardProps {
  step: string | number;
  title: string;
  description: string;
  icon: React.ReactNode;
  className?: string;
}

export const StepCard: React.FC<StepCardProps> = ({
  step,
  title,
  description,
  icon,
  className,
}) => {
  return (
    <div
      className={cn(
        'bg-white rounded-3xl p-6 sm:p-7 border border-ice-200 shadow-soft hover:shadow-soft-hover hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group',
        className
      )}
    >
      <span className="font-poppins font-extrabold text-5xl text-ice-200 absolute top-3 right-4 select-none group-hover:text-aqua-100 transition-colors pointer-events-none">
        {step}
      </span>

      <div className="w-12 h-12 rounded-2xl bg-ice-100 text-navy-500 flex items-center justify-center mb-5 group-hover:bg-aqua-400 group-hover:text-darkNavy-900 transition-colors">
        {icon}
      </div>

      <h4 className="font-poppins font-bold text-lg text-navy-500 mb-2">{title}</h4>
      <p className="text-xs sm:text-sm text-darkNavy/70 leading-relaxed">{description}</p>
    </div>
  );
};

// 4. Alert Notice Banner
export interface AlertBannerProps {
  title?: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'tip';
  onDismiss?: () => void;
  className?: string;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({
  title,
  message,
  type = 'info',
  onDismiss,
  className,
}) => {
  const configs = {
    info: {
      bg: 'bg-blue-50 border-blue-200 text-blue-900',
      icon: <Info className="w-5 h-5 text-blue-600 shrink-0" />,
    },
    success: {
      bg: 'bg-emerald-50 border-emerald-200 text-emerald-900',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
    },
    warning: {
      bg: 'bg-amber-50 border-amber-200 text-amber-900',
      icon: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
    },
    tip: {
      bg: 'bg-aqua-50 border-aqua-200 text-navy-900',
      icon: <AlertCircle className="w-5 h-5 text-aqua-600 shrink-0" />,
    },
  };

  const { bg, icon } = configs[type];

  return (
    <div
      role="alert"
      className={cn(
        'rounded-2xl p-4 border flex items-start justify-between gap-3 text-xs sm:text-sm',
        bg,
        className
      )}
    >
      <div className="flex items-start gap-3">
        {icon}
        <div>
          {title && <h5 className="font-bold text-sm mb-0.5">{title}</h5>}
          <p className="leading-relaxed opacity-90">{message}</p>
        </div>
      </div>

      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="p-1 rounded-lg hover:bg-black/5 opacity-60 hover:opacity-100 transition-opacity"
          aria-label="Dismiss alert"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
