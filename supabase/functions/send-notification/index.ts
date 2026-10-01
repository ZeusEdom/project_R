// Send Notification Edge Function
// Sends Web Push notifications to subscribed users
// Called by scheduled-publish or admin broadcast

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface NotificationPayload {
  story_id: string;
  chapter_id?: string;
  title: string;
  body: string;
  url?: string;
}

Deno.serve(async (req: Request) => {
  try {
    const payload: NotificationPayload = await req.json();
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // TODO (Phase 5): Implement full Web Push notification sending
    // 1. Query notification_subscriptions for story_id (or all if broadcast)
    // 2. For each subscription, send Web Push using VAPID keys
    // 3. Log each send in notification_log
    // 4. Handle expired/invalid subscriptions (remove them)

    return new Response(
      JSON.stringify({
        message: 'Notification sending not yet implemented',
        payload,
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
