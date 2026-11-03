import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/utils/cn';

export interface NavLinkProps {
  to: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  badge?: string | number;
  badgeVariant?: 'aqua' | 'navy' | 'neutral';
  onClick?: () => void;
  className?: string;
  isMobile?: boolean;
}

export const NavLink: React.FC<NavLinkProps> = ({
  to,
  children,
  icon,
  badge,
  badgeVariant = 'aqua',
  onClick,
  className,
  isMobile = false,
}) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  const badgeStyles = {
    aqua: 'bg-aqua-100 text-aqua-800 border-aqua-200',
    navy: 'bg-navy-100 text-navy-800 border-navy-200',
    neutral: 'bg-gray-100 text-gray-700 border-gray-200',
  };

  if (isMobile) {
    return (
      <Link
        to={to}
        onClick={onClick}
        className={cn(
          'flex items-center justify-between px-4 py-3 rounded-xl text-base font-medium transition-all duration-200',
          isActive
            ? 'bg-ice-100 text-navy-500 font-semibold'
            : 'text-darkNavy/80 hover:bg-ice-50 hover:text-navy-500',
          className
        )}
      >
        <div className="flex items-center gap-3">
          {icon && <span className="text-navy-400">{icon}</span>}
          <span>{children}</span>
        </div>
        {badge !== undefined && (
          <span
            className={cn(
              'px-2 py-0.5 text-xs font-semibold rounded-full border',
              badgeStyles[badgeVariant]
            )}
          >
            {badge}
          </span>
        )}
      </Link>
    );
  }

  return (
    <Link
      to={to}
      onClick={onClick}
      className={cn(
        'relative inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 group',
        isActive
          ? 'text-navy-500 bg-ice-200/60 font-semibold'
          : 'text-darkNavy/80 hover:text-navy-500 hover:bg-ice-100/70',
        className
      )}
    >
      {icon && (
        <span
          className={cn(
            'transition-colors duration-200',
            isActive ? 'text-navy-500' : 'text-navy-400 group-hover:text-navy-500'
          )}
        >
          {icon}
        </span>
      )}
      <span>{children}</span>

      {badge !== undefined && (
        <span
          className={cn(
            'ml-1 px-1.5 py-0.2 text-[10px] font-bold rounded-full border',
            badgeStyles[badgeVariant]
          )}
        >
          {badge}
        </span>
      )}

      {/* Active under-dot indicator */}
      {isActive && (
        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-aqua-400" />
      )}
    </Link>
  );
};

export interface NavPillProps {
  label: string;
  active: boolean;
  onClick: () => void;
  count?: number;
  icon?: React.ReactNode;
}

export const NavPill: React.FC<NavPillProps> = ({
  label,
  active,
  onClick,
  count,
  icon,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 select-none cursor-pointer',
        active
          ? 'bg-navy-500 text-white shadow-sm shadow-navy-500/20'
          : 'bg-white text-darkNavy/70 hover:text-navy-500 hover:bg-ice-50 border border-ice-200'
      )}
    >
      {icon && <span className={active ? 'text-aqua-300' : 'text-navy-400'}>{icon}</span>}
      <span>{label}</span>
      {count !== undefined && (
        <span
          className={cn(
            'px-1.5 py-0.2 text-[10px] rounded-full font-bold',
            active ? 'bg-white/20 text-white' : 'bg-ice-200 text-navy-700'
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
};
