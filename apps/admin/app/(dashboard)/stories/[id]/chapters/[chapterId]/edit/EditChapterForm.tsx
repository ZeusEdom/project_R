'use client';

import { useState, useTransition } from 'react';
import { Button, Input, Textarea, Card, CardContent, IconImage, IconFileText, IconUpload, IconX, IconTrash } from '@repo/ui';
import { updateChapterAction, deleteChapterAction } from '../../actions';

interface EditChapterFormProps {
  storyId: string;
  chapter: {
    id: string;
    chapter_number: number;
    title: string;
    content_text: string | null;
    content_images?: string[] | null;
    status: 'draft' | 'published' | 'scheduled';
    scheduled_at?: string | null;
  };
}

export function EditChapterForm({ storyId, chapter }: EditChapterFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<'draft' | 'published' | 'scheduled'>(chapter.status);
  const [contentType, setContentType] = useState<'images' | 'text'>(
    chapter.content_images && chapter.content_images.length > 0 ? 'images' : 'text'
  );
  
  const [existingImages, setExistingImages] = useState<string[]>(chapter.content_images || []);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      const filesArr = Array.from(e.target.files);
      setNewFiles((prev) => [...prev, ...filesArr]);

      const previewsArr = filesArr.map((file) => URL.createObjectURL(file));
      setNewPreviews((prev) => [...prev, ...previewsArr]);
    }
  }

  function removeExistingImage(index: number) {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  }

  function removeNewFile(index: number) {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
    setNewPreviews((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    
    if (contentType === 'images') {
      formData.set('existing_images', JSON.stringify(existingImages));
      formData.delete('chapter_images');
      newFiles.forEach((file) => {
        formData.append('chapter_images', file);
      });
    }

    startTransition(async () => {
      const res = await updateChapterAction(chapter.id, storyId, formData);
      if (res?.error) {
        setError(res.error);
      }
    });
  }

  async function handleDelete() {
    if (!confirm(`Bạn có chắc chắn muốn xóa Chương ${chapter.chapter_number}: "${chapter.title}"?`)) {
      return;
    }

    startTransition(async () => {
      const res = await deleteChapterAction(chapter.id, storyId);
      if (res?.error) {
        setError(res.error);
      }
    });
  }

  return (
    <Card className="bg-zinc-900/90 border-zinc-800">
      <CardContent className="pt-6">
        {error && (
          <div className="mb-4 rounded-lg bg-red-950/80 border border-red-800 p-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Số chương"
              name="chapter_number"
              type="number"
              min="1"
              defaultValue={chapter.chapter_number}
              required
            />
            <div className="sm:col-span-2">
              <Input
                label="Tiêu đề chương"
                name="title"
                defaultValue={chapter.title}
                placeholder="VD: Chương 1: Mở đầu"
                required
              />
            </div>
          </div>

          {/* Type selector tabs */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300 font-mono">Loại nội dung chương</label>
            <div className="flex rounded-xl bg-zinc-950 p-1 border border-zinc-800">
              <button
                type="button"
                onClick={() => setContentType('images')}
                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                  contentType === 'images'
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950 font-bold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <IconImage size={18} />
                <span>Manga / Comic ({existingImages.length + newFiles.length} trang ảnh)</span>
              </button>
              <button
                type="button"
                onClick={() => setContentType('text')}
                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                  contentType === 'text'
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950 font-bold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <IconFileText size={18} />
                <span>Truyện chữ / Văn bản</span>
              </button>
            </div>
          </div>

          {contentType === 'images' ? (
            <div className="space-y-4">
              <label className="text-sm font-medium text-zinc-300 font-mono">
                Các trang ảnh Manga ({existingImages.length} trang hiện tại + {newFiles.length} trang mới)
              </label>

              {/* Upload new images box */}
              <div className="border-2 border-dashed border-zinc-700 hover:border-emerald-500 rounded-2xl p-6 text-center bg-zinc-950/50 transition-colors relative cursor-pointer group">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="space-y-1.5 pointer-events-none">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center">
                    <IconUpload size={20} />
                  </div>
                  <p className="text-sm font-bold text-zinc-200 group-hover:text-emerald-400 transition-colors">
                    Bấm hoặc kéo thả để tải thêm ảnh trang mới
                  </p>
                  <p className="text-xs text-zinc-500 font-mono">Hỗ trợ JPG, PNG, WEBP</p>
                </div>
              </div>

              {/* Previews grid */}
              {(existingImages.length > 0 || newPreviews.length > 0) && (
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 pt-2">
                  {existingImages.map((src, index) => (
                    <div key={`exist-${index}`} className="relative group rounded-xl overflow-hidden border border-zinc-700 bg-zinc-950 aspect-[3/4]">
                      <img src={src} alt={`Trang ${index + 1}`} className="w-full h-full object-cover" />
                      <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded bg-emerald-950/90 border border-emerald-700 text-[10px] font-bold text-emerald-400 font-mono">
                        Trang {index + 1}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeExistingImage(index)}
                        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-600/90 text-white flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Xóa trang này"
                      >
                        <IconX size={14} />
                      </button>
                    </div>
                  ))}

                  {newPreviews.map((src, index) => (
                    <div key={`new-${index}`} className="relative group rounded-xl overflow-hidden border border-emerald-500 bg-zinc-950 aspect-[3/4]">
                      <img src={src} alt={`Mới ${index + 1}`} className="w-full h-full object-cover" />
                      <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded bg-blue-950/90 border border-blue-700 text-[10px] font-bold text-blue-400 font-mono">
                        Mới {existingImages.length + index + 1}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeNewFile(index)}
                        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-600/90 text-white flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <IconX size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <Textarea
              label="Nội dung chương (Truyện chữ)"
              name="content_text"
              defaultValue={chapter.content_text || ''}
              placeholder="Nhập hoặc dán nội dung văn bản của chương ở đây..."
              rows={14}
            />
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-zinc-300">Trạng thái phát hành</label>
              <select
                name="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100"
              >
                <option value="draft">Lưu Bản nháp (Draft)</option>
                <option value="published">Xuất bản ngay (Publish now)</option>
                <option value="scheduled">Lên lịch đăng (Schedule)</option>
              </select>
            </div>

            {status === 'scheduled' && (
              <Input
                label="Ngày & giờ phát hành"
                name="scheduled_at"
                type="datetime-local"
                defaultValue={chapter.scheduled_at ? new Date(chapter.scheduled_at).toISOString().slice(0, 16) : ''}
                required
              />
            )}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
            <Button
              type="button"
              variant="danger"
              onClick={handleDelete}
              isLoading={isPending}
              className="flex items-center gap-1.5"
            >
              <IconTrash size={15} />
              <span>Xóa chương này</span>
            </Button>

            <div className="flex gap-3">
              <Button type="button" variant="ghost" onClick={() => window.history.back()}>
                Hủy
              </Button>
              <Button type="submit" variant="primary" isLoading={isPending} className="px-6 font-bold">
                Cập nhật chương
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
