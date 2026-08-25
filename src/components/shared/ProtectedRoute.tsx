'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, accessToken, refreshToken, bootstrap, isBootstrapping } =
    useAuthStore();

  useEffect(() => {
    if (user) return;
    if (!accessToken && refreshToken) {
      bootstrap();
    } else if (!accessToken && !refreshToken) {
      router.replace('/login');
    }
  }, [user, accessToken, refreshToken, bootstrap, router]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}