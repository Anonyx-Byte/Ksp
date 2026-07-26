'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import ClientDataLoader from './ClientDataLoader';
import AuthProvider from '@/components/auth/AuthProvider';

export default function AppWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  if (pathname === '/login') {
    return (
      <AuthProvider>
        {children}
      </AuthProvider>
    );
  }

  return (
    <AuthProvider>
      <div className="app-root">
        <Sidebar />
        <main className="app-main">
          <Topbar />
          <div className="app-content">
            <ClientDataLoader>
              {children}
            </ClientDataLoader>
          </div>
        </main>
      </div>
    </AuthProvider>
  );
}
