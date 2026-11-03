import React from 'react';
import { PackageOpen, CalendarCheck, Search, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';

export interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  actionText?: string;
  onAction?: () => void;
  secondaryText?: string;
  onSecondary?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  actionText,
  onAction,
  secondaryText,
  onSecondary,
  className,
}) => {
  return (
    <div
      className={cn(
        'bg-white rounded-3xl p-8 sm:p-12 border border-ice-200 shadow-soft text-center max-w-lg mx-auto space-y-5',
        className
      )}
    >
      <div className="w-16 h-16 rounded-3xl bg-ice-100 text-navy-500 border border-ice-200 flex items-center justify-center mx-auto">
        {icon ? (
          icon
        ) : (
          <PackageOpen className="w-8 h-8 text-aqua-600" />
        )}
      </div>

      <div className="space-y-1.5">
        <h3 className="font-poppins font-bold text-xl text-navy-500">
          {title}
        </h3>
        <p className="text-xs sm:text-sm text-darkNavy/70 leading-relaxed max-w-sm mx-auto">
          {description}
        </p>
      </div>

      {(actionText || secondaryText) && (
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          {actionText && (
            <Button
              variant="primary"
              size="md"
              onClick={onAction}
              className="gap-2 w-full sm:w-auto"
            >
              <span>{actionText}</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          )}

          {secondaryText && (
            <Button
              variant="secondary"
              size="md"
              onClick={onSecondary}
              className="w-full sm:w-auto"
            >
              {secondaryText}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
