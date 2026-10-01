'use client';

import { logoutAction } from '../login/actions';
import { Button, IconLogOut } from '@repo/ui';

interface HeaderProps {
  userEmail?: string;
}

export function Header({ userEmail }: HeaderProps) {
  return (
    <header className="h-16 border-b border-zinc-800/80 bg-zinc-950/70 px-6 flex items-center justify-between sticky top-0 z-30 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-xs text-zinc-400">
          Tài khoản: <strong className="text-zinc-200 font-semibold">{userEmail || 'Admin'}</strong>
        </span>
      </div>

      <form action={logoutAction}>
        <Button
          variant="ghost"
          size="sm"
          type="submit"
          className="text-zinc-400 hover:text-red-400 hover:bg-red-950/30 border border-transparent hover:border-red-900/40 text-xs flex items-center gap-2 px-3 py-1.5 rounded-lg"
        >
          <IconLogOut size={15} />
          <span>Đăng xuất</span>
        </Button>
      </form>
    </header>
  );
}
