import React from 'react';
import { Link } from 'react-router-dom';
import { CORE_SERVICES } from '@/utils/constants';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { CheckCircle2, Sparkles, Shield, Clock, Droplets, Flame } from 'lucide-react';

export const ServicesPage: React.FC = () => {
  return (
    <div className="py-12 sm:py-16 space-y-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <Badge variant="accent">Professional Fabric Care</Badge>
          <h1 className="font-poppins text-3xl sm:text-5xl font-extrabold text-navy-500 tracking-tight">
            Our Laundry & Pressing Services
          </h1>
          <p className="text-navy-600/80 text-base sm:text-lg leading-relaxed">
            Every garment is inspected, color-separated, washed with premium detergents, and pressed with high-heat steam for sanitized, wrinkle-free perfection.
          </p>
        </div>

        {/* Services List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          {CORE_SERVICES.map((service) => (
            <Card key={service.id} className="p-8 flex flex-col justify-between border-ice-200">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold uppercase tracking-wider text-aqua-600 bg-aqua-50 px-3 py-1 rounded-full">
                    Turnaround: {service.turnaroundTime}
                  </span>
                  <div className="text-right">
                    <span className="text-xs text-navy-400 font-medium">Starting at</span>
                    <div className="font-poppins font-extrabold text-2xl text-navy-500">
                      PKR {service.pricePerUnit} <span className="text-xs font-normal text-navy-400">/{service.unit}</span>
                    </div>
                  </div>
                </div>

                <h3 className="font-poppins font-bold text-2xl text-navy-500 mb-3">
                  {service.title}
                </h3>
                <p className="text-sm text-navy-600/80 mb-6 leading-relaxed">
                  {service.description}
                </p>

                <h4 className="text-xs font-bold uppercase tracking-wider text-navy-400 mb-3">
                  What is included:
                </h4>
                <ul className="space-y-2.5 mb-8">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-navy-700">
                      <CheckCircle2 className="w-4 h-4 text-aqua-500 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-4 border-t border-ice-200 flex items-center justify-between">
                <span className="text-xs text-navy-400">Kasur doorstep collection</span>
                <Link to={`/book?service=${service.id}`}>
                  <Button size="sm" className="gap-1.5">
                    Book Service
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>

        {/* Hygiene & Quality Promise */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-ice-200 shadow-soft">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="font-poppins text-2xl sm:text-3xl font-bold text-navy-500 mb-2">
              Our 4-Point Quality Guarantee
            </h2>
            <p className="text-xs sm:text-sm text-navy-600/80">
              We handle your clothes with the highest standard of hygiene and fabric safety.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Droplets,
                title: 'Clean Water & Eco Soaps',
                desc: 'Treated water and premium detergents that prevent fabric fading and skin irritation.',
              },
              {
                icon: Shield,
                title: 'No Color Bleeding',
                desc: 'Whites, darks, and delicate embroidery items are always washed in dedicated cycles.',
              },
              {
                icon: Flame,
                title: 'Commercial Steam Press',
                desc: 'Deep steam kills 99.9% of bacteria and creates crisp, long-lasting creases.',
              },
              {
                icon: Clock,
                title: 'On-Time Doorstep Delivery',
                desc: 'Prompt pickup and punctual delivery schedules across all Kasur neighborhoods.',
              },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="p-4 rounded-2xl bg-ice-50/60 border border-ice-200/60 space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-navy-500 text-aqua-400 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="font-poppins font-semibold text-navy-500 text-sm">{item.title}</h4>
                  <p className="text-xs text-navy-600/80 leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

