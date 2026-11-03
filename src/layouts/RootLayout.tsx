import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/common/Footer';
import { MobileBottomBar } from '@/components/layout/MobileBottomBar';
import { SystemStatusBanner } from '@/components/common/SystemStatusBanner';

export const RootLayout: React.FC = () => {
  const { pathname } = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

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
