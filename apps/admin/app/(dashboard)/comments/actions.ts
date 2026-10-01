'use server';

import { revalidatePath } from 'next/cache';
import { createServiceSupabase } from '@repo/supabase/server';
import { verifyAdmin } from '@/lib/auth';

export async function approveCommentAction(commentId: string) {
  const admin = await verifyAdmin();
  if (!admin) return { error: 'Không có quyền thực hiện thao tác này' };

  const supabase = await createServiceSupabase();

  const { error } = await supabase
    .from('comments')
    .update({ status: 'approved', updated_at: new Date().toISOString() })
    .eq('id', commentId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/comments');
  return { success: true };
}

export async function rejectCommentAction(commentId: string) {
  const admin = await verifyAdmin();
  if (!admin) return { error: 'Không có quyền thực hiện thao tác này' };

  const supabase = await createServiceSupabase();

  const { error } = await supabase
    .from('comments')
    .update({ status: 'rejected', updated_at: new Date().toISOString() })
    .eq('id', commentId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/comments');
  return { success: true };
}

export async function deleteCommentAction(commentId: string) {
  const admin = await verifyAdmin();
  if (!admin) return { error: 'Không có quyền thực hiện thao tác này' };

  const supabase = await createServiceSupabase();

  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/comments');
  return { success: true };
}
