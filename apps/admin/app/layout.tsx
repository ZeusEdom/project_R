import type { ReactNode } from 'react';
import './globals.css';

export const metadata = {
  title: 'Admin - Quản lý truyện',
  description: 'Bảng điều khiển quản lý nội dung truyện',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="vi" className="dark">
      <body className="min-h-dvh bg-zinc-950 text-zinc-100 antialiased">
        {children}
      </body>
    </html>
  );
}
