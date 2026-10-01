import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@repo/supabase/middleware';

export async function middleware(request: NextRequest) {
  // Update Supabase auth session
  const response = await updateSession(request);

  // Allow login page without auth
  if (request.nextUrl.pathname === '/login') {
    return response;
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
