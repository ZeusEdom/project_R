import type { Database } from './database';

export type Json = Database['public']['Tables']['site_settings']['Row']['value'];

export type SiteSetting = Database['public']['Tables']['site_settings']['Row'];

export type Locale = 'vi' | 'en' | 'fr' | 'ja';
export type TranslationLocale = 'en' | 'fr' | 'ja';

export type PaginatedResponse<T> = {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type ApiError = {
  message: string;
  code?: string;
  status?: number;
};
