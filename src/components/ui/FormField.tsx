import React from 'react';
import { AlertCircle, HelpCircle } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface FormFieldProps {
  label?: string;
  required?: boolean;
  hint?: string;
  error?: string;
  helperText?: string;
  htmlFor?: string;
  className?: string;
  children: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  required = false,
  hint,
  error,
  helperText,
  htmlFor,
  className,
  children,
}) => {
  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <div className="flex items-center justify-between">
          <label
            htmlFor={htmlFor}
            className="block text-xs font-semibold text-darkNavy uppercase tracking-wider select-none"
          >
            {label}
            {required && <span className="text-red-500 ml-1 font-bold">*</span>}
          </label>
          {hint && (
            <span className="text-[11px] text-darkNavy/50 flex items-center gap-1">
              <HelpCircle className="w-3 h-3" />
              {hint}
            </span>
          )}
        </div>
      )}

      <div>{children}</div>

      {error ? (
        <p
          role="alert"
          className="text-xs text-red-600 flex items-center gap-1.5 mt-1 font-medium animate-fadeIn"
        >
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      ) : helperText ? (
        <p className="text-[11px] text-darkNavy/60 mt-1 leading-normal">
          {helperText}
        </p>
      ) : null}
    </div>
  );
};

