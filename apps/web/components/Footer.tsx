'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { IconArrowUp, IconFacebook, IconDiscord } from '@repo/ui';

interface FooterProps {
  locale: string;
  siteName?: string;
  siteDesc?: string;
  logoUrl?: string;
  socialLinks?: { facebook?: string; discord?: string };
}

export function Footer({
  locale,
  siteName = 'STORY ARCH',
  siteDesc = 'Nền tảng đọc truyện cá nhân đỉnh cao',
  logoUrl,
  socialLinks,
}: FooterProps) {
  const tNav = useTranslations('nav');

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const hasFacebook = socialLinks?.facebook && socialLinks.facebook.trim().length > 0;
  const hasDiscord = socialLinks?.discord && socialLinks.discord.trim().length > 0;
  const hasSocial = hasFacebook || hasDiscord;

  return (
    <footer className="border-t border-zinc-800/80 bg-zinc-950 mt-20 text-zinc-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          {logoUrl ? (
            <div className="w-9 h-9 rounded-xl overflow-hidden border border-zinc-700/60 shadow-md bg-zinc-900 shrink-0 flex items-center justify-center">
              <img src={logoUrl} alt={siteName} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center font-extrabold text-white text-base shadow-lg shadow-emerald-500/20 shrink-0">
              S
            </div>
          )}
          <div>
            <span className="font-extrabold text-zinc-100 text-sm tracking-tight">
              {siteName}
            </span>
            <p className="text-[11px] text-zinc-500 mt-0.5">{siteDesc}</p>
          </div>
        </div>

        <div className="flex items-center gap-6 text-xs font-semibold text-zinc-400">
          <Link href={`/${locale}`} className="hover:text-emerald-400 transition-colors">
            {tNav('home')}
          </Link>
          <Link href={`/${locale}/browse`} className="hover:text-emerald-400 transition-colors">
            {tNav('browse')}
          </Link>
          <Link href={`/${locale}/bookmarks`} className="hover:text-emerald-400 transition-colors">
            {tNav('bookmarks')}
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {/* Social Links */}
          {hasSocial && (
            <div className="flex items-center gap-2">
              {hasFacebook && (
                <a
                  href={socialLinks!.facebook!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-blue-500/40 text-zinc-400 hover:text-blue-400 transition-all"
                  title="Facebook"
                >
                  <IconFacebook size={16} />
                </a>
              )}
              {hasDiscord && (
                <a
                  href={socialLinks!.discord!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-indigo-500/40 text-zinc-400 hover:text-indigo-400 transition-all"
                  title="Discord"
                >
                  <IconDiscord size={16} />
                </a>
              )}
            </div>
          )}

          <span className="text-[11px] text-zinc-500 font-mono">
            &copy; 2026 {siteName}
          </span>
          <button
            onClick={scrollToTop}
            className="p-2 px-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-emerald-500/40 text-zinc-400 hover:text-emerald-400 transition-all text-xs font-bold flex items-center gap-1.5"
            title="Scroll to top"
          >
            <IconArrowUp size={14} />
          </button>
        </div>
      </div>
    </footer>
  );
}
