import { createServerSupabase } from '@repo/supabase/server';
import { IconSettings } from '@repo/ui';
import { SettingsForm } from './SettingsForm';

export default async function SettingsPage() {
  const supabase = await createServerSupabase();

  const { data: settingsData } = await (supabase as any).from('site_settings').select('*');
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

  const siteName = settingsMap.site_name || 'Truyện Của Tôi';
  const siteDesc = settingsMap.site_description || 'Website đọc truyện cá nhân';
  const logoUrl = settingsMap.logo_url || '';
  const socialLinks = settingsMap.social_links || { facebook: '', discord: '' };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="border-b border-zinc-800 pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100 flex items-center gap-2.5">
          <IconSettings className="text-emerald-400" size={24} />
          Cài Đặt Hệ Thống & Cấu Hình Trang Web
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Quản lý các thông tin cài đặt chung của hệ thống đọc truyện
        </p>
      </div>

      <SettingsForm
        initialSiteName={siteName}
        initialSiteDesc={siteDesc}
        initialLogoUrl={logoUrl}
        initialFacebook={socialLinks.facebook || ''}
        initialDiscord={socialLinks.discord || ''}
      />
    </div>
  );
}
