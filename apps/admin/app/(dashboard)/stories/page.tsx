import Link from 'next/link';
import { createServerSupabase } from '@repo/supabase/server';
import {
  Button,
  Card,
  Badge,
  IconPlus,
  IconStar,
  IconEye,
  IconEdit,
  IconScroll,
} from '@repo/ui';

export default async function StoriesListPage() {
  const supabase = await createServerSupabase();

  const { data: storiesData } = await (supabase as any)
    .from('stories')
    .select('id, title, slug, type, status, is_featured, view_count, updated_at, cover_url')
    .order('updated_at', { ascending: false });

  const stories = (storiesData || []) as any[];

  const statusVariants: Record<string, 'default' | 'success' | 'warning' | 'info'> = {
    draft: 'default',
    ongoing: 'success',
    completed: 'info',
    hiatus: 'warning',
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
            Danh sách tất cả truyện
          </h1>
          <p className="text-xs text-zinc-400 mt-1">Quản lý tiểu thuyết, manga và light novel trong kho truyền tải</p>
        </div>
        <Link href="/stories/new">
          <Button variant="primary" className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm">
            <IconPlus size={18} />
            <span>Thêm truyện mới</span>
          </Button>
        </Link>
      </div>

      <Card className="bg-zinc-900/60 border-zinc-800/80 overflow-hidden">
        {!stories || stories.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 text-sm">
            Chưa có truyện nào trong hệ thống. Hãy nhấn &quot;Thêm truyện mới&quot; để khởi tạo!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-zinc-300">
              <thead className="bg-zinc-950/60 text-[11px] font-semibold uppercase text-zinc-400 border-b border-zinc-800/80">
                <tr>
                  <th className="px-6 py-4">Truyện</th>
                  <th className="px-4 py-4">Loại</th>
                  <th className="px-4 py-4">Trạng thái</th>
                  <th className="px-4 py-4 text-center">Nổi bật</th>
                  <th className="px-4 py-4 text-right">Lượt xem</th>
                  <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {stories.map((story) => (
                  <tr key={story.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-zinc-100">
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-13 rounded-lg bg-zinc-800 border border-zinc-700/50 overflow-hidden shrink-0">
                          {story.cover_url ? (
                            <img src={story.cover_url} alt={story.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[9px] text-zinc-600 font-mono">NO COVER</div>
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-zinc-100">{story.title}</div>
                          <div className="text-xs text-zinc-500 font-mono mt-0.5">/{story.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-xs font-mono uppercase text-zinc-400">{story.type}</td>
                    <td className="px-4 py-4">
                      <Badge variant={statusVariants[story.status] || 'default'}>
                        {story.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 text-center">
                      {story.is_featured ? (
                        <IconStar size={16} className="text-amber-400 mx-auto" />
                      ) : (
                        <span className="text-zinc-600">-</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-right font-mono text-zinc-300">
                      <span className="inline-flex items-center gap-1">
                        <IconEye size={14} className="text-zinc-500" />
                        {story.view_count}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/stories/${story.id}/chapters`}>
                          <Button variant="ghost" size="sm" className="text-xs text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/40 flex items-center gap-1.5 px-3">
                            <IconScroll size={14} />
                            <span>Chương</span>
                          </Button>
                        </Link>
                        <Link href={`/stories/${story.id}/edit`}>
                          <Button variant="secondary" size="sm" className="text-xs flex items-center gap-1.5 px-3">
                            <IconEdit size={14} />
                            <span>Sửa</span>
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
