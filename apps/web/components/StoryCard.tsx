import Link from 'next/link';
import { Badge, IconEye } from '@repo/ui';
import type { Story } from '@repo/types';

interface StoryCardProps {
  story: Story;
  locale: string;
}

export function StoryCard({ story, locale }: StoryCardProps) {
  const typeLabels = {
    novel: 'Novel',
    manga: 'Manga',
    light_novel: 'Light Novel',
  };

  const statusLabels: Record<string, { labelVi: string; labelEn: string; variant: 'success' | 'info' | 'default' }> = {
    ongoing: { labelVi: 'Đang ra', labelEn: 'Ongoing', variant: 'success' },
    completed: { labelVi: 'Hoàn thành', labelEn: 'Completed', variant: 'info' },
    hiatus: { labelVi: 'Tạm ngưng', labelEn: 'Hiatus', variant: 'default' },
    draft: { labelVi: 'Nháp', labelEn: 'Draft', variant: 'default' },
  };

  const statusObj = statusLabels[story.status];
  const statusLabel = locale === 'en' ? (statusObj?.labelEn || story.status) : (statusObj?.labelVi || story.status);
  const statusVariant = statusObj?.variant || 'default';

  return (
    <Link
      href={`/${locale}/story/${story.slug}`}
      className="group relative flex flex-col bg-zinc-900/60 border border-zinc-800/80 rounded-2xl overflow-hidden hover:border-emerald-500/50 hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300"
    >
      {/* Cover Image with Glow & Zoom Effect */}
      <div className="aspect-[3/4] w-full bg-zinc-800/80 relative overflow-hidden">
        {story.cover_url ? (
          <img
            src={story.cover_url}
            alt={story.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-600 text-xs font-mono bg-gradient-to-br from-zinc-900 to-zinc-950">
            NO COVER
          </div>
        )}
        
        {/* Dark Gradient Overlay at Bottom of Image */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/95 via-transparent to-black/30 pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10">
          <span className="px-2 py-0.5 rounded-lg bg-zinc-950/80 backdrop-blur-md text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 border border-emerald-500/30 shadow-md font-mono">
            {typeLabels[story.type] || story.type}
          </span>
        </div>

        {/* Status Pill on Image */}
        <div className="absolute bottom-2.5 right-2.5 z-10">
          <Badge variant={statusVariant} className="text-[10px] py-0 px-2 shadow-sm font-semibold">
            {statusLabel}
          </Badge>
        </div>
      </div>

      {/* Info Content */}
      <div className="p-3.5 flex flex-col flex-1 justify-between gap-2">
        <div>
          <h3 className="font-extrabold text-zinc-100 text-sm line-clamp-1 group-hover:text-emerald-400 transition-colors leading-snug">
            {story.title}
          </h3>
          {story.synopsis && (
            <p className="text-xs text-zinc-400 line-clamp-2 mt-1 leading-relaxed">
              {story.synopsis}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-2 border-t border-zinc-800/60 font-mono">
          <span className="inline-flex items-center gap-1">
            <IconEye size={12} className="text-emerald-400" />
            {story.view_count || 0}
          </span>
          <span className="text-emerald-400 font-bold group-hover:translate-x-0.5 transition-transform text-xs">
            {locale === 'en' ? 'Read →' : 'Đọc →'}
          </span>
        </div>
      </div>
    </Link>
  );
}
