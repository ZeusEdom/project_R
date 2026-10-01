import type { Database } from './database';

type Tables = Database['public']['Tables'];

export type Profile = Tables['profiles']['Row'];
export type ProfileUpdate = Tables['profiles']['Update'];

export type Bookmark = Tables['bookmarks']['Row'];
export type ReadingProgress = Tables['reading_progress']['Row'];

export type Comment = Tables['comments']['Row'];
export type CommentInsert = Tables['comments']['Insert'];
export type CommentStatus = Database['public']['Enums']['comment_status'];

export type NotificationSubscription = Tables['notification_subscriptions']['Row'];
export type NotificationLog = Tables['notification_log']['Row'];
