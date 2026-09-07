'use client';

import { ChevronDown, ChevronRight, Eye, EyeOff } from 'lucide-react';

interface CollapsibleSectionProps {
  title: string;
  hint?: string;
  isOpen: boolean;
  onToggle: () => void;
  visible?: boolean;
  onToggleVisible?: () => void;
  children: React.ReactNode;
}

export default function CollapsibleSection({
  title, hint, isOpen, onToggle, visible = true, onToggleVisible, children,
}: CollapsibleSectionProps) {
  return (
    <div className="rounded-[12px] border border-secondary/30 bg-surface/50 overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={isOpen}
            className="flex items-center gap-2 text-left min-w-0 cursor-pointer"
          >
            {isOpen ? <ChevronDown size={16} className="shrink-0 text-text-secondary" /> : <ChevronRight size={16} className="shrink-0 text-text-secondary" />}
            <span className="text-sm font-bold text-black font-[family-name:var(--font-poppins)] truncate">
              {title}
            </span>
          </button>
          {hint && (
            <span className="text-xs text-text-secondary font-[family-name:var(--font-poppins)] hidden sm:inline">
              — {hint}
            </span>
          )}
        </div>

        {onToggleVisible && (
          <button
            type="button"
            onClick={onToggleVisible}
            title={visible ? 'Hide this section on the user panel' : 'Show this section on the user panel'}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer font-[family-name:var(--font-poppins)] shrink-0 ${
              visible
                ? 'bg-primary/10 text-primary hover:bg-primary/20'
                : 'bg-secondary/20 text-text-secondary hover:bg-secondary/30'
            }`}
          >
            {visible ? <Eye size={13} /> : <EyeOff size={13} />}
            {visible ? 'Visible' : 'Hidden'}
          </button>
        )}
      </div>

      {isOpen && (
        <div className={`px-4 pb-4 pt-1 flex flex-col gap-6 ${onToggleVisible && !visible ? 'opacity-40 pointer-events-none' : ''}`}>
          {children}
        </div>
      )}
    </div>
  );
}
