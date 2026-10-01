'use client';

import Link from 'next/link';
import { IconLayers, IconChevronRight } from '@repo/ui';

interface GenreFilterChipsProps {
  genres: any[];
  locale: string;
  activeGenre?: string;
}

export function GenreFilterChips({ genres, locale, activeGenre }: GenreFilterChipsProps) {
  if (!genres || genres.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">
          {locale === 'en' ? 'Explore by genre' : 'Khám phá theo thể loại'}
        </h3>
        <Link
          href={`/${locale}/browse`}
          className="text-xs text-emerald-400 hover:underline font-semibold flex items-center gap-1"
        >
          <span>{locale === 'en' ? 'All genres' : 'Tất cả thể loại'}</span>
          <IconChevronRight size={14} />
        </Link>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <Link
          href={`/${locale}/browse`}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all flex items-center gap-1.5 ${
            !activeGenre
              ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20 font-bold'
              : 'bg-zinc-900/80 text-zinc-300 border border-zinc-800 hover:bg-zinc-800 hover:text-white'
          }`}
        >
          <IconLayers size={14} />
          <span>{locale === 'en' ? 'All' : 'Tất cả'}</span>
        </Link>
        {genres.map((g) => {
          const isActive = activeGenre === g.slug;
          const genreName = locale === 'en' ? (g.name_en || g.name_vi || g.slug) : (g.name_vi || g.name_en || g.slug);
          return (
            <Link
              key={g.id}
              href={`/${locale}/browse?genre=${g.slug}`}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                isActive
                  ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20 font-bold'
                  : 'bg-zinc-900/80 text-zinc-300 border border-zinc-800 hover:bg-zinc-800 hover:text-white hover:border-emerald-500/40'
              }`}
            >
              {genreName}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
