import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { createServerSupabase } from '@repo/supabase/server';
import type { Story, Chapter } from '@repo/types';
import { TextReader } from '@/components/TextReader';
import { MangaReader } from '@/components/MangaReader';
import { ReadingTracker } from '@/components/ReadingTracker';
import { CommentSection } from '@/components/CommentSection';

export default async function ChapterReaderPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string; chapter: string }>;
}) {
  const { locale, slug, chapter } = await params;
  setRequestLocale(locale);

  const chapterNum = parseInt(chapter, 10);
  if (isNaN(chapterNum)) notFound();

  const supabase = await createServerSupabase();

  const [{ data: storyData }, { data: { user } }] = await Promise.all([
    supabase.from('stories').select('id, title, slug, type, cover_url').eq('slug', slug).single(),
    supabase.auth.getUser(),
  ]);

  const story = storyData as unknown as Pick<Story, 'id' | 'title' | 'slug' | 'type' | 'cover_url'> | null;

  if (!story) notFound();

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

  const { data: currentChapterData } = await supabase
    .from('chapters')
    .select('*')
    .eq('story_id', story.id)
    .eq('chapter_number', chapterNum)
    .eq('status', 'published')
    .single();

  const currentChapter = currentChapterData as unknown as Chapter | null;

  if (!currentChapter) notFound();

  // Fetch adjacent chapters & chapter comments in parallel
  const [{ data: prevChData }, { data: nextChData }, { data: commentsData }] = await Promise.all([
    supabase
      .from('chapters')
      .select('chapter_number')
      .eq('story_id', story.id)
      .eq('chapter_number', chapterNum - 1)
      .eq('status', 'published')
      .maybeSingle(),
    supabase
      .from('chapters')
      .select('chapter_number')
      .eq('story_id', story.id)
      .eq('chapter_number', chapterNum + 1)
      .eq('status', 'published')
      .maybeSingle(),
    (supabase as any)
      .from('comments')
      .select('*, profile:profiles(display_name, avatar_url)')
      .eq('chapter_id', currentChapter.id)
      .eq('status', 'approved')
      .order('created_at', { ascending: false }),
  ]);

  const prevCh = prevChData as unknown as { chapter_number: number } | null;
  const nextCh = nextChData as unknown as { chapter_number: number } | null;

  const comments = (commentsData || []).map((c: any) => ({
    id: c.id,
    userId: c.user_id,
    content: c.content,
    createdAt: c.created_at,
    userDisplayName: c.profile?.display_name || 'Độc giả',
    userAvatarUrl: c.profile?.avatar_url || undefined,
    chapterNumber: currentChapter.chapter_number,
  }));

  const isManga =
    story.type === 'manga' ||
    (currentChapter.content_images && currentChapter.content_images.length > 0);

  return (
    <>
      <ReadingTracker
        storyId={story.id}
        storyTitle={story.title}
        storySlug={story.slug}
        chapterId={currentChapter.id}
        chapterNumber={currentChapter.chapter_number}
        chapterTitle={currentChapter.title}
        coverUrl={story.cover_url || undefined}
      />

      {isManga && currentChapter.content_images && currentChapter.content_images.length > 0 ? (
        <MangaReader
          title={currentChapter.title}
          chapterNumber={currentChapter.chapter_number}
          contentImages={currentChapter.content_images}
          storySlug={story.slug}
          locale={locale}
          previousChapterNumber={prevCh?.chapter_number}
          nextChapterNumber={nextCh?.chapter_number}
        />
      ) : (
        <TextReader
          title={currentChapter.title}
          chapterNumber={currentChapter.chapter_number}
          contentText={currentChapter.content_text || ''}
          storySlug={story.slug}
          locale={locale}
          previousChapterNumber={prevCh?.chapter_number}
          nextChapterNumber={nextCh?.chapter_number}
        />
      )}

      {/* Chapter Comments Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-16 pt-8">
        <CommentSection
          storyId={story.id}
          chapterId={currentChapter.id}
          locale={locale}
          isLoggedIn={Boolean(user)}
          currentUserId={user?.id}
          currentUserAvatarUrl={currentUserAvatarUrl}
          initialComments={comments}
        />
      </div>
    </>
  );
}
