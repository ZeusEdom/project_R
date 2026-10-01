'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button, Badge, IconBook, IconEye, IconStar, IconChevronLeft, IconChevronRight, IconSparkles } from '@repo/ui';

interface StoryHeroCarouselProps {
  stories: any[];
  locale: string;
}

export function StoryHeroCarousel({ stories, locale }: StoryHeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const total = stories.length;

  useEffect(() => {
    if (total <= 1 || isHovered) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % total);
    }, 3000);

    return () => clearInterval(interval);
  }, [total, isHovered]);

  if (!stories || stories.length === 0) return null;

  const currentStory = stories[currentIndex];

  function nextSlide() {
    setCurrentIndex((prev) => (prev + 1) % total);
  }

  function prevSlide() {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }

  return (
    <div
      className="relative group max-w-7xl mx-auto my-4"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative flex items-center justify-between gap-2 sm:gap-4">
        {/* Left Arrow Button */}
        {total > 1 && (
          <button
            onClick={prevSlide}
            className="z-20 p-3 rounded-2xl bg-zinc-900/90 hover:bg-emerald-600 border border-zinc-800 hover:border-emerald-400 text-zinc-400 hover:text-white transition-all shadow-xl hover:scale-110 active:scale-95 shrink-0 group/arrow"
            title="Truyện nổi bật trước"
            aria-label="Previous Featured Story"
          >
            <IconChevronLeft size={22} className="group-hover/arrow:-translate-x-0.5 transition-transform" />
          </button>
        )}

        {/* Featured Story Hero Banner Card */}
        <div className="flex-1 bg-gradient-to-br from-zinc-900 via-zinc-900/90 to-emerald-950/40 border border-zinc-800/80 hover:border-emerald-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden transition-all duration-300">
          <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 sm:gap-8 relative z-10">
            {/* Cover Image */}
            <div className="w-40 sm:w-48 h-56 sm:h-64 rounded-2xl overflow-hidden shadow-2xl border border-zinc-700/60 shrink-0 bg-zinc-800 group-hover:scale-[1.02] transition-transform duration-300">
              {currentStory.cover_url ? (
                <img
                  src={currentStory.cover_url}
                  alt={currentStory.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-600 font-mono text-xs">
                  NO COVER
                </div>
              )}
            </div>

            {/* Story Details */}
            <div className="flex-1 space-y-4 text-center md:text-left min-w-0">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 font-mono">
                  <IconSparkles size={14} className="text-emerald-400" />
                  {locale === 'en' ? 'FEATURED' : 'NỔI BẬT'}
                </span>
                <span className="px-2.5 py-0.5 rounded-md bg-zinc-800 text-zinc-300 border border-zinc-700 text-xs font-mono font-semibold uppercase">
                  {currentStory.type}
                </span>
                <Badge variant={currentStory.status === 'ongoing' ? 'success' : 'default'}>
                  {currentStory.status === 'ongoing'
                    ? (locale === 'en' ? 'Ongoing' : 'Đang ra')
                    : currentStory.status === 'completed'
                    ? (locale === 'en' ? 'Completed' : 'Hoàn thành')
                    : currentStory.status}
                </Badge>
              </div>

              <h2 className="text-2xl sm:text-4xl font-extrabold text-zinc-100 tracking-tight leading-tight truncate">
                {currentStory.title}
              </h2>

              <p className="text-zinc-400 leading-relaxed text-sm line-clamp-3 max-w-2xl">
                {currentStory.synopsis || (locale === 'en' ? 'No synopsis available.' : 'Chưa có tóm tắt.')}
              </p>

              <div className="flex items-center justify-center md:justify-start gap-6 pt-1 text-xs font-semibold text-zinc-400 font-mono">
                <div className="flex items-center gap-1.5">
                  <IconEye className="w-4 h-4 text-emerald-400" />
                  <span>{currentStory.view_count || 0} {locale === 'en' ? 'views' : 'lượt xem'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <IconStar className="w-4 h-4 text-amber-400" />
                  <span>{currentStory.rating_avg || '5.0'}</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-center md:justify-start gap-4">
                <Link href={`/${locale}/story/${currentStory.slug}`}>
                  <Button variant="primary" size="lg" className="shadow-lg shadow-emerald-950 font-bold px-6">
                    <IconBook className="w-5 h-5" />
                    {locale === 'en' ? 'Start Reading' : 'Bắt đầu đọc ngay'}
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Autoplay Slide Indicators Dots */}
          {total > 1 && (
            <div className="absolute bottom-3 right-6 flex items-center gap-1.5 z-20">
              {stories.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    idx === currentIndex
                      ? 'w-6 bg-emerald-500 shadow-md shadow-emerald-500/50'
                      : 'w-2 bg-zinc-700 hover:bg-zinc-500'
                  }`}
                  title={`Chuyển tới truyện ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right Arrow Button */}
        {total > 1 && (
          <button
            onClick={nextSlide}
            className="z-20 p-3 rounded-2xl bg-zinc-900/90 hover:bg-emerald-600 border border-zinc-800 hover:border-emerald-400 text-zinc-400 hover:text-white transition-all shadow-xl hover:scale-110 active:scale-95 shrink-0 group/arrow"
            title="Truyện nổi bật tiếp theo"
            aria-label="Next Featured Story"
          >
            <IconChevronRight size={22} className="group-hover/arrow:translate-x-0.5 transition-transform" />
          </button>
        )}
      </div>
    </div>
  );
}
