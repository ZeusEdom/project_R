'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { IconBookmark, IconTrash, IconX } from '@repo/ui';

interface BookmarkedStory {
  id: string;
  title: string;
  slug: string;
  coverUrl?: string;
  savedAt: string;
}

export default function BookmarksPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'vi';
  const [bookmarks, setBookmarks] = useState<BookmarkedStory[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('user_bookmarks');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setBookmarks(parsed);
        }
      }
    } catch {
      // ignore
    } finally {
      setIsLoaded(true);
    }
  }, []);

  function removeBookmark(id: string) {
    const updated = bookmarks.filter((b) => b.id !== id);
    setBookmarks(updated);
    try {
      localStorage.setItem('user_bookmarks', JSON.stringify(updated));
    } catch {
      // ignore
    }
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 min-h-[60vh]">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-100 border-l-4 border-amber-500 pl-3 flex items-center gap-2.5">
            <IconBookmark size={26} className="text-amber-400" />
            <span>Truyen Da Danh Dau</span>
          </h1>
          <p className="text-sm text-zinc-400 mt-1 pl-4">
            Danh sach nhung bo truyen ban da luu de theo doi
          </p>
        </div>

        {bookmarks.length > 0 && (
          <button
            onClick={() => {
              setBookmarks([]);
              localStorage.removeItem('user_bookmarks');
            }}
            className="px-3.5 py-1.5 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs font-semibold hover:bg-red-900/80 transition-colors flex items-center gap-1.5"
          >
            <IconTrash size={14} />
            <span>Xoa tat ca</span>
          </button>
        )}
      </div>

      {!isLoaded ? (
        <div className="p-12 text-center text-zinc-500">Dang tai danh sach danh dau...</div>
      ) : bookmarks.length === 0 ? (
        <div className="p-16 text-center text-zinc-500 bg-zinc-900/40 rounded-3xl border border-zinc-800 space-y-3">
          <div className="flex justify-center">
            <IconBookmark size={48} className="text-zinc-600" />
          </div>
          <div className="text-base font-bold text-zinc-300">Chua co truyen nao duoc danh dau</div>
          <p className="text-xs text-zinc-500">
            Nhan vao nut "Danh Dau Truyen" o trang chi tiet truyen de luu vao day.
          </p>
          <div className="pt-2">
            <Link
              href={`/${locale}/browse`}
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500 transition-colors inline-block"
            >
              Duyet truyen ngay
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {bookmarks.map((story) => (
            <div
              key={story.id}
              className="group relative flex flex-col bg-zinc-900/60 border border-zinc-800 rounded-2xl overflow-hidden hover:border-amber-500/50 hover:-translate-y-1 transition-all duration-300"
            >
              <Link href={`/${locale}/story/${story.slug}`} className="aspect-[3/4] w-full bg-zinc-800 relative overflow-hidden">
                {story.coverUrl ? (
                  <img src={story.coverUrl} alt={story.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-600 text-xs font-mono">
                    NO COVER
                  </div>
                )}
                <div className="absolute top-2 right-2 z-10">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      removeBookmark(story.id);
                    }}
                    className="w-7 h-7 rounded-lg bg-zinc-950/80 hover:bg-red-600 text-zinc-300 hover:text-white flex items-center justify-center transition-colors backdrop-blur-md border border-zinc-700"
                    title="Bo danh dau"
                  >
                    <IconX size={14} />
                  </button>
                </div>
              </Link>

              <div className="p-3.5 flex flex-col flex-1 justify-between">
                <Link href={`/${locale}/story/${story.slug}`}>
                  <h3 className="font-extrabold text-zinc-100 text-sm line-clamp-2 group-hover:text-amber-400 transition-colors leading-snug">
                    {story.title}
                  </h3>
                </Link>
                <div className="text-[10px] font-mono text-zinc-500 mt-2 border-t border-zinc-800/60 pt-2 flex items-center justify-between">
                  <span>Luu: {new Date(story.savedAt).toLocaleDateString(locale)}</span>
                  <Link href={`/${locale}/story/${story.slug}`} className="text-amber-400 font-bold">
                    Doc
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
