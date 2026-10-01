import { setRequestLocale } from 'next-intl/server';
import { createServerSupabase } from '@repo/supabase/server';
import { IconBook } from '@repo/ui';
import { HistoryListClient } from './HistoryListClient';

interface ProgressItem {
  id: string;
  storyTitle: string;
  storySlug: string;
  coverUrl?: string;
  chapterNumber: number;
  chapterTitle: string;
  progressPercent: number;
  lastReadAt: string;
}

export default async function ReadingHistoryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  let historyItems: ProgressItem[] = [];

  if (user) {
    const { data: progressData } = await (supabase as any)
      .from('reading_progress')
      .select(`
        id,
        progress_percent,
        last_read_at,
        chapters:chapter_id (chapter_number, title),
        stories:story_id (title, slug, cover_url)
      `)
      .eq('user_id', user.id)
      .order('last_read_at', { ascending: false });

    if (progressData) {
      historyItems = (progressData as any[]).map((p) => ({
        id: p.id,
        storyTitle: p.stories?.title || 'Truyện',
        storySlug: p.stories?.slug || '',
        coverUrl: p.stories?.cover_url || undefined,
        chapterNumber: p.chapters?.chapter_number || 1,
        chapterTitle: p.chapters?.title || '',
        progressPercent: p.progress_percent || 0,
        lastReadAt: p.last_read_at,
      }));
    }
  }

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8 min-h-[70vh]">
      <div className="border-b border-zinc-800 pb-5">
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-100 border-l-4 border-emerald-500 pl-3 flex items-center gap-2">
          <IconBook className="text-emerald-400" size={28} />
          <span>{locale === 'en' ? 'Reading History' : 'Lịch Sử Đọc Truyện'}</span>
        </h1>
        <p className="text-sm text-zinc-400 mt-1 pl-4">
          {locale === 'en'
            ? 'Track your reading progress and continue where you left off'
            : 'Theo dõi tiến trình đọc và tiếp tục đọc những chương dở dang'}
        </p>
      </div>

      <HistoryListClient
        locale={locale}
        serverItems={historyItems}
        isLoggedIn={Boolean(user)}
      />
    </main>
  );
}
