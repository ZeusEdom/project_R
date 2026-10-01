-- ============================================
-- STORY PLATFORM: Initial Schema
-- ============================================

-- Reset schema for clean installation
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUMS
-- ============================================
CREATE TYPE story_type AS ENUM ('novel', 'manga', 'light_novel');
CREATE TYPE story_status AS ENUM ('draft', 'ongoing', 'completed', 'hiatus');
CREATE TYPE chapter_status AS ENUM ('draft', 'scheduled', 'published');
CREATE TYPE comment_status AS ENUM ('pending', 'approved', 'rejected', 'flagged');
CREATE TYPE locale_code AS ENUM ('en', 'fr', 'ja');
CREATE TYPE notif_status AS ENUM ('sent', 'delivered', 'clicked', 'failed');

-- ============================================
-- TABLE: profiles
-- ============================================
CREATE TABLE public.profiles (
  id              uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name    text,
  avatar_url      text,
  bio             text,
  language_pref   text NOT NULL DEFAULT 'vi'
                  CHECK (language_pref IN ('vi', 'en', 'fr', 'ja')),
  is_admin        boolean NOT NULL DEFAULT false,
  is_banned       boolean NOT NULL DEFAULT false,
  banned_until    timestamptz,
  notify_enabled  boolean NOT NULL DEFAULT true,
  last_active_at  timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, is_admin)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
    (LOWER(NEW.email) = 'thedzorc@gmail.com')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- TABLE: stories
-- ============================================
CREATE TABLE public.stories (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title         text NOT NULL,
  slug          text NOT NULL UNIQUE,
  synopsis      text,
  cover_url     text,
  type          story_type NOT NULL DEFAULT 'novel',
  status        story_status NOT NULL DEFAULT 'draft',
  is_featured   boolean NOT NULL DEFAULT false,
  view_count    bigint NOT NULL DEFAULT 0,
  rating_avg    numeric(3,2) NOT NULL DEFAULT 0,
  rating_count  integer NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  published_at  timestamptz
);

CREATE INDEX idx_stories_slug ON stories(slug);
CREATE INDEX idx_stories_status ON stories(status) WHERE status != 'draft';
CREATE INDEX idx_stories_type ON stories(type);
CREATE INDEX idx_stories_published ON stories(published_at DESC NULLS LAST);
CREATE INDEX idx_stories_featured ON stories(is_featured) WHERE is_featured = true;

-- ============================================
-- TABLE: story_translations
-- ============================================
CREATE TABLE public.story_translations (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id  uuid NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  locale    locale_code NOT NULL,
  title     text NOT NULL,
  synopsis  text,
  UNIQUE (story_id, locale)
);

CREATE INDEX idx_story_trans_story ON story_translations(story_id);

-- ============================================
-- TABLE: genres
-- ============================================
CREATE TABLE public.genres (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        text NOT NULL UNIQUE,
  name_vi     text NOT NULL,
  name_en     text,
  name_fr     text,
  name_ja     text,
  sort_order  integer NOT NULL DEFAULT 0
);

CREATE INDEX idx_genres_slug ON genres(slug);

-- ============================================
-- TABLE: story_genres (junction)
-- ============================================
CREATE TABLE public.story_genres (
  story_id  uuid NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  genre_id  uuid NOT NULL REFERENCES genres(id) ON DELETE CASCADE,
  PRIMARY KEY (story_id, genre_id)
);

CREATE INDEX idx_story_genres_genre ON story_genres(genre_id);

-- ============================================
-- TABLE: chapters
-- ============================================
CREATE TABLE public.chapters (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id        uuid NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  chapter_number  integer NOT NULL,
  title           text NOT NULL,
  content_text    text,
  content_images  text[] DEFAULT '{}',
  status          chapter_status NOT NULL DEFAULT 'draft',
  word_count      integer DEFAULT 0,
  scheduled_at    timestamptz,
  published_at    timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (story_id, chapter_number)
);

CREATE INDEX idx_chapters_story ON chapters(story_id);
CREATE INDEX idx_chapters_status ON chapters(status);
CREATE INDEX idx_chapters_scheduled ON chapters(scheduled_at)
  WHERE status = 'scheduled' AND scheduled_at IS NOT NULL;
CREATE INDEX idx_chapters_published ON chapters(story_id, published_at DESC);

-- ============================================
-- TABLE: bookmarks
-- ============================================
CREATE TABLE public.bookmarks (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  story_id    uuid NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, story_id)
);

CREATE INDEX idx_bookmarks_user ON bookmarks(user_id);

-- ============================================
-- TABLE: reading_progress
-- ============================================
CREATE TABLE public.reading_progress (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  chapter_id        uuid NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
  story_id          uuid NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  progress_percent  smallint NOT NULL DEFAULT 0
                    CHECK (progress_percent BETWEEN 0 AND 100),
  last_read_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, chapter_id)
);

CREATE INDEX idx_reading_user ON reading_progress(user_id);
CREATE INDEX idx_reading_story ON reading_progress(user_id, story_id);

-- ============================================
-- TABLE: comments
-- ============================================
CREATE TABLE public.comments (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  story_id    uuid NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  chapter_id  uuid REFERENCES chapters(id) ON DELETE CASCADE,
  content     text NOT NULL CHECK (char_length(content) BETWEEN 1 AND 2000),
  status      comment_status NOT NULL DEFAULT 'pending',
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_comments_story ON comments(story_id);
CREATE INDEX idx_comments_user ON comments(user_id);
CREATE INDEX idx_comments_status ON comments(status);

-- ============================================
-- TABLE: story_views
-- ============================================
CREATE TABLE public.story_views (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id    uuid NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  chapter_id  uuid REFERENCES chapters(id) ON DELETE CASCADE,
  user_id     uuid REFERENCES profiles(id) ON DELETE SET NULL,
  viewed_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_views_story ON story_views(story_id);
CREATE INDEX idx_views_date ON story_views(viewed_at DESC);
CREATE INDEX idx_views_story_date ON story_views(story_id, viewed_at DESC);

-- ============================================
-- TABLE: notification_subscriptions
-- ============================================
CREATE TABLE public.notification_subscriptions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  story_id    uuid REFERENCES stories(id) ON DELETE CASCADE,
  endpoint    text NOT NULL,
  p256dh      text NOT NULL,
  auth_key    text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, endpoint, story_id)
);

CREATE INDEX idx_notif_sub_user ON notification_subscriptions(user_id);
CREATE INDEX idx_notif_sub_story ON notification_subscriptions(story_id)
  WHERE story_id IS NOT NULL;

-- ============================================
-- TABLE: notification_log
-- ============================================
CREATE TABLE public.notification_log (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES profiles(id) ON DELETE SET NULL,
  story_id    uuid REFERENCES stories(id) ON DELETE SET NULL,
  chapter_id  uuid REFERENCES chapters(id) ON DELETE SET NULL,
  title       text NOT NULL,
  body        text,
  status      notif_status NOT NULL DEFAULT 'sent',
  sent_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_notif_log_story ON notification_log(story_id);
CREATE INDEX idx_notif_log_sent ON notification_log(sent_at DESC);

-- ============================================
-- TABLE: site_settings
-- ============================================
CREATE TABLE public.site_settings (
  key         text PRIMARY KEY,
  value       jsonb NOT NULL DEFAULT '{}',
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- ============================================
-- HELPER FUNCTION: is_admin
-- ============================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================
-- HELPER FUNCTION: updated_at trigger
-- ============================================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON stories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON chapters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE genres ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_genres ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- PROFILES
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admin can update any profile"
  ON profiles FOR UPDATE USING (is_admin());
CREATE POLICY "Admin can delete profiles"
  ON profiles FOR DELETE USING (is_admin());

-- STORIES
CREATE POLICY "Published stories are viewable by everyone"
  ON stories FOR SELECT USING (status != 'draft' OR is_admin());
CREATE POLICY "Admin can insert stories"
  ON stories FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admin can update stories"
  ON stories FOR UPDATE USING (is_admin());
CREATE POLICY "Admin can delete stories"
  ON stories FOR DELETE USING (is_admin());

-- STORY_TRANSLATIONS
CREATE POLICY "Translations are viewable by everyone"
  ON story_translations FOR SELECT USING (true);
CREATE POLICY "Admin can manage translations"
  ON story_translations FOR ALL USING (is_admin());

-- GENRES
CREATE POLICY "Genres are viewable by everyone"
  ON genres FOR SELECT USING (true);
CREATE POLICY "Admin can manage genres"
  ON genres FOR ALL USING (is_admin());

-- STORY_GENRES
CREATE POLICY "Story genres are viewable by everyone"
  ON story_genres FOR SELECT USING (true);
CREATE POLICY "Admin can manage story genres"
  ON story_genres FOR ALL USING (is_admin());

-- CHAPTERS
CREATE POLICY "Published chapters are viewable by everyone"
  ON chapters FOR SELECT USING (status = 'published' OR is_admin());
CREATE POLICY "Admin can insert chapters"
  ON chapters FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admin can update chapters"
  ON chapters FOR UPDATE USING (is_admin());
CREATE POLICY "Admin can delete chapters"
  ON chapters FOR DELETE USING (is_admin());

-- BOOKMARKS
CREATE POLICY "Users can view own bookmarks"
  ON bookmarks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own bookmarks"
  ON bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own bookmarks"
  ON bookmarks FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admin can view all bookmarks"
  ON bookmarks FOR SELECT USING (is_admin());

-- READING_PROGRESS
CREATE POLICY "Users can view own reading progress"
  ON reading_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can upsert own reading progress"
  ON reading_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reading progress"
  ON reading_progress FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admin can view all reading progress"
  ON reading_progress FOR SELECT USING (is_admin());

-- COMMENTS
CREATE POLICY "Approved comments are viewable by everyone"
  ON comments FOR SELECT USING (status = 'approved' OR auth.uid() = user_id OR is_admin());
CREATE POLICY "Authenticated users can create comments"
  ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own comments"
  ON comments FOR UPDATE USING (auth.uid() = user_id OR is_admin());
CREATE POLICY "Users can delete own comments or admin"
  ON comments FOR DELETE USING (auth.uid() = user_id OR is_admin());

-- STORY_VIEWS
CREATE POLICY "Admin can view story_views"
  ON story_views FOR SELECT USING (is_admin());
CREATE POLICY "Anyone can insert views"
  ON story_views FOR INSERT WITH CHECK (true);

-- NOTIFICATION_SUBSCRIPTIONS
CREATE POLICY "Users can view own subscriptions"
  ON notification_subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own subscriptions"
  ON notification_subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own subscriptions"
  ON notification_subscriptions FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admin can view all subscriptions"
  ON notification_subscriptions FOR SELECT USING (is_admin());

-- NOTIFICATION_LOG
CREATE POLICY "Admin can view notification logs"
  ON notification_log FOR SELECT USING (is_admin());

-- SITE_SETTINGS
CREATE POLICY "Site settings are viewable by everyone"
  ON site_settings FOR SELECT USING (true);
CREATE POLICY "Admin can manage site settings"
  ON site_settings FOR ALL USING (is_admin());

-- ============================================
-- STORAGE BUCKETS (created via Supabase Dashboard or CLI)
-- Note: Bucket creation is done via supabase CLI, not SQL.
-- These comments document the intended buckets:
-- Bucket: covers (public, 5MB limit)
-- Bucket: chapters (public, 10MB limit)
-- ============================================

-- ============================================
-- TABLE PRIVILEGES & PERMISSIONS (GRANT)
-- ============================================
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO anon, authenticated, service_role;

