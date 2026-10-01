import { setRequestLocale } from 'next-intl/server';
import { ForgotPasswordForm } from './ForgotPasswordForm';

export default async function ForgotPasswordPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="flex items-center justify-center min-h-[75vh] px-4 py-12">
      <div className="w-full max-w-md">
        <ForgotPasswordForm locale={locale} />
      </div>
    </main>
  );
}
