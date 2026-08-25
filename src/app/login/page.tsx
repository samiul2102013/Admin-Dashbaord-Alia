'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import Input from '@/components/shared/Input';
import Button from '@/components/shared/Button';
import { useLogin } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';
import { getErrorMessage } from '@/lib/api-client';

export default function LoginPage() {
  const router = useRouter();
  const login = useLogin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (user) router.replace('/dashboard');
  }, [user, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    login.mutate({ email: email.trim(), password });
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6">
      <div className="w-full max-w-[480px] bg-white rounded-[12px] shadow-lg p-8">
        <div className="w-[120px] h-[110px] border border-primary rounded-lg flex items-center justify-center mx-auto mb-6">
          <img src="/logo.png" alt="Marage Support" className="w-full h-full object-fill rounded-lg" />
        </div>

        <h1 className="text-center text-2xl font-bold text-navy mb-1 font-[family-name:var(--font-manrope)]">
          Admin Login
        </h1>
        <p className="text-center text-sm text-text-secondary mb-8 font-[family-name:var(--font-poppins)]">
          Sign in to manage the Marage Support platform
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <Input
            label="Email"
            type="email"
            required
            placeholder="admin@marage.ae"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={login.isError ? '' : undefined}
          />

          <div className="flex flex-col gap-[26px]">
            <label
              htmlFor="password"
              className="text-[16px] font-semibold leading-[28.13px] font-[family-name:var(--font-poppins)]"
            >
              Password
              <span className="text-danger ml-0.5">*</span>
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 px-[10px] py-[10px] pr-11 rounded-[10px] border border-secondary/80 bg-surface outline-none transition-colors font-[family-name:var(--font-poppins)] text-sm focus:border-primary"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {login.isError && (
            <p className="text-danger text-sm font-[family-name:var(--font-poppins)]">
              {getErrorMessage(login.error)}
            </p>
          )}

          <Button
            type="submit"
            size="md"
            isLoading={login.isPending}
            className="w-full"
          >
            Sign In
          </Button>
        </form>
      </div>
    </div>
  );
}