export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          avatar_url: string | null;
          bio: string | null;
          language_pref: 'vi' | 'en' | 'fr' | 'ja';
          is_admin: boolean;
          is_banned: boolean;
          banned_until: string | null;
          notify_enabled: boolean;
          last_active_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          language_pref?: 'vi' | 'en' | 'fr' | 'ja';
          is_admin?: boolean;
          is_banned?: boolean;
          banned_until?: string | null;
          notify_enabled?: boolean;
          last_active_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          language_pref?: 'vi' | 'en' | 'fr' | 'ja';
          is_admin?: boolean;
          is_banned?: boolean;
          banned_until?: string | null;
          notify_enabled?: boolean;
          last_active_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      stories: {
        Row: {
          id: string;
          title: string;
          slug: string;
          synopsis: string | null;
          cover_url: string | null;
          type: 'novel' | 'manga' | 'light_novel';
          status: 'draft' | 'ongoing' | 'completed' | 'hiatus';
          is_featured: boolean;
          view_count: number;
          rating_avg: number;
          rating_count: number;
          created_at: string;
          updated_at: string;
          published_at: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          synopsis?: string | null;
          cover_url?: string | null;
          type?: 'novel' | 'manga' | 'light_novel';
          status?: 'draft' | 'ongoing' | 'completed' | 'hiatus';
          is_featured?: boolean;
          view_count?: number;
          rating_avg?: number;
          rating_count?: number;
          created_at?: string;
          updated_at?: string;
          published_at?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          synopsis?: string | null;
          cover_url?: string | null;
          type?: 'novel' | 'manga' | 'light_novel';
          status?: 'draft' | 'ongoing' | 'completed' | 'hiatus';
          is_featured?: boolean;
          view_count?: number;
          rating_avg?: number;
          rating_count?: number;
          updated_at?: string;
          published_at?: string | null;
        };
        Relationships: [];
      };
      story_translations: {
        Row: {
          id: string;
          story_id: string;
          locale: 'en' | 'fr' | 'ja';
          title: string;
          synopsis: string | null;
        };
        Insert: {
          id?: string;
          story_id: string;
          locale: 'en' | 'fr' | 'ja';
          title: string;
          synopsis?: string | null;
        };
        Update: {
          id?: string;
          story_id?: string;
          locale?: 'en' | 'fr' | 'ja';
          title?: string;
          synopsis?: string | null;
        };
        Relationships: [];
      };
      genres: {
        Row: {
          id: string;
          slug: string;
          name_vi: string;
          name_en: string | null;
          name_fr: string | null;
          name_ja: string | null;
          sort_order: number;
        };
        Insert: {
          id?: string;
          slug: string;
          name_vi: string;
          name_en?: string | null;
          name_fr?: string | null;
          name_ja?: string | null;
          sort_order?: number;
        };
        Update: {
          id?: string;
          slug?: string;
          name_vi?: string;
          name_en?: string | null;
          name_fr?: string | null;
          name_ja?: string | null;
          sort_order?: number;
        };
        Relationships: [];
      };
      story_genres: {
        Row: {
          story_id: string;
          genre_id: string;
        };
        Insert: {
          story_id: string;
          genre_id: string;
        };
        Update: {
          story_id?: string;
          genre_id?: string;
        };
        Relationships: [];
      };
      chapters: {
        Row: {
          id: string;
          story_id: string;
          chapter_number: number;
          title: string;
          content_text: string | null;
          content_images: string[];
          status: 'draft' | 'scheduled' | 'published';
          word_count: number;
          scheduled_at: string | null;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          story_id: string;
          chapter_number: number;
          title: string;
          content_text?: string | null;
          content_images?: string[];
          status?: 'draft' | 'scheduled' | 'published';
          word_count?: number;
          scheduled_at?: string | null;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          story_id?: string;
          chapter_number?: number;
          title?: string;
          content_text?: string | null;
          content_images?: string[];
          status?: 'draft' | 'scheduled' | 'published';
          word_count?: number;
          scheduled_at?: string | null;
          published_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      bookmarks: {
        Row: {
          id: string;
          user_id: string;
          story_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          story_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          story_id?: string;
        };
        Relationships: [];
      };
      reading_progress: {
        Row: {
          id: string;
          user_id: string;
          chapter_id: string;
          story_id: string;
          progress_percent: number;
          last_read_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          chapter_id: string;
          story_id: string;
          progress_percent?: number;
          last_read_at?: string;
        };
        Update: {
          id?: string;
          progress_percent?: number;
          last_read_at?: string;
        };
        Relationships: [];
      };
      comments: {
        Row: {
          id: string;
          user_id: string;
          story_id: string;
          chapter_id: string | null;
          content: string;
          status: 'pending' | 'approved' | 'rejected' | 'flagged';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          story_id: string;
          chapter_id?: string | null;
          content: string;
          status?: 'pending' | 'approved' | 'rejected' | 'flagged';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          content?: string;
          status?: 'pending' | 'approved' | 'rejected' | 'flagged';
          updated_at?: string;
        };
        Relationships: [];
      };
      story_views: {
        Row: {
          id: string;
          story_id: string;
          chapter_id: string | null;
          user_id: string | null;
          viewed_at: string;
        };
        Insert: {
          id?: string;
          story_id: string;
          chapter_id?: string | null;
          user_id?: string | null;
          viewed_at?: string;
        };
        Update: {
          id?: string;
        };
        Relationships: [];
      };
      notification_subscriptions: {
        Row: {
          id: string;
          user_id: string;
          story_id: string | null;
          endpoint: string;
          p256dh: string;
          auth_key: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          story_id?: string | null;
          endpoint: string;
          p256dh: string;
          auth_key: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          story_id?: string | null;
          endpoint?: string;
          p256dh?: string;
          auth_key?: string;
        };
        Relationships: [];
      };
      notification_log: {
        Row: {
          id: string;
          user_id: string | null;
          story_id: string | null;
          chapter_id: string | null;
          title: string;
          body: string | null;
          status: 'sent' | 'delivered' | 'clicked' | 'failed';
          sent_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          story_id?: string | null;
          chapter_id?: string | null;
          title: string;
          body?: string | null;
          status?: 'sent' | 'delivered' | 'clicked' | 'failed';
          sent_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          story_id?: string | null;
          chapter_id?: string | null;
          title?: string;
          body?: string | null;
          status?: 'sent' | 'delivered' | 'clicked' | 'failed';
          sent_at?: string;
        };
        Relationships: [];
      };
      site_settings: {
        Row: {
          key: string;
          value: Json;
          updated_at: string;
        };
        Insert: {
          key: string;
          value: Json;
          updated_at?: string;
        };
        Update: {
          key?: string;
          value?: Json;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
    Enums: {
      story_type: 'novel' | 'manga' | 'light_novel';
      story_status: 'draft' | 'ongoing' | 'completed' | 'hiatus';
      chapter_status: 'draft' | 'scheduled' | 'published';
      comment_status: 'pending' | 'approved' | 'rejected' | 'flagged';
      locale_code: 'en' | 'fr' | 'ja';
      notif_status: 'sent' | 'delivered' | 'clicked' | 'failed';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
