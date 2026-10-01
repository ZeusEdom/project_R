-- Seed genres
INSERT INTO public.genres (slug, name_vi, name_en, name_fr, name_ja, sort_order) VALUES
  ('action', 'Hành động', 'Action', 'Action', 'アクション', 1),
  ('adventure', 'Phiêu lưu', 'Adventure', 'Aventure', '冒険', 2),
  ('comedy', 'Hài hước', 'Comedy', 'Comédie', 'コメディ', 3),
  ('drama', 'Kịch tính', 'Drama', 'Drame', 'ドラマ', 4),
  ('fantasy', 'Kỳ ảo', 'Fantasy', 'Fantaisie', 'ファンタジー', 5),
  ('horror', 'Kinh dị', 'Horror', 'Horreur', 'ホラー', 6),
  ('mystery', 'Bí ẩn', 'Mystery', 'Mystère', 'ミステリー', 7),
  ('romance', 'Lãng mạn', 'Romance', 'Romance', 'ロマンス', 8),
  ('sci-fi', 'Khoa học viễn tưởng', 'Sci-Fi', 'Science-fiction', 'SF', 9),
  ('slice-of-life', 'Đời thường', 'Slice of Life', 'Tranche de vie', '日常', 10),
  ('supernatural', 'Siêu nhiên', 'Supernatural', 'Surnaturel', '超自然', 11),
  ('thriller', 'Giật gân', 'Thriller', 'Thriller', 'スリラー', 12),
  ('historical', 'Lịch sử', 'Historical', 'Historique', '歴史', 13),
  ('martial-arts', 'Võ thuật', 'Martial Arts', 'Arts martiaux', '武道', 14),
  ('psychological', 'Tâm lý', 'Psychological', 'Psychologique', '心理', 15),
  ('school-life', 'Học đường', 'School Life', 'Vie scolaire', '学園', 16),
  ('sports', 'Thể thao', 'Sports', 'Sports', 'スポーツ', 17),
  ('tragedy', 'Bi kịch', 'Tragedy', 'Tragédie', '悲劇', 18),
  ('isekai', 'Isekai', 'Isekai', 'Isekai', '異世界', 19),
  ('mecha', 'Mecha', 'Mecha', 'Mecha', 'メカ', 20);

-- Seed default site settings
INSERT INTO public.site_settings (key, value) VALUES
  ('site_name', '"Truyện Của Tôi"'),
  ('site_description', '"Website đọc truyện cá nhân"'),
  ('logo_url', '""'),
  ('social_links', '{"facebook":"","twitter":"","discord":""}'),
  ('vapid_public_key', '""'),
  ('enabled_locales', '["vi","en","fr","ja"]')
ON CONFLICT (key) DO NOTHING;
