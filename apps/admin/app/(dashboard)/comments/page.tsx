import { createServerSupabase } from '@repo/supabase/server';
import { Badge, Card, CardContent, IconMessage } from '@repo/ui';
import { CommentActionButtons } from './CommentActionButtons';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function CommentsModerationPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const supabase = await createServerSupabase();

  let query = (supabase as any)
    .from('comments')
    .select('*, story:stories(title, slug), profile:profiles(display_name)')
    .order('created_at', { ascending: false });

  if (status && status !== 'all') {
    query = query.eq('status', status);
  }

  const { data: commentsData } = await query;
  const comments = (commentsData || []) as any[];

  const statusBadges: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'default' }> = {
    pending: { label: 'Chờ duyệt', variant: 'warning' },
    approved: { label: 'Đã duyệt', variant: 'success' },
    rejected: { label: 'Từ chối', variant: 'danger' },
    flagged: { label: 'Bị báo cáo', variant: 'danger' },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100 flex items-center gap-2.5">
            <IconMessage className="text-emerald-400" size={24} />
            Kiểm Duyệt Bình Luận ({comments.length})
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Quản lý và duyệt các bình luận độc giả gửi lên hệ thống
          </p>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 p-1 rounded-xl text-xs">
          <Link
            href="/comments"
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              !status || status === 'all'
                ? 'bg-emerald-500 text-zinc-950 font-bold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Tất cả
          </Link>
          <Link
            href="/comments?status=pending"
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              status === 'pending'
                ? 'bg-emerald-500 text-zinc-950 font-bold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Chờ duyệt
          </Link>
          <Link
            href="/comments?status=approved"
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              status === 'approved'
                ? 'bg-emerald-500 text-zinc-950 font-bold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Đã duyệt
          </Link>
          <Link
            href="/comments?status=flagged"
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              status === 'flagged'
                ? 'bg-emerald-500 text-zinc-950 font-bold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Vi phạm
          </Link>
        </div>
      </div>

      {/* Comments List */}
      {comments.length === 0 ? (
        <Card className="border-zinc-800 bg-zinc-900/40 text-center py-12">
          <CardContent className="text-zinc-500 text-sm">
            Không có bình luận nào trong danh mục này.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {comments.map((c) => {
            const statusInfo = statusBadges[c.status] || { label: c.status, variant: 'default' };
            return (
              <Card key={c.id} className="border-zinc-800 bg-zinc-900/60 hover:border-zinc-700 transition-all">
                <CardContent className="p-4 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800/80 pb-2.5">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-bold text-zinc-200">
                        {c.profile?.display_name || 'Độc giả ẩn danh'}
                      </span>
                      <span className="text-zinc-500">•</span>
                      <span className="text-emerald-400 font-semibold">
                        Truyện: {c.story?.title || 'Đã xóa'}
                      </span>
                      {c.chapter_id && <span className="text-zinc-500">• Chương {c.chapter_id}</span>}
                    </div>

                    <div className="flex items-center gap-3 text-xs">
                      <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                      <span className="text-zinc-500 font-mono">
                        {new Date(c.created_at).toLocaleString('vi-VN')}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-zinc-300 leading-relaxed bg-zinc-950/60 p-3 rounded-xl border border-zinc-800/60 font-mono">
                    {c.content}
                  </p>

                  <div className="flex justify-end pt-1">
                    <CommentActionButtons commentId={c.id} status={c.status} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
