import { createServerSupabase } from '@repo/supabase/server';
import type { Profile } from '@repo/types';
import { Badge, Button, Card, CardHeader, CardTitle, CardContent, IconUsers } from '@repo/ui';
import { UserActionButtons } from './UserActionButtons';
import Link from 'next/link';

export default async function UsersManagementPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string }>;
}) {
  const { query } = await searchParams;
  const supabase = await createServerSupabase();

  const { data: { user } } = await supabase.auth.getUser();
  const currentUserId = user?.id || '';

  let dbQuery = supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (query?.trim()) {
    dbQuery = dbQuery.ilike('display_name', `%${query.trim()}%`);
  }

  const { data: usersData } = await dbQuery;
  const users = (usersData || []) as Profile[];

  const totalUsers = users.length;
  const adminCount = users.filter((u) => u.is_admin).length;
  const bannedCount = users.filter((u) => u.is_banned).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100 flex items-center gap-2.5">
            <IconUsers className="text-emerald-400" size={24} />
            Quản Lý Độc Giả ({totalUsers})
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Danh sách tất cả người dùng và quản trị viên trong hệ thống
          </p>
        </div>

        {/* Stats Pills */}
        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 font-mono">
            Tổng: <strong className="text-zinc-100">{totalUsers}</strong>
          </span>
          <span className="px-3 py-1 rounded-lg bg-emerald-950/60 border border-emerald-800/80 text-emerald-400 font-mono">
            Admin: <strong className="text-emerald-300">{adminCount}</strong>
          </span>
          <span className="px-3 py-1 rounded-lg bg-red-950/60 border border-red-800/80 text-red-400 font-mono">
            Bị khóa: <strong className="text-red-300">{bannedCount}</strong>
          </span>
        </div>
      </div>

      {/* Search Input Filter */}
      <Card className="border-zinc-800 bg-zinc-900/60">
        <CardContent className="p-4">
          <form method="GET" className="flex items-center gap-3">
            <input
              type="text"
              name="query"
              defaultValue={query || ''}
              placeholder="Tìm kiếm người dùng theo tên..."
              className="flex-1 rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500"
            />
            <Button type="submit" variant="primary" size="md">
              Tìm kiếm
            </Button>
            {query && (
              <Link href="/users">
                <Button variant="ghost" size="md" type="button">
                  Xóa bộ lọc
                </Button>
              </Link>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Users Table */}
      {users.length === 0 ? (
        <Card className="border-zinc-800 bg-zinc-900/40 text-center py-12">
          <CardContent className="text-zinc-500 text-sm">
            {query ? 'Không tìm thấy người dùng nào phù hợp từ khóa.' : 'Chưa có người dùng nào trong hệ thống.'}
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-zinc-300">
              <thead className="border-b border-zinc-800 bg-zinc-900/80 text-xs font-semibold uppercase tracking-wider text-zinc-400 font-mono">
                <tr>
                  <th className="px-5 py-3.5">Người dùng</th>
                  <th className="px-5 py-3.5">Vai trò</th>
                  <th className="px-5 py-3.5">Trạng thái</th>
                  <th className="px-5 py-3.5">Ngôn ngữ</th>
                  <th className="px-5 py-3.5">Ngày tham gia</th>
                  <th className="px-5 py-3.5 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-emerald-950 border border-emerald-800/60 flex items-center justify-center font-bold text-emerald-400 text-sm shrink-0">
                          {u.avatar_url ? (
                            <img src={u.avatar_url} alt={u.display_name || ''} className="w-full h-full rounded-full object-cover" />
                          ) : (
                            (u.display_name || 'U').charAt(0).toUpperCase()
                          )}
                        </div>
                        <div>
                          <Link
                            href={`/users/${u.id}`}
                            className="font-semibold text-zinc-100 hover:text-emerald-400 hover:underline transition-colors"
                          >
                            {u.display_name || 'Độc giả'}
                          </Link>
                          <div className="text-[11px] font-mono text-zinc-500">{u.id}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      {u.is_admin ? (
                        <Badge variant="success" className="font-bold">ADMIN</Badge>
                      ) : (
                        <Badge variant="default">Độc giả</Badge>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      {u.is_banned ? (
                        <Badge variant="danger" className="font-bold">BỊ KHÓA</Badge>
                      ) : (
                        <Badge variant="success">Hoạt động</Badge>
                      )}
                    </td>

                    <td className="px-5 py-4 text-xs font-mono uppercase">
                      {u.language_pref || 'vi'}
                    </td>

                    <td className="px-5 py-4 text-xs font-mono text-zinc-400">
                      {new Date(u.created_at).toLocaleDateString('vi-VN')}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <UserActionButtons
                        currentUserId={currentUserId}
                        targetUserId={u.id}
                        targetUserName={u.display_name || 'Độc giả'}
                        isAdmin={u.is_admin}
                        isBanned={u.is_banned}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
