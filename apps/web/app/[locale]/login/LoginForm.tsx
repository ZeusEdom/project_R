'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Button, Input, Card, CardHeader, CardTitle, CardContent, IconUser } from '@repo/ui';
import { loginAction, resendConfirmationEmailAction } from './actions';

export function LoginForm({ locale }: { locale: string }) {
  const tAuth = useTranslations('auth');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [unconfirmedEmail, setUnconfirmedEmail] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setUnconfirmedEmail(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await loginAction(formData, locale);
      if (res?.error) {
        setError(res.error);
      }
    });
  }

  async function handleResendEmail() {
    if (!unconfirmedEmail) return;
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const res = await resendConfirmationEmailAction(unconfirmedEmail, locale);
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
          {tAuth('loginTitle')}
        </CardTitle>
        <p className="text-zinc-400 text-xs mt-1">
          {locale === 'en'
            ? 'Log in to track reading history and sync bookmarks'
            : 'Đăng nhập để theo dõi lịch sử đọc và đồng bộ đánh dấu'}
        </p>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {error && (
          <div className="rounded-xl bg-red-950/80 border border-red-800 p-3.5 text-xs text-red-300 font-semibold shadow-md space-y-2">
            <p>{error}</p>
            {unconfirmedEmail && (
              <button
                type="button"
                onClick={handleResendEmail}
                className="px-3 py-1 rounded-lg bg-red-900/80 hover:bg-red-800 text-white text-[11px] font-bold transition-colors inline-block"
              >
                {locale === 'en' ? 'Resend Confirmation Email' : 'Gửi lại email xác nhận'}
              </button>
            )}
          </div>
        )}

        {success && (
          <div className="rounded-xl bg-emerald-950/80 border border-emerald-800 p-3.5 text-xs text-emerald-300 font-semibold shadow-md">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
            autoComplete="current-password"
          />

          <div className="flex justify-end">
            <Link
              href={`/${locale}/forgot-password`}
              className="text-xs font-semibold text-emerald-400 hover:underline"
            >
              {tAuth('forgotPassword')}
            </Link>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full font-bold text-sm shadow-lg shadow-emerald-950"
            isLoading={isPending}
          >
            {tAuth('loginTitle')}
          </Button>
        </form>

        <div className="pt-4 border-t border-zinc-800 text-center text-xs text-zinc-400">
          <span>{tAuth('noAccount')} </span>
          <Link
            href={`/${locale}/signup`}
            className="font-bold text-emerald-400 hover:underline ml-1"
          >
            {tAuth('signupTitle')}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
