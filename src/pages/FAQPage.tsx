import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronDown,
  HelpCircle,
  Search,
  MessageSquare,
  CalendarCheck,
  CheckCircle2,
  Sparkles,
  PhoneCall,
  Clock,
  ShieldAlert,
  CreditCard,
  Truck,
  ArrowRight,
  Layers,
} from 'lucide-react';
import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { BUSINESS_INFO } from '@/utils/constants';
import { SEO } from '@/components/common/SEO';

interface FAQItem {
  id: number;
  category: 'general' | 'pricing' | 'policies';
  categoryLabel: string;
  question: string;
  answer: string;
  icon?: React.ReactNode;
}

export const FAQPage: React.FC = () => {
  // Exact 9 Questions and Answers required by the prompt
  const faqData: FAQItem[] = [
    {
      id: 1,
      category: 'general',
      categoryLabel: 'Service & Areas',
      question: 'Which areas do you serve?',
      answer: 'Pickup Wash serves the entire Kasur city.',
      icon: <Truck className="w-5 h-5 text-aqua-600" />,
    },
    {
      id: 2,
      category: 'general',
      categoryLabel: 'Service & Areas',
      question: 'How does the service work?',
      answer:
        'Book a pickup, we collect your clothes, wash and iron them, and return them to your doorstep.',
      icon: <Sparkles className="w-5 h-5 text-navy-500" />,
    },
    {
      id: 3,
      category: 'pricing',
      categoryLabel: 'Pricing & Packages',
      question: 'How much do you charge?',
      answer: 'We offer affordable per-kilo rates. Contact us for current pricing.',
      icon: <CreditCard className="w-5 h-5 text-emerald-600" />,
    },
    {
      id: 4,
      category: 'pricing',
      categoryLabel: 'Pricing & Packages',
      question: 'Is the first pickup free?',
      answer: 'Yes, your first pickup is free.',
      icon: <Sparkles className="w-5 h-5 text-aqua-600" />,
    },
    {
      id: 5,
      category: 'pricing',
      categoryLabel: 'Pricing & Packages',
      question: 'Do you offer monthly packages?',
      answer: 'Yes, monthly packages are available. Contact us for details.',
      icon: <Layers className="w-5 h-5 text-purple-600" />,
    },
    {
      id: 6,
      category: 'general',
      categoryLabel: 'Service & Areas',
      question: 'How long does delivery take?',
      answer:
        'Delivery is available the same day or the next day, depending on the service.',
      icon: <Clock className="w-5 h-5 text-aqua-600" />,
    },
    {
      id: 7,
      category: 'pricing',
      categoryLabel: 'Pricing & Packages',
      question: 'Which payment methods do you accept?',
      answer: 'Cash on delivery, JazzCash, Easypaisa, and bank transfer.',
      icon: <CreditCard className="w-5 h-5 text-emerald-600" />,
    },
    {
      id: 8,
      category: 'policies',
      categoryLabel: 'Policies & Bookings',
      question: 'Can I cancel or reschedule?',
      answer: 'You can cancel or reschedule within 3 hours.',
      icon: <Clock className="w-5 h-5 text-amber-600" />,
    },
    {
      id: 9,
      category: 'policies',
      categoryLabel: 'Policies & Bookings',
      question: 'What happens if clothes are damaged?',
      answer:
        'Pickup Wash offers compensation or 50% off your next booking according to its damage policy.',
      icon: <ShieldAlert className="w-5 h-5 text-navy-500" />,
    },
  ];

  // Accordion open/close state: can toggle individual or multiple items
  const [openIds, setOpenIds] = useState<number[]>([1, 2]); // default open first two
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const toggleItem = (id: number) => {
    setOpenIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleExpandAll = () => {
    setOpenIds(faqData.map((item) => item.id));
  };

  const handleCollapseAll = () => {
    setOpenIds([]);
  };

  // Filtered FAQs based on category and search query
  const filteredFAQs = useMemo(() => {
    return faqData.filter((item) => {
      const matchesCategory =
        activeCategory === 'all' || item.category === activeCategory;
      const matchesSearch =
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [faqData, activeCategory, searchQuery]);

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      <SEO
        title="Frequently Asked Questions (FAQ)"
        description="Got questions about laundry turnaround, turnaround times, rates, packaging, or 3-hour rescheduling policies in Kasur? Find all answers here."
      />
      {/* =========================================================================
          1. HERO SECTION
         ========================================================================= */}
      <section className="relative overflow-hidden bg-ice-100 pt-12 pb-16 sm:pt-16 sm:pb-20 border-b border-ice-200/70">
        {/* Soft background ambient blur circles */}
        <div
          className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-aqua-200/40 rounded-full blur-3xl pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-ice-300/60 blur-3xl pointer-events-none"
          aria-hidden="true"
        />

        <Container size="xl" className="relative z-10 text-center max-w-4xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-ice-200 shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-aqua-400" />
            <span className="text-xs font-semibold text-navy-500 tracking-wide uppercase">
              Help Center • Pickup Wash Kasur
            </span>
          </div>

          <h1 className="font-poppins text-4xl sm:text-5xl lg:text-6xl font-extrabold text-navy-500 tracking-tight leading-[1.15]">
            Frequently Asked Questions
          </h1>

          <p className="font-inter text-base sm:text-lg text-darkNavy/80 max-w-2xl mx-auto leading-relaxed pt-1">
            Quick, clear answers to common questions about our doorstep laundry service, rates,
            pickup timing, and customer policies across Kasur City.
          </p>

          {/* Search Bar */}
          <div className="pt-4 max-w-md mx-auto">
            <Input
              type="text"
              placeholder="Search questions (e.g. areas, payment, pricing)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-darkNavy/40" />}
              clearable={searchQuery.length > 0}
              onClear={() => setSearchQuery('')}
              className="bg-white shadow-card border-ice-300"
            />
          </div>
        </Container>
      </section>

      {/* =========================================================================
          2. EXPANDABLE FAQ ACCORDION SECTION
         ========================================================================= */}
      <section>
        <Container size="lg" className="space-y-8">
          
          {/* Controls Bar: Category Filter Chips & Expand/Collapse Toggle */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-2 border-b border-ice-200">
            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: 'all', label: 'All Questions' },
                { id: 'general', label: 'Service & Areas' },
                { id: 'pricing', label: 'Pricing & Packages' },
                { id: 'policies', label: 'Policies' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveCategory(tab.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all select-none ${
                    activeCategory === tab.id
                      ? 'bg-navy-500 text-white shadow-sm'
                      : 'bg-white text-darkNavy/70 hover:bg-ice-100 hover:text-navy-600 border border-ice-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Expand / Collapse Controls */}
            <div className="flex items-center gap-2 text-xs">
              <button
                type="button"
                onClick={handleExpandAll}
                className="text-navy-600 hover:text-aqua-600 font-semibold px-2 py-1 rounded hover:bg-ice-100 transition-colors"
              >
                Expand All
              </button>
              <span className="text-ice-300">|</span>
              <button
                type="button"
                onClick={handleCollapseAll}
                className="text-darkNavy/60 hover:text-navy-600 font-medium px-2 py-1 rounded hover:bg-ice-100 transition-colors"
              >
                Collapse All
              </button>
            </div>
          </div>

          {/* Accordion Items List */}
          {filteredFAQs.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-ice-200 space-y-3">
              <HelpCircle className="w-12 h-12 text-darkNavy/30 mx-auto" />
              <h3 className="font-poppins font-bold text-lg text-navy-500">
                No matching questions found
              </h3>
              <p className="text-xs text-darkNavy/60 max-w-sm mx-auto">
                Try searching for different keywords or clear your search filter to see all questions.
              </p>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('all');
                }}
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFAQs.map((item, index) => {
                const isOpen = openIds.includes(item.id);

                return (
                  <div
                    key={item.id}
                    className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden shadow-soft ${
                      isOpen
                        ? 'border-aqua-300 ring-2 ring-aqua-400/20 shadow-soft-hover'
                        : 'border-ice-200 hover:border-ice-300'
                    }`}
                  >
                    {/* Accordion Trigger Button */}
                    <button
                      type="button"
                      onClick={() => toggleItem(item.id)}
                      aria-expanded={isOpen}
                      className="w-full text-left p-5 sm:p-6 flex items-start justify-between gap-4 cursor-pointer focus:outline-none focus-visible:bg-ice-50 transition-colors"
                    >
                      <div className="flex items-start gap-3.5">
                        {/* Number Index */}
                        <span className="font-poppins font-extrabold text-sm sm:text-base text-navy-400 shrink-0 mt-0.5">
                          {String(index + 1).padStart(2, '0')}.
                        </span>

                        <div>
                          <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-aqua-700 bg-ice-50 px-2 py-0.5 rounded border border-ice-200 mb-1.5">
                            {item.categoryLabel}
                          </span>
                          <h3 className="font-poppins font-bold text-base sm:text-lg text-navy-500 leading-snug">
                            {item.question}
                          </h3>
                        </div>
                      </div>

                      {/* Expand / Collapse Chevron */}
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 ${
                          isOpen
                            ? 'bg-aqua-400 text-darkNavy rotate-180'
                            : 'bg-ice-100 text-navy-500'
                        }`}
                      >
                        <ChevronDown className="w-5 h-5" />
                      </div>
                    </button>

                    {/* Expandable Answer Content */}
                    {isOpen && (
                      <div className="px-5 sm:px-6 pb-6 pt-1 text-sm sm:text-base text-darkNavy/85 leading-relaxed font-inter border-t border-ice-100">
                        <div className="pt-3 pl-8 sm:pl-9 flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                          <p className="font-medium text-darkNavy">
                            {item.answer}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

        </Container>
      </section>

      {/* =========================================================================
          3. STILL HAVE QUESTIONS CTA
         ========================================================================= */}
      <section>
        <Container size="xl">
          <div className="rounded-3xl bg-gradient-to-r from-navy-500 via-navy-600 to-navy-700 text-white p-8 sm:p-12 lg:p-16 shadow-xl relative overflow-hidden">
            <div
              className="absolute top-0 right-0 translate-x-12 -translate-y-12 w-80 h-80 bg-aqua-400/20 rounded-full blur-3xl pointer-events-none"
              aria-hidden="true"
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
              <div className="lg:col-span-8 space-y-4 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-aqua-300 text-xs font-semibold backdrop-blur-sm">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Personal Support in Kasur</span>
                </div>

                <h2 className="font-poppins font-extrabold text-2xl sm:text-4xl text-white tracking-tight leading-tight">
                  Still Have Questions?
                </h2>

                <p className="text-ice-200/90 text-sm sm:text-base max-w-2xl leading-relaxed font-inter">
                  We are always ready to assist you. Contact our Kasur customer support team with any
                  questions, or book your first doorstep pickup for free!
                </p>
              </div>

              <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 justify-center items-center lg:items-end">
                <Link to="/book" className="w-full sm:w-auto lg:w-full">
                  <Button
                    size="lg"
                    variant="accent"
                    fullWidth
                    className="gap-2.5 font-bold shadow-aqua text-darkNavy py-4 text-base"
                    leftIcon={<CalendarCheck className="w-5 h-5 text-darkNavy" />}
                  >
                    Book a Pickup
                  </Button>
                </Link>

                <Link to="/contact" className="w-full sm:w-auto lg:w-full">
                  <Button
                    size="md"
                    variant="secondary"
                    fullWidth
                    className="gap-2 text-xs text-navy-500 bg-white/95 hover:bg-white"
                    leftIcon={<MessageSquare className="w-4 h-4 text-aqua-600" />}
                  >
                    Contact Support
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
};

