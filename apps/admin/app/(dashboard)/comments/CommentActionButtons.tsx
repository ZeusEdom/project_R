'use client';

import { useState, useTransition } from 'react';
import { Button } from '@repo/ui';
import { approveCommentAction, rejectCommentAction, deleteCommentAction } from './actions';

interface CommentActionButtonsProps {
  commentId: string;
  status: string;
}

export function CommentActionButtons({ commentId, status }: CommentActionButtonsProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleApprove = () => {
    setError(null);
    startTransition(async () => {
      const res = await approveCommentAction(commentId);
      if (res?.error) setError(res.error);
    });
  };

  const handleReject = () => {
    setError(null);
    startTransition(async () => {
      const res = await rejectCommentAction(commentId);
      if (res?.error) setError(res.error);
    });
  };

  const handleDelete = () => {
    if (!confirm('Bạn có chắc muốn XÓA bình luận này?')) return;
    setError(null);
    startTransition(async () => {
      const res = await deleteCommentAction(commentId);
      if (res?.error) setError(res.error);
    });
  };

  return (
    <div className="flex flex-col items-end gap-1">
      {error && <span className="text-[10px] text-red-400 font-semibold">{error}</span>}
      <div className="flex items-center gap-2">
        {status !== 'approved' && (
          <Button
            type="button"
            variant="primary"
            size="sm"
            className="text-xs"
            isLoading={isPending}
            onClick={handleApprove}
          >
            Duyệt bình luận
          </Button>
        )}

        {status !== 'rejected' && (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="text-xs"
            isLoading={isPending}
            onClick={handleReject}
          >
            Từ chối
          </Button>
        )}

        <Button
          type="button"
          variant="danger"
          size="sm"
          className="text-xs"
          isLoading={isPending}
          onClick={handleDelete}
        >
          Xóa
        </Button>
      </div>
    </div>
  );
}
