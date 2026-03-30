'use client';

import Navbar from './Navbar';
import Footer from './Footer';
import { usePathname } from 'next/navigation';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isGamePage = pathname === '/game';

  return (
    <>
      <Navbar />
      <main className="min-h-[calc(100vh-80px)]">{children}</main>
      {!isGamePage && <Footer />}
    </>
  );
}
