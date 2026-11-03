import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { RootLayout } from '@/layouts/RootLayout';
import { AdminLayout } from '@/layouts/AdminLayout';
import { CustomerLayout } from '@/layouts/CustomerLayout';

// Pages
import { HomePage } from '@/pages/HomePage';
import { ServicesPage } from '@/pages/ServicesPage';
import { HowItWorksPage } from '@/pages/HowItWorksPage';
import { PricingPage } from '@/pages/PricingPage';
import { BookingPage } from '@/pages/BookingPage';
import { BookingConfirmationPage } from '@/pages/BookingConfirmationPage';
import { TrackOrderPage } from '@/pages/TrackOrderPage';
import { AboutPage } from '@/pages/AboutPage';
import { ContactPage } from '@/pages/ContactPage';
import { FAQPage } from '@/pages/FAQPage';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { DesignSystemPage } from '@/pages/DesignSystemPage';
import { CustomerAccountPage } from '@/pages/CustomerAccountPage';
import { ResponsivePreviewPage } from '@/pages/ResponsivePreviewPage';

// Admin Route Guard
const ProtectedAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ice-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy-500"></div>
      </div>
    );
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* 1. Public Root Layout */}
          <Route path="/" element={<RootLayout />}>
            <Route index element={<HomePage />} />
            <Route path="services" element={<ServicesPage />} />
            <Route path="how-it-works" element={<HowItWorksPage />} />
            <Route path="pricing" element={<PricingPage />} />
            <Route path="book" element={<BookingPage />} />
            <Route path="booking-confirmation" element={<BookingConfirmationPage />} />
            <Route path="track" element={<TrackOrderPage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="faq" element={<FAQPage />} />
            <Route path="design-system" element={<DesignSystemPage />} />
            <Route path="responsive-preview" element={<ResponsivePreviewPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>

          {/* 2. Customer Account Layout */}
          <Route path="/account" element={<CustomerLayout />}>
            <Route index element={<CustomerAccountPage />} />
            <Route path="history" element={<CustomerAccountPage />} />
            <Route path="addresses" element={<CustomerAccountPage />} />
            <Route path="profile" element={<CustomerAccountPage />} />
          </Route>

          {/* 3. Admin Protected Operations Layout */}
          <Route
            path="/admin"
            element={
              <ProtectedAdminRoute>
                <AdminLayout />
              </ProtectedAdminRoute>
            }
          >
            <Route index element={<AdminDashboardPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
