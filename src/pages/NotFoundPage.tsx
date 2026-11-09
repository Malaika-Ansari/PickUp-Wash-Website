import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/common/Button';
import { ArrowLeft, Home } from 'lucide-react';
import { SEO } from '@/components/common/SEO';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center py-16 px-4">
      <SEO title="Page Not Found (404)" description="The requested page could not be found." />
      <div className="text-center max-w-md space-y-4">
        <div className="font-poppins font-extrabold text-7xl text-aqua-400">404</div>
        <h1 className="font-poppins font-bold text-2xl text-navy-500">Page Not Found</h1>
        <p className="text-xs sm:text-sm text-navy-600/80">
          The page you are looking for doesn't exist or has moved. Let's get you back to clean laundry!
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <Link to="/">
            <Button size="md" className="gap-2">
              <Home className="w-4 h-4" />
              Return Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

