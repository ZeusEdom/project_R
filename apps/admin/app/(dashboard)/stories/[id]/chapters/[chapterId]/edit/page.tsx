import { notFound } from 'next/navigation';
import { createServerSupabase } from '@repo/supabase/server';
import { EditChapterForm } from './EditChapterForm';

export default async function EditChapterPage({
  params,
}: {
  params: Promise<{ id: string; chapterId: string }>;
}) {
  const { id: storyId, chapterId } = await params;
  const supabase = await createServerSupabase();

  const { data: chapter } = await (supabase as any)
    .from('chapters')
    .select('*')
    .eq('id', chapterId)
    .eq('story_id', storyId)
    .single();

  if (!chapter) {
    notFound();
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
          Chỉnh sửa Chương {chapter.chapter_number}
        </h1>
        <p className="text-sm text-zinc-400 mt-1">Cập nhật nội dung hoặc đổi trạng thái phát hành</p>
      </div>

      <EditChapterForm storyId={storyId} chapter={chapter} />
    </div>
  );
}
