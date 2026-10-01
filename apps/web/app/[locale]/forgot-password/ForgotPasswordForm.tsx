'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Button, Input, Card, CardHeader, CardTitle, CardContent, IconUser } from '@repo/ui';
import { requestPasswordResetAction } from './actions';

export function ForgotPasswordForm({ locale }: { locale: string }) {
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
      const res = await requestPasswordResetAction(formData, locale);
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
          {locale === 'en' ? 'Reset Your Password' : 'Quên Mật Khẩu'}
        </CardTitle>
        <p className="text-zinc-400 text-xs mt-1">
          {locale === 'en'
            ? 'Enter your registered email address to receive a password reset link'
            : 'Nhập địa chỉ email đã đăng ký để nhận liên kết đặt lại mật khẩu'}
        </p>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {error && (
          <div className="rounded-xl bg-red-950/80 border border-red-800 p-3.5 text-xs text-red-300 font-semibold shadow-md">
            {error}
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

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full mt-2 py-3 font-bold text-sm shadow-lg shadow-emerald-950"
            isLoading={isPending}
          >
            {locale === 'en' ? 'Send Reset Link' : 'Gửi link đặt lại mật khẩu'}
          </Button>
        </form>

        <div className="pt-4 border-t border-zinc-800 text-center text-xs text-zinc-400">
          <Link
            href={`/${locale}/login`}
            className="font-bold text-emerald-400 hover:underline"
          >
            ← {locale === 'en' ? 'Back to Login' : 'Quay lại đăng nhập'}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
