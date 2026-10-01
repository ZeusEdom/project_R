'use client';

import { useState, useTransition } from 'react';
import { Button, Input, Textarea, Card, CardHeader, CardTitle, CardContent, IconUser, IconUpload, IconX } from '@repo/ui';
import { updateProfileAction } from './actions';

interface ProfileFormProps {
  locale: string;
  email: string;
  initialDisplayName: string;
  initialBio: string;
  initialLanguagePref: string;
  initialAvatarUrl: string;
  createdAt?: string;
}

export function ProfileForm({
  locale,
  email,
  initialDisplayName,
  initialBio,
  initialLanguagePref,
  initialAvatarUrl,
  createdAt,
}: ProfileFormProps) {
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
      const res = await updateProfileAction(formData, locale);
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
        <div className="rounded-xl bg-emerald-950/80 border border-emerald-800 p-4 text-xs font-semibold text-emerald-300 shadow-md flex items-center gap-2">
          <span>✓</span>
          <span>{success}</span>
        </div>
      )}

      {/* Main Profile Header Info Card */}
      <Card className="border-zinc-800 bg-zinc-900/90 shadow-xl">
        <CardHeader className="border-b border-zinc-800/80 pb-4">
          <CardTitle className="text-lg font-bold text-zinc-100 flex items-center gap-2">
            <IconUser className="text-emerald-400" size={20} />
            <span>{locale === 'en' ? 'Reader Profile Information' : 'Thông tin tài khoản độc giả'}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {/* Avatar Upload Box */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full bg-zinc-950 border-2 border-emerald-500/40 overflow-hidden flex items-center justify-center shadow-xl shrink-0">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-extrabold text-2xl text-emerald-400 bg-emerald-500/10">
                    {(initialDisplayName || email)[0].toUpperCase()}
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 w-full space-y-2 text-center sm:text-left">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">
                {locale === 'en' ? 'Upload Avatar Image' : 'Ảnh đại diện (Tải file từ máy)'}
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
                      : 'Bấm hoặc kéo thả ảnh để đổi đại diện'}
                  </p>
                  <p className="text-[10px] text-zinc-500 font-mono">PNG, JPG, WEBP</p>
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
            label={locale === 'en' ? 'Short Bio' : 'Tiểu sử cá nhân (Bio)'}
            name="bio"
            defaultValue={initialBio}
            placeholder={locale === 'en' ? 'Tell other readers about yourself...' : 'Giới thiệu ngắn về sở thích đọc truyện của bạn...'}
            rows={3}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-zinc-800/80">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">
                {locale === 'en' ? 'Preferred Language' : 'Ngôn ngữ ưu tiên'}
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

            {createdAt && (
              <div className="flex flex-col gap-1.5 justify-end">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">
                  {locale === 'en' ? 'Member Since' : 'Ngày tham gia'}
                </span>
                <p className="text-sm font-mono text-zinc-300 py-2">
                  {new Date(createdAt).toLocaleDateString(locale)}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isPending}
          className="font-bold px-8 shadow-lg shadow-emerald-950"
        >
          {locale === 'en' ? 'Save Changes' : 'Lưu thay đổi hồ sơ'}
        </Button>
      </div>
    </form>
  );
}
