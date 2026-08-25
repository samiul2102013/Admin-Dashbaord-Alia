'use client';

import { useEffect, useCallback } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'lg' | 'full';
}

const sizeStyles = {
  sm: 'max-w-md',
  lg: 'max-w-4xl',
  full: 'max-w-[1382px]',
};

export default function Modal({ isOpen, onClose, title, children, footer, size = 'full' }: ModalProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 pt-[88px]">
      <div
        className={`relative w-full ${sizeStyles[size]} mx-[29px] max-h-[calc(100vh-100px)] rounded-[12px] bg-surface shadow-xl flex flex-col`}
      >
        <div className="flex items-center justify-between px-4 pt-4 pb-2 shrink-0">
          {title && (
            <h2 className="text-navy text-[14px] font-bold leading-[100%] font-[family-name:var(--font-manrope)]">
              {title}
            </h2>
          )}
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors cursor-pointer ml-auto"
          >
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-scroll px-6 pb-6 flex-1">
          {children}
        </div>

        {footer && (
          <div className="px-6 py-4 border-t border-border-soft/50 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
