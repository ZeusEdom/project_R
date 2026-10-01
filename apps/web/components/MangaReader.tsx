'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface MangaReaderProps {
  title: string;
  chapterNumber: number;
  contentImages: string[];
  storySlug: string;
  locale: string;
  previousChapterNumber?: number | null;
  nextChapterNumber?: number | null;
}

export function MangaReader({
  title,
  chapterNumber,
  contentImages,
  storySlug,
  locale,
  previousChapterNumber,
  nextChapterNumber,
}: MangaReaderProps) {
  const [readMode, setReadMode] = useState<'vertical' | 'single'>('vertical');
  const [direction, setDirection] = useState<'ltr' | 'rtl'>('ltr');
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const totalPages = contentImages.length;

  // Keyboard navigation for page-by-page mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (readMode === 'single') {
        if (e.key === 'ArrowRight' || e.key === 'd') {
          if (direction === 'ltr') nextPage();
          else prevPage();
        } else if (e.key === 'ArrowLeft' || e.key === 'a') {
          if (direction === 'ltr') prevPage();
          else nextPage();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [readMode, direction, currentPage, totalPages]);

  function prevPage() {
    setCurrentPage((prev) => Math.max(0, prev - 1));
  }

  function nextPage() {
    setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1));
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  }

  return (
    <div className="min-h-dvh bg-zinc-950 text-zinc-100 flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* Sticky Top Control Header */}
      <header className="sticky top-0 z-40 bg-zinc-900/90 border-b border-zinc-800/80 backdrop-blur-md px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 text-xs">
          {/* Left: Back & Title */}
          <div className="flex items-center gap-3 truncate">
            <Link
              href={`/${locale}/story/${storySlug}`}
              className="flex items-center gap-1.5 font-bold text-zinc-300 hover:text-emerald-400 transition-colors shrink-0"
            >
              <span>←</span>
              <span className="hidden sm:inline">Trang truyện</span>
            </Link>
            <span className="text-zinc-700">|</span>
            <span className="font-semibold text-zinc-100 truncate">
              Chương {chapterNumber}: {title}
            </span>
          </div>

          {/* Right: Controls & Toggles */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Mode Switcher */}
            <div className="flex bg-zinc-950 rounded-lg p-0.5 border border-zinc-800">
              <button
                onClick={() => setReadMode('vertical')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                  readMode === 'vertical'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
                title="Cuộn dọc kiểu Webtoon"
              >
                📜 Cuộn dọc
              </button>
              <button
                onClick={() => setReadMode('single')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                  readMode === 'single'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
                title="Từng trang kiểu Manga"
              >
                📖 Từng trang
              </button>
            </div>

            {/* Reading Direction (For Single Page mode) */}
            {readMode === 'single' && (
              <button
                onClick={() => setDirection((d) => (d === 'ltr' ? 'rtl' : 'ltr'))}
                className="px-2 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono text-[11px] font-semibold transition-colors border border-zinc-700/60"
                title="Đổi hướng đọc"
              >
                {direction === 'ltr' ? 'Trái → Phải' : 'Phải → Trái (Nhật)'}
              </button>
            )}

            {/* Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors border border-zinc-700/60"
              title="Toàn màn hình"
            >
              {isFullscreen ? '📉' : '🖥️'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Reader Viewport */}
      <main className="flex-1 flex flex-col items-center justify-center py-4">
        {totalPages === 0 ? (
          <div className="p-12 text-center text-zinc-500 text-sm">
            Chương này chưa có trang ảnh nào.
          </div>
        ) : readMode === 'vertical' ? (
          /* ================= VERTICAL SCROLL MODE (WEBTOON STYLE) ================= */
          <div className="w-full max-w-3xl flex flex-col items-center">
            {contentImages.map((src, index) => (
              <div key={index} className="w-full relative bg-zinc-900 border-b border-zinc-900/40">
                <img
                  src={src}
                  alt={`Trang ${index + 1}`}
                  loading="lazy"
                  className="w-full h-auto object-contain block mx-auto shadow-2xl"
                />
                <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/60 backdrop-blur-sm text-[10px] font-mono text-zinc-400 opacity-0 hover:opacity-100 transition-opacity">
                  {index + 1} / {totalPages}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* ================= SINGLE PAGE MODE (MANGA STYLE) ================= */
          <div className="flex flex-col items-center justify-center w-full max-w-4xl px-4 space-y-4">
            <div
              className="relative bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden shadow-2xl max-h-[85dvh] flex items-center justify-center cursor-pointer"
              onClick={direction === 'ltr' ? nextPage : prevPage}
            >
              <img
                src={contentImages[currentPage]}
                alt={`Trang ${currentPage + 1}`}
                className="max-h-[85dvh] w-auto object-contain mx-auto"
              />
            </div>

            {/* Page Navigation Controls */}
            <div className="flex items-center gap-4 text-sm font-semibold">
              <button
                onClick={direction === 'ltr' ? prevPage : nextPage}
                disabled={currentPage === 0}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                ← Trang trước
              </button>

              <select
                value={currentPage}
                onChange={(e) => setCurrentPage(parseInt(e.target.value, 10))}
                className="bg-zinc-900 border border-zinc-700 text-emerald-400 font-mono text-sm px-3 py-1.5 rounded-xl font-bold"
              >
                {contentImages.map((_, i) => (
                  <option key={i} value={i}>
                    Trang {i + 1} / {totalPages}
                  </option>
                ))}
              </select>

              <button
                onClick={direction === 'ltr' ? nextPage : prevPage}
                disabled={currentPage === totalPages - 1}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                Trang sau →
              </button>
            </div>
          </div>
        )}

        {/* Chapter Navigation Footer */}
        <div className="w-full max-w-3xl px-4 mt-12 mb-8 flex items-center justify-between border-t border-zinc-800/80 pt-6">
          {previousChapterNumber ? (
            <Link
              href={`/${locale}/story/${storySlug}/${previousChapterNumber}`}
              className="px-5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:border-emerald-500/40 text-sm font-bold text-zinc-200 transition-all flex items-center gap-2"
            >
              <span>←</span>
              <span>Chương {previousChapterNumber}</span>
            </Link>
          ) : (
            <div />
          )}

          {nextChapterNumber ? (
            <Link
              href={`/${locale}/story/${storySlug}/${nextChapterNumber}`}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-sm font-bold text-white shadow-lg shadow-emerald-950 transition-all flex items-center gap-2"
            >
              <span>Chương {nextChapterNumber}</span>
              <span>→</span>
            </Link>
          ) : (
            <div />
          )}
        </div>
      </main>
    </div>
  );
}
