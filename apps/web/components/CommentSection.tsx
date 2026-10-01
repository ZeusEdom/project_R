'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { Button, Textarea, Card, CardHeader, CardTitle, CardContent, IconMessage } from '@repo/ui';
import { addCommentAction, editCommentAction, deleteUserCommentAction } from '@/app/[locale]/story/[slug]/actions';

interface CommentItem {
  id: string;
  userId?: string;
  content: string;
  createdAt: string;
  userDisplayName: string;
  userAvatarUrl?: string;
  chapterNumber?: number | null;
}

interface CommentSectionProps {
  storyId: string;
  chapterId?: string;
  locale: string;
  isLoggedIn: boolean;
  currentUserId?: string;
  currentUserAvatarUrl?: string;
  initialComments: CommentItem[];
}

export function CommentSection({
  storyId,
  chapterId,
  locale,
  isLoggedIn,
  currentUserId,
  currentUserAvatarUrl,
  initialComments,
}: CommentSectionProps) {
  const [comments, setComments] = useState<CommentItem[]>(initialComments);
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setError(null);
    startTransition(async () => {
      const res = await addCommentAction({
        storyId,
        chapterId,
        content,
      });

      if (res.error) {
        setError(res.error);
      } else if (res.success) {
        const newComment: CommentItem = {
          id: Date.now().toString(),
          userId: currentUserId,
          content: content.trim(),
          createdAt: new Date().toISOString(),
          userDisplayName: locale === 'en' ? 'You' : 'Bạn',
          userAvatarUrl: currentUserAvatarUrl,
        };
        setComments([newComment, ...comments]);
        setContent('');
      }
    });
  };

  const handleStartEdit = (item: CommentItem) => {
    setEditingId(item.id);
    setEditingContent(item.content);
  };

  const handleSaveEdit = (commentId: string) => {
    if (!editingContent.trim()) return;
    setError(null);
    startTransition(async () => {
      const res = await editCommentAction({
        commentId,
        content: editingContent,
      });

      if (res.error) {
        setError(res.error);
      } else if (res.success) {
        setComments(
          comments.map((c) =>
            c.id === commentId ? { ...c, content: editingContent.trim() } : c
          )
        );
        setEditingId(null);
      }
    });
  };

  const handleDelete = (commentId: string) => {
    if (!confirm(locale === 'en' ? 'Delete this comment?' : 'Bạn có chắc chắn muốn xóa bình luận này?')) {
      return;
    }

    setError(null);
    startTransition(async () => {
      const res = await deleteUserCommentAction(commentId);
      if (res.error) {
        setError(res.error);
      } else if (res.success) {
        setComments(comments.filter((c) => c.id !== commentId));
      }
    });
  };

  return (
    <Card className="border-zinc-800 bg-zinc-900/90 shadow-2xl">
      <CardHeader className="border-b border-zinc-800/80 pb-4">
        <CardTitle className="text-xl font-bold text-zinc-100 flex items-center gap-2">
          <IconMessage className="text-emerald-400" size={20} />
          <span>{locale === 'en' ? 'Reader Comments' : 'Bình Luận Độc Giả'} ({comments.length})</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-6 space-y-6">
        {/* Comment Form */}
        {isLoggedIn ? (
          <form onSubmit={handleSubmit} className="space-y-3">
            {error && (
              <div className="p-3 rounded-xl bg-red-950/80 border border-red-800 text-xs font-semibold text-red-300">
                {error}
              </div>
            )}
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={
                locale === 'en'
                  ? 'Share your thoughts about this story or chapter...'
                  : 'Viết bình luận hoặc cảm nhận của bạn về bộ truyện này...'
              }
              rows={3}
              required
            />
            <div className="flex justify-end">
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isPending}
                className="font-bold px-6 shadow-lg shadow-emerald-950"
              >
                {locale === 'en' ? 'Post Comment' : 'Gửi Bình Luận'}
              </Button>
            </div>
          </form>
        ) : (
          <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 text-center space-y-2">
            <p className="text-xs text-zinc-400 font-semibold">
              {locale === 'en'
                ? 'Please log in to participate in discussion'
                : 'Vui lòng đăng nhập để tham gia bình luận với cộng đồng độc giả'}
            </p>
            <Link
              href={`/${locale}/login`}
              className="inline-block px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-colors"
            >
              {locale === 'en' ? 'Log In to Comment' : 'Đăng Nhập Để Bình Luận'}
            </Link>
          </div>
        )}

        {/* Comments List */}
        {comments.length === 0 ? (
          <div className="py-8 text-center text-xs text-zinc-500 italic">
            {locale === 'en' ? 'No comments yet. Be the first to share!' : 'Chưa có bình luận nào. Hãy là người đầu tiên để lại ý kiến!'}
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            {comments.map((item) => {
              const isOwner = currentUserId && item.userId === currentUserId;
              const isEditing = editingId === item.id;

              return (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-zinc-950/50 border border-zinc-800/60 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs border-b border-zinc-800/60 pb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full overflow-hidden border border-emerald-500/40 shrink-0 bg-zinc-900 flex items-center justify-center">
                        {item.userAvatarUrl ? (
                          <img src={item.userAvatarUrl} alt={item.userDisplayName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-emerald-950 flex items-center justify-center font-bold text-emerald-400 text-[10px]">
                            {item.userDisplayName[0].toUpperCase()}
                          </div>
                        )}
                      </div>
                      <span className="font-bold text-zinc-200">{item.userDisplayName}</span>
                      {item.chapterNumber && (
                        <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-emerald-400 font-mono text-[10px]">
                          Chương {item.chapterNumber}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-zinc-500 font-mono text-[10px]">
                        {new Date(item.createdAt).toLocaleDateString(locale)}
                      </span>

                      {/* Owner Actions */}
                      {isOwner && !isEditing && (
                        <div className="flex items-center gap-1.5 border-l border-zinc-800 pl-2">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(item)}
                            className="text-[11px] text-zinc-400 hover:text-emerald-400 transition-colors font-semibold"
                          >
                            {locale === 'en' ? 'Edit' : 'Sửa'}
                          </button>
                          <span className="text-zinc-700">•</span>
                          <button
                            type="button"
                            onClick={() => handleDelete(item.id)}
                            className="text-[11px] text-zinc-400 hover:text-red-400 transition-colors font-semibold"
                          >
                            {locale === 'en' ? 'Delete' : 'Xóa'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {isEditing ? (
                    <div className="space-y-2 pt-2">
                      <Textarea
                        value={editingContent}
                        onChange={(e) => setEditingContent(e.target.value)}
                        rows={2}
                      />
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingId(null)}
                        >
                          {locale === 'en' ? 'Cancel' : 'Hủy'}
                        </Button>
                        <Button
                          type="button"
                          variant="primary"
                          size="sm"
                          isLoading={isPending}
                          onClick={() => handleSaveEdit(item.id)}
                        >
                          {locale === 'en' ? 'Save' : 'Lưu'}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-300 leading-relaxed font-mono whitespace-pre-wrap pt-1">
                      {item.content}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
