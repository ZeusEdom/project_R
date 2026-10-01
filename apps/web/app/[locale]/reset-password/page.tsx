import { setRequestLocale } from 'next-intl/server';
import { ResetPasswordForm } from './ResetPasswordForm';

export default async function ResetPasswordPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="flex items-center justify-center min-h-[75vh] px-4 py-12">
      <div className="w-full max-w-md">
        <ResetPasswordForm locale={locale} />
      </div>
    </main>
  );
}
