import { redirect } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { createServerSupabase } from '@repo/supabase/server';
import { SettingsForm } from './SettingsForm';

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  const { data: profileData } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  const profile = profileData as any;

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8 min-h-[70vh]">
      <div className="border-b border-zinc-800 pb-5">
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-100 border-l-4 border-emerald-500 pl-3">
          {locale === 'en' ? 'Account Settings' : 'Cài Đặt Tài Khoản'}
        </h1>
        <p className="text-sm text-zinc-400 mt-1 pl-4">
          {locale === 'en'
            ? 'Update your display name, profile photo, bio, and security preferences'
            : 'Chỉnh sửa thông tin hiển thị, ảnh đại diện, tiểu sử và cài đặt tài khoản'}
        </p>
      </div>

      <SettingsForm
        locale={locale}
        email={user.email || ''}
        initialDisplayName={profile?.display_name || user.email?.split('@')[0] || ''}
        initialBio={profile?.bio || ''}
        initialLanguagePref={profile?.language_pref || locale}
        initialAvatarUrl={profile?.avatar_url || ''}
      />
    </main>
  );
}
