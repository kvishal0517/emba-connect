'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, ChevronDown, User } from 'lucide-react';
import NotificationCenter from '@/components/NotificationCenter';
import styles from './layout.module.css';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          router.replace('/login');
        }
      } catch (err) {
        console.error('Failed to retrieve session:', err);
        router.replace('/login');
      }
    };
    fetchUser();
  }, [router]);

  useEffect(() => {
    if (!user) return;

    // Skip SSE connection in testing/automation environments to prevent connection hangs
    if (typeof window !== 'undefined' && (window.navigator.webdriver || window.location.search.includes('disableSSE'))) {
      console.log('Realtime SSE connection bypassed in automation/webdriver environment');
      return;
    }

    const eventSource = new EventSource('/api/realtime');

    eventSource.onmessage = (event) => {
      try {
        const eventData = JSON.parse(event.data);
        // Dispatch custom window event
        const customEvent = new CustomEvent('emba-realtime', { detail: eventData });
        window.dispatchEvent(customEvent);
      } catch (err) {
        console.error('Failed to parse realtime event data:', err);
      }
    };

    eventSource.onerror = (err) => {
      console.error('Realtime SSE connection error:', err);
    };

    return () => {
      eventSource.close();
    };
  }, [user]);

  // Click outside to close profile dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) {
        router.replace('/login');
      }
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const getRoleClass = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN': return styles.badge_super_admin;
      case 'ADMIN': return styles.badge_admin;
      case 'PROFESSOR': return styles.badge_professor;
      case 'STUDENT': return styles.badge_student;
      default: return '';
    }
  };

  const getRoleLabel = (role: string) => {
    if (!role) return '';
    return role.replace('_', ' ');
  };

  if (!user) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', justifyContent: 'center', alignItems: 'center', backgroundColor: 'var(--bg-page)' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Verifying session...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.nav}>
          <div className={styles.logo}>
            <span className={styles.logoSeal}>EC</span>
            EMBA Connect
          </div>
          <div className={styles.rightNav}>
            <NotificationCenter />
            
            <div className={styles.userMenu} ref={dropdownRef}>
              <button className={styles.profileButton} onClick={() => setDropdownOpen(!dropdownOpen)}>
                <User size={14} />
                <span>{user.name.split(' ')[0]}</span>
                <ChevronDown size={12} />
              </button>

              {dropdownOpen && (
                <div className={styles.profileDropdown}>
                  <div className={styles.dropdownUser}>
                    <span className={styles.dropdownName}>{user.name}</span>
                    <span className={styles.dropdownEmail}>{user.email}</span>
                    <span style={{ marginTop: '6px' }} className={`${styles.badge} ${getRoleClass(user.role)}`}>
                      {getRoleLabel(user.role)}
                    </span>
                  </div>
                  <button className={styles.logoutButton} onClick={handleLogout}>
                    <LogOut size={14} />
                    Log Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      
      <main className={`${styles.main} animate-fade-in`}>
        {children}
      </main>
    </div>
  );
}
