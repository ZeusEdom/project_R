'use server';

import { revalidatePath } from 'next/cache';
import { createServerSupabase, createServiceSupabase } from '@repo/supabase/server';

export async function updateUserSettingsAction(formData: FormData, locale: string = 'vi') {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: locale === 'en' ? 'Unauthorized' : 'Bạn chưa đăng nhập' };
  }

  const displayName = (formData.get('displayName') as string) || '';
  const bio = (formData.get('bio') as string) || '';
  const languagePref = (formData.get('languagePref') as string) || 'vi';
  const avatarFile = formData.get('avatarFile') as File | null;

  let avatarUrl: string | undefined = undefined;

  // Upload avatar if provided using service role client to bypass storage RLS
  if (avatarFile && avatarFile.size > 0 && typeof avatarFile.name === 'string') {
    try {
      const serviceClient = await createServiceSupabase();
      const ext = avatarFile.name.split('.').pop() || 'png';
      const filePath = `avatars/avatar-${user.id}-${Date.now()}.${ext}`;

      const bytes = await avatarFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const { error: uploadError } = await serviceClient.storage
        .from('covers')
        .upload(filePath, buffer, {
          contentType: avatarFile.type || 'image/png',
          upsert: true,
        });

      if (!uploadError) {
        const { data: publicUrlData } = serviceClient.storage
          .from('covers')
          .getPublicUrl(filePath);
        avatarUrl = publicUrlData.publicUrl;
      }
    } catch {
      // ignore avatar upload failure fallback
    }
  }

  const updatePayload: Record<string, any> = {
    id: user.id,
    display_name: displayName,
    bio,
    language_pref: languagePref,
    updated_at: new Date().toISOString(),
  };

  if (avatarUrl) {
    updatePayload.avatar_url = avatarUrl;
  }

  const serviceClient = await createServiceSupabase();
  const { error: updateError } = await (serviceClient as any)
    .from('profiles')
    .upsert(updatePayload, { onConflict: 'id' });

  if (updateError) {
    return { error: updateError.message };
  }

  revalidatePath('/', 'layout');
  revalidatePath('/profile');
  revalidatePath('/settings');
  return {
    success: locale === 'en' ? 'Settings saved successfully!' : 'Đã lưu cài đặt tài khoản thành công!',
    avatarUrl,
  };
}
