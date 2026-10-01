import { redirect } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { createServerSupabase, createServiceSupabase } from '@repo/supabase/server';
import { Card, CardContent, Badge, IconBookmark, IconBook, IconCalendar } from '@repo/ui';

export const dynamic = 'force-dynamic';

const OWNER_ADMIN_EMAIL = 'thedzorc@gmail.com';

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  const [{ data: profileData }, { count: bookmarksCount }, { count: historyCount }] =
    await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('bookmarks').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
      (supabase as any)
        .from('reading_progress')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id),
    ]);

  const profile = profileData as any;
  const isOwner = user.email?.toLowerCase() === OWNER_ADMIN_EMAIL;

  // Cleanup: If a non-owner user has is_admin = true in DB from old test code, fix it immediately
  if (!isOwner && profile?.is_admin) {
    try {
      const serviceSupabase = await createServiceSupabase();
      await serviceSupabase.from('profiles').update({ is_admin: false }).eq('id', user.id);
    } catch {
      // ignore
    }
  }

  const displayName = profile?.display_name || user.email?.split('@')[0] || 'Độc giả';
  const bio = profile?.bio || (locale === 'en' ? 'No bio added yet.' : 'Chưa có tiểu sử cá nhân.');
  const avatarUrl = profile?.avatar_url || '';
  const isAdmin = isOwner && Boolean(profile?.is_admin);

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8 min-h-[70vh]">
      {/* Header */}
      <div className="border-b border-zinc-800 pb-5">
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-100 border-l-4 border-emerald-500 pl-3">
          {locale === 'en' ? 'User Profile' : 'Trang Cá Nhân Độc Giả'}
        </h1>
        <p className="text-sm text-zinc-400 mt-1 pl-4">
          {locale === 'en'
            ? 'View your personal profile details and reading stats'
            : 'Xem thông tin cá nhân và thống kê số liệu đọc truyện'}
        </p>
      </div>

      {/* Main Profile Info Card */}
      <Card className="border-zinc-800 bg-zinc-900/90 shadow-2xl relative overflow-hidden">
        {/* Top Cover Banner Overlay */}
        <div className="h-32 bg-gradient-to-r from-emerald-900/50 via-teal-900/30 to-zinc-900 border-b border-zinc-800/80" />

        <CardContent className="px-6 pb-8 pt-0 relative z-10">
          <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-6 -mt-14 mb-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 text-center sm:text-left">
              {/* Avatar Box */}
              <div className="w-28 h-28 rounded-3xl bg-zinc-950 border-4 border-zinc-900 shadow-2xl overflow-hidden flex items-center justify-center shrink-0">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-extrabold text-3xl text-emerald-400 bg-emerald-500/10">
                    {displayName[0].toUpperCase()}
                  </div>
                )}
              </div>

              {/* Name & Badge */}
              <div className="space-y-1 pb-1">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-100 tracking-tight">
                    {displayName}
                  </h2>
                  {isAdmin && (
                    <Badge variant="success" className="text-[10px] font-mono">
                      ADMINISTRATOR
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-zinc-400 font-mono">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 mb-6">
            <div className="flex items-center gap-3 p-2">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                <IconBookmark size={20} />
              </div>
              <div>
                <p className="text-[11px] font-mono uppercase text-zinc-500">
                  {locale === 'en' ? 'Bookmarks' : 'Đã Đánh Dấu'}
                </p>
                <p className="text-lg font-extrabold text-zinc-100">{bookmarksCount || 0}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                <IconBook size={20} />
              </div>
              <div>
                <p className="text-[11px] font-mono uppercase text-zinc-500">
                  {locale === 'en' ? 'Read Chapters' : 'Chương Đã Đọc'}
                </p>
                <p className="text-lg font-extrabold text-zinc-100">{historyCount || 0}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-2 col-span-2 sm:col-span-1">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center shrink-0">
                <IconCalendar size={20} />
              </div>
              <div>
                <p className="text-[11px] font-mono uppercase text-zinc-500">
                  {locale === 'en' ? 'Joined Date' : 'Ngày Tham Gia'}
                </p>
                <p className="text-xs font-mono font-bold text-zinc-200 mt-1">
                  {new Date(profile?.created_at || user.created_at).toLocaleDateString(locale)}
                </p>
              </div>
            </div>
          </div>

          {/* User Bio Box */}
          <div className="space-y-2 border-t border-zinc-800/80 pt-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">
              {locale === 'en' ? 'About Me (Bio)' : 'Giới thiệu bản thân (Bio)'}
            </h3>
            <div className="p-4 rounded-2xl bg-zinc-950/40 border border-zinc-800/60 text-sm text-zinc-300 leading-relaxed italic">
              &quot;{bio}&quot;
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
