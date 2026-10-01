import { notFound } from 'next/navigation';
import { createServerSupabase } from '@repo/supabase/server';
import type { Story, Genre } from '@repo/types';
import { EditStoryForm } from './EditStoryForm';

export default async function EditStoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabase();

  const [
    { data: storyData },
    { data: genresData },
    { data: storyGenresData },
  ] = await Promise.all([
    supabase.from('stories').select('*').eq('id', id).single(),
    supabase.from('genres').select('*').order('sort_order', { ascending: true }),
    supabase.from('story_genres').select('genre_id').eq('story_id', id),
  ]);

  if (!storyData) {
    notFound();
  }

  const story = storyData as unknown as Story;
  const genres = (genresData || []) as unknown as Genre[];
  const assignedGenreIds = (storyGenresData || []).map((sg: any) => sg.genre_id);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100">Chỉnh sửa truyện</h1>
        <p className="text-sm text-zinc-400 mt-1">Cập nhật thông tin chi tiết và thể loại cho &quot;{story.title}&quot;</p>
      </div>

      <EditStoryForm story={story} genres={genres} assignedGenreIds={assignedGenreIds} />
    </div>
  );
}
