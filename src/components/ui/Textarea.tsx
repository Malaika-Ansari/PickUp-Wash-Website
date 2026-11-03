import React, { forwardRef } from 'react';
import { cn } from '@/utils/cn';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  isError?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, isError = false, disabled, rows = 3, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        rows={rows}
        disabled={disabled}
        className={cn(
          'w-full bg-white text-darkNavy text-sm rounded-xl border transition-all duration-200 placeholder:text-darkNavy/40',
          'focus:outline-none focus:ring-2 focus:border-transparent px-4 py-2.5',
          isError
            ? 'border-red-400 focus:ring-red-400/25 bg-red-50/20 text-red-900'
            : 'border-ice-300 focus:border-aqua-400 focus:ring-aqua-400/25 hover:border-ice-400',
          disabled && 'bg-ice-100 text-darkNavy/40 cursor-not-allowed border-ice-200',
          className
        )}
        {...props}
      />
    );
  }
);

Textarea.displayName = 'Textarea';

