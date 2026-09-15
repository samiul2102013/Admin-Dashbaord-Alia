'use client';

import { ChevronDown, ChevronRight, Eye, EyeOff } from 'lucide-react';

interface CollapsibleSectionProps {
  title: string;
  hint?: string;
  isOpen: boolean;
  onToggle: () => void;
  visible?: boolean;
  onToggleVisible?: () => void;
  /**
   * Real name of the public section this visibility toggle controls. Defaults
   * to `title`. Shown in the toggle tooltip and the hidden notice so admins know
   * exactly what disappears from the public site.
   */
  sectionName?: string;
  /** Optional concrete preview of what is hidden, e.g. "the Topics cards". */
  hidePreview?: string;
  children: React.ReactNode;
}

export default function CollapsibleSection({
  title, hint, isOpen, onToggle, visible = true, onToggleVisible, sectionName, hidePreview, children,
}: CollapsibleSectionProps) {
  const publicName = sectionName ?? title;

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
            aria-pressed={!visible}
            title={
              visible
                ? `Hide the "${publicName}" section from the public site`
                : `Show the "${publicName}" section on the public site`
            }
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer font-[family-name:var(--font-poppins)] shrink-0 ${
              visible
                ? 'bg-primary/10 text-primary hover:bg-primary/20'
                : 'bg-secondary/20 text-text-secondary hover:bg-secondary/30'
            }`}
          >
            {visible ? <Eye size={13} /> : <EyeOff size={13} />}
            {visible ? 'Visible publicly' : 'Hidden publicly'}
          </button>
        )}
      </div>

      {onToggleVisible && !visible && (
        <div className="border-t border-secondary/20 bg-warning/5 px-4 py-2 text-xs text-warning font-[family-name:var(--font-poppins)]">
          Hidden from the public site: {hidePreview ?? `the entire "${publicName}" section`}.
        </div>
      )}

      {isOpen && (
        <div className={`px-4 pb-4 pt-1 flex flex-col gap-6 ${onToggleVisible && !visible ? 'opacity-40 pointer-events-none' : ''}`}>
          {children}
        </div>
      )}
    </div>
  );
}
