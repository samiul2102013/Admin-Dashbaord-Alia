'use client';

import { cn } from '@/lib/utils';

export interface Tab {
  key: string;
  label: string;
}

interface TabBarProps {
  tabs: Tab[];
  activeKey: string;
  onChange: (key: string) => void;
  className?: string;
}

export default function TabBar({ tabs, activeKey, onChange, className }: TabBarProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-1 border-b border-secondary/30 shrink-0',
        className,
      )}
    >
      {tabs.map((tab) => {
        const isActive = tab.key === activeKey;
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            className={cn(
              'px-4 py-2 text-[13px] font-medium leading-[24px] rounded-t-[8px] border-b-2 -mb-[2px] transition-colors cursor-pointer font-[family-name:var(--font-poppins)] whitespace-nowrap',
              isActive
                ? 'border-primary text-primary bg-primary/5'
                : 'border-transparent text-text-secondary hover:text-navy hover:border-secondary/50',
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
