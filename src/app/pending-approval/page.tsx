'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, LogOut } from 'lucide-react';
import Card from '@/components/Card';

export default function PendingApproval() {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [isChecking, setIsChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setName(data.user.name);
          setRole(data.user.role);
          
          if (data.user.status === 'APPROVED') {
            // Automatically redirect to their dashboard if approved
            const dashboardMap: Record<string, string> = {
              SUPER_ADMIN: '/dashboard/super-admin',
              ADMIN: '/dashboard/admin',
              PROFESSOR: '/dashboard/professor',
              STUDENT: '/dashboard/student',
            };
            router.replace(dashboardMap[data.user.role] || '/login');
          }
        } else {
          router.replace('/login');
        }
      } catch (err) {
        console.error('Error checking user status:', err);
      } finally {
        setIsChecking(false);
      }
    };

    checkStatus();

    // Check status every 5 seconds for automatic redirection
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, [router]);

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) {
        router.replace('/login');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (isChecking) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', justifyContent: 'center',  alignItems: 'center', backgroundColor: 'var(--bg-page)' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', justifyContent: 'center', alignItems: 'center', backgroundColor: 'var(--bg-page)', padding: '24px' }}>
      <Card className="animate-fade-in" style={{ maxWidth: '440px', width: '100%', textAlign: 'center', padding: '40px 32px' }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: 'var(--radius-pill)',
          backgroundColor: 'rgba(255, 149, 0, 0.1)',
          color: 'var(--accent-yellow)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          margin: '0 auto 24px auto',
          border: '1px solid rgba(255, 149, 0, 0.2)'
        }}>
          <Clock size={32} />
        </div>
        
        <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px', letterSpacing: '-0.02em' }}>
          Approval Pending
        </h2>
        
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '24px' }}>
          Hello <strong>{name}</strong>. Your account has been registered successfully as a <strong>{role.toLowerCase()}</strong>.
          <br /><br />
          For security, registrations must be approved by an administrator before accessing the dashboard. This page will automatically update once you are approved.
        </p>

        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              width: '100%',
              padding: '12px',
              borderRadius: 'var(--radius-pill)',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-card)',
              color: 'var(--accent-red)',
              cursor: 'pointer',
              fontWeight: '500',
              transition: 'background-color 0.2s ease',
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-page)')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-card)')}
          >
            <LogOut size={16} />
            Log Out
          </button>
        </div>
      </Card>
    </div>
  );
}
