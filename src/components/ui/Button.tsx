import React from 'react';
import { cn } from '@/utils/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'danger';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  disabled,
  type = 'button',
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-all duration-200 select-none ' +
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-aqua-400 focus-visible:ring-offset-2 ' +
    'active:scale-[0.98] disabled:opacity-55 disabled:cursor-not-allowed disabled:pointer-events-none disabled:active:scale-100';

  const variants = {
    // Primary: Navy Blue #173B57
    primary:
      'bg-navy-500 text-white hover:bg-navy-600 active:bg-navy-700 shadow-sm shadow-navy-500/25',
    // Secondary: Pure White #FFFFFF surface with Ice border & Dark Navy text
    secondary:
      'bg-white text-darkNavy hover:bg-ice-50 active:bg-ice-100 border border-ice-200/90 shadow-card hover:border-ice-300',
    // Accent: Aqua #65B9C5
    accent:
      'bg-aqua-400 text-darkNavy-900 font-semibold hover:bg-aqua-500 hover:text-white shadow-sm shadow-aqua-400/30',
    // Outline: Navy border
    outline:
      'border-2 border-navy-500 text-navy-500 hover:bg-navy-500 hover:text-white active:bg-navy-600',
    // Ghost: Subtle highlight on hover
    ghost:
      'text-darkNavy hover:bg-ice-200/50 hover:text-navy-900 active:bg-ice-200',
    // Danger: For cancellation / removal
    danger:
      'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-sm shadow-red-600/20',
  };

  const sizes = {
    xs: 'text-xs px-2.5 py-1 rounded-lg gap-1.5',
    sm: 'text-xs px-3.5 py-1.5 rounded-xl gap-2 font-medium',
    md: 'text-sm px-5 py-2.5 rounded-xl gap-2.5 font-medium',
    lg: 'text-base px-6 py-3.5 rounded-2xl gap-3 font-semibold',
  };

  return (
    <button
      type={type}
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <svg
            className="animate-spin h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Loading...</span>
        </>
      ) : (
        <>
          {leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );
};
