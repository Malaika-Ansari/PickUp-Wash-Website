import React from 'react';
import { Container, ContainerProps } from './Container';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { cn } from '@/utils/cn';

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  variant?: 'ice' | 'white' | 'navy' | 'gradient' | 'muted';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  containerSize?: ContainerProps['size'];
  noContainer?: boolean;
  badge?: string;
  title?: string;
  subtitle?: string;
  titleAlign?: 'center' | 'left';
}

export const Section: React.FC<SectionProps> = ({
  children,
  variant = 'ice',
  padding = 'md',
  containerSize = 'xl',
  noContainer = false,
  badge,
  title,
  subtitle,
  titleAlign = 'center',
  className,
  ...props
}) => {
  const variantClasses = {
    ice: 'bg-ice-100 text-darkNavy',
    white: 'bg-white text-darkNavy border-y border-ice-200/60',
    navy: 'bg-navy-700 text-white',
    gradient: 'brand-gradient text-white',
    muted: 'bg-ice-50 text-darkNavy',
  };

  const paddingClasses = {
    none: 'py-0',
    sm: 'py-8 sm:py-12',
    md: 'py-12 sm:py-16 lg:py-20',
    lg: 'py-16 sm:py-24 lg:py-28',
    xl: 'py-20 sm:py-28 lg:py-36',
  };

  const content = (
    <>
      {(title || badge || subtitle) && (
        <div
          className={cn(
            'mb-10 sm:mb-14 space-y-3',
            titleAlign === 'center' ? 'text-center max-w-3xl mx-auto' : 'text-left max-w-2xl'
          )}
        >
          {badge && (
            <div className="inline-block">
              <StatusBadge
                variant={variant === 'navy' || variant === 'gradient' ? 'accent' : 'primary'}
                label={badge}
              />
            </div>
          )}
          {title && (
            <h2
              className={cn(
                'font-poppins font-extrabold text-2xl sm:text-3xl lg:text-4xl tracking-tight leading-tight',
                variant === 'navy' || variant === 'gradient' ? 'text-white' : 'text-navy-500'
              )}
            >
              {title}
            </h2>
          )}
          {subtitle && (
            <p
              className={cn(
                'text-sm sm:text-base leading-relaxed',
                variant === 'navy' || variant === 'gradient' ? 'text-ice-200/90' : 'text-darkNavy/70'
              )}
            >
              {subtitle}
            </p>
          )}
        </div>
      )}
      {children}
    </>
  );

  return (
    <section
      className={cn(
        'relative w-full overflow-hidden',
        variantClasses[variant],
        paddingClasses[padding],
        className
      )}
      {...props}
    >
      {noContainer ? content : <Container size={containerSize}>{content}</Container>}
    </section>
  );
};

