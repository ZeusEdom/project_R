'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Card, CardHeader, CardTitle, CardContent, Badge } from '@repo/ui';
import { adminUpdatePasswordAction, adminBanUserTimedAction, adminDeleteUserAction } from './actions';

interface UserDetailClientProps {
  currentUserId: string;
  targetUserId: string;
  targetEmail: string;
  targetDisplayName: string;
  isAdmin: boolean;
  isBanned: boolean;
  bannedUntil: string | null;
}

export function UserDetailClient({
  currentUserId,
  targetUserId,
  targetEmail,
  targetDisplayName,
  isAdmin,
  isBanned,
  bannedUntil,
}: UserDetailClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; message: string } | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [selectedBanHours, setSelectedBanHours] = useState<string>('24');

  const isSelf = currentUserId === targetUserId;

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setFeedback({ type: 'error', message: 'Mật khẩu phải từ 6 ký tự trở lên' });
      return;
    }

    setFeedback(null);
    startTransition(async () => {
      const res = await adminUpdatePasswordAction(targetUserId, newPassword);
      if (res.error) {
        setFeedback({ type: 'error', message: res.error });
      } else {
        setFeedback({ type: 'success', message: res.message || 'Đã cập nhật mật khẩu!' });
        setNewPassword('');
      }
    });
  };

  const handleBanTimed = (hours: number | null) => {
    if (isSelf) {
      setFeedback({ type: 'error', message: 'Không thể khóa tài khoản của chính mình' });
      return;
    }

    const text = hours === 0 ? 'mở khóa' : hours === null ? 'khóa vĩnh viễn' : `khóa trong ${hours} giờ`;
    if (!confirm(`Bạn có chắc muốn ${text} tài khoản "${targetDisplayName}"?`)) return;

    setFeedback(null);
    startTransition(async () => {
      const res = await adminBanUserTimedAction(targetUserId, hours);
      if (res.error) {
        setFeedback({ type: 'error', message: res.error });
      } else {
        setFeedback({ type: 'success', message: res.message || 'Thao tác thành công!' });
      }
    });
  };

  const handleDeleteUser = () => {
    if (isSelf) {
      setFeedback({ type: 'error', message: 'Không thể xóa tài khoản của chính mình' });
      return;
    }

    if (!confirm(`HÀNH ĐỘNG NGUY HIỂM: Bạn có chắc chắn muốn XÓA VĨNH VIỄN tài khoản "${targetDisplayName}" (${targetEmail})?`)) {
      return;
    }

    setFeedback(null);
    startTransition(async () => {
      const res = await adminDeleteUserAction(targetUserId);
      if (res.error) {
        setFeedback({ type: 'error', message: res.error });
      } else {
        router.push('/users');
      }
    });
  };

  return (
    <div className="space-y-6">
      {feedback && (
        <div
          className={`p-4 rounded-xl text-xs font-bold border shadow-md ${
            feedback.type === 'error'
              ? 'bg-red-950/90 border-red-800 text-red-300'
              : 'bg-emerald-950/90 border-emerald-800 text-emerald-300'
          }`}
        >
          {feedback.message}
        </div>
      )}

      {/* Direct Password Reset Card */}
      <Card className="border-zinc-800 bg-zinc-900/90 shadow-xl">
        <CardHeader className="border-b border-zinc-800/80 pb-3">
          <CardTitle className="text-base font-bold text-zinc-100">
            Đặt Lại Mật Khẩu Trực Tiếp (Admin Reset)
          </CardTitle>
          <p className="text-xs text-zinc-400">
            Gán trực tiếp mật khẩu mới cho tài khoản độc giả này mà không cần qua email
          </p>
        </CardHeader>
        <CardContent className="pt-4">
          <form onSubmit={handleUpdatePassword} className="flex flex-col sm:flex-row items-end gap-3">
            <div className="flex-1 w-full">
              <Input
                label="Mật khẩu mới"
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isPending}
              className="font-bold shrink-0"
            >
              Cập Nhật Mật Khẩu
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Ban & Account Control Card */}
      <Card className="border-zinc-800 bg-zinc-900/90 shadow-xl">
        <CardHeader className="border-b border-zinc-800/80 pb-3">
          <CardTitle className="text-base font-bold text-zinc-100">
            Khóa Tài Khoản Theo Thời Gian & Quản Lý
          </CardTitle>
          <p className="text-xs text-zinc-400">
            Khóa tài khoản theo giờ, ngày hoặc xóa vĩnh viễn khỏi hệ thống
          </p>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          {isBanned ? (
            <div className="flex items-center justify-between p-3 rounded-xl bg-red-950/40 border border-red-900/60">
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-red-400">Trạng thái: Đang bị khóa</p>
                {bannedUntil && (
                  <p className="text-[11px] font-mono text-zinc-400">
                    Thời hạn mở khóa: {new Date(bannedUntil).toLocaleString('vi-VN')}
                  </p>
                )}
              </div>
              <Button
                type="button"
                variant="primary"
                size="sm"
                isLoading={isPending}
                onClick={() => handleBanTimed(0)}
                disabled={isSelf}
              >
                Mở Khóa Ngay
              </Button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <select
                value={selectedBanHours}
                onChange={(e) => setSelectedBanHours(e.target.value)}
                className="w-full sm:w-auto rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs font-semibold text-zinc-200"
                disabled={isSelf}
              >
                <option value="1">Khóa 1 giờ</option>
                <option value="24">Khóa 24 giờ (1 ngày)</option>
                <option value="168">Khóa 7 ngày</option>
                <option value="720">Khóa 30 ngày</option>
                <option value="perm">Khóa vĩnh viễn</option>
              </select>

              <Button
                type="button"
                variant="danger"
                size="md"
                isLoading={isPending}
                disabled={isSelf}
                onClick={() => {
                  const hrs = selectedBanHours === 'perm' ? null : parseInt(selectedBanHours, 10);
                  handleBanTimed(hrs);
                }}
                className="font-bold w-full sm:w-auto"
              >
                Áp Dụng Khóa
              </Button>
            </div>
          )}

          <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-red-400">Xóa vĩnh viễn tài khoản</p>
              <p className="text-[11px] text-zinc-500">
                Xóa sạch dữ liệu profile, bình luận và tài khoản Auth
              </p>
            </div>
            <Button
              type="button"
              variant="danger"
              size="sm"
              isLoading={isPending}
              disabled={isSelf}
              onClick={handleDeleteUser}
              className="font-bold"
            >
              Xóa Tài Khoản
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
