'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogIn, Key, Eye, EyeOff } from 'lucide-react';
import Card from '@/components/Card';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      // Check status and route accordingly
      const user = data.user;
      if (user.status === 'PENDING') {
        router.replace('/pending-approval');
      } else {
        const dashboardMap: Record<string, string> = {
          SUPER_ADMIN: '/dashboard/super-admin',
          ADMIN: '/dashboard/admin',
          PROFESSOR: '/dashboard/professor',
          STUDENT: '/dashboard/student',
        };
        router.replace(dashboardMap[user.role] || '/login');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // Helper to click-fill test credentials
  const fillCredentials = (testEmail: string) => {
    setEmail(testEmail);
    setPassword('Password123');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', justifyContent: 'center', alignItems: 'center', backgroundColor: 'var(--bg-page)', padding: '24px', flexDirection: 'column', gap: '24px' }}>
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '50%',
          border: '2px double var(--accent-gold)',
          backgroundColor: '#0f172a',
          color: 'var(--accent-gold)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          fontSize: '13px',
          fontWeight: '800',
          fontFamily: 'var(--font-serif)',
          boxShadow: '0 2px 8px rgba(197, 160, 89, 0.25)',
          marginBottom: '4px'
        }}>EC</div>
        <h1 style={{ fontSize: '32px', fontWeight: '500', letterSpacing: '-0.02em', color: 'var(--text-primary)', marginBottom: '2px', fontFamily: 'var(--font-serif)' }}>EMBA Connect</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Executive Academy Management Console</p>
      </div>

      <Card className="animate-fade-in" style={{ maxWidth: '400px', width: '100%', padding: '32px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <LogIn size={20} />
          Sign In
        </h2>

        {error && (
          <div style={{ backgroundColor: 'rgba(255, 59, 48, 0.08)', border: '1px solid rgba(255, 59, 48, 0.15)', color: 'var(--accent-red)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', fontSize: '13px', marginBottom: '20px', lineHeight: '1.4' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label htmlFor="email" style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '6px' }}>Email Address</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@emba.com"
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-page)',
                color: 'var(--text-primary)',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.2s ease',
              }}
              onFocus={(e) => (e.target.style.borderColor = 'var(--accent-blue)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--border-color)')}
            />
          </div>

          <div>
            <label htmlFor="password" style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '6px' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '12px 48px 12px 16px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-page)',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.2s ease',
                }}
                onFocus={(e) => (e.target.style.borderColor = 'var(--accent-blue)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--border-color)')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: 'var(--radius-pill)',
              border: 'none',
              backgroundColor: 'var(--text-primary)',
              color: 'var(--bg-card)',
              fontWeight: '500',
              fontSize: '14px',
              cursor: 'pointer',
              marginTop: '8px',
              transition: 'opacity 0.2s ease, transform 0.1s ease',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '8px',
            }}
            onMouseOver={(e) => (e.currentTarget.style.opacity = '0.9')}
            onMouseOut={(e) => (e.currentTarget.style.opacity = '1')}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-secondary)', marginTop: '24px' }}>
          Don&apos;t have an account?{' '}
          <Link href="/signup" style={{ color: 'var(--accent-blue)', fontWeight: '500' }}>
            Register here
          </Link>
        </p>
      </Card>

      {/* Demo Credentials Box */}
      <Card style={{ maxWidth: '400px', width: '100%', padding: '20px 24px', borderStyle: 'dashed' }}>
        <h3 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Key size={14} style={{ color: 'var(--accent-yellow)' }} />
          Seeded Test Credentials (Password: Password123)
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '11px' }}>
          <button
            onClick={() => fillCredentials('superadmin@emba.com')}
            style={{ padding: '8px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-card)', cursor: 'pointer', textAlign: 'left' }}
          >
            <strong>Super Admin</strong><br />
            superadmin@emba.com
          </button>
          <button
            onClick={() => fillCredentials('admin@emba.com')}
            style={{ padding: '8px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-card)', cursor: 'pointer', textAlign: 'left' }}
          >
            <strong>Admin</strong><br />
            admin@emba.com
          </button>
          <button
            onClick={() => fillCredentials('professor@emba.com')}
            style={{ padding: '8px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-card)', cursor: 'pointer', textAlign: 'left' }}
          >
            <strong>Professor</strong><br />
            professor@emba.com
          </button>
          <button
            onClick={() => fillCredentials('student@emba.com')}
            style={{ padding: '8px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-card)', cursor: 'pointer', textAlign: 'left' }}
          >
            <strong>Student</strong><br />
            student@emba.com
          </button>
        </div>
      </Card>
    </div>
  );
}
