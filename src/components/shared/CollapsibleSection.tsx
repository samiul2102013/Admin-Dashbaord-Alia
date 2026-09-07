'use client';

import { ChevronDown, ChevronRight } from 'lucide-react';

interface CollapsibleSectionProps {
  title: string;
  hint?: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

export default function CollapsibleSection({ title, hint, isOpen, onToggle, children }: CollapsibleSectionProps) {
  return (
    <div className="rounded-[12px] border border-secondary/30 bg-surface/50 overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-secondary/10 transition-colors cursor-pointer"
      >
        {isOpen ? <ChevronDown size={16} className="shrink-0 text-text-secondary" /> : <ChevronRight size={16} className="shrink-0 text-text-secondary" />}
        <span className="text-sm font-bold text-black font-[family-name:var(--font-poppins)]">{title}</span>
        {hint && (
          <span className="ml-auto text-xs text-text-secondary font-[family-name:var(--font-poppins)] shrink-0">
            {hint}
          </span>
        )}
      </button>
      {isOpen && (
        <div className="px-4 pb-4 pt-1 flex flex-col gap-6">
          {children}
        </div>
      )}
    </div>
  );
}
