import React from 'react';
import { AlertCircle, RefreshCw, AlertTriangle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';

// 1. Inline Error Message
export interface ErrorMessageProps {
  message: string;
  className?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, className }) => {
  if (!message) return null;
  return (
    <div
      role="alert"
      className={cn(
        'p-3.5 rounded-xl bg-red-50 text-red-800 border border-red-200 text-xs flex items-center gap-2.5',
        className
      )}
    >
      <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
      <span className="font-medium leading-normal">{message}</span>
    </div>
  );
};

// 2. Full Container / Page Error State
export interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  onBack?: () => void;
  retryText?: string;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  description = 'We encountered an error loading this laundry information. Please check your internet connection or try again.',
  onRetry,
  onBack,
  retryText = 'Try Again',
  className,
}) => {
  return (
    <div
      role="alert"
      className={cn(
        'bg-white rounded-3xl p-8 sm:p-12 border border-ice-200 shadow-soft text-center max-w-lg mx-auto space-y-5',
        className
      )}
    >
      <div className="w-16 h-16 rounded-full bg-red-50 text-red-600 border border-red-200 flex items-center justify-center mx-auto">
        <AlertTriangle className="w-8 h-8" />
      </div>

      <div className="space-y-1.5">
        <h3 className="font-poppins font-bold text-xl sm:text-2xl text-navy-500">
          {title}
        </h3>
        <p className="text-xs sm:text-sm text-darkNavy/70 leading-relaxed max-w-sm mx-auto">
          {description}
        </p>
      </div>

      <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
        {onRetry && (
          <Button
            variant="primary"
            size="md"
            onClick={onRetry}
            leftIcon={<RefreshCw className="w-4 h-4" />}
          >
            {retryText}
          </Button>
        )}
        {onBack && (
          <Button
            variant="secondary"
            size="md"
            onClick={onBack}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Go Back
          </Button>
        )}
      </div>
    </div>
  );
};

