import type { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { locales } from '@repo/i18n';
import { createServerSupabase } from '@repo/supabase/server';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import '../globals.css';

export const dynamic = 'force-dynamic';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const messages = await getMessages();

  // Query dynamic site settings, auth user, and broadcast notifications from Supabase DB
  const supabase = await createServerSupabase();
  const [{ data: settingsData }, { data: { user: authUser } }, { data: notificationsData }] = await Promise.all([
    (supabase as any).from('site_settings').select('*'),
    supabase.auth.getUser(),
    (supabase as any)
      .from('notification_log')
      .select('*, story:stories(slug, title)')
      .order('sent_at', { ascending: false })
      .limit(10),
  ]);

  const settingsMap: Record<string, any> = {};
  if (settingsData) {
    (settingsData as any[]).forEach((s) => {
      try {
        settingsMap[s.key] = typeof s.value === 'string' ? JSON.parse(s.value) : s.value;
      } catch {
        settingsMap[s.key] = s.value;
      }
    });
  }

  let userInfo: { email: string; displayName?: string; avatarUrl?: string } | null = null;
  if (authUser) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name, avatar_url')
      .eq('id', authUser.id)
      .maybeSingle();

    userInfo = {
      email: authUser.email || '',
      displayName: (profile as any)?.display_name || authUser.user_metadata?.full_name || authUser.email?.split('@')[0],
      avatarUrl: (profile as any)?.avatar_url || authUser.user_metadata?.avatar_url,
    };
  }

  const notifications = (notificationsData || []).map((n: any) => ({
    id: n.id,
    title: n.title,
    body: n.body,
    sentAt: n.sent_at,
    storySlug: n.story?.slug || null,
    storyTitle: n.story?.title || null,
  }));

  const siteName = settingsMap.site_name || 'STORY ARCH';
  const siteDesc = settingsMap.site_description || 'Nền tảng đọc truyện cá nhân đỉnh cao';
  const logoUrl = settingsMap.logo_url || '';
  const socialLinks = settingsMap.social_links || { facebook: '', discord: '' };

  return (
    <html lang={locale} className="dark">
      <body className="min-h-dvh bg-zinc-950 text-zinc-100 antialiased flex flex-col font-sans selection:bg-emerald-500 selection:text-zinc-950">
        <NextIntlClientProvider messages={messages}>
          <Navbar
            locale={locale}
            siteName={siteName}
            logoUrl={logoUrl}
            notifications={notifications}
            user={userInfo}
          />
          <div className="flex-1">{children}</div>
          <Footer
            locale={locale}
            siteName={siteName}
            siteDesc={siteDesc}
            logoUrl={logoUrl}
            socialLinks={socialLinks}
          />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
