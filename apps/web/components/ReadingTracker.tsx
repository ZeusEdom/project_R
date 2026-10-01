'use client';

import { useEffect } from 'react';
import { saveReadingProgressAction } from '@/app/[locale]/story/[slug]/[chapter]/actions';

interface ReadingTrackerProps {
  storyId: string;
  storyTitle: string;
  storySlug: string;
  chapterId: string;
  chapterNumber: number;
  chapterTitle: string;
  coverUrl?: string;
}

export function ReadingTracker({
  storyId,
  storyTitle,
  storySlug,
  chapterId,
  chapterNumber,
  chapterTitle,
  coverUrl,
}: ReadingTrackerProps) {
  useEffect(() => {
    // 1. Save to Supabase DB for logged in user
    saveReadingProgressAction({ storyId, chapterId, progressPercent: 100 });

    // 2. Save to LocalStorage reading history fallback
    try {
      const stored = localStorage.getItem('user_reading_history');
      let history: any[] = stored ? JSON.parse(stored) : [];
      if (!Array.isArray(history)) history = [];

      // Remove existing entry for same story
      history = history.filter((item: any) => item.storyId !== storyId);

      // Add new entry at top
      history.unshift({
        storyId,
        storyTitle,
        storySlug,
        chapterId,
        chapterNumber,
        chapterTitle,
        coverUrl,
        lastReadAt: new Date().toISOString(),
      });

      localStorage.setItem('user_reading_history', JSON.stringify(history.slice(0, 20)));
    } catch {
      // ignore
    }
  }, [storyId, chapterId, storyTitle, storySlug, chapterNumber, chapterTitle, coverUrl]);

  return null;
}
