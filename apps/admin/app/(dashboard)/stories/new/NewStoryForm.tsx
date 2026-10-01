'use client';

import { useState, useTransition } from 'react';
import { Button, Input, Textarea, Card, CardContent } from '@repo/ui';
import { createStoryAction } from '../actions';
import type { Genre } from '@repo/types';

export function NewStoryForm({ genres }: { genres: Genre[] }) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [slug, setSlug] = useState('');

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const title = e.target.value;
    // Auto-generate slug from title
    const generatedSlug = title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
    setSlug(generatedSlug);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await createStoryAction(formData);
      if (res?.error) {
        setError(res.error);
      }
    });
  }

  return (
    <Card className="bg-zinc-900/90 border-zinc-800">
      <CardContent className="pt-6">
        {error && (
          <div className="mb-4 rounded-lg bg-red-950/80 border border-red-800 p-3 text-sm text-red-300 font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Tên truyện"
            name="title"
            placeholder="VD: Avengers Doomsday"
            required
            onChange={handleTitleChange}
          />

          <Input
            label="Slug URL"
            name="slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="avengers-doomsday"
            required
            helperText="Đường dẫn thân thiện SEO (VD: domain.com/story/avengers-doomsday)"
          />

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-zinc-300">Loại truyện</label>
              <select
                name="type"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:ring-emerald-500"
              >
                <option value="novel">Novel (Truyện chữ)</option>
                <option value="manga">Manga / Comic (Truyện tranh)</option>
                <option value="light_novel">Light Novel (Chữ + Minh họa)</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-zinc-300">Trạng thái</label>
              <select
                name="status"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:ring-emerald-500"
              >
                <option value="draft">Bản nháp (Draft)</option>
                <option value="ongoing">Đang tiến hành (Ongoing)</option>
                <option value="completed">Hoàn thành (Completed)</option>
                <option value="hiatus">Tạm ngưng (Hiatus)</option>
              </select>
            </div>
          </div>

          {/* Genre Checkboxes Selection */}
          <div className="flex flex-col gap-2 pt-1">
            <label className="text-sm font-medium text-zinc-300">
              Thể loại truyện (Có thể chọn nhiều thể loại)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 p-3 rounded-xl border border-zinc-800 bg-zinc-950/60 max-h-48 overflow-y-auto">
              {genres.map((genre) => (
                <label
                  key={genre.id}
                  className="flex items-center gap-2 p-2 rounded-lg bg-zinc-900/60 border border-zinc-800/80 hover:border-emerald-500/50 cursor-pointer text-xs transition-colors"
                >
                  <input
                    type="checkbox"
                    name="genres"
                    value={genre.id}
                    className="w-4 h-4 rounded bg-zinc-950 border-zinc-700 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-zinc-200 font-medium line-clamp-1">{genre.name_vi}</span>
                </label>
              ))}
            </div>
          </div>

          <Textarea
            label="Tóm tắt (Synopsis)"
            name="synopsis"
            placeholder="Mô tả ngắn gọn về nội dung truyện..."
            rows={4}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-zinc-300">Ảnh bìa (Cover Image)</label>
            <input
              type="file"
              name="cover"
              accept="image/*"
              className="text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-zinc-800 file:text-zinc-200 hover:file:bg-zinc-700 cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="is_featured"
              name="is_featured"
              className="w-4 h-4 rounded bg-zinc-900 border-zinc-700 text-emerald-600 focus:ring-emerald-500"
            />
            <label htmlFor="is_featured" className="text-sm text-zinc-300 font-medium cursor-pointer">
              Ghim làm Truyện Nổi Bật (Featured)
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
            <Button type="button" variant="ghost" onClick={() => window.history.back()}>
              Hủy
            </Button>
            <Button type="submit" variant="primary" isLoading={isPending} className="font-bold">
              Tạo truyện mới
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
