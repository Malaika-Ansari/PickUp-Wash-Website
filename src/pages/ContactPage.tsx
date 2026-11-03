import React, { useState } from 'react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { Phone, Mail, MapPin, Clock, MessageSquare, CheckCircle } from 'lucide-react';
import { BUSINESS_INFO, KASUR_SERVICE_AREAS } from '@/utils/constants';

export const ContactPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="py-12 sm:py-16 space-y-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <Badge variant="accent">Customer Support</Badge>
          <h1 className="font-poppins text-3xl sm:text-5xl font-extrabold text-navy-500 tracking-tight">
            We are Here in Kasur to Help
          </h1>
          <p className="text-navy-600/80 text-base leading-relaxed">
            Have questions about pickup timings, bulk household packages, or special garment care? Reach out anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Contact Details Card */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="p-8 border-ice-200 space-y-6">
              <h2 className="font-poppins font-bold text-xl text-navy-500">Contact Information</h2>

              <ul className="space-y-5 text-sm text-navy-700">
                <li className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-ice-100 flex items-center justify-center text-navy-500 shrink-0">
                    <MapPin className="w-5 h-5 text-aqua-500" />
                  </div>
                  <div>
                    <span className="font-semibold block text-navy-900">Service Base</span>
                    <span className="text-xs text-navy-600">{BUSINESS_INFO.location}</span>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-ice-100 flex items-center justify-center text-navy-500 shrink-0">
                    <Phone className="w-5 h-5 text-aqua-500" />
                  </div>
                  <div>
                    <span className="font-semibold block text-navy-900">Direct Helpline & WhatsApp</span>
                    <span className="text-xs text-navy-600">{BUSINESS_INFO.phone}</span>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-ice-100 flex items-center justify-center text-navy-500 shrink-0">
                    <Mail className="w-5 h-5 text-aqua-500" />
                  </div>
                  <div>
                    <span className="font-semibold block text-navy-900">Email Inquiries</span>
                    <span className="text-xs text-navy-600">{BUSINESS_INFO.email}</span>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-ice-100 flex items-center justify-center text-navy-500 shrink-0">
                    <Clock className="w-5 h-5 text-aqua-500" />
                  </div>
                  <div>
                    <span className="font-semibold block text-navy-900">Operating Hours</span>
                    <span className="text-xs text-navy-600">{BUSINESS_INFO.hours}</span>
                  </div>
                </li>
              </ul>
            </Card>

            <Card className="p-6 border-ice-200">
              <h3 className="font-poppins font-semibold text-sm text-navy-500 mb-2">Kasur Service Neighborhoods</h3>
              <p className="text-xs text-navy-600 leading-relaxed">
                Regular daily pickup rounds in Model Town, Steel Bagh, Railway Road, Kot Murad Khan, Shahbaz Khan Road, Circular Road, and adjoining areas.
              </p>
            </Card>
          </div>

          {/* Quick Inquiry Form */}
          <div className="lg:col-span-7">
            <Card className="p-8 sm:p-10 border-ice-200">
              {submitted ? (
                <div className="text-center py-12 space-y-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <h3 className="font-poppins font-bold text-xl text-navy-500">Message Received!</h3>
                  <p className="text-xs sm:text-sm text-navy-600 max-w-sm mx-auto">
                    Thank you for reaching out to Pickup Wash. Our Kasur support team will contact you shortly via phone or WhatsApp.
                  </p>
                  <Button variant="secondary" size="sm" onClick={() => setSubmitted(false)}>
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <h2 className="font-poppins font-bold text-xl text-navy-500">Send an Inquiry</h2>

                  <div>
                    <label className="block text-xs font-semibold text-navy-600 uppercase mb-1.5">
                      Your Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g. Usman Ali"
                      className="w-full px-4 py-2.5 rounded-xl border border-ice-300 text-sm focus:outline-none focus:ring-2 focus:ring-navy-400 bg-ice-50/40"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-navy-600 uppercase mb-1.5">
                      Phone Number (WhatsApp)
                    </label>
                    <input
                      type="tel"
                      required
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="0300 0000000"
                      className="w-full px-4 py-2.5 rounded-xl border border-ice-300 text-sm focus:outline-none focus:ring-2 focus:ring-navy-400 bg-ice-50/40"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-navy-600 uppercase mb-1.5">
                      Message / Question
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="How can we help you today?"
                      className="w-full px-4 py-2.5 rounded-xl border border-ice-300 text-sm focus:outline-none focus:ring-2 focus:ring-navy-400 bg-ice-50/40"
                    />
                  </div>

                  <Button type="submit" size="lg" className="w-full">
                    Submit Message
                  </Button>
                </form>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

