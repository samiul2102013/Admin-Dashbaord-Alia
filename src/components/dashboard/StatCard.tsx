import type { StatItem } from '@/types/dashboard';
import { Video, Target, FileText, MessageCircle, MapPin, Users, type LucideIcon } from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
  shorts: Video,
  initiative: Target,
  news: FileText,
  consultation: MessageCircle,
  emirates: MapPin,
  users: Users,
};

export default function StatCard({ item }: { item: StatItem }) {
  const Icon = ICON_MAP[item.icon] || Users;

  return (
    <div className="flex-1 min-w-[160px] h-full bg-surface rounded-lg border border-border-soft flex flex-col items-center justify-center gap-1 px-3 py-4">
      <Icon size={20} className="text-primary" />
      <span className="text-2xl font-bold text-text-primary font-[family-name:var(--font-poppins)]">
        {item.value}
      </span>
      <span className="text-[11px] text-text-secondary text-center font-[family-name:var(--font-manrope)]">
        {item.label}
      </span>
    </div>
  );
}