'use client';

import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import styles from './Topbar.module.css';
import { Search, Bell, ChevronRight } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { getFirRecords, getAccusedRecords } from '@/data/dataService';

const routeNames: Record<string, string> = {
  '/': 'Command Center Dashboard',
  '/map': 'Tactical Map',
  '/analytics': 'Crime Analytics',
  '/network': 'Criminal Network Analysis',
  '/chat': 'AI Intelligence Chat',
  '/financial': 'Financial Crime Tracker',
  '/settings': 'System Settings',
};

export default function Topbar() {
  const pathname = usePathname();
  const pageTitle = routeNames[pathname] || 'Dashboard';
  const { user, logout } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search effect
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setResults([]);
      return;
    }
    const qRaw = searchQuery.toLowerCase().trim();
    // Strip "fir-" or "fir " from the beginning of the query if present
    const q = qRaw.replace(/^fir[-\s]?/, '');
    
    const matches = [];

    // Search FIRs
    const firs = getFirRecords();
    for (const f of firs) {
      // f.FIRNo might be mapped, or we can check CrimeNo, CaseNo directly
      const crimeNo = (f.CrimeNo || '').toLowerCase();
      const caseNo = (f.CaseNo || '').toLowerCase();
      const firNo = ((f as any).FIRNo || '').toLowerCase();
      const caseMasterStr = String(f.CaseMasterID);
      const brief = (f.BriefFacts || '').toLowerCase();

      if (
        crimeNo.includes(q) || 
        caseNo.includes(q) || 
        firNo.includes(q) ||
        caseMasterStr.includes(q) ||
        brief.includes(q)
      ) {
        matches.push({
          type: 'fir',
          title: f.CrimeNo || f.CaseNo || `FIR-${f.CaseMasterID}`,
          desc: f.BriefFacts.substring(0, 80) + '...',
          id: f.CaseMasterID
        });
      }
      if (matches.length > 10) break;
    }

    // Search Suspects
    const accused = getAccusedRecords();
    for (const a of accused) {
      if (a.AccusedName?.toLowerCase().includes(q)) {
        matches.push({
          type: 'suspect',
          title: a.AccusedName,
          desc: `Linked to FIR-${a.CaseMasterID}`,
          id: a.AccusedMasterID
        });
      }
      if (matches.length > 20) break;
    }

    setResults(matches.slice(0, 8)); // Top 8 results
  }, [searchQuery]);

  const handleResultClick = (res: any) => {
    setIsFocused(false);
    setSearchQuery('');
    if (res.type === 'fir') {
      window.alert(`FIR Details for ${res.title}\n\n${res.desc}\n\n(A dedicated FIR page would load here)`);
    } else {
      window.alert(`Suspect Profile: ${res.title}\n\n(A dedicated suspect profile would load here)`);
    }
  };

  return (
    <header className={styles.topbar}>
      <div className={styles.left}>
        <h1 className={styles.pageTitle}>{pageTitle}</h1>
        <div className={styles.breadcrumb}>
          <span className={styles.breadcrumbRoot}>IRIS</span>
          <ChevronRight size={11} className={styles.separator} />
          <span className={styles.breadcrumbCurrent}>{pageTitle.toUpperCase()}</span>
        </div>
      </div>

      <div className={styles.right}>
        <div className={styles.searchContainer} ref={dropdownRef}>
          <Search size={15} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search entities, FIRs, IDs..."
            className={styles.searchInput}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
          />
          {isFocused && searchQuery.trim().length >= 2 && (
            <div className={styles.searchDropdown}>
              {results.length > 0 ? (
                results.map((res, i) => (
                  <div key={i} className={styles.searchItem} onClick={() => handleResultClick(res)}>
                    <span className={styles.searchItemTitle}>{res.title}</span>
                    <span className={styles.searchItemDesc}>{res.desc}</span>
                    <span className={`${styles.searchBadge} ${styles[res.type]}`}>{res.type}</span>
                  </div>
                ))
              ) : (
                <div className={styles.searchEmpty}>No matching records found.</div>
              )}
            </div>
          )}
        </div>

        <button className={styles.notifBtn} aria-label="Notifications" onClick={() => window.alert('No new notifications')}>
          <Bell size={18} />
          <span className={styles.notifDot} />
        </button>

        <div className={styles.userProfile} onClick={() => user && logout()} style={{cursor: 'pointer'}} title="Click to logout">
          <div className={styles.avatar}>
            {user ? (user.firstName?.[0] || user.emailId?.[0]?.toUpperCase()) : 'IN'}
          </div>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.emailId : 'Insp. Naveen'}</span>
            <span className={styles.userRole}>{user ? user.roleDetails?.roleName : 'CCB Bengaluru'}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
