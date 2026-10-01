'use client';

import Link from 'next/link';
import { IconEye, IconStar, IconFlame, IconChevronRight } from '@repo/ui';

interface TopRankingsProps {
  stories: any[];
  locale: string;
}

export function TopRankings({ stories, locale }: TopRankingsProps) {
  if (!stories || stories.length === 0) return null;

  const top3 = stories.slice(0, 3);
  const remaining = stories.slice(3, 10);

  const rankBadges = [
    { bg: 'bg-gradient-to-r from-amber-400 to-yellow-600 text-zinc-950 font-black shadow-lg shadow-amber-500/30', border: 'border-amber-400/60' },
    { bg: 'bg-gradient-to-r from-zinc-300 to-slate-400 text-zinc-950 font-black shadow-lg shadow-zinc-400/30', border: 'border-zinc-400/60' },
    { bg: 'bg-gradient-to-r from-amber-700 to-amber-900 text-amber-100 font-black shadow-lg shadow-amber-800/30', border: 'border-amber-700/60' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
            <IconFlame size={20} />
          </div>
          <div>
            <h2 className="text-xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
              {locale === 'en' ? 'Trending Rankings' : 'Bảng Xếp Hạng Hot'}
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              {locale === 'en' ? 'Top most read stories' : 'Top những bộ truyện được đọc nhiều nhất'}
            </p>
          </div>
        </div>
        <Link
          href={`/${locale}/browse?sort=views`}
          className="text-xs font-semibold text-emerald-400 hover:underline flex items-center gap-1"
        >
          <span>{locale === 'en' ? 'View all' : 'Xem tất cả'}</span>
          <IconChevronRight size={14} />
        </Link>
      </div>

      {/* Top 3 Podium Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {top3.map((story, index) => {
          const badgeStyle = rankBadges[index] || { bg: 'bg-zinc-800 text-zinc-300', border: 'border-zinc-700' };
          return (
            <Link
              key={story.id}
              href={`/${locale}/story/${story.slug}`}
              className={`group relative flex items-center gap-4 p-3.5 rounded-2xl bg-zinc-900/60 border ${badgeStyle.border} hover:border-emerald-500/50 hover:bg-zinc-800/80 transition-all duration-300 shadow-lg overflow-hidden`}
            >
              {/* Rank Badge */}
              <div className={`absolute top-2 left-2 z-10 w-7 h-7 rounded-lg ${badgeStyle.bg} flex items-center justify-center text-xs font-black shadow-md font-mono`}>
                #{index + 1}
              </div>

              {/* Cover Image */}
              <div className="w-20 h-28 rounded-xl overflow-hidden shrink-0 bg-zinc-800 shadow-md group-hover:scale-105 transition-transform duration-300 relative">
                {story.cover_url ? (
                  <img src={story.cover_url} alt={story.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-600 text-[10px] font-mono">
                    NO COVER
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0 py-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 font-mono">
                  {story.type}
                </span>
                <h3 className="font-extrabold text-zinc-100 text-sm truncate group-hover:text-emerald-400 transition-colors mt-0.5">
                  {story.title}
                </h3>
                <p className="text-xs text-zinc-400 line-clamp-2 mt-1 leading-relaxed">
                  {story.synopsis || (locale === 'en' ? 'No synopsis available.' : 'Chưa có tóm tắt.')}
                </p>
                <div className="flex items-center gap-3 text-[11px] text-zinc-400 font-mono mt-2">
                  <span className="flex items-center gap-1">
                    <IconEye size={12} className="text-emerald-400" />
                    {story.view_count || 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <IconStar size={12} className="text-amber-400" />
                    {story.rating_avg || '5.0'}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Remaining Ranks (4-10) Horizontal List if available */}
      {remaining.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-1">
          {remaining.map((story, idx) => (
            <Link
              key={story.id}
              href={`/${locale}/story/${story.slug}`}
              className="flex items-center gap-3 p-2.5 rounded-xl bg-zinc-900/40 border border-zinc-800/80 hover:bg-zinc-800/60 hover:border-zinc-700 transition-all text-xs group"
            >
              <span className="w-6 h-6 rounded-md bg-zinc-800 text-zinc-400 group-hover:bg-emerald-500/20 group-hover:text-emerald-400 flex items-center justify-center font-extrabold text-[11px] font-mono shrink-0">
                #{idx + 4}
              </span>
              <div className="w-9 h-12 rounded-md overflow-hidden bg-zinc-800 shrink-0">
                {story.cover_url ? (
                  <img src={story.cover_url} alt={story.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-zinc-800" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-bold text-zinc-200 truncate group-hover:text-emerald-400 transition-colors">
                  {story.title}
                </div>
                <div className="text-[10px] text-zinc-500 font-mono flex items-center gap-1 mt-0.5">
                  <IconEye size={10} className="text-emerald-500" />
                  {story.view_count || 0} {locale === 'en' ? 'views' : 'lượt xem'}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
