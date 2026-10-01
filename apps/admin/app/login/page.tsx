'use client';

import { useState, useTransition } from 'react';
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from '@repo/ui';
import { loginAction } from './actions';

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await loginAction(formData);
      if (res?.error) {
        setError(res.error);
      }
    });
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-dvh px-4 bg-zinc-950 text-zinc-100 relative overflow-hidden">
      {/* Subtle ambient gradient background */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <Card className="border-zinc-800/80 bg-zinc-900/80 shadow-2xl backdrop-blur-xl p-2 rounded-2xl">
          <CardHeader className="text-center pb-2 pt-4 border-b-0">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center font-extrabold text-white text-xl mx-auto mb-3 shadow-lg shadow-emerald-950/60 border border-emerald-400/20">
              S
            </div>
            <CardTitle className="text-xl font-bold tracking-tight text-zinc-100">
              STORY ARCH PORTAL
            </CardTitle>
            <p className="text-zinc-400 text-xs mt-1">Hệ thống quản lý nội dung đọc truyện cá nhân</p>
          </CardHeader>
          <CardContent className="pt-4">
            {error && (
              <div className="mb-4 rounded-xl bg-red-950/60 border border-red-800/60 p-3 text-xs text-red-300 font-medium">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email quản trị"
                name="email"
                type="email"
                placeholder="admin@example.com"
                required
                autoComplete="email"
              />
              <Input
                label="Mật khẩu"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
              <Button
                type="submit"
                variant="primary"
                className="w-full mt-2 py-3 rounded-xl font-semibold text-sm shadow-lg shadow-emerald-950/50"
                isLoading={isPending}
              >
                Đăng nhập hệ thống
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
