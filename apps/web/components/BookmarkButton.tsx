'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button, IconBookmark } from '@repo/ui';

interface BookmarkButtonProps {
  storyId: string;
  storyTitle: string;
  storySlug: string;
  coverUrl?: string;
}

export function BookmarkButton({ storyId, storyTitle, storySlug, coverUrl }: BookmarkButtonProps) {
  const tStory = useTranslations('story');
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('user_bookmarks');
      if (stored) {
        const bookmarks = JSON.parse(stored);
        if (Array.isArray(bookmarks)) {
          setIsBookmarked(bookmarks.some((b: any) => b.id === storyId));
        }
      }
    } catch {
      // ignore
    }
  }, [storyId]);

  function toggleBookmark() {
    try {
      const stored = localStorage.getItem('user_bookmarks');
      let bookmarks: any[] = stored ? JSON.parse(stored) : [];

      if (isBookmarked) {
        bookmarks = bookmarks.filter((b: any) => b.id !== storyId);
        setIsBookmarked(false);
      } else {
        bookmarks.unshift({
          id: storyId,
          title: storyTitle,
          slug: storySlug,
          coverUrl,
          savedAt: new Date().toISOString(),
        });
        setIsBookmarked(true);
      }

      localStorage.setItem('user_bookmarks', JSON.stringify(bookmarks));
    } catch {
      // ignore
    }
  }

  return (
    <Button
      variant={isBookmarked ? 'primary' : 'secondary'}
      size="lg"
      onClick={toggleBookmark}
      className={`transition-all font-bold ${
        isBookmarked ? 'bg-amber-500 hover:bg-amber-600 text-zinc-950 shadow-lg shadow-amber-500/20' : ''
      }`}
    >
      <IconBookmark className={`w-5 h-5 ${isBookmarked ? 'fill-zinc-950 text-zinc-950' : 'text-amber-400'}`} />
      <span>{isBookmarked ? tStory('bookmarked') : tStory('bookmark')}</span>
    </Button>
  );
}
