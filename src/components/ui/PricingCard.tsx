import React from 'react';
import { Check, Star, ShieldCheck } from 'lucide-react';
import { Button } from './Button';
import { cn } from '@/utils/cn';

export interface PricingCardProps {
  name: string;
  badge?: string;
  price: number;
  unit: string;
  description: string;
  turnaround: string;
  perks: string[];
  isHighlighted?: boolean;
  ctaText?: string;
  onSelect?: () => void;
  className?: string;
}

export const PricingCard: React.FC<PricingCardProps> = ({
  name,
  badge,
  price,
  unit,
  description,
  turnaround,
  perks,
  isHighlighted = false,
  ctaText = 'Choose Plan',
  onSelect,
  className,
}) => {
  return (
    <div
      className={cn(
        'relative rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300',
        isHighlighted
          ? 'bg-white border-2 border-aqua-400 shadow-soft-hover ring-4 ring-aqua-100/50 -translate-y-1'
          : 'bg-white border border-ice-200 shadow-soft hover:shadow-soft-hover hover:border-ice-300',
        className
      )}
    >
      {badge && (
        <span
          className={cn(
            'absolute -top-3.5 right-6 px-3.5 py-1 rounded-full text-xs font-poppins font-bold tracking-wide shadow-sm flex items-center gap-1.5',
            isHighlighted
              ? 'bg-navy-500 text-white'
              : 'bg-aqua-100 text-navy-800 border border-aqua-200'
          )}
        >
          <Star className="w-3.5 h-3.5 text-aqua-400 fill-aqua-400" />
          {badge}
        </span>
      )}

      <div>
        <h3 className="font-poppins font-bold text-xl sm:text-2xl text-navy-500 mb-2">
          {name}
        </h3>
        <p className="text-xs sm:text-sm text-darkNavy/70 mb-6 leading-relaxed">
          {description}
        </p>

        {/* Price Block */}
        <div className="p-4 rounded-2xl bg-ice-50 border border-ice-200/70 mb-6">
          <div className="flex items-baseline gap-1.5">
            <span className="text-xs font-bold text-navy-400 uppercase">PKR</span>
            <span className="font-poppins font-extrabold text-3xl sm:text-4xl text-navy-500 tracking-tight">
              {price}
            </span>
            <span className="text-xs font-medium text-darkNavy/60">/{unit}</span>
          </div>
          <div className="mt-1 text-[11px] font-semibold text-aqua-600 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Turnaround: {turnaround}</span>
          </div>
        </div>

        {/* Perks Checklist */}
        <div className="space-y-3 mb-8">
          <span className="text-[11px] font-bold uppercase tracking-wider text-navy-400 block">
            Plan Benefits:
          </span>
          {perks.map((perk, idx) => (
            <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-darkNavy/80">
              <div className="w-4 h-4 rounded-full bg-aqua-100 text-aqua-700 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              </div>
              <span>{perk}</span>
            </div>
          ))}
        </div>
      </div>

      <Button
        variant={isHighlighted ? 'primary' : 'secondary'}
        size="md"
        fullWidth
        onClick={onSelect}
        className={cn('font-semibold', isHighlighted && 'bg-navy-500 hover:bg-navy-600')}
      >
        {ctaText}
      </Button>
    </div>
  );
};

