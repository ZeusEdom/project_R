'use client';

import { useState, useTransition, use } from 'react';
import { Button, Input, Textarea, Card, CardContent, IconImage, IconFileText, IconUpload, IconX } from '@repo/ui';
import { createChapterAction } from '../actions';

export default function NewChapterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: storyId } = use(params);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<'draft' | 'published' | 'scheduled'>('draft');
  const [contentType, setContentType] = useState<'images' | 'text'>('images');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      const filesArr = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...filesArr]);

      const newPreviews = filesArr.map((file) => URL.createObjectURL(file));
      setPreviews((prev) => [...prev, ...newPreviews]);
    }
  }

  function removeFile(index: number) {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    
    if (contentType === 'images') {
      formData.delete('chapter_images');
      selectedFiles.forEach((file) => {
        formData.append('chapter_images', file);
      });
    }

    startTransition(async () => {
      const res = await createChapterAction(storyId, formData);
      if (res?.error) {
        setError(res.error);
      }
    });
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100">Viết / Đăng chương mới</h1>
        <p className="text-sm text-zinc-400 mt-1">Hỗ trợ cả Manga / Truyện tranh (Tải danh sách trang ảnh) & Tiểu thuyết (Văn bản)</p>
      </div>

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
                label="Số chương (VD: 1, 2, 3)"
                name="chapter_number"
                type="number"
                min="1"
                placeholder="VD: 1"
                required
              />
              <div className="sm:col-span-2">
                <Input
                  label="Tiêu đề chương"
                  name="title"
                  placeholder="VD: Chương 1: Cuộc chạm trán bất ngờ"
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
                  <span>Manga / Comic (Tải nhiều trang ảnh)</span>
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
                  <span>Truyện chữ / Tiểu thuyết (Văn bản)</span>
                </button>
              </div>
            </div>

            {/* Content inputs based on type */}
            {contentType === 'images' ? (
              <div className="space-y-4">
                <label className="text-sm font-medium text-zinc-300 font-mono">
                  Tải lên danh sách các trang ảnh Manga ({selectedFiles.length} trang đã chọn)
                </label>
                <div className="border-2 border-dashed border-zinc-700 hover:border-emerald-500 rounded-2xl p-8 text-center bg-zinc-950/50 transition-colors relative cursor-pointer group">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="space-y-2 pointer-events-none">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center shadow-md">
                      <IconUpload size={22} />
                    </div>
                    <p className="text-sm font-bold text-zinc-200 group-hover:text-emerald-400 transition-colors">
                      Kéo & thả hoặc bấm vào đây để chọn nhiều ảnh trang truyện
                    </p>
                    <p className="text-xs text-zinc-500 font-mono">
                      Hỗ trợ định dạng JPG, PNG, WEBP. Chọn nhiều ảnh cùng lúc theo thứ tự trang 1, 2, 3...
                    </p>
                  </div>
                </div>

                {/* Image Previews Grid */}
                {previews.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 pt-2">
                    {previews.map((src, index) => (
                      <div key={index} className="relative group rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950 aspect-[3/4]">
                        <img src={src} alt={`Trang ${index + 1}`} className="w-full h-full object-cover" />
                        <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded bg-black/80 backdrop-blur-md text-[10px] font-bold text-emerald-400 font-mono">
                          Trang {index + 1}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
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
                placeholder="Nhập hoặc dán nội dung văn bản của chương ở đây..."
                rows={14}
              />
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
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
                  required
                />
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
              <Button type="button" variant="ghost" onClick={() => window.history.back()}>
                Hủy
              </Button>
              <Button type="submit" variant="primary" isLoading={isPending} className="px-6 font-bold">
                Đăng tải chương truyện
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
