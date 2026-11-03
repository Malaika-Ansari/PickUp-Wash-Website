import React, { forwardRef } from 'react';
import { cn } from '@/utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isError?: boolean;
  clearable?: boolean;
  onClear?: () => void;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      leftIcon,
      rightIcon,
      isError = false,
      clearable = false,
      onClear,
      disabled,
      type = 'text',
      ...props
    },
    ref
  ) => {
    return (
      <div className="relative w-full">
        {leftIcon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-darkNavy/40 pointer-events-none flex items-center justify-center">
            {leftIcon}
          </div>
        )}

        <input
          ref={ref}
          type={type}
          disabled={disabled}
          className={cn(
            'w-full bg-white text-darkNavy text-sm rounded-xl border transition-all duration-200 placeholder:text-darkNavy/40',
            'focus:outline-none focus:ring-2 focus:border-transparent',
            leftIcon ? 'pl-10' : 'pl-4',
            rightIcon || clearable ? 'pr-10' : 'pr-4',
            'py-2.5',
            isError
              ? 'border-red-400 focus:ring-red-400/25 bg-red-50/20 text-red-900'
              : 'border-ice-300 focus:border-aqua-400 focus:ring-aqua-400/25 hover:border-ice-400',
            disabled && 'bg-ice-100 text-darkNavy/40 cursor-not-allowed border-ice-200',
            className
          )}
          {...props}
        />

        {rightIcon && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-darkNavy/40 flex items-center justify-center">
            {rightIcon}
          </div>
        )}

        {clearable && !rightIcon && props.value && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-darkNavy/40 hover:text-darkNavy/70 p-0.5 rounded-full"
            aria-label="Clear input"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

