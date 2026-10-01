'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { IconBook, IconChevronRight } from '@repo/ui';

interface ProgressItem {
  id: string;
  storyTitle: string;
  storySlug: string;
  coverUrl?: string;
  chapterNumber: number;
  chapterTitle: string;
  progressPercent: number;
  lastReadAt: string;
}

export function HistoryListClient({
  locale,
  serverItems,
  isLoggedIn,
}: {
  locale: string;
  serverItems: ProgressItem[];
  isLoggedIn: boolean;
}) {
  const [items, setItems] = useState<ProgressItem[]>(serverItems);

  useEffect(() => {
    if (serverItems.length === 0) {
      try {
        const stored = localStorage.getItem('user_reading_history');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const formatted: ProgressItem[] = parsed.map((item: any, idx: number) => ({
              id: item.chapterId || `local-${idx}`,
              storyTitle: item.storyTitle || 'Truyện',
              storySlug: item.storySlug || '',
              coverUrl: item.coverUrl || undefined,
              chapterNumber: item.chapterNumber || 1,
              chapterTitle: item.chapterTitle || '',
              progressPercent: 100,
              lastReadAt: item.lastReadAt || new Date().toISOString(),
            }));
            setItems(formatted);
          }
        }
      } catch {
        // ignore
      }
    }
  }, [serverItems]);

  if (items.length === 0) {
    return (
      <div className="p-16 text-center text-zinc-500 bg-zinc-900/40 rounded-3xl border border-zinc-800 space-y-3">
        <IconBook size={40} className="text-zinc-600 mx-auto" />
        <div className="text-base font-bold text-zinc-300">
          {locale === 'en' ? 'No reading history found' : 'Chưa có lịch sử đọc truyện'}
        </div>
        <p className="text-xs text-zinc-500">
          {locale === 'en'
            ? 'Start reading any story and your progress will automatically appear here.'
            : 'Hãy bắt đầu đọc bộ truyện bất kỳ, tiến trình đọc của bạn sẽ tự động xuất hiện tại đây.'}
        </p>
        <div className="pt-2">
          <Link
            href={`/${locale}/browse`}
            className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500 transition-colors inline-block shadow-md"
          >
            {locale === 'en' ? 'Browse Stories' : 'Duyệt truyện ngay'}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div
          key={item.id}
          className="group flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800 hover:border-emerald-500/50 transition-all duration-200 gap-4"
        >
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-14 h-18 rounded-xl bg-zinc-800 border border-zinc-700/60 overflow-hidden shrink-0 flex items-center justify-center text-zinc-600 font-mono text-[10px]">
              {item.coverUrl ? (
                <img src={item.coverUrl} alt={item.storyTitle} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              ) : (
                'NO COVER'
              )}
            </div>

            <div className="space-y-1 min-w-0">
              <Link
                href={`/${locale}/story/${item.storySlug}`}
                className="font-extrabold text-zinc-100 text-base hover:text-emerald-400 transition-colors line-clamp-1"
              >
                {item.storyTitle}
              </Link>

              <div className="flex items-center gap-2 text-xs text-zinc-400 font-medium">
                <span className="text-emerald-400 font-mono">Chương {item.chapterNumber}</span>
                <span>•</span>
                <span className="truncate">{item.chapterTitle}</span>
              </div>

              {/* Progress Bar */}
              <div className="w-full max-w-xs space-y-1 pt-1">
                <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                  <span>Đã đọc {item.progressPercent}%</span>
                  <span>{new Date(item.lastReadAt).toLocaleDateString(locale)}</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all"
                    style={{ width: `${Math.max(5, item.progressPercent)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <Link
            href={`/${locale}/story/${item.storySlug}/${item.chapterNumber}`}
            className="px-4 py-2 rounded-xl bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white border border-emerald-500/30 font-bold text-xs transition-all flex items-center gap-1.5 shrink-0 self-end sm:self-center"
          >
            <span>{locale === 'en' ? 'Continue Reading' : 'Đọc tiếp'}</span>
            <IconChevronRight size={14} />
          </Link>
        </div>
      ))}
    </div>
  );
}
