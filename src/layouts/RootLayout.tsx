import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/common/Footer';
import { MobileBottomBar } from '@/components/layout/MobileBottomBar';
import { SystemStatusBanner } from '@/components/common/SystemStatusBanner';

export const RootLayout: React.FC = () => {
  const location = useLocation();

  // Scroll to top or target hash element on route change
  useEffect(() => {
    if (location.hash) {
      const el = document.getElementById(location.hash.replace('#', ''));
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 100);
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [location.pathname, location.hash]);

  return (
    <div className="min-h-screen flex flex-col bg-ice-100 text-darkNavy selection:bg-aqua-400 selection:text-white pb-16 sm:pb-0 relative overflow-x-hidden">
      <SystemStatusBanner />
      <Header />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
      <MobileBottomBar />
    </div>
  );
};
