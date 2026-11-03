import React from 'react';
import {
  FooterBrand,
  FooterLinkList,
  FooterCoverageCloud,
  FooterContactCard,
  FooterCopyright,
} from '@/components/ui';
import { BUSINESS_INFO, KASUR_SERVICE_AREAS } from '@/utils/constants';

export const Footer: React.FC = () => {
  const quickLinks = [
    { label: 'Our Services & Rates', href: '/services' },
    { label: 'How It Works', href: '/how-it-works' },
    { label: 'Pricing & Plans', href: '/pricing' },
    { label: 'Schedule a Pickup', href: '/book' },
    { label: 'Track Your Order Status', href: '/track' },
    { label: 'About Pickup Wash', href: '/about' },
    { label: 'Customer Support', href: '/contact' },
    { label: 'Brand & Design System', href: '/design-system' },
  ];

  return (
    <footer className="bg-navy-700 text-white pt-16 pb-8 border-t border-navy-600/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12">
          {/* Brand Column */}
          <FooterBrand
            name="Pickup Wash"
            tagline="Kasur City Doorstep Laundry"
            description="Kasur’s premier doorstep laundry solution. We collect your laundry, wash with fabric-safe detergents, precision steam press, and deliver back clean and crisp."
            badgeText="100% Hygienic Care Guarantee"
          />

          {/* Quick Links Column */}
          <FooterLinkList title="Quick Links" links={quickLinks} />

          {/* Coverage Cloud Column */}
          <FooterCoverageCloud
            title="Service Areas in Kasur"
            areas={KASUR_SERVICE_AREAS.slice(0, 8)}
            subtitle="Expanding rapidly across all Kasur union councils."
          />

          {/* Contact Details Column */}
          <FooterContactCard
            title="Contact & Hours"
            location={BUSINESS_INFO.location}
            phone={BUSINESS_INFO.phone}
            email={BUSINESS_INFO.email}
            hours={BUSINESS_INFO.hours}
          />
        </div>

        {/* Bottom Copyright Strip */}
        <FooterCopyright
          companyName="Pickup Wash (Kasur)"
          year={new Date().getFullYear()}
          locationText="Built with care for Kasur City"
        />
      </div>
    </footer>
  );
};
