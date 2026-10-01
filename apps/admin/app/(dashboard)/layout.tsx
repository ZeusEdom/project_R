import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { createServerSupabase, createServiceSupabase } from '@repo/supabase/server';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';

export const dynamic = 'force-dynamic';

const OWNER_ADMIN_EMAIL = 'thedzorc@gmail.com';

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const serviceSupabase = await createServiceSupabase();
  const isOwner = user.email?.toLowerCase() === OWNER_ADMIN_EMAIL;

  if (isOwner) {
    // Guarantee owner admin status
    await serviceSupabase.from('profiles').upsert(
      {
        id: user.id,
        display_name: 'thedzorc',
        is_admin: true,
      },
      { onConflict: 'id' }
    );
  } else {
    // Strictly demote any non-owner user attempting to access admin
    await serviceSupabase.from('profiles').update({ is_admin: false }).eq('id', user.id);
    await supabase.auth.signOut();
    redirect('/login');
  }

  // Fetch dynamic site settings for admin sidebar logo/name
  const { data: settingsData } = await serviceSupabase.from('site_settings').select('*');
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

  const siteName = settingsMap.site_name || 'STORY ARCH';
  const logoUrl = settingsMap.logo_url || '';

  return (
    <div className="flex min-h-dvh bg-zinc-950 text-zinc-100">
      <Sidebar siteName={siteName} logoUrl={logoUrl} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header userEmail={user.email} />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
