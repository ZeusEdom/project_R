'use server';

import { redirect } from 'next/navigation';
import { createServerSupabase, createServiceSupabase } from '@repo/supabase/server';

const OWNER_ADMIN_EMAIL = 'thedzorc@gmail.com';

export async function loginAction(formData: FormData) {
  const email = ((formData.get('email') as string) || '').trim().toLowerCase();
  const password = (formData.get('password') as string) || '';

  if (!email || !password) {
    return { error: 'Vui lòng nhập đầy đủ email và mật khẩu' };
  }

  const supabase = await createServerSupabase();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message || 'Đăng nhập thất bại. Kiểm tra lại thông tin.' };
  }

  if (!data.user) {
    return { error: 'Không tìm thấy thông tin người dùng' };
  }

  const serviceSupabase = await createServiceSupabase();

  // Strict owner check: ONLY thedzorc@gmail.com is allowed admin access
  if (email === OWNER_ADMIN_EMAIL) {
    await serviceSupabase.from('profiles').upsert(
      {
        id: data.user.id,
        display_name: 'thedzorc',
        is_admin: true,
      },
      { onConflict: 'id' }
    );
    redirect('/');
  }

  // Deny any other email and strictly set is_admin = false
  await serviceSupabase.from('profiles').update({ is_admin: false }).eq('id', data.user.id);
  await supabase.auth.signOut();
  return { error: 'Tài khoản của bạn không có quyền truy cập Admin' };
}

export async function logoutAction() {
  const supabase = await createServerSupabase();
  await supabase.auth.signOut();
  redirect('/login');
}
