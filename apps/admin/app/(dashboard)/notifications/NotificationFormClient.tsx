'use client';

import { useState, useTransition } from 'react';
import { Button, Input, Textarea, Card, CardHeader, CardTitle, CardContent, IconBell } from '@repo/ui';
import { sendNotificationBroadcastAction } from './actions';

interface StoryOption {
  id: string;
  title: string;
}

export function NotificationFormClient({ stories }: { stories: StoryOption[] }) {
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; message: string } | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFeedback(null);
    const formData = new FormData(e.currentTarget);
    const formElement = e.currentTarget;

    startTransition(async () => {
      const res = await sendNotificationBroadcastAction(formData);
      if (res?.error) {
        setFeedback({ type: 'error', message: res.error });
      } else if (res?.success) {
        setFeedback({ type: 'success', message: res.message || 'Đã gửi thông báo thành công!' });
        formElement.reset();
      }
    });
  };

  return (
    <Card className="border-zinc-800 bg-zinc-900/80 sticky top-20">
      <CardHeader>
        <CardTitle className="text-base text-emerald-400 flex items-center gap-2">
          <IconBell size={18} />
          Tạo Thông Báo Mới
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {feedback && (
          <div
            className={`p-3 rounded-xl text-xs font-bold border ${
              feedback.type === 'error'
                ? 'bg-red-950/80 border-red-800 text-red-300'
                : 'bg-emerald-950/80 border-emerald-800 text-emerald-300'
            }`}
          >
            {feedback.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Tiêu đề thông báo"
            name="title"
            placeholder="Ví dụ: Chương mới vừa ra mắt!"
            required
          />

          <Textarea
            label="Nội dung chi tiết"
            name="body"
            placeholder="Nhập nội dung ngắn gọn phát tới thiết bị của độc giả..."
            rows={3}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-zinc-300">
              Truyện liên quan (Không bắt buộc)
            </label>
            <select
              name="story_id"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">-- Tất cả độc giả (Broadcast chung) --</option>
              {stories.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </select>
          </div>

          <Button
            type="submit"
            variant="primary"
            isLoading={isPending}
            className="w-full mt-2 font-bold py-2.5"
          >
            Gửi Thông Báo Tới Độc Giả
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
