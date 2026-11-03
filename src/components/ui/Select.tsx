import React, { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  leftIcon?: React.ReactNode;
  isError?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, leftIcon, isError = false, disabled, ...props }, ref) => {
    return (
      <div className="relative w-full">
        {leftIcon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-darkNavy/40 pointer-events-none flex items-center justify-center">
            {leftIcon}
          </div>
        )}

        <select
          ref={ref}
          disabled={disabled}
          className={cn(
            'w-full bg-white text-darkNavy text-sm rounded-xl border appearance-none transition-all duration-200 cursor-pointer',
            'focus:outline-none focus:ring-2 focus:border-transparent',
            leftIcon ? 'pl-10' : 'pl-4',
            'pr-10 py-2.5',
            isError
              ? 'border-red-400 focus:ring-red-400/25 bg-red-50/20 text-red-900'
              : 'border-ice-300 focus:border-aqua-400 focus:ring-aqua-400/25 hover:border-ice-400',
            disabled && 'bg-ice-100 text-darkNavy/40 cursor-not-allowed border-ice-200',
            className
          )}
          {...props}
        >
          {children}
        </select>

        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-darkNavy/40 pointer-events-none flex items-center justify-center">
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>
    );
  }
);

Select.displayName = 'Select';

