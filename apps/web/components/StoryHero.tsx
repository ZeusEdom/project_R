import Link from 'next/link';
import { Button, IconBook, IconEye } from '@repo/ui';
import type { Story } from '@repo/types';

interface StoryHeroProps {
  story: Story;
  locale: string;
}

export function StoryHero({ story, locale }: StoryHeroProps) {
  return (
    <div className="relative rounded-3xl overflow-hidden border border-zinc-200/90 dark:border-zinc-800/80 bg-white/90 dark:bg-zinc-900/90 shadow-2xl transition-colors duration-200">
      {/* Background Image with Ambient Glow Orbs */}
      {story.cover_url && (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center filter blur-3xl opacity-25 dark:opacity-20 scale-125 pointer-events-none"
            style={{ backgroundImage: `url(${story.cover_url})` }}
          />
          <div className="absolute -top-32 -left-32 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
          <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />
        </>
      )}

      <div className="relative z-10 p-6 sm:p-10 flex flex-col md:flex-row items-center md:items-start gap-8 backdrop-blur-sm">
        {/* Cover with Shadow */}
        <div className="w-44 h-60 sm:w-52 sm:h-72 rounded-2xl overflow-hidden shadow-2xl border border-zinc-300 dark:border-zinc-700/60 shrink-0 bg-zinc-100 dark:bg-zinc-800 group hover:scale-[1.02] transition-transform duration-300">
          {story.cover_url ? (
            <img src={story.cover_url} alt={story.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-400 dark:text-zinc-600 font-mono text-xs">
              NO COVER
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left space-y-4">
          <div className="flex items-center gap-2">
            <span className="px-3.5 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-extrabold uppercase tracking-wider shadow-sm">
              ⭐ Nổi Bật
            </span>
            <span className="px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold uppercase">
              {story.type}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">
            {story.title}
          </h1>

          {story.synopsis && (
            <p className="text-zinc-700 dark:text-zinc-300 text-sm sm:text-base line-clamp-3 leading-relaxed max-w-2xl font-normal">
              {story.synopsis}
            </p>
          )}

          <div className="flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400 font-mono pt-2">
            <span className="flex items-center gap-1">
              <IconEye size={15} className="text-emerald-500 dark:text-emerald-400" />
              {story.view_count} lượt xem
            </span>
            <span>•</span>
            <span className="uppercase text-emerald-600 dark:text-emerald-400 font-bold">{story.status}</span>
          </div>

          <div className="pt-4 flex items-center gap-3">
            <Link href={`/${locale}/story/${story.slug}`}>
              <Button variant="primary" className="px-6 py-3.5 rounded-xl font-bold text-sm flex items-center gap-2.5 shadow-xl shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all">
                <IconBook size={18} />
                <span>Bắt đầu đọc ngay</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
