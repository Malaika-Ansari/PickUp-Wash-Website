import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
  closeOnBackdrop?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxWidth = 'md',
  closeOnBackdrop = true,
}) => {
  // Listen for Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidths = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-darkNavy-900/60 backdrop-blur-sm transition-opacity"
        onClick={() => closeOnBackdrop && onClose()}
        aria-hidden="true"
      />

      {/* Dialog Surface */}
      <div
        className={cn(
          'relative w-full bg-white rounded-3xl shadow-modal border border-ice-200/80 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200',
          maxWidths[maxWidth]
        )}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between p-6 border-b border-ice-200 bg-ice-50/50">
          <div>
            <h3
              id="modal-title"
              className="font-poppins font-bold text-xl text-navy-500 tracking-tight"
            >
              {title}
            </h3>
            {subtitle && (
              <p className="text-xs text-darkNavy/70 mt-0.5 leading-normal">
                {subtitle}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-darkNavy/40 hover:text-darkNavy/80 hover:bg-ice-200/60 transition-colors focus:outline-none focus:ring-2 focus:ring-aqua-400"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[70vh] overflow-y-auto text-sm text-darkNavy/80 leading-relaxed">
          {children}
        </div>

        {/* Modal Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 p-4 px-6 border-t border-ice-200 bg-ice-50/40">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
