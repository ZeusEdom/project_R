'use server';

import { redirect } from 'next/navigation';
import { createServerSupabase } from '@repo/supabase/server';

export async function requestPasswordResetAction(formData: FormData, locale: string = 'vi') {
  const email = (formData.get('email') as string) || '';

  if (!email) {
    return { error: locale === 'en' ? 'Please enter your email address' : 'Vui lòng nhập địa chỉ Email' };
  }

  const supabase = await createServerSupabase();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/${locale}/reset-password`,
  });

  if (error) {
    return { error: error.message };
  }

  return {
    success:
      locale === 'en'
        ? 'A password reset link has been sent to your email inbox.'
        : 'Link đặt lại mật khẩu đã được gửi về hộp thư Email của bạn. Vui lòng mở email để đặt lại mật khẩu.',
  };
}

export async function updatePasswordAction(formData: FormData, locale: string = 'vi') {
  const password = (formData.get('password') as string) || '';
  const confirmPassword = (formData.get('confirmPassword') as string) || '';

  if (!password || !confirmPassword) {
    return { error: locale === 'en' ? 'Please fill in all fields' : 'Vui lòng nhập đầy đủ thông tin' };
  }

  if (password !== confirmPassword) {
    return {
      error: locale === 'en' ? 'Passwords do not match' : 'Mật khẩu xác nhận không trùng khớp',
    };
  }

  if (password.length < 6) {
    return {
      error: locale === 'en' ? 'Password must be at least 6 characters' : 'Mật khẩu phải có ít nhất 6 ký tự',
    };
  }

  const supabase = await createServerSupabase();
  const { error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    return { error: error.message };
  }

  redirect(`/${locale}/login`);
}
