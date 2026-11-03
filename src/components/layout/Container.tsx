import React from 'react';
import { cn } from '@/utils/cn';

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  noPadding?: boolean;
}

export const Container: React.FC<ContainerProps> = ({
  children,
  size = 'xl',
  noPadding = false,
  className,
  ...props
}) => {
  const sizeClasses = {
    sm: 'max-w-3xl',    // ~768px (article, reading, small forms)
    md: 'max-w-5xl',    // ~1024px (standard forms, account pages)
    lg: 'max-w-6xl',    // ~1152px
    xl: 'max-w-7xl',    // ~1280px (standard full content width)
    full: 'max-w-full', // 100% full width
  };

  return (
    <div
      className={cn(
        'w-full mx-auto',
        sizeClasses[size],
        !noPadding && 'px-4 sm:px-6 lg:px-8',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
