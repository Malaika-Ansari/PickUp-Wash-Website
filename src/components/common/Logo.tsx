import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/utils/cn';

export interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  className?: string;
  onClick?: () => void;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showTagline = true,
  className,
  onClick,
}) => {
  const iconSizes = {
    sm: 'w-8 h-8 rounded-xl',
    md: 'w-10 h-10 rounded-2xl',
    lg: 'w-12 h-12 rounded-2xl',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl sm:text-2xl',
    lg: 'text-2xl sm:text-3xl',
  };

  return (
    <Link
      to="/"
      onClick={onClick}
      className={cn('inline-flex items-center gap-3 group select-none', className)}
      aria-label="Pickup Wash - Home"
    >
      {/* Laundry Washing Machine & Water Droplet Icon */}
      <div
        className={cn(
          'bg-navy-500 flex items-center justify-center shrink-0 shadow-md shadow-navy-500/20 group-hover:bg-navy-600 transition-colors',
          iconSizes[size]
        )}
      >
        <svg
          className="w-3/5 h-3/5 transition-transform duration-500 group-hover:rotate-45"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          {/* Washing Machine Door / Outer Drum Ring */}
          <circle
            cx="50"
            cy="50"
            r="32"
            stroke="#65B9C5"
            strokeWidth="8"
            strokeDasharray="140 30"
            strokeLinecap="round"
          />
          {/* Water Droplet in Center */}
          <path
            d="M50 32C45 39 39 46 39 53C39 59.1 43.9 64 50 64C56.1 64 61 59.1 61 53C61 46 55 39 50 32Z"
            fill="#65B9C5"
          />
          {/* Inner Light Reflection */}
          <circle cx="53" cy="49" r="3.5" fill="#FFFFFF" opacity="0.85" />
          {/* Soap Bubble */}
          <circle cx="66" cy="34" r="4.5" fill="#FFFFFF" opacity="0.9" />
        </svg>
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col">
        <div className={cn('font-poppins font-bold tracking-tight leading-none', textSizes[size])}>
          <span className="text-navy-500">Pickup</span>
          <span className="text-aqua-400 ml-1">Wash</span>
        </div>
        {showTagline && (
          <span className="text-[10px] uppercase font-semibold tracking-wider text-navy-400 mt-0.5">
            Kasur • Doorstep Laundry
          </span>
        )}
      </div>
    </Link>
  );
};
