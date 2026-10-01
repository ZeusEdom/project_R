import { redirect } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { createServerSupabase } from '@repo/supabase/server';
import { LoginForm } from './LoginForm';

export default async function ReaderLoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  // If already logged in, redirect to home page
  if (user) {
    redirect(`/${locale}`);
  }

  return (
    <main className="flex items-center justify-center min-h-[75vh] px-4 py-12">
      <div className="w-full max-w-md">
        <LoginForm locale={locale} />
      </div>
    </main>
  );
}
