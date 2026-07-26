'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './login.module.css';
import { Shield } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');

  useEffect(() => {
    // Inject Catalyst init script
    const initScript = document.createElement('script');
    initScript.src = '/__catalyst/sdk/init.js';
    document.body.appendChild(initScript);

    initScript.onload = () => {
      // @ts-ignore
      if (typeof window !== 'undefined' && window.catalyst) {
        try {
          // Check if already logged in
          // @ts-ignore
          window.catalyst.auth.isUserAuthenticated().then((res: any) => {
            if (res) {
              router.push('/');
            } else {
              // Not logged in, render the iFrame
              // @ts-ignore
              window.catalyst.auth.signIn('catalyst-login-container').catch((err: any) => {
                setError('Failed to load Catalyst Auth. Please ensure Authentication is enabled in the Catalyst Console.');
                console.error(err);
              });
            }
          }).catch((err: any) => {
             setError('Failed to load Catalyst Auth. Please ensure Authentication is enabled in the Catalyst Console.');
             console.error(err);
          });
        } catch (e) {
          setError('Catalyst SDK error.');
        }
      } else {
        setError('Catalyst Web SDK is missing in layout.');
      }
    };

    return () => {
      document.body.removeChild(initScript);
    };
  }, [router]);

  return (
    <div className={styles.container}>
      <div className={styles.loginBox}>
        <div className={styles.header}>
          <Shield size={48} className={styles.logo} />
          <h1>IRIS KSP</h1>
          <p>Integrated Risk & Intelligence System</p>
        </div>
        
        {error ? (
          <div className={styles.errorBox}>
            <p>{error}</p>
            <p style={{marginTop: 8, fontSize: '0.8rem'}}>Ensure you have enabled Authentication in the Zoho Catalyst Console.</p>
          </div>
        ) : (
          <div id="catalyst-login-container" className={styles.catalystContainer}>
            {/* Catalyst iframe will mount here */}
            <p>Loading Catalyst Auth...</p>
          </div>
        )}
      </div>
    </div>
  );
}
