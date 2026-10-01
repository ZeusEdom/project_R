import { setRequestLocale } from 'next-intl/server';
import { createServerSupabase } from '@repo/supabase/server';
import type { Story, Genre } from '@repo/types';
import { StoryCard } from '@/components/StoryCard';
import { IconBook, IconFlame, IconSparkles, IconSearch, IconLayers } from '@repo/ui';
import Link from 'next/link';

export default async function BrowseStoriesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ type?: string; status?: string; genre?: string; sort?: string }>;
}) {
  const { locale } = await params;
  const { type, status, genre, sort } = await searchParams;
  setRequestLocale(locale);

  const supabase = await createServerSupabase();

  // Query all genres for filter bar
  const { data: genresData } = await supabase
    .from('genres')
    .select('*')
    .order('sort_order', { ascending: true });

  const genres = (genresData || []) as unknown as Genre[];

  // If genre filter is active, find matching story_ids first
  let storyIdsForGenre: string[] | null = null;
  if (genre) {
    const { data: selectedGenreData } = await supabase
      .from('genres')
      .select('id')
      .eq('slug', genre)
      .single();

    if (selectedGenreData) {
      const { data: sgData } = await supabase
        .from('story_genres')
        .select('story_id')
        .eq('genre_id', (selectedGenreData as any).id);

      storyIdsForGenre = (sgData || []).map((item: any) => item.story_id);
    } else {
      storyIdsForGenre = [];
    }
  }

  // Query published stories
  let query = (supabase as any)
    .from('stories')
    .select('*')
    .neq('status', 'draft');

  if (type) {
    query = query.eq('type', type);
  }
  if (status) {
    query = query.eq('status', status);
  }
  if (storyIdsForGenre !== null) {
    if (storyIdsForGenre.length > 0) {
      query = query.in('id', storyIdsForGenre);
    } else {
      // No stories match this genre
      query = query.eq('id', '00000000-0000-0000-0000-000000000000');
    }
  }

  // Apply sorting
  if (sort === 'views') {
    query = query.order('view_count', { ascending: false });
  } else if (sort === 'rating') {
    query = query.order('rating_avg', { ascending: false });
  } else {
    query = query.order('updated_at', { ascending: false });
  }

  const { data: storiesData } = await query;
  const stories = (storiesData || []) as unknown as Story[];

  function buildFilterUrl(newParams: { type?: string; status?: string; genre?: string; sort?: string }) {
    const merged = { type, status, genre, sort, ...newParams };
    const queryParts = [];
    if (merged.type) queryParts.push(`type=${merged.type}`);
    if (merged.status) queryParts.push(`status=${merged.status}`);
    if (merged.genre) queryParts.push(`genre=${merged.genre}`);
    if (merged.sort) queryParts.push(`sort=${merged.sort}`);
    const qString = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';
    return `/${locale}/browse${qString}`;
  }

  const hasActiveFilters = Boolean(type || status || genre || sort);
  const activeGenreObj = genres.find((g) => g.slug === genre);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-100 border-l-4 border-emerald-500 pl-3">
            {locale === 'en' ? 'Browse All Stories' : 'Duyệt Tất Cả Truyện'}
          </h1>
          <p className="text-sm text-zinc-400 mt-1 pl-4">
            {activeGenreObj
              ? (locale === 'en'
                  ? `Viewing stories in genre: ${activeGenreObj.name_en || activeGenreObj.name_vi}`
                  : `Đang xem các bộ truyện thuộc thể loại: ${activeGenreObj.name_vi}`)
              : (locale === 'en'
                  ? 'Explore rich manga, novel, and light novel collections'
                  : 'Khám phá kho truyện tranh manga, tiểu thuyết và light novel phong phú')}
          </p>
        </div>

        {hasActiveFilters && (
          <Link
            href={`/${locale}/browse`}
            className="px-3.5 py-1.5 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs font-semibold hover:bg-red-900/80 transition-colors shrink-0 self-start sm:self-auto"
          >
            {locale === 'en' ? 'Clear all filters' : 'Xóa tất cả bộ lọc'}
          </Link>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 space-y-4 backdrop-blur-md">
        {/* Story Type Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-bold text-zinc-400 uppercase tracking-wider font-mono min-w-[90px]">
            {locale === 'en' ? 'Type:' : 'Loại truyện:'}
          </span>
          <Link
            href={buildFilterUrl({ type: undefined })}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
              !type
                ? 'bg-emerald-500 text-zinc-950 font-bold'
                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
            }`}
          >
            {locale === 'en' ? 'All' : 'Tất cả'}
          </Link>
          <Link
            href={buildFilterUrl({ type: 'manga' })}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all flex items-center gap-1.5 ${
              type === 'manga'
                ? 'bg-emerald-500 text-zinc-950 font-bold'
                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
            }`}
          >
            <IconBook size={14} />
            <span>Manga</span>
          </Link>
          <Link
            href={buildFilterUrl({ type: 'novel' })}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all flex items-center gap-1.5 ${
              type === 'novel'
                ? 'bg-emerald-500 text-zinc-950 font-bold'
                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
            }`}
          >
            <IconBook size={14} />
            <span>Novel</span>
          </Link>
          <Link
            href={buildFilterUrl({ type: 'light_novel' })}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all flex items-center gap-1.5 ${
              type === 'light_novel'
                ? 'bg-emerald-500 text-zinc-950 font-bold'
                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
            }`}
          >
            <IconSparkles size={14} />
            <span>Light Novel</span>
          </Link>
        </div>

        {/* Genre Filters Row */}
        {genres.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 text-xs border-t border-zinc-800/80 pt-3">
            <span className="font-bold text-zinc-400 uppercase tracking-wider font-mono min-w-[90px] flex items-center gap-1">
              <IconLayers size={13} className="text-emerald-400" />
              <span>{locale === 'en' ? 'Genre:' : 'Thể loại:'}</span>
            </span>
            <Link
              href={buildFilterUrl({ genre: undefined })}
              className={`px-2.5 py-1 rounded-xl font-semibold transition-all ${
                !genre
                  ? 'bg-emerald-500 text-zinc-950 font-bold'
                  : 'bg-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700'
              }`}
            >
              {locale === 'en' ? 'All genres' : 'Tất cả thể loại'}
            </Link>
            {genres.map((g) => {
              const isSelected = genre === g.slug;
              const genreName = locale === 'en' ? (g.name_en || g.name_vi) : (g.name_vi || g.name_en);
              return (
                <Link
                  key={g.id}
                  href={buildFilterUrl({ genre: isSelected ? undefined : g.slug })}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-all ${
                    isSelected
                      ? 'bg-emerald-500 text-zinc-950 font-bold shadow-md shadow-emerald-950'
                      : 'bg-zinc-800/70 text-zinc-300 hover:bg-zinc-700 hover:text-white'
                  }`}
                >
                  {genreName}
                </Link>
              );
            })}
          </div>
        )}

        {/* Status & Sort Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs border-t border-zinc-800/80 pt-3">
          <span className="font-bold text-zinc-400 uppercase tracking-wider font-mono min-w-[90px]">
            {locale === 'en' ? 'Status:' : 'Trạng thái:'}
          </span>
          <Link
            href={buildFilterUrl({ status: undefined })}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
              !status
                ? 'bg-emerald-500 text-zinc-950 font-bold'
                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
            }`}
          >
            {locale === 'en' ? 'All' : 'Tất cả'}
          </Link>
          <Link
            href={buildFilterUrl({ status: 'ongoing' })}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all flex items-center gap-1.5 ${
              status === 'ongoing'
                ? 'bg-emerald-500 text-zinc-950 font-bold'
                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
            }`}
          >
            <IconFlame size={14} />
            <span>{locale === 'en' ? 'Ongoing' : 'Đang tiến hành'}</span>
          </Link>
          <Link
            href={buildFilterUrl({ status: 'completed' })}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
              status === 'completed'
                ? 'bg-emerald-500 text-zinc-950 font-bold'
                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
            }`}
          >
            {locale === 'en' ? 'Completed' : 'Hoàn thành'}
          </Link>

          <div className="ml-auto flex items-center gap-2 pt-2 sm:pt-0">
            <span className="font-bold text-zinc-400 uppercase tracking-wider font-mono">
              {locale === 'en' ? 'Sort by:' : 'Sắp xếp:'}
            </span>
            <Link
              href={buildFilterUrl({ sort: undefined })}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                !sort
                  ? 'bg-zinc-700 text-emerald-400 border border-emerald-500/40'
                  : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {locale === 'en' ? 'Latest' : 'Mới cập nhật'}
            </Link>
            <Link
              href={buildFilterUrl({ sort: 'views' })}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                sort === 'views'
                  ? 'bg-zinc-700 text-emerald-400 border border-emerald-500/40'
                  : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {locale === 'en' ? 'Most Viewed' : 'Lượt xem nhiều'}
            </Link>
          </div>
        </div>
      </div>

      {/* Stories Grid */}
      {stories.length === 0 ? (
        <div className="p-16 text-center text-zinc-500 bg-zinc-900/40 rounded-3xl border border-zinc-800 space-y-3">
          <div className="flex justify-center text-zinc-600">
            <IconSearch size={36} />
          </div>
          <div className="text-base font-bold text-zinc-300">
            {locale === 'en' ? 'No stories found' : 'Không tìm thấy truyện nào'}
          </div>
          <p className="text-xs text-zinc-500">
            {locale === 'en'
              ? 'Try selecting a different genre filter or press Ctrl+K to search.'
              : 'Hãy thử chọn bộ lọc thể loại khác hoặc tìm kiếm bằng Ctrl+K.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {stories.map((story) => (
            <StoryCard key={story.id} story={story} locale={locale} />
          ))}
        </div>
      )}
    </main>
  );
}
