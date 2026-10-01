'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  IconDashboard,
  IconBook,
  IconPlus,
  IconMessage,
  IconUsers,
  IconBell,
  IconSettings,
} from '@repo/ui';

interface SidebarProps {
  siteName?: string;
  logoUrl?: string;
}

const navItems = [
  { label: 'Tổng quan', href: '/', icon: IconDashboard },
  { label: 'Tất cả truyện', href: '/stories', icon: IconBook },
  { label: 'Thêm truyện mới', href: '/stories/new', icon: IconPlus },
  { label: 'Bình luận', href: '/comments', icon: IconMessage },
  { label: 'Độc giả', href: '/users', icon: IconUsers },
  { label: 'Thông báo', href: '/notifications', icon: IconBell },
  { label: 'Cài đặt', href: '/settings', icon: IconSettings },
];

export function Sidebar({ siteName = 'STORY ARCH', logoUrl }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-zinc-800/80 bg-zinc-950/90 flex flex-col shrink-0 min-h-dvh backdrop-blur-xl">
      {/* Dynamic Brand Header */}
      <div className="p-5 border-b border-zinc-800/80 flex items-center gap-3">
        {logoUrl ? (
          <div className="w-9 h-9 rounded-xl overflow-hidden border border-zinc-700/60 shadow-lg shadow-emerald-950/50 bg-zinc-900 shrink-0 flex items-center justify-center">
            <img src={logoUrl} alt={siteName} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center font-extrabold text-white text-base shadow-lg shadow-emerald-950/50 border border-emerald-400/20 shrink-0">
            S
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="font-bold text-zinc-100 text-sm tracking-tight truncate">
            {siteName}
          </h1>
          <p className="text-[11px] text-emerald-400/90 font-medium tracking-wide font-mono">STUDIO CONTROL</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        <div className="px-3 py-2 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider font-mono">
          Menu Điều Hành
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : item.href === '/stories'
                ? pathname === '/stories'
                : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20 shadow-sm shadow-emerald-950/30'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/60'
              }`}
            >
              <Icon
                size={18}
                className={`transition-colors duration-200 ${
                  isActive ? 'text-emerald-400' : 'text-zinc-500 group-hover:text-zinc-300'
                }`}
              />
              <span className="flex-1">{item.label}</span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400 animate-pulse" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer info */}
      <div className="p-4 border-t border-zinc-800/80 text-[11px] text-zinc-500 text-center font-mono">
        STORY PLATFORM v1.0
      </div>
    </aside>
  );
}
