import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock, ShieldCheck, Heart } from 'lucide-react';
import { cn } from '@/utils/cn';

// 1. Footer Brand Column
export interface FooterBrandProps {
  name: string;
  tagline: string;
  description: string;
  badgeText?: string;
  className?: string;
}

export const FooterBrand: React.FC<FooterBrandProps> = ({
  name,
  tagline,
  description,
  badgeText = '100% Hygienic Care Guarantee',
  className,
}) => {
  return (
    <div className={cn('space-y-4', className)}>
      <Link to="/" className="flex items-center gap-3 group">
        <div className="w-10 h-10 rounded-xl bg-navy-500 flex items-center justify-center border border-aqua-400/50 shadow-sm">
          <svg className="w-6 h-6" viewBox="0 0 100 100" fill="none">
            <circle
              cx="50"
              cy="50"
              r="32"
              stroke="#65B9C5"
              strokeWidth="8"
              strokeDasharray="140 30"
              strokeLinecap="round"
            />
            <path
              d="M50 32C46 38 40 45 40 52C40 57.5 44.5 62 50 62C55.5 62 60 57.5 60 52C60 45 54 38 50 32Z"
              fill="#65B9C5"
            />
          </svg>
        </div>
        <div className="flex flex-col">
          <span className="font-poppins font-bold text-xl tracking-tight text-white">
            Pickup<span className="text-aqua-400">Wash</span>
          </span>
          <span className="text-[10px] text-ice-200/70 uppercase tracking-widest font-semibold">
            Kasur City
          </span>
        </div>
      </Link>

      <p className="text-xs sm:text-sm text-ice-200/80 leading-relaxed max-w-sm">
        {description}
      </p>

      {badgeText && (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-aqua-300">
          <ShieldCheck className="w-4 h-4 text-aqua-400" />
          <span>{badgeText}</span>
        </div>
      )}
    </div>
  );
};

// 2. Footer Link List
export interface FooterLinkListProps {
  title: string;
  links: Array<{ label: string; href: string }>;
  className?: string;
}

export const FooterLinkList: React.FC<FooterLinkListProps> = ({
  title,
  links,
  className,
}) => {
  return (
    <div className={cn('space-y-3', className)}>
      <h4 className="font-poppins font-semibold text-white text-sm sm:text-base tracking-wide">
        {title}
      </h4>
      <ul className="space-y-2 text-xs sm:text-sm text-ice-200/80">
        {links.map((link, idx) => (
          <li key={idx}>
            <Link
              to={link.href}
              className="hover:text-aqua-300 transition-colors inline-block py-0.5"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

// 3. Footer Coverage Neighborhood Pills
export interface FooterCoverageCloudProps {
  title?: string;
  areas: string[];
  subtitle?: string;
  className?: string;
}

export const FooterCoverageCloud: React.FC<FooterCoverageCloudProps> = ({
  title = 'Service Areas in Kasur',
  areas,
  subtitle = 'Regular morning & evening doorstep rounds.',
  className,
}) => {
  return (
    <div className={cn('space-y-3', className)}>
      <h4 className="font-poppins font-semibold text-white text-sm sm:text-base tracking-wide">
        {title}
      </h4>
      <div className="flex flex-wrap gap-1.5">
        {areas.map((area, idx) => (
          <span
            key={idx}
            className="px-2.5 py-1 rounded-lg bg-white/10 text-ice-200 text-xs border border-white/5 hover:bg-white/15 hover:text-white transition-colors"
          >
            {area}
          </span>
        ))}
      </div>
      {subtitle && <p className="text-[11px] text-aqua-300/80">{subtitle}</p>}
    </div>
  );
};

// 4. Footer Contact Information Block
export interface FooterContactCardProps {
  title?: string;
  location: string;
  phone: string;
  email: string;
  hours: string;
  className?: string;
}

export const FooterContactCard: React.FC<FooterContactCardProps> = ({
  title = 'Customer Support',
  location,
  phone,
  email,
  hours,
  className,
}) => {
  return (
    <div className={cn('space-y-3', className)}>
      <h4 className="font-poppins font-semibold text-white text-sm sm:text-base tracking-wide">
        {title}
      </h4>
      <ul className="space-y-2.5 text-xs text-ice-200/80">
        <li className="flex items-start gap-2.5">
          <MapPin className="w-4 h-4 text-aqua-400 shrink-0 mt-0.5" />
          <span>{location}</span>
        </li>
        <li className="flex items-center gap-2.5">
          <Phone className="w-4 h-4 text-aqua-400 shrink-0" />
          <a href={`tel:${phone}`} className="hover:text-white">
            {phone}
          </a>
        </li>
        <li className="flex items-center gap-2.5">
          <Mail className="w-4 h-4 text-aqua-400 shrink-0" />
          <a href={`mailto:${email}`} className="hover:text-white">
            {email}
          </a>
        </li>
        <li className="flex items-start gap-2.5">
          <Clock className="w-4 h-4 text-aqua-400 shrink-0 mt-0.5" />
          <span>{hours}</span>
        </li>
      </ul>
    </div>
  );
};

// 5. Footer Copyright Strip
export interface FooterCopyrightProps {
  companyName: string;
  year?: number;
  locationText?: string;
}

export const FooterCopyright: React.FC<FooterCopyrightProps> = ({
  companyName,
  year = new Date().getFullYear(),
  locationText = 'Serving Kasur City',
}) => {
  return (
    <div className="pt-8 border-t border-navy-600/60 flex flex-col sm:flex-row items-center justify-between text-xs text-ice-200/60 gap-4">
      <p>© {year} {companyName}. All rights reserved.</p>
      <div className="flex items-center gap-1.5 text-ice-200/70">
        <span>{locationText}</span>
        <Heart className="w-3.5 h-3.5 text-aqua-400 fill-aqua-400" />
      </div>
    </div>
  );
};

