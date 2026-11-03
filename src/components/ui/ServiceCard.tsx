import React from 'react';
import { CheckCircle2, Clock, Sparkles } from 'lucide-react';
import { Button } from './Button';
import { cn } from '@/utils/cn';

export interface ServiceCardProps {
  id: string;
  title: string;
  description: string;
  pricePerUnit: number;
  unit: 'suit' | 'kg' | 'piece' | string;
  turnaroundTime: string;
  features: string[];
  popular?: boolean;
  icon?: React.ReactNode;
  onSelect?: (id: string) => void;
  ctaText?: string;
  className?: string;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  id,
  title,
  description,
  pricePerUnit,
  unit,
  turnaroundTime,
  features,
  popular = false,
  icon,
  onSelect,
  ctaText = 'Book Service',
  className,
}) => {
  return (
    <div
      className={cn(
        'relative rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 group',
        popular
          ? 'bg-navy-500 text-white shadow-soft-hover ring-2 ring-aqua-400'
          : 'bg-white text-darkNavy border border-ice-200 shadow-soft hover:shadow-soft-hover hover:border-aqua-300 hover:-translate-y-1',
        className
      )}
    >
      {/* Popular Ribbon */}
      {popular && (
        <div className="absolute -top-3 right-6 px-3.5 py-1 rounded-full bg-aqua-400 text-darkNavy font-poppins text-xs font-bold tracking-wide shadow-sm flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Most Popular in Kasur</span>
        </div>
      )}

      <div>
        {/* Top Header: Icon & Turnaround Badge */}
        <div className="flex items-center justify-between mb-5">
          <div
            className={cn(
              'w-12 h-12 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-105',
              popular
                ? 'bg-white/10 text-aqua-300 border border-white/15'
                : 'bg-ice-100 text-navy-500 border border-ice-200'
            )}
          >
            {icon ? (
              icon
            ) : (
              <svg className="w-6 h-6" viewBox="0 0 100 100" fill="none">
                <circle
                  cx="50"
                  cy="50"
                  r="32"
                  stroke={popular ? '#65B9C5' : '#173B57'}
                  strokeWidth="8"
                  strokeDasharray="140 30"
                  strokeLinecap="round"
                />
                <circle cx="50" cy="50" r="14" fill={popular ? '#65B9C5' : '#65B9C5'} />
              </svg>
            )}
          </div>

          <div
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium',
              popular
                ? 'bg-white/15 text-ice-200'
                : 'bg-ice-100 text-navy-600 border border-ice-200'
            )}
          >
            <Clock className="w-3.5 h-3.5 text-aqua-400" />
            <span>{turnaroundTime}</span>
          </div>
        </div>

        {/* Service Title */}
        <h3
          className={cn(
            'font-poppins font-bold text-xl sm:text-2xl mb-2 tracking-tight',
            popular ? 'text-white' : 'text-navy-500'
          )}
        >
          {title}
        </h3>

        {/* Description */}
        <p
          className={cn(
            'text-xs sm:text-sm mb-6 leading-relaxed',
            popular ? 'text-ice-200/90' : 'text-darkNavy/70'
          )}
        >
          {description}
        </p>

        {/* Price Tag */}
        <div className="mb-6 pb-6 border-b border-current/10">
          <span
            className={cn(
              'text-[11px] font-semibold uppercase tracking-wider block mb-1',
              popular ? 'text-aqua-300' : 'text-navy-400'
            )}
          >
            Kasur Rate
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm font-semibold uppercase">PKR</span>
            <span
              className={cn(
                'font-poppins font-extrabold text-3xl sm:text-4xl tracking-tight',
                popular ? 'text-white' : 'text-navy-500'
              )}
            >
              {pricePerUnit}
            </span>
            <span
              className={cn(
                'text-xs font-medium',
                popular ? 'text-ice-200' : 'text-darkNavy/60'
              )}
            >
              /{unit}
            </span>
          </div>
        </div>

        {/* Feature List */}
        <div className="space-y-2.5 mb-8">
          <span
            className={cn(
              'text-[11px] font-bold uppercase tracking-wider block',
              popular ? 'text-aqua-300' : 'text-navy-400'
            )}
          >
            What is included:
          </span>
          {features.map((feature, idx) => (
            <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm">
              <CheckCircle2
                className={cn(
                  'w-4 h-4 shrink-0 mt-0.5',
                  popular ? 'text-aqua-300' : 'text-aqua-500'
                )}
              />
              <span className={popular ? 'text-ice-100' : 'text-darkNavy/85'}>
                {feature}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Action Button */}
      <Button
        variant={popular ? 'accent' : 'primary'}
        size="md"
        fullWidth
        onClick={() => onSelect && onSelect(id)}
        className="font-semibold"
      >
        {ctaText}
      </Button>
    </div>
  );
};
