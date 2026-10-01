'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { IconBook } from '@repo/ui';

interface HistoryItem {
  storySlug: string;
  storyTitle: string;
  coverUrl?: string;
  chapterNumber: number;
  chapterTitle?: string;
  lastReadAt: string;
}

export function RecentHistoryBar({ locale }: { locale: string }) {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('user_reading_history');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setHistory(parsed.slice(0, 4));
        }
      }
    } catch {
      // ignore parsing error
    }
  }, []);

  if (history.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-emerald-950/40 via-zinc-900/60 to-zinc-900/40 border border-emerald-500/20 rounded-2xl p-4 mb-6 backdrop-blur-md space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <IconBook size={18} className="text-emerald-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-300">
            {locale === 'en' ? 'Continue Reading' : 'Truyện Bạn Đang Đọc'}
          </h3>
        </div>
        <button
          onClick={() => {
            localStorage.removeItem('user_reading_history');
            setHistory([]);
          }}
          className="text-[11px] text-zinc-500 hover:text-red-400 transition-colors"
        >
          {locale === 'en' ? 'Clear history' : 'Xóa lịch sử'}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {history.map((item) => (
          <Link
            key={item.storySlug}
            href={`/${locale}/story/${item.storySlug}/${item.chapterNumber}`}
            className="flex items-center gap-3 p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800 hover:border-emerald-500/50 hover:bg-zinc-900 transition-all group"
          >
            <div className="w-10 h-13 rounded-lg overflow-hidden bg-zinc-800 shrink-0">
              {item.coverUrl ? (
                <img src={item.coverUrl} alt={item.storyTitle} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-[9px] text-zinc-600">
                  NO COVER
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-zinc-200 truncate group-hover:text-emerald-400 transition-colors">
                {item.storyTitle}
              </div>
              <div className="text-[11px] font-mono text-emerald-400 font-semibold mt-0.5">
                {locale === 'en' ? `Chapter ${item.chapterNumber}` : `Chương ${item.chapterNumber}`}
              </div>
            </div>
            <span className="text-xs text-zinc-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all">
              →
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
