'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { Button, Input, Textarea, Card, CardHeader, CardTitle, CardContent, IconSettings, IconUpload, IconUser } from '@repo/ui';
import { updateUserSettingsAction } from './actions';

interface SettingsFormProps {
  locale: string;
  email: string;
  initialDisplayName: string;
  initialBio: string;
  initialLanguagePref: string;
  initialAvatarUrl: string;
}

export function SettingsForm({
  locale,
  email,
  initialDisplayName,
  initialBio,
  initialLanguagePref,
  initialAvatarUrl,
}: SettingsFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const [avatarPreview, setAvatarPreview] = useState<string | null>(initialAvatarUrl || null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const formData = new FormData(e.currentTarget);
    if (avatarFile) {
      formData.set('avatarFile', avatarFile);
    }

    startTransition(async () => {
      const res = await updateUserSettingsAction(formData, locale);
      if (res?.error) {
        setError(res.error);
      } else if (res?.success) {
        setSuccess(res.success);
        if (res.avatarUrl) {
          setAvatarPreview(res.avatarUrl);
        }
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-xl bg-red-950/80 border border-red-800 p-4 text-xs font-semibold text-red-300 shadow-md">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-xl bg-emerald-950/80 border border-emerald-800 p-4 text-xs font-semibold text-emerald-300 shadow-md flex items-center justify-between">
          <span>{success}</span>
          <Link href={`/${locale}/profile`} className="underline font-bold text-emerald-400 text-xs">
            {locale === 'en' ? 'View Profile →' : 'Xem Trang Cá Nhân →'}
          </Link>
        </div>
      )}

      <Card className="border-zinc-800 bg-zinc-900/90 shadow-xl">
        <CardHeader className="border-b border-zinc-800/80 pb-4">
          <CardTitle className="text-lg font-bold text-zinc-100 flex items-center gap-2">
            <IconSettings className="text-emerald-400" size={20} />
            <span>{locale === 'en' ? 'Account & Profile Settings' : 'Cài Đặt Hồ Sơ & Tài Khoản'}</span>
          </CardTitle>
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          {/* Avatar Upload Box */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="w-24 h-24 rounded-full bg-zinc-950 border-2 border-emerald-500/40 overflow-hidden flex items-center justify-center shadow-xl shrink-0">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-extrabold text-2xl text-emerald-400 bg-emerald-500/10">
                  {(initialDisplayName || email)[0].toUpperCase()}
                </div>
              )}
            </div>

            <div className="flex-1 w-full space-y-2 text-center sm:text-left">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">
                {locale === 'en' ? 'Upload Avatar Photo' : 'Tải Ảnh Đại Diện Mới'}
              </label>
              <div className="relative border-2 border-dashed border-zinc-700 hover:border-emerald-500 rounded-2xl p-4 text-center bg-zinc-950/40 transition-colors cursor-pointer group">
                <input
                  type="file"
                  name="avatarFile"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="space-y-1 pointer-events-none">
                  <IconUpload size={18} className="text-emerald-400 mx-auto" />
                  <p className="text-xs font-bold text-zinc-200 group-hover:text-emerald-400 transition-colors">
                    {avatarFile
                      ? `Đã chọn: ${avatarFile.name}`
                      : locale === 'en'
                      ? 'Click or drag photo here to change avatar'
                      : 'Bấm hoặc kéo thả ảnh từ máy tính để đổi đại diện'}
                  </p>
                  <p className="text-[10px] text-zinc-500 font-mono">PNG, JPG, WEBP (Max 5MB)</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label={locale === 'en' ? 'Display Name' : 'Tên hiển thị'}
              name="displayName"
              defaultValue={initialDisplayName}
              required
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">
                Email
              </label>
              <input
                type="text"
                disabled
                value={email}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-500 cursor-not-allowed font-mono"
              />
            </div>
          </div>

          <Textarea
            label={locale === 'en' ? 'Bio / Description' : 'Tiểu sử cá nhân (Bio)'}
            name="bio"
            defaultValue={initialBio}
            placeholder={locale === 'en' ? 'Introduce yourself to other readers...' : 'Viết giới thiệu ngắn về bản thân...'}
            rows={3}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-zinc-800/80">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">
                {locale === 'en' ? 'Interface Language' : 'Ngôn ngữ hiển thị'}
              </label>
              <select
                name="languagePref"
                defaultValue={initialLanguagePref}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:ring-emerald-500"
              >
                <option value="vi">Tiếng Việt</option>
                <option value="en">English</option>
                <option value="fr">Français</option>
                <option value="ja">日本語</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5 justify-end">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">
                {locale === 'en' ? 'Password & Security' : 'Bảo mật tài khoản'}
              </span>
              <Link
                href={`/${locale}/forgot-password`}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-xs font-bold text-zinc-200 transition-colors inline-flex items-center gap-2 text-center"
              >
                <IconUser size={13} />
                {locale === 'en' ? 'Change / Reset Password' : 'Đổi / Đặt lại Mật khẩu qua Email'}
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between pt-2">
        <Link
          href={`/${locale}/profile`}
          className="px-4 py-2.5 rounded-xl border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900 text-xs font-bold transition-colors"
        >
          ← {locale === 'en' ? 'Back to Profile' : 'Quay lại Trang cá nhân'}
        </Link>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isPending}
          className="font-bold px-8 shadow-lg shadow-emerald-950"
        >
          {locale === 'en' ? 'Save Settings' : 'Lưu cài đặt tài khoản'}
        </Button>
      </div>
    </form>
  );
}
