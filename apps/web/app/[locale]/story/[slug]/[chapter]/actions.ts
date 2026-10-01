'use server';

import { createServerSupabase, createServiceSupabase } from '@repo/supabase/server';

export async function saveReadingProgressAction({
  storyId,
  chapterId,
  progressPercent = 100,
}: {
  storyId: string;
  chapterId: string;
  progressPercent?: number;
}) {
  if (!storyId || !chapterId) return;

  try {
    const supabase = await createServerSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const serviceClient = await createServiceSupabase();
      await serviceClient.from('reading_progress').upsert(
        {
          user_id: user.id,
          story_id: storyId,
          chapter_id: chapterId,
          progress_percent: Math.min(100, Math.max(1, progressPercent)),
          last_read_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,chapter_id' }
      );
    }
  } catch {
    // ignore tracking errors silently
  }
}
