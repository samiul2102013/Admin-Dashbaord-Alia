'use client';

import { useAuthStore } from '@/store/authStore';

export default function Header() {
  const user = useAuthStore((s) => s.user);

  const displayName = user?.name || user?.username || 'Admin';
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <header className="h-[75px] bg-surface flex items-center justify-between px-[14px] py-4 shrink-0">
      <div className="flex items-center gap-2">
        <span className="text-text-primary text-base font-medium font-[family-name:var(--font-urbanist)]">
          Welcome back, {displayName.split(' ')[0]}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white text-sm font-semibold font-[family-name:var(--font-urbanist)]">
          {initials}
        </div>
        <span className="text-text-primary text-base font-semibold font-[family-name:var(--font-urbanist)]">
          {displayName}
        </span>
      </div>
    </header>
  );
}