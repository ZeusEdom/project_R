'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { IconBell } from '@repo/ui';

interface NotificationItem {
  id: string;
  title: string;
  body?: string | null;
  sentAt: string;
  storySlug?: string | null;
  storyTitle?: string | null;
}

interface NotificationBellProps {
  notifications: NotificationItem[];
  locale: string;
}

export function NotificationBell({ notifications, locale }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [readIds, setReadIds] = useState<string[]>([]);
  const [deletedIds, setDeletedIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const storedRead = localStorage.getItem('read_notification_ids');
      if (storedRead) setReadIds(JSON.parse(storedRead));

      const storedDeleted = localStorage.getItem('deleted_notification_ids');
      if (storedDeleted) setDeletedIds(JSON.parse(storedDeleted));
    } catch {
      // ignore
    }
  }, []);

  const activeNotifications = notifications.filter((n) => !deletedIds.includes(n.id));
  const unreadCount = activeNotifications.filter((n) => !readIds.includes(n.id)).length;

  const markAllAsRead = () => {
    const allIds = activeNotifications.map((n) => n.id);
    setReadIds(allIds);
    try {
      localStorage.setItem('read_notification_ids', JSON.stringify(allIds));
    } catch {
      // ignore
    }
  };

  const deleteAllNotifications = () => {
    const allIds = notifications.map((n) => n.id);
    setDeletedIds(allIds);
    try {
      localStorage.setItem('deleted_notification_ids', JSON.stringify(allIds));
    } catch {
      // ignore
    }
  };

  const deleteSingleNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = [...deletedIds, id];
    setDeletedIds(updated);
    try {
      localStorage.setItem('deleted_notification_ids', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const markAsRead = (id: string) => {
    if (!readIds.includes(id)) {
      const updated = [...readIds, id];
      setReadIds(updated);
      try {
        localStorage.setItem('read_notification_ids', JSON.stringify(updated));
      } catch {
        // ignore
      }
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer"
        title={locale === 'en' ? 'Notifications' : 'Thông báo'}
      >
        <IconBell size={18} className="text-emerald-400" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-600 text-white font-bold font-mono text-[9px] flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-4 py-2.5 border-b border-zinc-800 flex items-center justify-between">
            <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-wider flex items-center gap-2 font-mono">
              <IconBell size={14} className="text-emerald-400" />
              {locale === 'en' ? 'Notifications' : 'Thông Báo'} ({activeNotifications.length})
            </h3>
            <div className="flex items-center gap-2 text-[11px]">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="font-semibold text-emerald-400 hover:underline cursor-pointer"
                >
                  {locale === 'en' ? 'Mark read' : 'Đã đọc'}
                </button>
              )}
              {activeNotifications.length > 0 && (
                <button
                  type="button"
                  onClick={deleteAllNotifications}
                  className="font-semibold text-red-400 hover:underline cursor-pointer"
                >
                  {locale === 'en' ? 'Clear all' : 'Xóa tất cả'}
                </button>
              )}
            </div>
          </div>

          {/* List */}
          {activeNotifications.length === 0 ? (
            <div className="py-8 text-center text-xs text-zinc-500 italic">
              {locale === 'en' ? 'No notifications' : 'Chưa có thông báo nào'}
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto divide-y divide-zinc-800/60">
              {activeNotifications.map((item) => {
                const isRead = readIds.includes(item.id);

                return (
                  <div
                    key={item.id}
                    onClick={() => markAsRead(item.id)}
                    className={`p-3.5 space-y-1 transition-colors relative group ${
                      isRead ? 'opacity-60 bg-zinc-950/40' : 'bg-emerald-950/20'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 pr-6">
                      <h4 className="text-xs font-bold text-zinc-200 leading-snug">
                        {!isRead && <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 mr-1.5" />}
                        {item.title}
                      </h4>
                      <span className="text-[10px] font-mono text-zinc-500 shrink-0">
                        {new Date(item.sentAt).toLocaleDateString(locale)}
                      </span>
                    </div>

                    {item.body && (
                      <p className="text-[11px] text-zinc-400 leading-relaxed pr-6">{item.body}</p>
                    )}

                    {item.storySlug && (
                      <div className="pt-1">
                        <Link
                          href={`/${locale}/story/${item.storySlug}`}
                          onClick={() => {
                            markAsRead(item.id);
                            setIsOpen(false);
                          }}
                          className="text-[11px] font-bold text-emerald-400 hover:underline inline-flex items-center gap-1"
                        >
                          → {locale === 'en' ? 'View Story' : 'Xem Truyện'}: {item.storyTitle || item.storySlug}
                        </Link>
                      </div>
                    )}

                    {/* Delete Single Notification Button */}
                    <button
                      type="button"
                      onClick={(e) => deleteSingleNotification(item.id, e)}
                      title={locale === 'en' ? 'Delete' : 'Xóa thông báo này'}
                      className="absolute top-3 right-3 p-1 rounded text-zinc-500 hover:text-red-400 hover:bg-zinc-800 opacity-0 group-hover:opacity-100 transition-all cursor-pointer text-[11px] font-bold"
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
