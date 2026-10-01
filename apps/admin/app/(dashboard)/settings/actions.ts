'use server';

import { revalidatePath } from 'next/cache';
import { createServiceSupabase } from '@repo/supabase/server';
import { verifyAdmin } from '@/lib/auth';

export async function updateSiteSettingsAction(formData: FormData) {
  const admin = await verifyAdmin();
  if (!admin) return { error: 'Không có quyền thực hiện thao tác này' };

  const site_name = ((formData.get('site_name') as string) || 'STORY ARCH').trim();
  const site_description = ((formData.get('site_description') as string) || '').trim();
  let logo_url = ((formData.get('logo_url') as string) || '').trim();
  const facebook = ((formData.get('facebook') as string) || '').trim();
  const discord = ((formData.get('discord') as string) || '').trim();

  const logoFile = (formData.get('logo_file') as File | null) || (formData.get('logo_file_input') as File | null);

  const supabase = await createServiceSupabase();

  // Handle logo image file upload if provided
  if (logoFile && logoFile.size > 0 && typeof logoFile.name === 'string') {
    const ext = logoFile.name.split('.').pop() || 'png';
    const filePath = `logo/site-logo-${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('covers')
      .upload(filePath, logoFile, { upsert: true });

    if (uploadError) {
      return { error: `Lỗi tải ảnh logo: ${uploadError.message}` };
    }

    const { data: publicUrlData } = supabase.storage
      .from('covers')
      .getPublicUrl(filePath);
    logo_url = publicUrlData.publicUrl;
  }

  const settingsToUpdate = [
    { key: 'site_name', value: site_name },
    { key: 'site_description', value: site_description },
    { key: 'logo_url', value: logo_url },
    { key: 'social_links', value: { facebook, discord } },
  ];

  for (const item of settingsToUpdate) {
    const { error } = await (supabase as any).from('site_settings').upsert(
      {
        key: item.key,
        value: item.value,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'key' }
    );

    if (error) {
      return { error: `Lỗi cập nhật [${item.key}]: ${error.message}` };
    }
  }

  revalidatePath('/', 'layout');
  revalidatePath('/settings');
  return { success: true, logo_url };
}
