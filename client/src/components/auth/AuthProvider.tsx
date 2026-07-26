'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface User {
  firstName: string;
  lastName: string;
  emailId: string;
  roleDetails: {
    roleName: string;
  };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // If we're on the login page, don't force checks here immediately
    if (pathname === '/login') {
      setLoading(false);
      return;
    }

    const checkAuth = async () => {
      // @ts-ignore
      if (typeof window !== 'undefined' && window.catalyst) {
        try {
          // @ts-ignore
          const auth = window.catalyst.auth;
          const isAuthenticated = await auth.isUserAuthenticated();
          
          if (isAuthenticated) {
            const currentUser = await auth.getCurrentUserPromise();
            setUser(currentUser);
          } else {
            router.push('/login');
          }
        } catch (error) {
          console.error("Auth check failed:", error);
          router.push('/login');
        }
      } else {
        // If SDK not loaded, wait a bit and retry
        setTimeout(checkAuth, 500);
      }
      setLoading(false);
    };

    checkAuth();
  }, [pathname, router]);

  const logout = () => {
    // @ts-ignore
    if (window.catalyst) {
      // @ts-ignore
      const redirectURL = window.location.origin + '/login';
      // @ts-ignore
      window.catalyst.auth.signOut(redirectURL);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
