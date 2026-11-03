import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface RadioCardProps {
  id: string;
  name: string;
  value: string;
  checked: boolean;
  onChange: (value: string) => void;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  badge?: string;
  disabled?: boolean;
  className?: string;
}

export const RadioCard: React.FC<RadioCardProps> = ({
  id,
  name,
  value,
  checked,
  onChange,
  title,
  description,
  icon,
  badge,
  disabled = false,
  className,
}) => {
  return (
    <label
      htmlFor={id}
      className={cn(
        'relative flex items-start gap-3.5 p-4 rounded-2xl border transition-all duration-200 cursor-pointer select-none',
        checked
          ? 'bg-aqua-50/50 border-aqua-400 ring-2 ring-aqua-400/25 shadow-sm'
          : 'bg-white border-ice-200 hover:border-ice-300 hover:bg-ice-50/50',
        disabled && 'opacity-50 cursor-not-allowed bg-ice-100 border-ice-200',
        className
      )}
    >
      <input
        type="radio"
        id={id}
        name={name}
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={() => onChange(value)}
        className="sr-only"
      />

      {/* Custom Radio Bubble */}
      <div
        className={cn(
          'w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-colors',
          checked
            ? 'bg-aqua-400 border-aqua-400 text-darkNavy'
            : 'border-ice-300 bg-white'
        )}
      >
        {checked && <Check className="w-3 h-3 stroke-[3]" />}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {icon && <span className="text-navy-500 shrink-0">{icon}</span>}
            <span
              className={cn(
                'text-sm font-semibold truncate',
                checked ? 'text-navy-900' : 'text-darkNavy'
              )}
            >
              {title}
            </span>
          </div>

          {badge && (
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-aqua-100 text-aqua-800 border border-aqua-200">
              {badge}
            </span>
          )}
        </div>

        {description && (
          <p className="text-xs text-darkNavy/70 mt-1 leading-normal">
            {description}
          </p>
        )}
      </div>
    </label>
  );
};
