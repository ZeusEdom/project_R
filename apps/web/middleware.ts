import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from '@repo/i18n';

export default createMiddleware({
  locales,
  defaultLocale,
  localeDetection: true,
  localePrefix: 'always',
});

export const config = {
  matcher: ['/', '/(vi|en)/:path*'],
};
