'use client';

import { useState } from 'react';
import Link from 'next/link';
import { IconChevronRight } from '@repo/ui';

interface ChapterItem {
  id: string;
  chapter_number: number;
  title: string;
  published_at: string | null;
  word_count?: number;
}

interface ChapterListInteractiveProps {
  chapters: ChapterItem[];
  storySlug: string;
  locale: string;
}

export function ChapterListInteractive({ chapters, storySlug, locale }: ChapterListInteractiveProps) {
  const [query, setQuery] = useState('');
  const [isReverse, setIsReverse] = useState(false);

  const filtered = chapters.filter((c) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      c.title.toLowerCase().includes(q) ||
      c.chapter_number.toString().includes(q) ||
      `chương ${c.chapter_number}`.includes(q)
    );
  });

  const displayChapters = isReverse ? [...filtered].reverse() : filtered;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
        <h2 className="text-xl font-extrabold text-zinc-100 border-l-4 border-emerald-500 pl-3">
          Danh Sách Chương ({chapters.length})
        </h2>

        <div className="flex items-center gap-2">
          {/* Search Input inside Chapter List */}
          <div className="relative flex-1 sm:w-64">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm số chương hoặc tên..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-2.5 top-1.5 text-xs text-zinc-500 hover:text-zinc-300"
              >
                ✕
              </button>
            )}
          </div>

          {/* Sort Order Toggle */}
          <button
            onClick={() => setIsReverse(!isReverse)}
            className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-300 hover:border-emerald-500/50 transition-colors shrink-0 font-mono"
            title="Đảo ngược thứ tự chương"
          >
            {isReverse ? 'Mới nhất trước' : 'Cũ nhất trước'}
          </button>
        </div>
      </div>

      {displayChapters.length === 0 ? (
        <div className="p-8 text-center bg-zinc-900/50 rounded-2xl border border-zinc-800 text-zinc-500 text-sm">
          {query ? 'Không tìm thấy chương nào phù hợp.' : 'Truyện chưa có chương nào được xuất bản.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {displayChapters.map((ch) => (
            <Link
              key={ch.id}
              href={`/${locale}/story/${storySlug}/${ch.chapter_number}`}
              className="group flex items-center justify-between p-3.5 rounded-xl border border-zinc-800/80 bg-zinc-900/40 hover:bg-zinc-800/80 hover:border-emerald-500/40 transition-all"
            >
              <div className="min-w-0 flex-1 pr-3">
                <div className="text-xs font-bold text-zinc-200 group-hover:text-emerald-400 transition-colors truncate">
                  Chương {ch.chapter_number}: {ch.title}
                </div>
                {ch.published_at && (
                  <div className="text-[10px] font-mono text-zinc-500 mt-0.5">
                    {new Date(ch.published_at).toLocaleDateString(locale)}
                  </div>
                )}
              </div>
              <span className="text-xs font-semibold text-emerald-400 opacity-80 group-hover:opacity-100 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-all shrink-0">
                <span>Đọc</span>
                <IconChevronRight size={14} />
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
