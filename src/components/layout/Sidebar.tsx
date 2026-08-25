'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useLogout } from '@/hooks/useAuth';
import {
  LayoutDashboard,
  Video,
  Newspaper,
  Target,
  MessageCircle,
  CalendarCheck,
  MapPin,
  Grid3X3,
  Settings,
  PenSquare,
  LogOut,
  type LucideIcon,
} from 'lucide-react';

interface NavItem {
  label: string;
  icon: LucideIcon;
  href: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { label: 'Shorts Management', icon: Video, href: '/shorts' },
  { label: 'News Management', icon: Newspaper, href: '/news' },
  { label: 'Upcoming Initiatives', icon: Target, href: '/initiatives' },
  { label: 'Consultation Sessions', icon: MessageCircle, href: '/consultations' },
  { label: 'Booked Consultations', icon: CalendarCheck, href: '/bookings' },
  { label: 'Emirates', icon: MapPin, href: '/emirates' },
  { label: 'Initiative Category', icon: Grid3X3, href: '/categories' },
  { label: 'Website Content', icon: PenSquare, href: '/website-content' },
  { label: 'Settings', icon: Settings, href: '/settings' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const logout = useLogout();

  return (
    <aside className="w-[275px] min-h-screen bg-sidebar-bg rounded-tl-[10px] rounded-bl-[10px] flex flex-col items-center py-8 shrink-0">
      <div className="w-[149px] h-[140px] border border-primary rounded-lg flex items-center justify-center mb-8">
        <img src="/logo.png" alt="Marage Support" className="w-full h-full object-fill rounded-lg" />
      </div>

      <nav className="flex flex-col gap-1 w-full items-center flex-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'w-[224px] h-11 flex items-center gap-2 px-3 rounded-[30px] transition-colors',
                isActive
                  ? 'bg-primary text-white'
                  : 'text-[#010101] hover:bg-sidebar-hover'
              )}
            >
              <Icon size={18} className={cn(isActive ? 'text-white shrink-0' : 'text-[#010101] shrink-0')} />
              <span className="text-[13px] font-normal leading-[28px] whitespace-nowrap truncate font-[family-name:var(--font-poppins)]">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      <button
        onClick={() => logout.mutate()}
        disabled={logout.isPending}
        className="w-[224px] h-11 flex items-center gap-2 px-3 rounded-[30px] text-[#010101] hover:bg-sidebar-hover transition-colors cursor-pointer disabled:opacity-50"
      >
        <LogOut size={18} className="shrink-0" />
        <span className="text-[13px] font-normal leading-[28px] whitespace-nowrap truncate font-[family-name:var(--font-poppins)]">
          {logout.isPending ? 'Logging out...' : 'Log Out'}
        </span>
      </button>
    </aside>
  );
}
