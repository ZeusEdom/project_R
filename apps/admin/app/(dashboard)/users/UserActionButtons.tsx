'use client';

import { useState, useTransition } from 'react';
import { Button } from '@repo/ui';
import { toggleAdminRoleAction, toggleBanUserAction } from './actions';

interface UserActionButtonsProps {
  currentUserId: string;
  targetUserId: string;
  targetUserName: string;
  isAdmin: boolean;
  isBanned: boolean;
}

export function UserActionButtons({
  currentUserId,
  targetUserId,
  targetUserName,
  isAdmin,
  isBanned,
}: UserActionButtonsProps) {
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; message: string } | null>(null);

  const isSelf = currentUserId === targetUserId;

  const handleToggleAdmin = () => {
    if (isSelf) {
      setFeedback({ type: 'error', message: 'Bạn không thể tự tước quyền Admin của chính mình.' });
      return;
    }

    const actionText = isAdmin ? 'tước quyền Admin' : 'cấp quyền Admin';
    if (!confirm(`Bạn có chắc chắn muốn ${actionText} cho tài khoản "${targetUserName}"?`)) {
      return;
    }

    setFeedback(null);
    startTransition(async () => {
      const res = await toggleAdminRoleAction(targetUserId, isAdmin);
      if (res?.error) {
        setFeedback({ type: 'error', message: res.error });
      } else if (res?.success) {
        setFeedback({
          type: 'success',
          message: isAdmin ? 'Đã hạ quyền Admin thành công!' : 'Đã nâng thành Admin thành công!',
        });
      }
    });
  };

  const handleToggleBan = () => {
    if (isSelf) {
      setFeedback({ type: 'error', message: 'Bạn không thể tự khóa tài khoản của chính mình.' });
      return;
    }

    const actionText = isBanned ? 'mở khóa' : 'khóa';
    if (!confirm(`Bạn có chắc chắn muốn ${actionText} tài khoản "${targetUserName}"?`)) {
      return;
    }

    setFeedback(null);
    startTransition(async () => {
      const res = await toggleBanUserAction(targetUserId, isBanned);
      if (res?.error) {
        setFeedback({ type: 'error', message: res.error });
      } else if (res?.success) {
        setFeedback({
          type: 'success',
          message: isBanned ? 'Đã mở khóa tài khoản thành công!' : 'Đã khóa tài khoản thành công!',
        });
      }
    });
  };

  if (isSelf) {
    return (
      <div className="flex flex-col items-end gap-1">
        <span className="px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-400 text-xs font-mono font-medium border border-zinc-700/60">
          Tài khoản của bạn (Hiện tại)
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      {feedback && (
        <div
          className={`text-[11px] font-medium px-2 py-0.5 rounded ${
            feedback.type === 'error'
              ? 'bg-red-950 text-red-300 border border-red-800'
              : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
          }`}
        >
          {feedback.message}
        </div>
      )}

      <div className="flex items-center justify-end gap-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="text-xs font-semibold"
          isLoading={isPending}
          onClick={handleToggleAdmin}
        >
          {isAdmin ? 'Hạ quyền Admin' : 'Thăng Admin'}
        </Button>

        <Button
          type="button"
          variant={isBanned ? 'primary' : 'danger'}
          size="sm"
          className="text-xs font-semibold"
          isLoading={isPending}
          onClick={handleToggleBan}
        >
          {isBanned ? 'Mở khóa' : 'Khóa tài khoản'}
        </Button>
      </div>
    </div>
  );
}
