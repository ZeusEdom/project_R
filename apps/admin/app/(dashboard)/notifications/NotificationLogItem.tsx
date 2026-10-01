'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent, Badge, Button, Input, Textarea } from '@repo/ui';
import { deleteNotificationAction, editNotificationAction } from './actions';

interface NotificationLogItemProps {
  log: {
    id: string;
    title: string;
    body: string | null;
    status: string;
    sent_at: string;
  };
}

export function NotificationLogItem({ log }: NotificationLogItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(log.title);
  const [editBody, setEditBody] = useState(log.body || '');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSave = () => {
    if (!editTitle.trim()) {
      setError('Tiêu đề không được để trống');
      return;
    }

    setError(null);
    startTransition(async () => {
      const res = await editNotificationAction(log.id, editTitle, editBody);
      if (res?.error) {
        setError(res.error);
      } else {
        setIsEditing(false);
      }
    });
  };

  const handleDelete = () => {
    if (!confirm(`Bạn có chắc muốn XÓA thông báo "${log.title}"?`)) return;

    setError(null);
    startTransition(async () => {
      const res = await deleteNotificationAction(log.id);
      if (res?.error) {
        setError(res.error);
      }
    });
  };

  return (
    <Card className="border-zinc-800 bg-zinc-900/60 hover:border-zinc-700 transition-all">
      <CardContent className="p-4 space-y-3">
        {error && (
          <div className="p-2 rounded-lg bg-red-950/80 border border-red-800 text-xs font-semibold text-red-300">
            {error}
          </div>
        )}

        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
          <Badge variant={log.status === 'sent' ? 'success' : 'default'}>
            {log.status}
          </Badge>
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono text-zinc-500">
              {new Date(log.sent_at).toLocaleString('vi-VN')}
            </span>
            <div className="flex items-center gap-1.5 border-l border-zinc-800 pl-2">
              {!isEditing && (
                <>
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="text-xs font-semibold text-zinc-400 hover:text-emerald-400 transition-colors"
                  >
                    Sửa
                  </button>
                  <span className="text-zinc-700">•</span>
                </>
              )}
              <button
                type="button"
                onClick={handleDelete}
                className="text-xs font-semibold text-zinc-400 hover:text-red-400 transition-colors"
                disabled={isPending}
              >
                Xóa
              </button>
            </div>
          </div>
        </div>

        {isEditing ? (
          <div className="space-y-3 pt-1">
            <Input
              label="Tiêu đề"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              required
            />
            <Textarea
              label="Nội dung"
              value={editBody}
              onChange={(e) => setEditBody(e.target.value)}
              rows={2}
            />
            <div className="flex justify-end gap-2 pt-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(false)}
              >
                Hủy
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                isLoading={isPending}
                onClick={handleSave}
              >
                Lưu Thay Đổi
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            <h3 className="font-bold text-zinc-100 text-sm">{log.title}</h3>
            {log.body && (
              <p className="text-xs text-zinc-300 leading-relaxed font-mono whitespace-pre-wrap bg-zinc-950/40 p-2.5 rounded-lg border border-zinc-800/60">
                {log.body}
              </p>
            )}
            <p className="text-[10px] font-mono text-zinc-500 pt-1">ID: {log.id}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
