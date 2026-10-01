import type { Database } from './database';

type Tables = Database['public']['Tables'];

export type Chapter = Tables['chapters']['Row'];
export type ChapterInsert = Tables['chapters']['Insert'];
export type ChapterUpdate = Tables['chapters']['Update'];

export type ChapterListItem = Pick<
  Chapter,
  'id' | 'chapter_number' | 'title' | 'status' | 'published_at' | 'word_count'
>;

export type ChapterWithStory = Chapter & {
  story: {
    id: string;
    title: string;
    slug: string;
    type: Database['public']['Enums']['story_type'];
  };
};

export type ChapterStatus = Database['public']['Enums']['chapter_status'];
