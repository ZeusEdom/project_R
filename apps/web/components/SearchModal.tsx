'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { createClient } from '@repo/supabase/client';
import { IconSearch, IconBook, IconEye, IconX, Badge } from '@repo/ui';

interface SearchModalProps {
  locale: string;
}

export function SearchModal({ locale }: SearchModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcut (Ctrl+K or Cmd+K) and Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close when clicking or touching anywhere outside the modal dialog
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  // Focus search input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Debounced Supabase Realtime Search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('stories')
        .select('id, title, slug, cover_url, type, status, synopsis, view_count')
        .neq('status', 'draft')
        .ilike('title', `%${query.trim()}%`)
        .order('view_count', { ascending: false })
        .limit(8);

      setResults(data || []);
      setIsLoading(false);
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <>
      {/* Search Input Trigger Button in Navbar */}
      <div className="flex-1 max-w-md relative hidden md:block">
        <button
          onClick={() => setIsOpen(true)}
          className="w-full flex items-center justify-between pl-3.5 pr-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500 dark:text-zinc-400 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 transition-all text-left group shadow-inner"
        >
          <div className="flex items-center gap-2">
            <IconSearch size={15} className="text-zinc-400 group-hover:text-emerald-500 transition-colors" />
            <span>{locale === 'en' ? 'Search title, author...' : 'Tìm kiếm tên truyện, tác giả...'}</span>
          </div>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono font-semibold text-zinc-400 bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded shadow-xs">
            Ctrl K
          </kbd>
        </button>
      </div>

      {/* Mobile Search Icon Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden p-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 transition-colors"
        title={locale === 'en' ? 'Search' : 'Tìm kiếm'}
      >
        <IconSearch size={18} />
      </button>

      {/* Search Modal Container */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4">
          {/* Dimmed Backdrop */}
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal Content Box with Ref for Outside Click Detection */}
          <div
            ref={modalRef}
            className="relative z-10 w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80dvh] animate-in fade-in zoom-in-95 duration-150"
          >
            {/* Search Input Header */}
            <div className="p-4 border-b border-zinc-800/80 flex items-center gap-3 bg-zinc-950/60">
              <IconSearch size={20} className="text-emerald-500 shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={locale === 'en' ? 'Type story title to search...' : 'Nhập tên truyện cần tìm...'}
                className="w-full bg-transparent text-base font-medium text-zinc-100 placeholder:text-zinc-500 focus:outline-none"
              />

              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="text-xs font-semibold text-zinc-400 hover:text-zinc-200 px-2 py-1 rounded bg-zinc-800/80 shrink-0"
                >
                  {locale === 'en' ? 'Clear' : 'Xóa'}
                </button>
              )}

              {/* Close Button Icon */}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors shrink-0 ml-1"
                title={locale === 'en' ? 'Close (Esc)' : 'Đóng (Esc)'}
              >
                <IconX size={18} />
              </button>
            </div>

            {/* Results Body */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {isLoading && (
                <div className="p-8 text-center text-xs text-zinc-400 flex items-center justify-center gap-2">
                  <div className="w-4 h-4 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
                  <span>{locale === 'en' ? 'Searching stories...' : 'Đang tìm kiếm dữ liệu...'}</span>
                </div>
              )}

              {!isLoading && query.trim() && results.length === 0 && (
                <div className="p-10 text-center space-y-2">
                  <p className="text-sm font-semibold text-zinc-300">
                    {locale === 'en' ? 'No stories found' : 'Không tìm thấy truyện nào'}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {locale === 'en'
                      ? `No stories matched "${query}"`
                      : `Không có truyện nào khớp với từ khóa "${query}"`}
                  </p>
                </div>
              )}

              {!isLoading && !query.trim() && (
                <div className="p-8 text-center text-xs text-zinc-500">
                  {locale === 'en'
                    ? 'Type a story title to start searching...'
                    : 'Gõ tên truyện để bắt đầu tìm kiếm từ kho dữ liệu...'}
                </div>
              )}

              {!isLoading &&
                results.map((story) => (
                  <Link
                    key={story.id}
                    href={`/${locale}/story/${story.slug}`}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-4 p-3 rounded-2xl border border-zinc-800/60 bg-zinc-950/40 hover:bg-zinc-800/80 hover:border-emerald-500/50 transition-all group"
                  >
                    <div className="w-12 h-16 rounded-xl bg-zinc-800 overflow-hidden shrink-0 border border-zinc-700/60 shadow">
                      {story.cover_url ? (
                        <img src={story.cover_url} alt={story.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[9px] text-zinc-600 font-mono">
                          NO COVER
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase font-mono">
                          {story.type}
                        </span>
                        <Badge variant={story.status === 'ongoing' ? 'success' : 'default'}>
                          {story.status === 'ongoing'
                            ? (locale === 'en' ? 'Ongoing' : 'Đang ra')
                            : story.status === 'completed'
                            ? (locale === 'en' ? 'Completed' : 'Hoàn thành')
                            : story.status}
                        </Badge>
                      </div>
                      <h4 className="font-bold text-sm text-zinc-100 group-hover:text-emerald-400 transition-colors truncate">
                        {story.title}
                      </h4>
                      <p className="text-xs text-zinc-400 truncate mt-0.5">
                        {story.synopsis || (locale === 'en' ? 'No synopsis available.' : 'Chưa có tóm tắt.')}
                      </p>
                    </div>

                    <div className="text-xs text-emerald-400 font-semibold shrink-0 group-hover:translate-x-1 transition-transform">
                      {locale === 'en' ? 'Read →' : 'Đọc ngay →'}
                    </div>
                  </Link>
                ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
