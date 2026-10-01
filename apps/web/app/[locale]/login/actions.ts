'use server';

import { redirect } from 'next/navigation';
import { createServerSupabase, createServiceSupabase } from '@repo/supabase/server';

export async function loginAction(formData: FormData, locale: string = 'vi') {
  const email = ((formData.get('email') as string) || '').trim();
  const password = (formData.get('password') as string) || '';

  if (!email || !password) {
    return { error: locale === 'en' ? 'Please fill in all fields' : 'Vui lòng nhập đầy đủ thông tin' };
  }

  const supabase = await createServerSupabase();
  let { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // If email not confirmed, auto-confirm via service client and retry sign in
    if (error.message.includes('Email not confirmed') || error.status === 400) {
      try {
        const serviceSupabase = await createServiceSupabase();
        const { data: usersData } = await serviceSupabase.auth.admin.listUsers();
        const existingUser = usersData?.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());

        if (existingUser) {
          await serviceSupabase.auth.admin.updateUserById(existingUser.id, {
            email_confirm: true,
          });

          // Retry login after auto-confirmation
          const retryResult = await supabase.auth.signInWithPassword({ email, password });
          if (!retryResult.error) {
            redirect(`/${locale}`);
          }
        }
      } catch {
        // fallback to standard error message
      }
    }

    return {
      error:
        locale === 'en'
          ? 'Login failed. Please check your credentials.'
          : 'Đăng nhập thất bại. Vui lòng kiểm tra lại email và mật khẩu.',
    };
  }

  redirect(`/${locale}`);
}

export async function signupAction(formData: FormData, locale: string = 'vi') {
  const email = ((formData.get('email') as string) || '').trim();
  const password = (formData.get('password') as string) || '';
  const confirmPassword = (formData.get('confirmPassword') as string) || '';
  const displayName = (formData.get('displayName') as string) || email.split('@')[0];

  if (!email || !password) {
    return { error: locale === 'en' ? 'Please fill in all fields' : 'Vui lòng nhập đầy đủ thông tin' };
  }

  if (password !== confirmPassword) {
    return {
      error:
        locale === 'en'
          ? 'Passwords do not match'
          : 'Mật khẩu xác nhận không trùng khớp',
    };
  }

  if (password.length < 6) {
    return {
      error:
        locale === 'en'
          ? 'Password must be at least 6 characters'
          : 'Mật khẩu phải có ít nhất 6 ký tự',
    };
  }

  const serviceSupabase = await createServiceSupabase();

  // Create user using service role API with auto email confirmation
  const { data: adminData, error: adminError } = await serviceSupabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: displayName,
    },
  });

  if (adminError) {
    if (adminError.message.includes('already registered') || adminError.message.includes('exists')) {
      return {
        error:
          locale === 'en'
            ? 'This email is already registered. Please log in.'
            : 'Email này đã được đăng ký. Vui lòng đăng nhập.',
      };
    }
    return { error: adminError.message };
  }

  // Sign in immediately after registration
  const supabase = await createServerSupabase();
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (!signInError) {
    redirect(`/${locale}`);
  }

  return {
    success:
      locale === 'en'
        ? 'Account registered successfully! You can now log in.'
        : 'Tạo tài khoản thành công! Bạn có thể đăng nhập ngay.',
  };
}

export async function resendConfirmationEmailAction(email: string, locale: string = 'vi') {
  if (!email) {
    return { error: locale === 'en' ? 'Email address is required' : 'Vui lòng cung cấp địa chỉ Email' };
  }

  const supabase = await createServerSupabase();
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
  });

  if (error) {
    return { error: error.message };
  }

  return {
    success:
      locale === 'en'
        ? 'Confirmation email resent! Please check your inbox.'
        : 'Đã gửi lại email xác nhận! Vui lòng kiểm tra hộp thư của bạn.',
  };
}

export async function logoutAction(locale: string = 'vi') {
  const supabase = await createServerSupabase();
  await supabase.auth.signOut();
  redirect(`/${locale}`);
}
