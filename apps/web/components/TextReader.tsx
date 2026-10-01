'use client';

import { useState } from 'react';
import Link from 'next/link';
import { IconChevronLeft, IconChevronRight, IconBook } from '@repo/ui';

interface TextReaderProps {
  title: string;
  chapterNumber: number;
  contentText: string;
  storySlug: string;
  locale: string;
  previousChapterNumber?: number | null;
  nextChapterNumber?: number | null;
}

export function TextReader({
  title,
  chapterNumber,
  contentText,
  storySlug,
  locale,
  previousChapterNumber,
  nextChapterNumber,
}: TextReaderProps) {
  const [fontSize, setFontSize] = useState<number>(18);
  const [theme, setTheme] = useState<'dark' | 'light' | 'sepia'>('dark');
  const [fontFamily, setFontFamily] = useState<'sans' | 'serif' | 'mono'>('sans');

  // Unicode NFC normalization to ensure Vietnamese accents combine properly
  const normalizedText = (contentText || '').normalize('NFC');

  const themeClasses = {
    dark: 'bg-zinc-950 text-zinc-200 border-zinc-800/80',
    light: 'bg-white text-zinc-900 border-zinc-200',
    sepia: 'bg-[#f8f1e5] text-[#433422] border-[#e4d7c5]',
  };

  const fontClasses = {
    sans: 'font-sans tracking-normal',
    serif: 'font-serif tracking-normal',
    mono: 'font-mono tracking-tight',
  };

  return (
    <div className={`min-h-dvh transition-colors duration-200 ${themeClasses[theme]}`}>
      {/* Sticky Reader Controls Header */}
      <div className={`sticky top-16 z-30 border-b px-4 py-3 backdrop-blur-md transition-colors duration-200 ${themeClasses[theme]}`}>
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Back to story */}
          <Link
            href={`/${locale}/story/${storySlug}`}
            className="font-semibold hover:text-emerald-500 transition-colors flex items-center gap-1 shrink-0"
          >
            <IconChevronLeft size={16} />
            <span>Quay lại truyện</span>
          </Link>

          {/* Controls Bar */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Font Family Selector */}
            <div className="flex items-center gap-1 border rounded-xl p-0.5 opacity-90">
              <button
                onClick={() => setFontFamily('sans')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  fontFamily === 'sans' ? 'bg-emerald-500 text-zinc-950 font-bold shadow-sm' : 'opacity-70 hover:opacity-100'
                }`}
                title="Phông Sans-serif (Khuyên dùng cho Tiếng Việt)"
              >
                Sans
              </button>
              <button
                onClick={() => setFontFamily('serif')}
                className={`px-2.5 py-1 rounded-lg text-xs font-serif font-semibold transition-all ${
                  fontFamily === 'serif' ? 'bg-emerald-500 text-zinc-950 font-bold shadow-sm' : 'opacity-70 hover:opacity-100'
                }`}
                title="Phông Serif (Truyền thống)"
              >
                Serif
              </button>
              <button
                onClick={() => setFontFamily('mono')}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-all ${
                  fontFamily === 'mono' ? 'bg-emerald-500 text-zinc-950 font-bold shadow-sm' : 'opacity-70 hover:opacity-100'
                }`}
                title="Phông Monospace"
              >
                Mono
              </button>
            </div>

            {/* Font Size Adjuster */}
            <div className="flex items-center gap-1.5 border rounded-xl px-2.5 py-1">
              <button
                onClick={() => setFontSize((prev) => Math.max(14, prev - 2))}
                className="px-1.5 font-bold hover:text-emerald-500 transition-colors"
                title="Giảm cỡ chữ"
              >
                A-
              </button>
              <span className="font-mono text-[11px] font-bold min-w-[32px] text-center">{fontSize}px</span>
              <button
                onClick={() => setFontSize((prev) => Math.min(28, prev + 2))}
                className="px-1.5 font-bold hover:text-emerald-500 transition-colors"
                title="Tăng cỡ chữ"
              >
                A+
              </button>
            </div>

            {/* Theme Toggle */}
            <div className="flex items-center gap-1 border rounded-xl p-0.5">
              <button
                onClick={() => setTheme('dark')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  theme === 'dark' ? 'bg-zinc-800 text-zinc-100 font-bold shadow-sm' : 'opacity-70 hover:opacity-100'
                }`}
              >
                Tối
              </button>
              <button
                onClick={() => setTheme('light')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  theme === 'light' ? 'bg-zinc-200 text-zinc-900 font-bold shadow-sm' : 'opacity-70 hover:opacity-100'
                }`}
              >
                Sáng
              </button>
              <button
                onClick={() => setTheme('sepia')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  theme === 'sepia' ? 'bg-[#e4d7c5] text-[#433422] font-bold shadow-sm' : 'opacity-70 hover:opacity-100'
                }`}
              >
                Sepia
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Reader Article Area */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-10">
        <div className="text-center space-y-3 border-b pb-8">
          <p className="text-xs font-mono uppercase tracking-widest opacity-60">Chương {chapterNumber}</p>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-snug">{title}</h1>
        </div>

        {/* Text Body */}
        <article
          className={`leading-loose whitespace-pre-wrap ${fontClasses[fontFamily]} space-y-6 antialiased`}
          style={{ fontSize: `${fontSize}px` }}
        >
          {normalizedText}
        </article>

        {/* Navigation Footer Buttons */}
        <div className="pt-12 border-t flex items-center justify-between gap-4">
          {previousChapterNumber ? (
            <Link
              href={`/${locale}/story/${storySlug}/${previousChapterNumber}`}
              className="px-4 py-2.5 rounded-xl border text-xs font-semibold hover:opacity-80 transition-all flex items-center gap-1.5"
            >
              <IconChevronLeft size={16} />
              <span>Chương {previousChapterNumber}</span>
            </Link>
          ) : (
            <div />
          )}

          {nextChapterNumber ? (
            <Link
              href={`/${locale}/story/${storySlug}/${nextChapterNumber}`}
              className="px-5 py-2.5 rounded-xl border text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-500 shadow-md shadow-emerald-950/40 transition-all flex items-center gap-1.5"
            >
              <span>Chương {nextChapterNumber}</span>
              <IconChevronRight size={16} />
            </Link>
          ) : (
            <div />
          )}
        </div>
      </main>
    </div>
  );
}
