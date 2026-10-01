'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createServiceSupabase } from '@repo/supabase/server';
import type { ChapterStatus } from '@repo/types';
import { verifyAdmin } from '@/lib/auth';

export async function createChapterAction(storyId: string, formData: FormData) {
  const admin = await verifyAdmin();
  if (!admin) return { error: 'Không có quyền thực hiện thao tác này' };

  const supabase = await createServiceSupabase();

  const title = ((formData.get('title') as string) || '').trim();
  const chapter_number = parseInt(formData.get('chapter_number') as string, 10);
  const content_text = formData.get('content_text') as string | null;
  const status = formData.get('status') as ChapterStatus;
  const scheduled_at = formData.get('scheduled_at') as string | null;

  const imageFiles = formData.getAll('chapter_images') as File[];
  const content_images: string[] = [];

  if (!title || isNaN(chapter_number)) {
    return { error: 'Vui lòng nhập Tên chương và Số chương hợp lệ' };
  }

  // Upload manga pages to 'chapters' bucket if provided
  if (imageFiles && imageFiles.length > 0) {
    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i];
      if (file && file.size > 0) {
        const ext = file.name.split('.').pop() || 'jpg';
        const filePath = `${storyId}/${chapter_number}/${Date.now()}-${i + 1}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from('chapters')
          .upload(filePath, file, { upsert: true });

        if (!uploadError) {
          const { data: publicUrlData } = supabase.storage
            .from('chapters')
            .getPublicUrl(filePath);
          content_images.push(publicUrlData.publicUrl);
        }
      }
    }
  }

  // Calculate word count for text chapters
  const word_count = content_text ? content_text.trim().split(/\s+/).length : content_images.length * 100;

  const { error } = await supabase.from('chapters').insert({
    story_id: storyId,
    chapter_number,
    title,
    content_text,
    content_images,
    status: status || 'draft',
    word_count,
    scheduled_at: scheduled_at ? new Date(scheduled_at).toISOString() : null,
    published_at: status === 'published' ? new Date().toISOString() : null,
  });

  if (error) {
    if (error.code === '23505' || error.message.includes('chapters_story_id_chapter_number_key')) {
      return { error: `Chương số ${chapter_number} đã tồn tại trong truyện này! Vui lòng nhập số chương khác (VD: Chương ${chapter_number + 1}).` };
    }
    return { error: `Lỗi thêm chương: ${error.message}` };
  }

  revalidatePath(`/stories/${storyId}/chapters`);
  redirect(`/stories/${storyId}/chapters`);
}

export async function updateChapterAction(chapterId: string, storyId: string, formData: FormData) {
  const admin = await verifyAdmin();
  if (!admin) return { error: 'Không có quyền thực hiện thao tác này' };

  const supabase = await createServiceSupabase();

  const title = ((formData.get('title') as string) || '').trim();
  const chapter_number = parseInt(formData.get('chapter_number') as string, 10);
  const content_text = formData.get('content_text') as string | null;
  const status = formData.get('status') as ChapterStatus;
  const scheduled_at = formData.get('scheduled_at') as string | null;
  const existingImagesJson = formData.get('existing_images') as string | null;

  let content_images: string[] = [];
  if (existingImagesJson) {
    try {
      content_images = JSON.parse(existingImagesJson);
    } catch {
      content_images = [];
    }
  }

  const imageFiles = formData.getAll('chapter_images') as File[];

  if (!title || isNaN(chapter_number)) {
    return { error: 'Vui lòng nhập Tên chương và Số chương hợp lệ' };
  }

  // Upload new manga pages if provided
  if (imageFiles && imageFiles.length > 0) {
    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i];
      if (file && file.size > 0) {
        const ext = file.name.split('.').pop() || 'jpg';
        const filePath = `${storyId}/${chapter_number}/${Date.now()}-${i + 1}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from('chapters')
          .upload(filePath, file, { upsert: true });

        if (!uploadError) {
          const { data: publicUrlData } = supabase.storage
            .from('chapters')
            .getPublicUrl(filePath);
          content_images.push(publicUrlData.publicUrl);
        }
      }
    }
  }

  const word_count = content_text ? content_text.trim().split(/\s+/).length : content_images.length * 100;

  const updateData: Record<string, any> = {
    chapter_number,
    title,
    content_text,
    content_images,
    status,
    word_count,
    scheduled_at: scheduled_at ? new Date(scheduled_at).toISOString() : null,
    updated_at: new Date().toISOString(),
  };

  if (status === 'published') {
    updateData.published_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from('chapters')
    .update(updateData as any)
    .eq('id', chapterId);

  if (error) {
    if (error.code === '23505' || error.message.includes('chapters_story_id_chapter_number_key')) {
      return { error: `Chương số ${chapter_number} đã tồn tại trong truyện này!` };
    }
    return { error: `Lỗi cập nhật chương: ${error.message}` };
  }

  revalidatePath(`/stories/${storyId}/chapters`);
  redirect(`/stories/${storyId}/chapters`);
}

export async function deleteChapterAction(chapterId: string, storyId: string) {
  const admin = await verifyAdmin();
  if (!admin) return { error: 'Không có quyền thực hiện thao tác này' };

  const supabase = await createServiceSupabase();
  const { error } = await supabase.from('chapters').delete().eq('id', chapterId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/stories/${storyId}/chapters`);
  return { success: true };
}
