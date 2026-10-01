'use server';

import { revalidatePath } from 'next/cache';
import { createServiceSupabase } from '@repo/supabase/server';
import { verifyAdmin } from '@/lib/auth';

const OWNER_ADMIN_EMAIL = 'thedzorc@gmail.com';

async function checkIsTargetOwner(serviceSupabase: any, targetUserId: string) {
  const { data } = await serviceSupabase.auth.admin.getUserById(targetUserId);
  return data?.user?.email?.toLowerCase() === OWNER_ADMIN_EMAIL;
}

export async function adminUpdatePasswordAction(targetUserId: string, newPassword: string) {
  const adminUser = await verifyAdmin();
  if (!adminUser) return { error: 'Không có quyền thực hiện' };

  if (!newPassword || newPassword.length < 6) {
    return { error: 'Mật khẩu phải từ 6 ký tự trở lên' };
  }

  const serviceSupabase = await createServiceSupabase();

  const isOwnerTarget = await checkIsTargetOwner(serviceSupabase, targetUserId);
  if (isOwnerTarget && adminUser.email?.toLowerCase() !== OWNER_ADMIN_EMAIL) {
    return { error: 'Không thể thay đổi mật khẩu của Tài khoản Quản trị tối cao (Owner)' };
  }

  const { error } = await serviceSupabase.auth.admin.updateUserById(targetUserId, {
    password: newPassword,
  });

  if (error) return { error: error.message };
  return { success: true, message: 'Đã cập nhật mật khẩu mới thành công!' };
}

export async function adminBanUserTimedAction(targetUserId: string, hours: number | null) {
  const adminUser = await verifyAdmin();
  if (!adminUser) return { error: 'Không có quyền thực hiện' };
  if (adminUser.id === targetUserId) return { error: 'Không thể tự khóa tài khoản của chính mình' };

  const serviceSupabase = await createServiceSupabase();

  const isOwnerTarget = await checkIsTargetOwner(serviceSupabase, targetUserId);
  if (isOwnerTarget) {
    return { error: 'Không thể khóa tài khoản của Quản trị viên tối cao (Owner)' };
  }

  if (hours === 0) {
    // Unban
    const { error } = await serviceSupabase
      .from('profiles')
      .update({ is_banned: false, banned_until: null, updated_at: new Date().toISOString() })
      .eq('id', targetUserId);
    if (error) return { error: error.message };
    revalidatePath('/users');
    revalidatePath(`/users/${targetUserId}`);
    return { success: true, message: 'Đã mở khóa tài khoản!' };
  }

  const bannedUntil = hours === null
    ? null
    : new Date(Date.now() + hours * 3600 * 1000).toISOString();

  const { error } = await serviceSupabase
    .from('profiles')
    .update({
      is_banned: true,
      banned_until: bannedUntil,
      updated_at: new Date().toISOString(),
    })
    .eq('id', targetUserId);

  if (error) return { error: error.message };
  revalidatePath('/users');
  revalidatePath(`/users/${targetUserId}`);
  return {
    success: true,
    message: hours === null ? 'Đã khóa tài khoản vĩnh viễn!' : `Đã khóa tài khoản trong ${hours} giờ!`,
  };
}

export async function adminDeleteUserAction(targetUserId: string) {
  const adminUser = await verifyAdmin();
  if (!adminUser) return { error: 'Không có quyền thực hiện' };
  if (adminUser.id === targetUserId) return { error: 'Không thể tự xóa tài khoản của chính mình' };

  const serviceSupabase = await createServiceSupabase();

  const isOwnerTarget = await checkIsTargetOwner(serviceSupabase, targetUserId);
  if (isOwnerTarget) {
    return { error: 'Không thể xóa tài khoản của Quản trị viên tối cao (Owner)' };
  }

  const { error: authError } = await serviceSupabase.auth.admin.deleteUser(targetUserId);

  if (authError) {
    // Fallback delete from profiles table
    await serviceSupabase.from('profiles').delete().eq('id', targetUserId);
  }

  revalidatePath('/users');
  return { success: true };
}
