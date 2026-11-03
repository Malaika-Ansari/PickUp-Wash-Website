import React from 'react';
import { cn } from '@/utils/cn';

// 1. Reusable Inline Spinner
export interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'primary' | 'aqua' | 'white' | 'darkNavy';
  label?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  variant = 'primary',
  label = 'Loading...',
  className,
}) => {
  const sizeClasses = {
    xs: 'w-3.5 h-3.5 border-2',
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-3',
    xl: 'w-12 h-12 border-4',
  };

  const variantClasses = {
    primary: 'border-ice-200 border-t-navy-500',
    aqua: 'border-aqua-100 border-t-aqua-500',
    white: 'border-white/30 border-t-white',
    darkNavy: 'border-ice-300 border-t-darkNavy',
  };

  return (
    <div className={cn('inline-flex items-center gap-2.5', className)} role="status">
      <div
        className={cn(
          'animate-spin rounded-full',
          sizeClasses[size],
          variantClasses[variant]
        )}
      />
      {label && <span className="sr-only">{label}</span>}
    </div>
  );
};

// 2. Full Page / Container Laundry Loader
export interface PageLoaderProps {
  message?: string;
  submessage?: string;
  fullScreen?: boolean;
}

export const PageLoader: React.FC<PageLoaderProps> = ({
  message = 'Loading Pickup Wash...',
  submessage = 'Connecting to Kasur doorstep service',
  fullScreen = false,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center p-8 select-none',
        fullScreen
          ? 'fixed inset-0 z-50 bg-ice-100/90 backdrop-blur-md min-h-screen'
          : 'min-h-[50vh] w-full'
      )}
      role="status"
      aria-live="polite"
    >
      {/* Animated Washing Swirl Graphic */}
      <div className="relative w-20 h-20 mb-6 flex items-center justify-center">
        {/* Outer Pulsing Glow */}
        <div className="absolute inset-0 rounded-3xl bg-aqua-200/50 blur-xl animate-pulse" />

        {/* Navy Machine Shell */}
        <div className="relative w-16 h-16 rounded-2xl bg-navy-500 flex items-center justify-center shadow-lg shadow-navy-500/30">
          {/* Animated Water Drum */}
          <svg className="w-10 h-10 animate-spin duration-1000" viewBox="0 0 100 100" fill="none">
            <circle
              cx="50"
              cy="50"
              r="34"
              stroke="#65B9C5"
              strokeWidth="8"
              strokeDasharray="140 40"
              strokeLinecap="round"
            />
            <path
              d="M50 34C46 40 42 46 42 52C42 56.5 45.5 60 50 60C54.5 60 58 56.5 58 52C58 46 54 40 50 34Z"
              fill="#FFFFFF"
            />
          </svg>
        </div>
      </div>

      <h3 className="font-poppins font-bold text-lg sm:text-xl text-navy-500 mb-1">
        {message}
      </h3>
      <p className="text-xs sm:text-sm text-darkNavy/60 max-w-xs">{submessage}</p>
    </div>
  );
};

// 3. Versatile Skeleton Loader
export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'rectangular' | 'rounded' | 'circular' | 'text';
  width?: string | number;
  height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'rounded',
  width,
  height,
  className,
  style,
  ...props
}) => {
  const variantClasses = {
    rectangular: 'rounded-none',
    rounded: 'rounded-2xl',
    circular: 'rounded-full',
    text: 'rounded-md h-4 w-full my-1.5',
  };

  return (
    <div
      className={cn(
        'animate-pulse bg-ice-200/70 border border-ice-300/40',
        variantClasses[variant],
        className
      )}
      style={{
        width,
        height,
        ...style,
      }}
      aria-hidden="true"
      {...props}
    />
  );
};

