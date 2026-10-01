import { setRequestLocale } from 'next-intl/server';
import { useTranslations } from 'next-intl';
import { createServerSupabase } from '@repo/supabase/server';
import { StoryHeroCarousel } from '@/components/StoryHeroCarousel';
import { StoryCard } from '@/components/StoryCard';
import { TopRankings } from '@/components/TopRankings';
import { GenreFilterChips } from '@/components/GenreFilterChips';
import { RecentHistoryBar } from '@/components/RecentHistoryBar';
import Link from 'next/link';

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const supabase = await createServerSupabase();

  const [
    { data: featuredData },
    { data: topRankedData },
    { data: latestStoriesData },
    { data: genresData },
  ] = await Promise.all([
    (supabase as any)
      .from('stories')
      .select('*')
      .neq('status', 'draft')
      .order('is_featured', { ascending: false })
      .order('updated_at', { ascending: false })
      .limit(6),
    (supabase as any)
      .from('stories')
      .select('*')
      .neq('status', 'draft')
      .order('view_count', { ascending: false })
      .limit(10),
    (supabase as any)
      .from('stories')
      .select('*')
      .neq('status', 'draft')
      .order('updated_at', { ascending: false })
      .limit(18),
    supabase
      .from('genres')
      .select('*')
      .order('sort_order', { ascending: true }),
  ]);

  const featuredStories = (featuredData || []) as any[];
  const topRankedStories = (topRankedData || []) as any[];
  const latestStories = (latestStoriesData || []) as any[];
  const genres = (genresData || []) as any[];

  return (
    <HomeContent
      locale={locale}
      featuredStories={featuredStories}
      topRankedStories={topRankedStories}
      latestStories={latestStories}
      genres={genres}
    />
  );
}

function HomeContent({
  locale,
  featuredStories,
  topRankedStories,
  latestStories,
  genres,
}: {
  locale: string;
  featuredStories: any[];
  topRankedStories: any[];
  latestStories: any[];
  genres: any[];
}) {
  const t = useTranslations('home');

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-12">
      {/* 1. Recently Read Stories Bar */}
      <RecentHistoryBar locale={locale} />

      {/* 2. Featured Autoplay Carousel Slider (3s interval) */}
      {featuredStories.length > 0 && (
        <StoryHeroCarousel stories={featuredStories} locale={locale} />
      )}

      {/* 3. Genre Filter Quick Chips */}
      {genres.length > 0 && (
        <GenreFilterChips genres={genres} locale={locale} />
      )}

      {/* 4. Top Rankings Section (BXH Hot) */}
      {topRankedStories.length > 0 && (
        <TopRankings stories={topRankedStories} locale={locale} />
      )}

      {/* 5. Latest Updates Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
          <div>
            <h2 className="text-xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 border-l-4 border-emerald-500 pl-3">
              {locale === 'en' ? 'Latest Updates' : 'Cập Nhật Mới Nhất'}
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 pl-4">
              {locale === 'en'
                ? 'Newly released chapters from translators'
                : 'Những chương truyện vừa ra mắt từ nhóm dịch'}
            </p>
          </div>
          <Link
            href={`/${locale}/browse`}
            className="text-xs font-semibold text-emerald-400 hover:underline"
          >
            {locale === 'en' ? 'All stories →' : 'Tất cả truyện →'}
          </Link>
        </div>

        {latestStories.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 dark:text-zinc-400 bg-zinc-900/40 rounded-3xl border border-zinc-800 shadow-sm">
            {locale === 'en'
              ? 'No stories have been published yet.'
              : 'Chưa có truyện nào được xuất bản trong hệ thống.'}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {latestStories.map((story) => (
              <StoryCard key={story.id} story={story} locale={locale} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
