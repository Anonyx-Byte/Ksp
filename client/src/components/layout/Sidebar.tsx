'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Sidebar.module.css';
import {
  LayoutDashboard,
  Map,
  BarChart3,
  Network,
  MessageSquareText,
  Banknote,
  Settings,
  Shield,
  Activity,
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Tactical Map', href: '/map', icon: Map },
  { label: 'Analytics', href: '/analytics', icon: BarChart3 },
  { label: 'Network', href: '/network', icon: Network },
  { label: 'AI Chat', href: '/chat', icon: MessageSquareText },
  { label: 'Financial', href: '/financial', icon: Banknote },
  { label: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logoContainer}>
        <div className={styles.logoIcon}>
          <Shield size={26} strokeWidth={1.8} />
        </div>
        <div className={styles.logoText}>
          <span className={styles.logoTitle}>IRIS</span>
          <span className={styles.logoSub}>KSP INTEL</span>
        </div>
      </div>

      <nav className={styles.nav}>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navItem} ${isActive ? styles.active : ''}`}
              title={item.label}
            >
              {isActive && <div className={styles.activeIndicator} />}
              <Icon size={20} strokeWidth={isActive ? 2 : 1.5} className={styles.navIcon} />
              <span className={styles.navLabel}>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className={styles.footer}>
        <div className={styles.statusRow}>
          <Activity size={13} className={styles.statusIcon} />
          <span className={styles.statusText}>SYSTEM ONLINE</span>
        </div>
      </div>
    </aside>
  );
}
