import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createServerSupabase } from '@repo/supabase/server';
import { Button, Card, Badge, IconEdit } from '@repo/ui';

export default async function StoryChaptersPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabase();

  const [{ data: story }, { data: chaptersData }] = await Promise.all([
    (supabase as any).from('stories').select('id, title, type').eq('id', id).single(),
    (supabase as any)
      .from('chapters')
      .select('id, chapter_number, title, status, word_count, published_at, scheduled_at, updated_at')
      .eq('story_id', id)
      .order('chapter_number', { ascending: true }),
  ]);

  const chapters = (chaptersData || []) as any[];

  if (!story) {
    notFound();
  }

  const statusVariant: Record<string, 'default' | 'success' | 'warning'> = {
    draft: 'default',
    published: 'success',
    scheduled: 'warning',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-zinc-400 mb-1">
            <Link href="/stories" className="hover:underline">Tất cả truyện</Link>
            <span>/</span>
            <span className="text-zinc-200 font-medium">{story.title}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100">Danh sách chương ({chapters?.length || 0})</h1>
        </div>
        <Link href={`/stories/${id}/chapters/new`}>
          <Button variant="primary">➕ Thêm chương mới</Button>
        </Link>
      </div>

      <Card className="bg-zinc-900/90 border-zinc-800 overflow-hidden">
        {!chapters || chapters.length === 0 ? (
          <div className="p-8 text-center text-zinc-500">
            Truyện này chưa có chương nào. Nhấn &quot;Thêm chương mới&quot; để viết chương đầu tiên!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-zinc-300">
              <thead className="bg-zinc-800/60 text-xs font-semibold uppercase text-zinc-400 border-b border-zinc-800">
                <tr>
                  <th className="px-4 py-3.5 w-20 text-center">Chương</th>
                  <th className="px-4 py-3.5">Tiêu đề chương</th>
                  <th className="px-4 py-3.5">Trạng thái</th>
                  <th className="px-4 py-3.5 text-right">Số từ</th>
                  <th className="px-4 py-3.5 text-right">Ngày xuất bản / Lên lịch</th>
                  <th className="px-6 py-3.5 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80">
                {chapters.map((ch) => (
                  <tr key={ch.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-4 py-3 text-center font-bold text-emerald-400 font-mono">
                      #{ch.chapter_number}
                    </td>
                    <td className="px-4 py-3 font-medium text-zinc-100">{ch.title}</td>
                    <td className="px-4 py-3">
                      <Badge variant={statusVariant[ch.status] || 'default'}>
                        {ch.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-zinc-400">{ch.word_count || '-'}</td>
                    <td className="px-4 py-3 text-right text-xs text-zinc-400">
                      {ch.status === 'published' && ch.published_at
                        ? new Date(ch.published_at).toLocaleDateString('vi-VN')
                        : ch.status === 'scheduled' && ch.scheduled_at
                        ? `📅 ${new Date(ch.scheduled_at).toLocaleString('vi-VN')}`
                        : 'Bản nháp'}
                    </td>
                    <td className="px-6 py-3 text-right">
                      <Link href={`/stories/${id}/chapters/${ch.id}/edit`}>
                        <Button variant="secondary" size="sm" className="text-xs flex items-center gap-1 px-3">
                          <IconEdit size={14} />
                          <span>Chỉnh sửa / Xuất bản</span>
                        </Button>
                      </Link>
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
