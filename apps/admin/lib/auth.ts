import { createServerSupabase } from '@repo/supabase/server';

const OWNER_ADMIN_EMAIL = 'thedzorc@gmail.com';

export async function verifyAdmin() {
  const sessionSupabase = await createServerSupabase();
  const {
    data: { user },
  } = await sessionSupabase.auth.getUser();

  if (!user) return null;

  const isOwner = user.email?.toLowerCase() === OWNER_ADMIN_EMAIL;
  if (!isOwner) {
    const { data: profile } = await sessionSupabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (!(profile as any)?.is_admin) return null;
  }

  return user;
}
