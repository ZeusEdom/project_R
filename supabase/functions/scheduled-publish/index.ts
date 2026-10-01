// Scheduled Publish Edge Function
// Triggered by cron job every minute
// Publishes chapters where status = 'scheduled' AND scheduled_at <= now()

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

Deno.serve(async (req: Request) => {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find scheduled chapters that are due
    const now = new Date().toISOString();
    const { data: chapters, error } = await supabase
      .from('chapters')
      .select('id, story_id, title')
      .eq('status', 'scheduled')
      .lte('scheduled_at', now);

    if (error) throw error;
    if (!chapters || chapters.length === 0) {
      return new Response(JSON.stringify({ message: 'No chapters to publish' }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Publish each chapter
    const publishedIds: string[] = [];
    for (const chapter of chapters) {
      const { error: updateError } = await supabase
        .from('chapters')
        .update({ status: 'published', published_at: now })
        .eq('id', chapter.id);

      if (!updateError) {
        publishedIds.push(chapter.id);
        // TODO (Phase 5): Trigger send-notification for this chapter
      }
    }

    return new Response(
      JSON.stringify({ published: publishedIds.length, ids: publishedIds }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
