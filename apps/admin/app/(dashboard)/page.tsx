import Link from 'next/link';
import { createServerSupabase } from '@repo/supabase/server';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Badge,
  IconBook,
  IconScroll,
  IconUsers,
  IconActivity,
  IconPlus,
  IconChevronRight,
} from '@repo/ui';

export default async function DashboardPage() {
  const supabase = await createServerSupabase();
  const db = supabase as any;

  // Fetch counts
  const [{ count: storyCount }, { count: chapterCount }, { count: userCount }, { data: recentStories }] =
    await Promise.all([
      db.from('stories').select('*', { count: 'exact', head: true }),
      db.from('chapters').select('*', { count: 'exact', head: true }),
      db.from('profiles').select('*', { count: 'exact', head: true }),
      db
        .from('stories')
        .select('id, title, slug, type, status, updated_at, cover_url')
        .order('updated_at', { ascending: false })
        .limit(5),
    ]);

  const metrics = [
    { label: 'Tổng số truyện', value: storyCount || 0, icon: IconBook, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    { label: 'Tổng số chương', value: chapterCount || 0, icon: IconScroll, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
    { label: 'Độc giả đăng ký', value: userCount || 0, icon: IconUsers, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
    { label: 'Trạng thái hệ thống', value: 'Hoạt động', icon: IconActivity, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Bar / Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100 flex items-center gap-2">
            Bảng tổng quan
          </h1>
          <p className="text-xs text-zinc-400 mt-1">Thống kê chỉ số và các cập nhật mới nhất trong hệ thống</p>
        </div>
        <Link href="/stories/new">
          <Button variant="primary" className="flex items-center gap-2 px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-950/40 font-semibold text-sm">
            <IconPlus size={18} />
            <span>Thêm truyện mới</span>
          </Button>
        </Link>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <Card key={m.label} className="bg-zinc-900/60 border-zinc-800/80 hover:border-zinc-700 transition-all duration-200">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">{m.label}</p>
                  <p className={`text-2xl font-bold mt-2 tracking-tight ${m.color}`}>{m.value}</p>
                </div>
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${m.bg}`}>
                  <Icon size={20} className={m.color} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Stories Table */}
      <Card className="bg-zinc-900/60 border-zinc-800/80">
        <CardHeader className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/80">
          <CardTitle className="text-sm font-bold text-zinc-200 uppercase tracking-wider">
            Truyện mới cập nhật gần đây
          </CardTitle>
          <Link href="/stories" className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors">
            <span>Xem tất cả</span>
            <IconChevronRight size={14} />
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          {!recentStories || recentStories.length === 0 ? (
            <div className="p-12 text-center text-zinc-500 text-sm">
              Chưa có truyện nào trong hệ thống. Hãy bắt đầu bằng cách thêm một truyện mới!
            </div>
          ) : (
            <div className="divide-y divide-zinc-800/60">
              {recentStories.map((story: any) => (
                <div key={story.id} className="px-6 py-4 flex items-center justify-between hover:bg-zinc-800/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-14 rounded-lg bg-zinc-800/80 border border-zinc-700/50 overflow-hidden shrink-0 flex items-center justify-center text-zinc-600 font-mono text-[10px]">
                      {story.cover_url ? (
                        <img src={story.cover_url} alt={story.title} className="w-full h-full object-cover" />
                      ) : (
                        'NO COVER'
                      )}
                    </div>
                    <div>
                      <Link href={`/stories/${story.id}/edit`} className="font-semibold text-zinc-100 hover:text-emerald-400 transition-colors text-sm">
                        {story.title}
                      </Link>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[11px] font-mono uppercase text-zinc-500 bg-zinc-800/60 px-2 py-0.5 rounded border border-zinc-700/40">
                          {story.type}
                        </span>
                        <Badge variant={story.status === 'ongoing' ? 'success' : story.status === 'completed' ? 'info' : 'default'}>
                          {story.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Link href={`/stories/${story.id}/chapters`}>
                    <Button variant="ghost" size="sm" className="text-xs text-zinc-300 hover:text-emerald-400 flex items-center gap-1">
                      <span>Quản lý chương</span>
                      <IconChevronRight size={14} />
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
