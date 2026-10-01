'use server';

import { revalidatePath } from 'next/cache';
import { createServiceSupabase } from '@repo/supabase/server';

export async function sendNotificationBroadcastAction(formData: FormData) {
  const title = ((formData.get('title') as string) || '').trim();
  const body = ((formData.get('body') as string) || '').trim();
  const story_id = (formData.get('story_id') as string) || null;

  if (!title) {
    return { error: 'Tiêu đề thông báo không được để trống' };
  }

  const serviceSupabase = await createServiceSupabase();

  const { error } = await serviceSupabase.from('notification_log').insert({
    title,
    body: body || null,
    story_id,
    status: 'sent',
    sent_at: new Date().toISOString(),
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/notifications');
  return { success: true, message: 'Đã phát thông báo thành công!' };
}

export async function deleteNotificationAction(notificationId: string) {
  if (!notificationId) return { error: 'Thiếu ID thông báo' };

  const serviceSupabase = await createServiceSupabase();
  const { error } = await serviceSupabase
    .from('notification_log')
    .delete()
    .eq('id', notificationId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/notifications');
  return { success: true, message: 'Đã xóa thông báo thành công!' };
}

export async function editNotificationAction(
  notificationId: string,
  title: string,
  body: string
) {
  const trimmedTitle = title.trim();
  if (!notificationId || !trimmedTitle) {
    return { error: 'Tiêu đề không được để trống' };
  }

  const serviceSupabase = await createServiceSupabase();
  const { error } = await serviceSupabase
    .from('notification_log')
    .update({
      title: trimmedTitle,
      body: body.trim() || null,
    })
    .eq('id', notificationId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/notifications');
  return { success: true, message: 'Đã cập nhật thông báo thành công!' };
}
