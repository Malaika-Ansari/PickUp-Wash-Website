import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { CheckCircle2, HelpCircle, ArrowRight } from 'lucide-react';
import { CORE_SERVICES } from '@/utils/constants';

export const PricingPage: React.FC = () => {
  const garmentRates = [
    { item: 'Shalwar Kameez (2-pc)', washAndIron: 'PKR 180', ironOnly: 'PKR 60' },
    { item: 'Kurta Only', washAndIron: 'PKR 110', ironOnly: 'PKR 40' },
    { item: 'Formal Shirt / T-Shirt', washAndIron: 'PKR 100', ironOnly: 'PKR 35' },
    { item: 'Trousers / Jeans', washAndIron: 'PKR 110', ironOnly: 'PKR 40' },
    { item: 'Ladies 3-pc Suit (Simple)', washAndIron: 'PKR 240', ironOnly: 'PKR 90' },
    { item: 'Ladies Fancy / Embroidered Suit', washAndIron: 'PKR 350', ironOnly: 'PKR 140' },
    { item: 'Bed Sheet (Single)', washAndIron: 'PKR 150', ironOnly: 'PKR 60' },
    { item: 'Bed Sheet (King/Double)', washAndIron: 'PKR 250', ironOnly: 'PKR 90' },
    { item: 'Blanket / Comforter (Single)', washAndIron: 'PKR 450 (Deep Clean)', ironOnly: '-' },
    { item: 'Blanket / Comforter (Double)', washAndIron: 'PKR 650 (Deep Clean)', ironOnly: '-' },
  ];

  return (
    <div className="py-12 sm:py-16 space-y-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <Badge variant="primary">Simple & Transparent Rates</Badge>
          <h1 className="font-poppins text-3xl sm:text-5xl font-extrabold text-navy-500 tracking-tight">
            Fair Laundry Pricing in Kasur
          </h1>
          <p className="text-navy-600/80 text-base leading-relaxed">
            No surprise add-ons. No hidden service charges. Pay conveniently with Cash on Delivery or JazzCash/EasyPaisa.
          </p>
        </div>

        {/* Pricing Highlights Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card className="p-8 border-ice-200">
            <span className="text-xs font-bold uppercase tracking-wider text-navy-400">Casual & Daily</span>
            <h3 className="font-poppins font-bold text-xl text-navy-500 mt-1 mb-2">Wash & Fold (Bulk)</h3>
            <div className="flex items-baseline gap-1 my-4">
              <span className="font-poppins font-extrabold text-3xl text-navy-500">PKR 160</span>
              <span className="text-xs text-navy-400">/ kg</span>
            </div>
            <p className="text-xs text-navy-600/80 mb-6">
              Best for everyday clothes, gym wear, towels, and student laundry. Weighed accurately at pickup.
            </p>
            <Link to="/book?service=wash-and-fold">
              <Button variant="secondary" className="w-full text-xs">Book Wash & Fold</Button>
            </Link>
          </Card>

          <Card className="p-8 border-aqua-400 ring-2 ring-aqua-400/40 shadow-soft-hover relative">
            <span className="absolute -top-3 right-6 px-3 py-0.5 rounded-full bg-navy-500 text-white text-[11px] font-bold">
              Most Popular
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-aqua-600">Complete Care</span>
            <h3 className="font-poppins font-bold text-xl text-navy-500 mt-1 mb-2">Wash & Steam Iron</h3>
            <div className="flex items-baseline gap-1 my-4">
              <span className="font-poppins font-extrabold text-3xl text-navy-500">PKR 180</span>
              <span className="text-xs text-navy-400">/ suit</span>
            </div>
            <p className="text-xs text-navy-600/80 mb-6">
              Full premium service: wash, soften, and crisp steam press for Shalwar Kameez and formal clothing.
            </p>
            <Link to="/book?service=wash-and-iron">
              <Button variant="primary" className="w-full text-xs">Book Wash & Iron</Button>
            </Link>
          </Card>

          <Card className="p-8 border-ice-200">
            <span className="text-xs font-bold uppercase tracking-wider text-navy-400">Quick Crisp</span>
            <h3 className="font-poppins font-bold text-xl text-navy-500 mt-1 mb-2">Steam Iron Only</h3>
            <div className="flex items-baseline gap-1 my-4">
              <span className="font-poppins font-extrabold text-3xl text-navy-500">PKR 60</span>
              <span className="text-xs text-navy-400">/ suit</span>
            </div>
            <p className="text-xs text-navy-600/80 mb-6">
              Wrinkle-free high pressure steam press. Perfect for work shirts, office wear, and Friday suits.
            </p>
            <Link to="/book?service=steam-iron-only">
              <Button variant="secondary" className="w-full text-xs">Book Steam Press</Button>
            </Link>
          </Card>
        </div>

        {/* Detailed Itemized Rate Card Table */}
        <div className="bg-white rounded-3xl border border-ice-200 overflow-hidden shadow-soft mb-16">
          <div className="p-6 sm:p-8 border-b border-ice-200 bg-ice-50/50">
            <h2 className="font-poppins font-bold text-xl sm:text-2xl text-navy-500">
              Detailed Garment Rate Card
            </h2>
            <p className="text-xs sm:text-sm text-navy-600/80 mt-1">
              Standard individual garment rates for Kasur City residents.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-navy-500 text-white font-poppins text-xs uppercase tracking-wider">
                <tr>
                  <th className="py-4 px-6">Garment / Item</th>
                  <th className="py-4 px-6">Wash & Steam Iron</th>
                  <th className="py-4 px-6">Iron Only</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ice-200 text-xs sm:text-sm text-navy-700">
                {garmentRates.map((row, i) => (
                  <tr key={i} className="hover:bg-ice-50/50 transition-colors">
                    <td className="py-4 px-6 font-medium text-navy-900">{row.item}</td>
                    <td className="py-4 px-6 font-semibold text-navy-700">{row.washAndIron}</td>
                    <td className="py-4 px-6 text-navy-600">{row.ironOnly}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Free Delivery & Payment Policy */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-ice-200 space-y-3">
            <h4 className="font-poppins font-semibold text-base text-navy-500">
              Pickup & Delivery Policy
            </h4>
            <ul className="space-y-2 text-xs text-navy-600/80 leading-relaxed">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-aqua-500 shrink-0" />
                <span><strong>Free Doorstep Pickup & Delivery</strong> on orders of PKR 500 or more.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-aqua-500 shrink-0" />
                <span>Small nominal delivery fee of PKR 100 on orders below PKR 500 anywhere in Kasur.</span>
              </li>
            </ul>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-ice-200 space-y-3">
            <h4 className="font-poppins font-semibold text-base text-navy-500">
              Accepted Payment Methods
            </h4>
            <ul className="space-y-2 text-xs text-navy-600/80 leading-relaxed">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-aqua-500 shrink-0" />
                <span><strong>Cash on Delivery (COD)</strong> upon receiving your fresh laundry.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-aqua-500 shrink-0" />
                <span><strong>JazzCash & EasyPaisa</strong> digital wallet transfer directly to our business number.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

