'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { createClient } from '@repo/supabase/client';
import { Button, Input, Card, CardHeader, CardTitle, CardContent, IconUser } from '@repo/ui';

export function ResetPasswordForm({ locale }: { locale: string }) {
  const router = useRouter();
  const tAuth = useTranslations('auth');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [hasValidSession, setHasValidSession] = useState<boolean | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const supabase = createClient();

    async function initSession() {
      try {
        // 1. Check if URL contains hash parameters (#access_token=...&refresh_token=...)
        if (typeof window !== 'undefined' && window.location.hash) {
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');

          if (accessToken && refreshToken) {
            const { error: setSessionErr } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            if (!setSessionErr) {
              setHasValidSession(true);
              return;
            }
          }
        }

        // 2. Check if URL contains query parameter (?code=...)
        if (typeof window !== 'undefined' && window.location.search) {
          const searchParams = new URLSearchParams(window.location.search);
          const code = searchParams.get('code');
          if (code) {
            const { error: exchangeErr } = await supabase.auth.exchangeCodeForSession(code);
            if (!exchangeErr) {
              setHasValidSession(true);
              return;
            }
          }
        }

        // 3. Fallback: Check if there is an existing active session
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setHasValidSession(true);
        } else {
          setHasValidSession(false);
        }
      } catch {
        setHasValidSession(false);
      }
    }

    initSession();

    // Listen for auth state changes (e.g. PASSWORD_RECOVERY event)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || session) {
        setHasValidSession(true);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const formData = new FormData(e.currentTarget);
    const password = (formData.get('password') as string) || '';
    const confirmPassword = (formData.get('confirmPassword') as string) || '';

    if (!password || !confirmPassword) {
      setError(locale === 'en' ? 'Please fill in all fields' : 'Vui lòng nhập đầy đủ thông tin');
      return;
    }

    if (password !== confirmPassword) {
      setError(locale === 'en' ? 'Passwords do not match' : 'Mật khẩu xác nhận không trùng khớp');
      return;
    }

    if (password.length < 6) {
      setError(
        locale === 'en'
          ? 'Password must be at least 6 characters'
          : 'Mật khẩu phải có ít nhất 6 ký tự'
      );
      return;
    }

    startTransition(async () => {
      const supabase = createClient();
      const { error: updateErr } = await supabase.auth.updateUser({
        password,
      });

      if (updateErr) {
        if (updateErr.message.includes('Auth session missing')) {
          setError(
            locale === 'en'
              ? 'Your reset link is invalid or has expired. Please request a new password reset email.'
              : 'Liên kết đặt lại mật khẩu đã hết hạn hoặc không hợp lệ. Vui lòng gửi lại yêu cầu quên mật khẩu.'
          );
          setHasValidSession(false);
        } else {
          setError(updateErr.message);
        }
      } else {
        setSuccess(
          locale === 'en'
            ? 'Password updated successfully! Redirecting to login...'
            : 'Đặt lại mật khẩu thành công! Đang chuyển hướng đến trang đăng nhập...'
        );
        setTimeout(() => {
          router.push(`/${locale}/login`);
        }, 2000);
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
          {locale === 'en' ? 'Set New Password' : 'Đặt Mật Khẩu Mới'}
        </CardTitle>
        <p className="text-zinc-400 text-xs mt-1">
          {locale === 'en'
            ? 'Enter your new account password below'
            : 'Nhập mật khẩu mới cho tài khoản của bạn bên dưới'}
        </p>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {hasValidSession === false && (
          <div className="rounded-xl bg-amber-950/80 border border-amber-800/80 p-4 text-xs text-amber-300 font-semibold shadow-md space-y-3">
            <p>
              {locale === 'en'
                ? 'Your password reset link is missing or expired. Please request a new reset email.'
                : 'Phiên làm việc hoặc liên kết đặt lại mật khẩu không hợp lệ (hoặc đã hết hạn). Vui lòng gửi lại yêu cầu quên mật khẩu.'}
            </p>
            <Link
              href={`/${locale}/forgot-password`}
              className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs inline-block shadow-md transition-colors"
            >
              {locale === 'en' ? 'Request New Reset Link' : 'Gửi lại yêu cầu Quên Mật Khẩu'}
            </Link>
          </div>
        )}

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
            label={locale === 'en' ? 'New Password' : 'Mật khẩu mới'}
            name="password"
            type="password"
            placeholder="••••••••"
            required
            autoComplete="new-password"
            disabled={hasValidSession === false}
          />

          <Input
            label={tAuth('confirmPassword')}
            name="confirmPassword"
            type="password"
            placeholder="••••••••"
            required
            autoComplete="new-password"
            disabled={hasValidSession === false}
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full mt-2 py-3 font-bold text-sm shadow-lg shadow-emerald-950"
            isLoading={isPending}
            disabled={hasValidSession === false}
          >
            {locale === 'en' ? 'Update Password' : 'Cập nhật mật khẩu'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
