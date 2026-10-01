'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createServiceSupabase } from '@repo/supabase/server';
import type { StoryType, StoryStatus } from '@repo/types';
import { verifyAdmin } from '@/lib/auth';

export async function createStoryAction(formData: FormData) {
  const admin = await verifyAdmin();
  if (!admin) return { error: 'Không có quyền thực hiện thao tác này' };

  const supabase = await createServiceSupabase();

  const title = ((formData.get('title') as string) || '').trim();
  const slug = ((formData.get('slug') as string) || '').trim();
  const synopsis = ((formData.get('synopsis') as string) || '').trim();
  const type = formData.get('type') as StoryType;
  const status = formData.get('status') as StoryStatus;
  const is_featured = formData.get('is_featured') === 'on';
  const genreIds = formData.getAll('genres') as string[];
  const coverFile = formData.get('cover') as File | null;

  if (!title || !slug) {
    return { error: 'Tiêu đề và Slug không được để trống' };
  }

  let cover_url: string | null = null;

  // Upload cover image if provided
  if (coverFile && coverFile.size > 0) {
    const ext = coverFile.name.split('.').pop() || 'jpg';
    const filePath = `covers/${slug}-${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('covers')
      .upload(filePath, coverFile, { upsert: true });

    if (!uploadError) {
      const { data: publicUrlData } = supabase.storage
        .from('covers')
        .getPublicUrl(filePath);
      cover_url = publicUrlData.publicUrl;
    }
  }

  // Insert story
  const { data: story, error: insertError } = await supabase
    .from('stories')
    .insert({
      title,
      slug,
      synopsis,
      type: type || 'novel',
      status: status || 'draft',
      is_featured,
      cover_url,
      published_at: status === 'ongoing' || status === 'completed' ? new Date().toISOString() : null,
    })
    .select('id')
    .single();

  if (insertError) {
    return { error: `Lỗi tạo truyện: ${insertError.message}` };
  }

  // Insert genres
  if (genreIds.length > 0 && story) {
    const genreRows = genreIds.map((genre_id) => ({
      story_id: story.id,
      genre_id,
    }));
    await supabase.from('story_genres').insert(genreRows);
  }

  revalidatePath('/stories');
  redirect('/stories');
}

export async function updateStoryAction(id: string, formData: FormData) {
  const admin = await verifyAdmin();
  if (!admin) return { error: 'Không có quyền thực hiện thao tác này' };

  const supabase = await createServiceSupabase();

  const title = ((formData.get('title') as string) || '').trim();
  const slug = ((formData.get('slug') as string) || '').trim();
  const synopsis = ((formData.get('synopsis') as string) || '').trim();
  const type = formData.get('type') as StoryType;
  const status = formData.get('status') as StoryStatus;
  const is_featured = formData.get('is_featured') === 'on';
  const genreIds = formData.getAll('genres') as string[];
  const coverFile = formData.get('cover') as File | null;

  const updateData: Record<string, any> = {
    title,
    slug,
    synopsis,
    type,
    status,
    is_featured,
    updated_at: new Date().toISOString(),
  };

  // Handle optional cover image replacement
  if (coverFile && coverFile.size > 0) {
    const ext = coverFile.name.split('.').pop() || 'jpg';
    const filePath = `covers/${slug}-${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('covers')
      .upload(filePath, coverFile, { upsert: true });

    if (!uploadError) {
      const { data: publicUrlData } = supabase.storage
        .from('covers')
        .getPublicUrl(filePath);
      updateData.cover_url = publicUrlData.publicUrl;
    }
  }

  const { error: updateError } = await supabase
    .from('stories')
    .update(updateData as any)
    .eq('id', id);

  if (updateError) {
    return { error: `Lỗi cập nhật: ${updateError.message}` };
  }

  // Update genres (delete old, insert new)
  await supabase.from('story_genres').delete().eq('story_id', id);
  if (genreIds.length > 0) {
    const genreRows = genreIds.map((genre_id) => ({
      story_id: id,
      genre_id,
    }));
    await supabase.from('story_genres').insert(genreRows);
  }

  revalidatePath('/stories');
  revalidatePath(`/stories/${id}`);
  redirect('/stories');
}

export async function deleteStoryAction(id: string) {
  const admin = await verifyAdmin();
  if (!admin) return { error: 'Không có quyền thực hiện thao tác này' };

  const supabase = await createServiceSupabase();
  const { error } = await supabase.from('stories').delete().eq('id', id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/stories');
  return { success: true };
}
