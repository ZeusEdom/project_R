import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createServerSupabase, createServiceSupabase } from '@repo/supabase/server';
import { Card, CardHeader, CardTitle, CardContent, Badge, IconUser, IconBookmark, IconBook, IconMessage } from '@repo/ui';
import { UserDetailClient } from './UserDetailClient';

export const dynamic = 'force-dynamic';

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const sessionSupabase = await createServerSupabase();
  const { data: { user: currentUser } } = await sessionSupabase.auth.getUser();

  const serviceSupabase = await createServiceSupabase();

  // Fetch target profile
  const { data: targetProfileData } = await serviceSupabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (!targetProfileData) {
    notFound();
  }

  const targetProfile = targetProfileData as any;

  // Fetch target auth user info
  const { data: authUserData } = await serviceSupabase.auth.admin.getUserById(id);
  const authUser = authUserData?.user;

  // Stats queries
  const [{ count: bookmarksCount }, { count: historyCount }, { count: commentsCount }] = await Promise.all([
    serviceSupabase.from('bookmarks').select('*', { count: 'exact', head: true }).eq('user_id', id),
    serviceSupabase.from('reading_progress').select('*', { count: 'exact', head: true }).eq('user_id', id),
    serviceSupabase.from('comments').select('*', { count: 'exact', head: true }).eq('user_id', id),
  ]);

  const displayName = targetProfile.display_name || authUser?.email?.split('@')[0] || 'Độc giả';
  const email = authUser?.email || 'N/A';
  const provider = authUser?.app_metadata?.provider || 'email';
  const emailConfirmed = Boolean(authUser?.email_confirmed_at);
  const lastSignIn = authUser?.last_sign_in_at
    ? new Date(authUser.last_sign_in_at).toLocaleString('vi-VN')
    : 'Chưa đăng nhập';

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/users"
            className="px-3 py-1.5 rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-xs font-bold text-zinc-300 transition-colors"
          >
            ← Danh sách độc giả
          </Link>
          <h1 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
            <IconUser size={20} className="text-emerald-400" />
            Chi Tiết Tài Khoản
          </h1>
        </div>
      </div>

      {/* Main Details Card */}
      <Card className="border-zinc-800 bg-zinc-900/90 shadow-xl">
        <CardContent className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
            <div className="w-20 h-20 rounded-full bg-zinc-950 border-2 border-emerald-500/40 overflow-hidden flex items-center justify-center font-bold text-2xl text-emerald-400 shrink-0">
              {targetProfile.avatar_url ? (
                <img src={targetProfile.avatar_url} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                displayName[0].toUpperCase()
              )}
            </div>

            <div className="space-y-1 flex-1">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h2 className="text-2xl font-bold text-zinc-100">{displayName}</h2>
                {targetProfile.is_admin ? (
                  <Badge variant="success" className="font-bold">ADMIN</Badge>
                ) : (
                  <Badge variant="default">Độc giả</Badge>
                )}
                {targetProfile.is_banned && (
                  <Badge variant="danger" className="font-bold">BỊ KHÓA</Badge>
                )}
              </div>
              <p className="text-xs font-mono text-zinc-400">{email}</p>
              <p className="text-[11px] font-mono text-zinc-500">ID: {id}</p>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-zinc-800/80 text-xs font-mono">
            <div className="bg-zinc-950/60 p-3 rounded-xl border border-zinc-800">
              <span className="text-zinc-500 uppercase block text-[10px]">Phương thức xác thực</span>
              <span className="font-bold text-zinc-200 uppercase">{provider}</span>
            </div>

            <div className="bg-zinc-950/60 p-3 rounded-xl border border-zinc-800">
              <span className="text-zinc-500 uppercase block text-[10px]">Trạng thái Email</span>
              <span className={`font-bold ${emailConfirmed ? 'text-emerald-400' : 'text-amber-400'}`}>
                {emailConfirmed ? 'Đã xác thực' : 'Chưa xác thực'}
              </span>
            </div>

            <div className="bg-zinc-950/60 p-3 rounded-xl border border-zinc-800">
              <span className="text-zinc-500 uppercase block text-[10px]">Đăng nhập lần cuối</span>
              <span className="font-bold text-zinc-200">{lastSignIn}</span>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-4 pt-2">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-950/40 border border-zinc-800">
              <IconBookmark size={18} className="text-amber-400" />
              <div>
                <span className="text-[10px] text-zinc-500 uppercase block font-mono">Đánh dấu</span>
                <span className="text-base font-extrabold text-zinc-100">{bookmarksCount || 0}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-950/40 border border-zinc-800">
              <IconBook size={18} className="text-emerald-400" />
              <div>
                <span className="text-[10px] text-zinc-500 uppercase block font-mono">Đã đọc</span>
                <span className="text-base font-extrabold text-zinc-100">{historyCount || 0}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-950/40 border border-zinc-800">
              <IconMessage size={18} className="text-blue-400" />
              <div>
                <span className="text-[10px] text-zinc-500 uppercase block font-mono">Bình luận</span>
                <span className="text-base font-extrabold text-zinc-100">{commentsCount || 0}</span>
              </div>
            </div>
          </div>

          {/* Bio Box */}
          {targetProfile.bio && (
            <div className="pt-2">
              <span className="text-[10px] text-zinc-500 uppercase font-mono block mb-1">Tiểu sử cá nhân</span>
              <p className="text-xs text-zinc-300 italic bg-zinc-950/40 p-3 rounded-xl border border-zinc-800">
                &quot;{targetProfile.bio}&quot;
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Interactive Actions (Password reset, Timed Ban, Delete) */}
      <UserDetailClient
        currentUserId={currentUser?.id || ''}
        targetUserId={id}
        targetEmail={email}
        targetDisplayName={displayName}
        isAdmin={Boolean(targetProfile.is_admin)}
        isBanned={Boolean(targetProfile.is_banned)}
        bannedUntil={targetProfile.banned_until || null}
      />
    </div>
  );
}
