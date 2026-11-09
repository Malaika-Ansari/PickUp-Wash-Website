import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { RootLayout } from '@/layouts/RootLayout';
import { AdminLayout } from '@/layouts/AdminLayout';
import { CustomerLayout } from '@/layouts/CustomerLayout';

// Pages - Lazy loaded for production performance and optimal bundle chunking
const HomePage = lazy(() => import('@/pages/HomePage').then((m) => ({ default: m.HomePage })));
const ServicesPage = lazy(() => import('@/pages/ServicesPage').then((m) => ({ default: m.ServicesPage })));
const HowItWorksPage = lazy(() => import('@/pages/HowItWorksPage').then((m) => ({ default: m.HowItWorksPage })));
const PricingPage = lazy(() => import('@/pages/PricingPage').then((m) => ({ default: m.PricingPage })));
const BookingPage = lazy(() => import('@/pages/BookingPage').then((m) => ({ default: m.BookingPage })));
const BookingConfirmationPage = lazy(() => import('@/pages/BookingConfirmationPage').then((m) => ({ default: m.BookingConfirmationPage })));
const TrackOrderPage = lazy(() => import('@/pages/TrackOrderPage').then((m) => ({ default: m.TrackOrderPage })));
const AboutPage = lazy(() => import('@/pages/AboutPage').then((m) => ({ default: m.AboutPage })));
const ContactPage = lazy(() => import('@/pages/ContactPage').then((m) => ({ default: m.ContactPage })));
const FAQPage = lazy(() => import('@/pages/FAQPage').then((m) => ({ default: m.FAQPage })));
const LoginPage = lazy(() => import('@/pages/auth/LoginPage').then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage').then((m) => ({ default: m.RegisterPage })));
const AdminDashboardPage = lazy(() => import('@/pages/admin/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage })));
const AdminLoginPage = lazy(() => import('@/pages/admin/AdminLoginPage').then((m) => ({ default: m.AdminLoginPage })));
const AdminAccessDenied = lazy(() => import('@/components/admin/AdminAccessDenied').then((m) => ({ default: m.AdminAccessDenied })));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })));
const DesignSystemPage = lazy(() => import('@/pages/DesignSystemPage').then((m) => ({ default: m.DesignSystemPage })));
const CustomerAccountPage = lazy(() => import('@/pages/CustomerAccountPage').then((m) => ({ default: m.CustomerAccountPage })));
const ResponsivePreviewPage = lazy(() => import('@/pages/ResponsivePreviewPage').then((m) => ({ default: m.ResponsivePreviewPage })));

// Accessible Loading Fallback for Suspense transitions
const PageLoadingFallback: React.FC = () => (
  <div
    role="status"
    aria-live="polite"
    className="min-h-[50vh] flex flex-col items-center justify-center p-8"
  >
    <div className="w-9 h-9 border-3 border-ice-300 border-t-navy-500 rounded-full animate-spin" />
    <span className="mt-3 text-xs font-semibold text-navy-700">Loading page...</span>
  </div>
);

// Admin Route Guard
const ProtectedAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ice-50">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy-500"></div>
          <span className="text-xs font-semibold text-navy-700">Verifying administrator credentials...</span>
        </div>
      </div>
    );
  }

  // 1. Unauthenticated -> Redirect to dedicated Admin Login
  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // 2. Authenticated but not an administrator -> 403 Forbidden screen
  if (user.role !== 'admin') {
    return <AdminAccessDenied userEmail={user.email} />;
  }

  // 3. Verified Administrator
  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<PageLoadingFallback />}>
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
              <Route path="notifications" element={<CustomerAccountPage />} />
              <Route path="addresses" element={<CustomerAccountPage />} />
              <Route path="profile" element={<CustomerAccountPage />} />
            </Route>

            {/* 3. Admin Dedicated Login Route */}
            <Route path="/admin/login" element={<AdminLoginPage />} />

            {/* 4. Admin Protected Operations Layout */}
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
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
