'use client';

import type { LucideIcon } from 'lucide-react';

export type VisibilityToggles = Record<string, boolean>;

export interface VisibilityItem {
  key: string;
  label: string;
  description: string;
}

export interface VisibilityGroup {
  title: string;
  description?: string;
  icon?: LucideIcon;
  items: VisibilityItem[];
}

/** Flatten every toggle key across all groups (save payload coverage). */
export function visibilityKeys(groups: VisibilityGroup[]): string[] {
  return groups.flatMap((group) => group.items.map((item) => item.key));
}

/** Number of hidden toggles across all groups. */
export function countHidden(groups: VisibilityGroup[], toggles: VisibilityToggles): number {
  return visibilityKeys(groups).filter((key) => !toggles[key]).length;
}

interface VisibilityGroupsProps {
  groups: VisibilityGroup[];
  toggles: VisibilityToggles;
  onChange: (key: string, checked: boolean) => void;
  /** Optional explanatory line shown above the groups. */
  intro?: string;
}

/**
 * Grouped section-visibility switches shared by every entity modal. Groups
 * mirror the order sections appear on the public page so admins can map each
 * switch to what visitors see.
 */
export default function VisibilityGroups({ groups, toggles, onChange, intro }: VisibilityGroupsProps) {
  return (
    <div className="flex flex-col gap-4">
      {intro && (
        <p className="text-xs leading-5 text-text-secondary font-[family-name:var(--font-poppins)]">
          {intro}
        </p>
      )}

      {groups.map((group) => {
        const groupHidden = group.items.filter((item) => !toggles[item.key]).length;
        const GroupIcon = group.icon;
        return (
          <div
            key={group.title}
            className="rounded-[12px] border border-secondary/20 bg-white overflow-hidden"
          >
            <div className="flex items-center gap-2 px-4 py-2.5 bg-background-soft/40 border-b border-secondary/10">
              {GroupIcon && <GroupIcon size={14} className="shrink-0 text-primary" />}
              <span className="text-xs font-bold uppercase tracking-wide text-text-primary font-[family-name:var(--font-poppins)]">
                {group.title}
              </span>
              {group.description && (
                <span className="text-xs text-text-secondary font-[family-name:var(--font-poppins)] hidden sm:inline truncate">
                  — {group.description}
                </span>
              )}
              <span
                className={`ml-auto text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0 font-[family-name:var(--font-poppins)] ${
                  groupHidden === 0
                    ? 'bg-primary/10 text-primary'
                    : 'bg-secondary/10 text-text-secondary'
                }`}
              >
                {groupHidden === 0 ? 'All visible' : `${groupHidden} hidden`}
              </span>
            </div>
            <div className="divide-y divide-secondary/10">
              {group.items.map((item) => (
                <VisibilityToggle
                  key={item.key}
                  label={item.label}
                  description={item.description}
                  checked={Boolean(toggles[item.key])}
                  onChange={(checked) => onChange(item.key, checked)}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Visibility row: label + description on the left, switch on the right ── */

export function VisibilityToggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-4 px-4 py-3 cursor-pointer hover:bg-secondary/5 transition-colors">
      <span className="flex-1 min-w-0">
        <span className="block text-sm font-semibold text-text-primary font-[family-name:var(--font-poppins)]">
          {label}
        </span>
        <span className="block text-xs leading-4 text-text-secondary font-[family-name:var(--font-poppins)]">
          {description}
        </span>
      </span>
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span
        aria-hidden="true"
        className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors ${
          checked ? 'bg-primary' : 'bg-secondary/30'
        }`}
      >
        <span
          className={`absolute top-1 left-1 h-4 w-4 rounded-full bg-white shadow transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </span>
    </label>
  );
}
