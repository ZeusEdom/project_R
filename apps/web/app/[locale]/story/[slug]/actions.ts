'use server';

import { revalidatePath } from 'next/cache';
import { createServerSupabase, createServiceSupabase } from '@repo/supabase/server';

export async function rateStoryAction({
  storyId,
  rating,
}: {
  storyId: string;
  rating: number;
}) {
  if (!storyId || rating < 1 || rating > 5) {
    return { error: 'Đánh giá không hợp lệ' };
  }

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Vui lòng đăng nhập để đánh giá truyện' };
  }

  const serviceSupabase = await createServiceSupabase();

  // Fetch current story rating stats
  const { data: story } = await serviceSupabase
    .from('stories')
    .select('rating_avg, rating_count')
    .eq('id', storyId)
    .single();

  if (!story) {
    return { error: 'Không tìm thấy thông tin truyện' };
  }

  const currentAvg = Number(story.rating_avg || 5);
  const currentCount = Number(story.rating_count || 0);

  const newCount = currentCount + 1;
  const newAvg = Number(((currentAvg * currentCount + rating) / newCount).toFixed(1));

  const { error: updateError } = await serviceSupabase
    .from('stories')
    .update({
      rating_avg: newAvg,
      rating_count: newCount,
      updated_at: new Date().toISOString(),
    })
    .eq('id', storyId);

  if (updateError) {
    return { error: updateError.message };
  }

  revalidatePath('/story/[slug]', 'page');
  return { success: true, newAvg, newCount };
}

export async function addCommentAction({
  storyId,
  chapterId,
  content,
}: {
  storyId: string;
  chapterId?: string;
  content: string;
}) {
  const trimmed = content.trim();
  if (!storyId || !trimmed) {
    return { error: 'Nội dung bình luận không được để trống' };
  }

  if (trimmed.length > 2000) {
    return { error: 'Bình luận không được vượt quá 2000 ký tự' };
  }

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Vui lòng đăng nhập để viết bình luận' };
  }

  const serviceSupabase = await createServiceSupabase();

  const { error: insertError } = await serviceSupabase.from('comments').insert({
    user_id: user.id,
    story_id: storyId,
    chapter_id: chapterId || null,
    content: trimmed,
    status: 'approved',
  });

  if (insertError) {
    return { error: insertError.message };
  }

  revalidatePath('/story/[slug]', 'page');
  revalidatePath('/story/[slug]/[chapter]', 'page');
  return { success: true };
}

export async function editCommentAction({
  commentId,
  content,
}: {
  commentId: string;
  content: string;
}) {
  const trimmed = content.trim();
  if (!commentId || !trimmed) {
    return { error: 'Nội dung không được để trống' };
  }

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Chưa đăng nhập' };
  }

  const serviceSupabase = await createServiceSupabase();

  // Verify comment ownership
  const { data: comment } = await serviceSupabase
    .from('comments')
    .select('user_id')
    .eq('id', commentId)
    .single();

  if (!comment || comment.user_id !== user.id) {
    return { error: 'Bạn không có quyền chỉnh sửa bình luận này' };
  }

  const { error: updateError } = await serviceSupabase
    .from('comments')
    .update({
      content: trimmed,
      updated_at: new Date().toISOString(),
    })
    .eq('id', commentId);

  if (updateError) {
    return { error: updateError.message };
  }

  revalidatePath('/story/[slug]', 'page');
  revalidatePath('/story/[slug]/[chapter]', 'page');
  return { success: true };
}

export async function deleteUserCommentAction(commentId: string) {
  if (!commentId) return { error: 'Thiếu ID bình luận' };

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Chưa đăng nhập' };
  }

  const serviceSupabase = await createServiceSupabase();

  // Verify comment ownership
  const { data: comment } = await serviceSupabase
    .from('comments')
    .select('user_id')
    .eq('id', commentId)
    .single();

  if (!comment || comment.user_id !== user.id) {
    return { error: 'Bạn không có quyền xóa bình luận này' };
  }

  const { error: deleteError } = await serviceSupabase
    .from('comments')
    .delete()
    .eq('id', commentId);

  if (deleteError) {
    return { error: deleteError.message };
  }

  revalidatePath('/story/[slug]', 'page');
  revalidatePath('/story/[slug]/[chapter]', 'page');
  return { success: true };
}
