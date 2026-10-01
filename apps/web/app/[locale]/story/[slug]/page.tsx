import Link from 'next/link';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { createServerSupabase } from '@repo/supabase/server';
import type { Story, Chapter, Genre } from '@repo/types';
import { Button, Badge, IconBook, IconEye, IconLayers } from '@repo/ui';
import { ChapterListInteractive } from '@/components/ChapterListInteractive';
import { BookmarkButton } from '@/components/BookmarkButton';
import { RatingStars } from '@/components/RatingStars';
import { CommentSection } from '@/components/CommentSection';

export default async function StoryDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const supabase = await createServerSupabase();

  const [{ data: storyData }, { data: { user } }] = await Promise.all([
    supabase.from('stories').select('*').eq('slug', slug).single(),
    supabase.auth.getUser(),
  ]);

  const story = storyData as Story | null;

  if (!story) {
    notFound();
  }

  // Fetch current user avatar
  let currentUserAvatarUrl: string | undefined = undefined;
  if (user) {
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('avatar_url')
      .eq('id', user.id)
      .maybeSingle();
    currentUserAvatarUrl = (userProfile as any)?.avatar_url || undefined;
  }

  // Fetch story genres, chapters, and comments in parallel
  const [{ data: storyGenresData }, { data: chaptersData }, { data: commentsData }] = await Promise.all([
    supabase.from('story_genres').select('genre_id').eq('story_id', story.id),
    supabase
      .from('chapters')
      .select('id, chapter_number, title, published_at, word_count')
      .eq('story_id', story.id)
      .eq('status', 'published')
      .order('chapter_number', { ascending: true }),
    (supabase as any)
      .from('comments')
      .select('*, profile:profiles(display_name, avatar_url)')
      .eq('story_id', story.id)
      .eq('status', 'approved')
      .order('created_at', { ascending: false }),
  ]);

  const genreIds = (storyGenresData || []).map((sg: any) => sg.genre_id);
  let genres: Genre[] = [];
  if (genreIds.length > 0) {
    const { data: genresData } = await supabase
      .from('genres')
      .select('*')
      .in('id', genreIds)
      .order('sort_order', { ascending: true });
    genres = (genresData || []) as unknown as Genre[];
  }

  const chapters = (chaptersData || []) as unknown as Pick<Chapter, 'id' | 'chapter_number' | 'title' | 'published_at' | 'word_count'>[];
  const firstChapter = chapters?.[0];

  const comments = (commentsData || []).map((c: any) => ({
    id: c.id,
    userId: c.user_id,
    content: c.content,
    createdAt: c.created_at,
    userDisplayName: c.profile?.display_name || 'Độc giả',
    userAvatarUrl: c.profile?.avatar_url || undefined,
    chapterNumber: null,
  }));

  const typeLabels: Record<string, Record<string, string>> = {
    novel: { vi: 'TIỂU THUYẾT', en: 'NOVEL' },
    manga: { vi: 'MANGA / TRUYỆN TRANH', en: 'MANGA' },
    light_novel: { vi: 'LIGHT NOVEL', en: 'LIGHT NOVEL' },
  };

  const statusLabels: Record<string, Record<string, string>> = {
    ongoing: { vi: 'Đang ra', en: 'Ongoing' },
    completed: { vi: 'Hoàn thành', en: 'Completed' },
    hiatus: { vi: 'Tạm ngưng', en: 'Hiatus' },
    draft: { vi: 'Bản nháp', en: 'Draft' },
  };

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-10">
      {/* Story Hero Banner Box with Ambient Cover Background */}
      <div className="relative bg-zinc-900/90 border border-zinc-800/80 rounded-3xl p-6 sm:p-8 overflow-hidden shadow-2xl">
        {/* Blurred Cover Art Ambient Background */}
        {story.cover_url && (
          <div
            className="absolute inset-0 bg-cover bg-center blur-3xl opacity-25 scale-125 pointer-events-none"
            style={{ backgroundImage: `url(${story.cover_url})` }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
          {/* Main Cover Image */}
          <div className="w-48 sm:w-52 h-64 sm:h-72 rounded-2xl overflow-hidden shadow-2xl border border-zinc-700/60 shrink-0 bg-zinc-800 relative group">
            {story.cover_url ? (
              <img
                src={story.cover_url}
                alt={story.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-600 font-mono text-xs">
                NO COVER
              </div>
            )}
          </div>

          {/* Details & Actions */}
          <div className="flex-1 space-y-4 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2.5">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-extrabold tracking-wider font-mono">
                {typeLabels[story.type]?.[locale] || typeLabels[story.type]?.vi || story.type}
              </span>
              <Badge variant={story.status === 'ongoing' ? 'success' : story.status === 'completed' ? 'info' : 'default'}>
                {statusLabels[story.status]?.[locale] || statusLabels[story.status]?.vi || story.status}
              </Badge>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-100 tracking-tight leading-tight">
              {story.title}
            </h1>

            {/* Display Genre Badges */}
            {genres.length > 0 && (
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-1.5 pt-1">
                <IconLayers size={14} className="text-emerald-400 mr-1" />
                {genres.map((g) => (
                  <Link
                    key={g.id}
                    href={`/${locale}/browse?genre=${g.slug}`}
                    className="px-2.5 py-0.5 rounded-lg bg-zinc-800/80 hover:bg-emerald-500/20 hover:text-emerald-400 border border-zinc-700/60 text-zinc-300 text-xs font-semibold transition-all"
                  >
                    {locale === 'en' && g.name_en ? g.name_en : g.name_vi}
                  </Link>
                ))}
              </div>
            )}

            <p className="text-zinc-300 leading-relaxed text-sm sm:text-base max-w-2xl pt-1">
              {story.synopsis || (locale === 'en' ? 'No synopsis available.' : 'Chưa có tóm tắt cho bộ truyện này.')}
            </p>

            {/* Stats & Rating */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 pt-1 text-sm font-semibold text-zinc-300">
              <div className="flex items-center gap-2 font-mono">
                <IconEye className="w-4 h-4 text-emerald-400" />
                <span>{story.view_count || 0} {locale === 'en' ? 'views' : 'lượt xem'}</span>
              </div>
              <RatingStars
                storyId={story.id}
                initialRatingAvg={Number(story.rating_avg || 5)}
                initialRatingCount={Number(story.rating_count || 0)}
                locale={locale}
                isLoggedIn={Boolean(user)}
              />
              <div className="flex items-center gap-2 font-mono">
                <IconBook className="w-4 h-4 text-blue-400" />
                <span>{chapters.length} {locale === 'en' ? 'chapters' : 'chương'}</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="pt-4 flex flex-wrap items-center justify-center md:justify-start gap-4">
              {firstChapter ? (
                <Link href={`/${locale}/story/${story.slug}/${firstChapter.chapter_number}`}>
                  <Button variant="primary" size="lg" className="shadow-lg shadow-emerald-950 font-bold px-6">
                    <IconBook className="w-5 h-5" />
                    {locale === 'en' ? 'Start Reading (Ch. 1)' : 'Đọc Từ Đầu (Chương 1)'}
                  </Button>
                </Link>
              ) : (
                <Button variant="secondary" size="lg" disabled>
                  {locale === 'en' ? 'No chapters' : 'Chưa có chương'}
                </Button>
              )}

              <BookmarkButton
                storyId={story.id}
                storyTitle={story.title}
                storySlug={story.slug}
                coverUrl={story.cover_url || undefined}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Chapters Interactive List Section */}
      <ChapterListInteractive
        chapters={chapters}
        storySlug={story.slug}
        locale={locale}
      />

      {/* Comments Section */}
      <CommentSection
        storyId={story.id}
        locale={locale}
        isLoggedIn={Boolean(user)}
        currentUserId={user?.id}
        currentUserAvatarUrl={currentUserAvatarUrl}
        initialComments={comments}
      />
    </main>
  );
}
