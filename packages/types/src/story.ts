import type { Database } from './database';

type Tables = Database['public']['Tables'];

export type Story = Tables['stories']['Row'];
export type StoryInsert = Tables['stories']['Insert'];
export type StoryUpdate = Tables['stories']['Update'];

export type Genre = Tables['genres']['Row'];
export type StoryGenre = Tables['story_genres']['Row'];
export type StoryTranslation = Tables['story_translations']['Row'];

export type StoryWithGenres = Story & {
  genres: Genre[];
  translations?: StoryTranslation[];
};

export type StoryWithDetails = StoryWithGenres & {
  chapter_count: number;
  latest_chapter?: {
    chapter_number: number;
    title: string;
    published_at: string | null;
  };
};

export type StoryType = Database['public']['Enums']['story_type'];
export type StoryStatus = Database['public']['Enums']['story_status'];
