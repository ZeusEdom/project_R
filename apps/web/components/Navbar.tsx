'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { createClient } from '@repo/supabase/client';
import { LocaleSwitcher } from './LocaleSwitcher';
import { ThemeToggle } from './ThemeToggle';
import { SearchModal } from './SearchModal';
import { NotificationBell } from './NotificationBell';
import { IconBook, IconBookmark, IconUser, IconSettings, IconLogOut } from '@repo/ui';

interface NotificationItem {
  id: string;
  title: string;
  body?: string | null;
  sentAt: string;
  storySlug?: string | null;
  storyTitle?: string | null;
}

interface NavbarProps {
  locale: string;
  siteName?: string;
  logoUrl?: string;
  notifications?: NotificationItem[];
  user?: {
    email: string;
    displayName?: string;
    avatarUrl?: string;
  } | null;
}

export function Navbar({
  locale,
  siteName = 'STORY ARCH',
  logoUrl,
  notifications = [],
  user,
}: NavbarProps) {
  const tNav = useTranslations('nav');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  async function handleLogout() {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {
      // ignore
    } finally {
      window.location.href = `/${locale}`;
    }
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Dynamic Brand Logo & Name */}
        <Link href={`/${locale}`} className="flex items-center gap-2.5 shrink-0 group">
          {logoUrl ? (
            <div className="w-9 h-9 rounded-xl overflow-hidden border border-zinc-700/60 shadow-md group-hover:scale-105 transition-transform bg-zinc-900 shrink-0 flex items-center justify-center">
              <img src={logoUrl} alt={siteName} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center font-extrabold text-white text-base shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform shrink-0">
              S
            </div>
          )}
          <span className="font-extrabold text-zinc-900 dark:text-zinc-100 text-lg tracking-tight hidden sm:inline-block">
            {siteName}
          </span>
        </Link>

        {/* Center Realtime Search */}
        <SearchModal locale={locale} />

        {/* Navigation Links & Controls */}
        <nav className="flex items-center gap-1.5 sm:gap-2">
          <Link
            href={`/${locale}/browse`}
            className="px-3 py-2 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-emerald-600 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors flex items-center gap-1.5"
          >
            <IconBook size={16} className="text-emerald-500 dark:text-emerald-400" />
            <span>{tNav('browse')}</span>
          </Link>

          <Link
            href={`/${locale}/bookmarks`}
            className="px-3 py-2 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-emerald-600 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors flex items-center gap-1.5"
          >
            <IconBookmark size={16} className="text-amber-500 dark:text-amber-400" />
            <span className="hidden sm:inline-block">{tNav('bookmarks')}</span>
          </Link>

          {/* Broadcast Notification Bell */}
          <NotificationBell notifications={notifications} locale={locale} />

          {/* Theme Toggle Button */}
          <ThemeToggle />

          {/* Locale Switcher (VI & EN) */}
          <LocaleSwitcher />

          {/* Auth State Button / User Dropdown */}
          {user ? (
            <div className="relative pl-1">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-zinc-700/60 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 transition-colors shadow-sm cursor-pointer"
              >
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt="Avatar" className="w-6 h-6 rounded-full object-cover border border-emerald-500/40" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center border border-emerald-500/40">
                    {(user.displayName || user.email)[0].toUpperCase()}
                  </div>
                )}
                <span className="text-xs font-semibold max-w-[90px] truncate hidden md:inline-block">
                  {user.displayName || user.email.split('@')[0]}
                </span>
              </button>

              {/* Dropdown Menu */}
              {isMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-52 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="px-4 py-2.5 border-b border-zinc-800/80">
                    <p className="text-xs font-bold text-zinc-200 truncate">
                      {user.displayName || 'Độc giả'}
                    </p>
                    <p className="text-[10px] text-zinc-500 truncate font-mono">{user.email}</p>
                  </div>

                  <Link
                    href={`/${locale}/profile`}
                    className="flex items-center gap-2 px-4 py-2 text-xs text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
                  >
                    <IconUser size={14} className="text-emerald-400" />
                    <span>{locale === 'en' ? 'Profile' : 'Trang cá nhân'}</span>
                  </Link>

                  <Link
                    href={`/${locale}/settings`}
                    className="flex items-center gap-2 px-4 py-2 text-xs text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
                  >
                    <IconSettings size={14} className="text-teal-400" />
                    <span>{locale === 'en' ? 'Settings' : 'Cài đặt'}</span>
                  </Link>

                  <Link
                    href={`/${locale}/history`}
                    className="flex items-center gap-2 px-4 py-2 text-xs text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
                  >
                    <IconBook size={14} className="text-blue-400" />
                    <span>{locale === 'en' ? 'Reading History' : 'Lịch sử đọc'}</span>
                  </Link>

                  <Link
                    href={`/${locale}/bookmarks`}
                    className="flex items-center gap-2 px-4 py-2 text-xs text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
                  >
                    <IconBookmark size={14} className="text-amber-400" />
                    <span>{tNav('bookmarks')}</span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-xs text-red-400 hover:bg-zinc-800 transition-colors text-left border-t border-zinc-800/80 mt-1 cursor-pointer font-semibold"
                  >
                    <IconLogOut size={14} />
                    <span>{tNav('logout')}</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 pl-1">
              <Link
                href={`/${locale}/login`}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md shadow-emerald-950 flex items-center gap-1.5"
              >
                <IconUser size={14} />
                <span>{tNav('login')}</span>
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
