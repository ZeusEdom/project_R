'use server';

import { revalidatePath } from 'next/cache';
import { createServerSupabase, createServiceSupabase } from '@repo/supabase/server';

export async function toggleBanUserAction(userId: string, currentIsBanned: boolean) {
  // Verify caller is admin via their session
  const sessionSupabase = await createServerSupabase();
  const {
    data: { user },
  } = await sessionSupabase.auth.getUser();
  if (!user) return { error: 'Chưa đăng nhập' };

  const { data: adminProfile } = await sessionSupabase
    .from('profiles')
    .select('id, is_admin')
    .eq('id', user.id)
    .single();

  if (!(adminProfile as { is_admin: boolean } | null)?.is_admin) {
    return { error: 'Bạn không có quyền thực hiện thao tác này' };
  }

  if (user.id === userId) {
    return { error: 'Bạn không thể tự khóa tài khoản của chính mình' };
  }

  // Use service role to bypass RLS for the update
  const serviceSupabase = await createServiceSupabase();
  const { error } = await serviceSupabase
    .from('profiles')
    .update({ is_banned: !currentIsBanned, updated_at: new Date().toISOString() })
    .eq('id', userId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/users');
  return { success: true };
}

export async function toggleAdminRoleAction(userId: string, currentIsAdmin: boolean) {
  // Verify caller is admin via their session
  const sessionSupabase = await createServerSupabase();
  const {
    data: { user },
  } = await sessionSupabase.auth.getUser();
  if (!user) return { error: 'Chưa đăng nhập' };

  const { data: adminProfile } = await sessionSupabase
    .from('profiles')
    .select('id, is_admin')
    .eq('id', user.id)
    .single();

  if (!(adminProfile as { is_admin: boolean } | null)?.is_admin) {
    return { error: 'Bạn không có quyền thực hiện thao tác này' };
  }

  if (user.id === userId) {
    return { error: 'Bạn không thể tự tước quyền Admin của chính mình' };
  }

  // Use service role to bypass RLS for the update
  const serviceSupabase = await createServiceSupabase();
  const { error } = await serviceSupabase
    .from('profiles')
    .update({ is_admin: !currentIsAdmin, updated_at: new Date().toISOString() })
    .eq('id', userId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/users');
  return { success: true };
}
