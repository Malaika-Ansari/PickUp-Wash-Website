import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import { SystemStatusBanner } from '@/components/common/SystemStatusBanner';

export const RootLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-ice-100 text-navy-900 selection:bg-aqua-400 selection:text-white">
      <SystemStatusBanner />
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

