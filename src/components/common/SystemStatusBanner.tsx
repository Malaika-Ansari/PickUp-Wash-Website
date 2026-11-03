import React, { useState } from 'react';
import { isSupabaseConfigured } from '@/services/supabase';
import { Database, CheckCircle, Info, X } from 'lucide-react';

export const SystemStatusBanner: React.FC = () => {
  const [dismissed, setDismissed] = useState(false);
  const configured = isSupabaseConfigured();

  if (dismissed) return null;

  return (
    <div className={`text-xs py-2 px-4 border-b transition-colors ${
      configured 
        ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
        : 'bg-amber-50 text-amber-900 border-amber-200'
    }`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {configured ? (
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <Database className="w-4 h-4 text-amber-600 shrink-0" />
          )}
          <span>
            {configured ? (
              <span className="font-medium">Supabase Cloud Database Connected. Real-time sync active.</span>
            ) : (
              <span>
                <strong className="font-semibold">Local Development Mode Active:</strong> Supabase keys are using placeholder defaults. Booking & tracking operate seamlessly via resilient local persistence. Connect your free-tier Supabase project in <code className="bg-amber-100 px-1.5 py-0.5 rounded text-amber-950 font-mono text-[11px]">.env</code> when ready!
              </span>
            )}
          </span>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="p-1 text-current opacity-60 hover:opacity-100 rounded"
          aria-label="Dismiss banner"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

