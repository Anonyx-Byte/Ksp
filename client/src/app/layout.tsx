import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import '../styles/globals.css';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-body',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

import AppWrapper from '@/components/layout/AppWrapper';

export const metadata: Metadata = {
  title: 'IRIS | Crime Intelligence Platform',
  description: 'Karnataka State Police Intelligence Platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${jetbrainsMono.variable}`}>
        <AppWrapper>
          {children}
        </AppWrapper>
      </body>
    </html>
  );
}
