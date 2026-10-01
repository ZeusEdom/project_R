import { createServerSupabase } from '@repo/supabase/server';
import { Card, CardContent, IconBell } from '@repo/ui';
import { NotificationFormClient } from './NotificationFormClient';
import { NotificationLogItem } from './NotificationLogItem';

export const dynamic = 'force-dynamic';

export default async function NotificationsPage() {
  const supabase = await createServerSupabase();

  const [{ data: storiesData }, { data: logsData }] = await Promise.all([
    supabase.from('stories').select('id, title').order('title', { ascending: true }),
    supabase.from('notification_log').select('*').order('sent_at', { ascending: false }).limit(20),
  ]);

  const stories = (storiesData || []) as any[];
  const logs = (logsData || []) as any[];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-zinc-800 pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100 flex items-center gap-2.5">
          <IconBell className="text-emerald-400" size={24} />
          Thông Báo & Phát Tin (Notification Broadcast)
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Gửi thông báo mới tới tất cả độc giả đã đăng ký nhận tin
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Send Broadcast */}
        <div className="lg:col-span-1">
          <NotificationFormClient stories={stories} />
        </div>

        {/* Sent Notification Logs */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
            Nhật Ký Thông Báo Đã Gửi ({logs.length})
          </h2>

          {logs.length === 0 ? (
            <Card className="border-zinc-800 bg-zinc-900/40 text-center py-12">
              <CardContent className="text-zinc-500 text-sm">
                Chưa có thông báo nào được gửi trong nhật ký.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => (
                <NotificationLogItem key={log.id} log={log} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
