import React from 'react';
import { cn } from '@/utils/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  hoverEffect = false,
  ...props
}) => {
  return (
    <div
      className={cn(
        'bg-white rounded-2xl border border-ice-200/80 shadow-soft p-6 transition-all duration-300',
        hoverEffect && 'hover:shadow-soft-hover hover:-translate-y-1 hover:border-aqua-200',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

