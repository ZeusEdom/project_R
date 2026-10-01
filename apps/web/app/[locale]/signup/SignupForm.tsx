'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Button, Input, Card, CardHeader, CardTitle, CardContent, IconUser } from '@repo/ui';
import { signupAction } from '../login/actions';

export function SignupForm({ locale }: { locale: string }) {
  const tAuth = useTranslations('auth');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await signupAction(formData, locale);
      if (res?.error) {
        setError(res.error);
      } else if (res?.success) {
        setSuccess(res.success);
      }
    });
  }

  return (
    <Card className="border-zinc-800 bg-zinc-900/90 shadow-2xl backdrop-blur-xl">
      <CardHeader className="text-center pb-2">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center mb-2 shadow-md">
          <IconUser size={24} />
        </div>
        <CardTitle className="text-2xl font-extrabold tracking-tight text-zinc-100">
          {tAuth('signupTitle')}
        </CardTitle>
        <p className="text-zinc-400 text-xs mt-1">
          {locale === 'en'
            ? 'Create a free account to join the reader community'
            : 'Tạo tài khoản miễn phí để tham gia cộng đồng độc giả'}
        </p>
      </CardHeader>

      <CardContent className="pt-4">
        {error && (
          <div className="mb-4 rounded-xl bg-red-950/80 border border-red-800 p-3.5 text-xs text-red-300 font-semibold shadow-md">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 rounded-xl bg-emerald-950/90 border border-emerald-800 p-4 text-xs text-emerald-200 font-semibold shadow-md space-y-2">
            <p>{success}</p>
            <Link
              href={`/${locale}/login`}
              className="inline-block mt-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-colors"
            >
              {locale === 'en' ? 'Go to Login' : 'Chuyển sang Đăng nhập'}
            </Link>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label={locale === 'en' ? 'Display Name' : 'Tên hiển thị'}
            name="displayName"
            type="text"
            placeholder="VD: Reader123"
            required
          />

          <Input
            label={tAuth('email')}
            name="email"
            type="email"
            placeholder="your.email@example.com"
            required
            autoComplete="email"
          />

          <Input
            label={tAuth('password')}
            name="password"
            type="password"
            placeholder="••••••••"
            required
            autoComplete="new-password"
          />

          <Input
            label={tAuth('confirmPassword')}
            name="confirmPassword"
            type="password"
            placeholder="••••••••"
            required
            autoComplete="new-password"
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full mt-2 py-3 font-bold text-sm shadow-lg shadow-emerald-950"
            isLoading={isPending}
          >
            {tAuth('signupTitle')}
          </Button>
        </form>

        <div className="mt-6 pt-5 border-t border-zinc-800 text-center text-xs text-zinc-400">
          <span>{tAuth('hasAccount')} </span>
          <Link
            href={`/${locale}/login`}
            className="font-bold text-emerald-400 hover:underline ml-1"
          >
            {tAuth('loginTitle')}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
