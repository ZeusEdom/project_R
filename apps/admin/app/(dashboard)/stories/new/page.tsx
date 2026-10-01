import { createServerSupabase } from '@repo/supabase/server';
import type { Genre } from '@repo/types';
import { NewStoryForm } from './NewStoryForm';

export default async function NewStoryPage() {
  const supabase = await createServerSupabase();

  const { data: genresData } = await supabase
    .from('genres')
    .select('*')
    .order('sort_order', { ascending: true });

  const genres = (genresData || []) as unknown as Genre[];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100">Thêm truyện mới</h1>
        <p className="text-sm text-zinc-400 mt-1">Tạo một tiểu thuyết, manga hoặc light novel mới và chọn thể loại</p>
      </div>

      <NewStoryForm genres={genres} />
    </div>
  );
}
