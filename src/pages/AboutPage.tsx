import React from 'react';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { ShieldCheck, Heart, Users, Sparkles, MapPin } from 'lucide-react';
import { BUSINESS_INFO } from '@/utils/constants';

export const AboutPage: React.FC = () => {
  return (
    <div className="py-12 sm:py-16 space-y-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <Badge variant="accent">Our Startup Journey</Badge>
          <h1 className="font-poppins text-3xl sm:text-5xl font-extrabold text-navy-500 tracking-tight">
            Modern Laundry Care for Kasur City
          </h1>
          <p className="text-navy-600/80 text-base sm:text-lg leading-relaxed">
            Pickup Wash was founded to relieve households, working professionals, and students in Kasur from the weekly chore of washing and ironing.
          </p>
        </div>

        {/* Mission & Story Card */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <Card className="p-8 sm:p-10 border-ice-200 space-y-6">
            <h2 className="font-poppins font-bold text-2xl text-navy-500">
              Why We Started Pickup Wash
            </h2>
            <div className="space-y-4 text-sm text-navy-700/80 leading-relaxed">
              <p>
                In Kasur, keeping traditional and modern clothes in pristine condition requires countless hours: soaking, scrubbing, line drying in unpredictable weather, and tedious pressing with hot irons.
              </p>
              <p>
                We built Pickup Wash as a technology-first, reliable doorstep laundry service. With our modern commercial washers, fabric-softening rinses, and crisp steam press equipment, we deliver laundry that smells fresh, looks crisp, and extends the lifespan of your garments.
              </p>
            </div>
            <div className="pt-2 flex items-center gap-2 text-xs font-semibold text-aqua-600">
              <MapPin className="w-4 h-4" />
              <span>Proudly rooted in Kasur City, Punjab</span>
            </div>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                icon: ShieldCheck,
                title: 'Hygienic Standards',
                desc: 'Clean water, branded detergents, and zero cross-contamination between customer batches.',
              },
              {
                icon: Heart,
                title: 'Fabric Safety',
                desc: 'Delicate silks, embroidery, and lawn fabrics are washed on tailored gentle cycles.',
              },
              {
                icon: Users,
                title: 'Built for Families',
                desc: 'Cost-effective bulk plans so parents and students can reclaim their weekends.',
              },
              {
                icon: Sparkles,
                title: 'Steam Finishing',
                desc: 'Sharp collars, smooth cuffs, and flawless pleats on all traditional shalwar kameez.',
              },
            ].map((val, idx) => {
              const Icon = val.icon;
              return (
                <Card key={idx} className="p-6 border-ice-200 space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-navy-50 text-navy-500 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-aqua-500" />
                  </div>
                  <h3 className="font-poppins font-semibold text-sm text-navy-500">{val.title}</h3>
                  <p className="text-xs text-navy-600/80 leading-relaxed">{val.desc}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

