import type { Metadata } from 'next';
import './globals.css';
import LayoutWrapper from '@/components/layout/LayoutWrapper';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'Code Battle - 1v1 Coding Arena',
  description: 'Compete in real-time 1v1 coding battles',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-900 text-white min-h-screen">
        <LayoutWrapper>{children}</LayoutWrapper>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
