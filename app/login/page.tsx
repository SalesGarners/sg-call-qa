'use client';

import React, { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, Lock } from 'lucide-react';

export default function LoginPage() {
  const { data: session, status } = useSession();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  // If already logged in, redirect to appropriate page
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      const role = (session.user as any).role;
      if (role === 'agent') {
        router.push('/agent');
      } else {
        router.push('/');
      }
    }
  }, [status, session, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    
    setIsLoading(true);
    setError(null);

    try {
      // We use redirect: false to handle errors manually in the UI
      const res = await signIn('credentials', {
        redirect: false,
        username: username.trim(),
        password: password.trim(),
        callbackUrl,
      });

      if (res?.error) {
        setError('Invalid username or password');
        setIsLoading(false);
      } else if (res?.ok) {
        // Successful login - allow the useEffect above to handle redirection 
        // OR trigger a hard refresh to be safe
        window.location.href = res.url || callbackUrl;
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Something went wrong. Please try again.');
      setIsLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div style={styles.container}>
        <Loader2 size={32} className="spin" style={{ color: 'var(--color-primary)' }} />
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div className="card fade-in" style={styles.card}>
        <div style={styles.iconHeader}>
          <div style={styles.lockCircle}>
            <Lock size={24} color="var(--color-primary)" />
          </div>
        </div>
        
        <h2 className="outfit-font" style={{ textAlign: 'center', marginBottom: '12px', fontSize: '26px', fontWeight: '800', color: 'var(--color-text-main)' }}>
          Welcome Back
        </h2>
        <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', marginBottom: '32px', fontSize: '14px' }}>
          Please enter your credentials to access the platform.
        </p>

        {error && (
          <div style={styles.errorBox}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={styles.label}>Username</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="text-input"
              placeholder="Enter your username"
              style={{ width: '100%', boxSizing: 'border-box' }}
              disabled={isLoading}
            />
          </div>

          <div>
            <label style={styles.label}>Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="text-input"
              placeholder="Enter your password"
              style={{ width: '100%', boxSizing: 'border-box' }}
              disabled={isLoading}
            />
          </div>

          <button 
            type="submit" 
            className="primary-button" 
            disabled={isLoading || !username.trim() || !password.trim()}
            style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '12px', height: '48px' }}
          >
            {isLoading ? <Loader2 size={18} className="spin" /> : 'Log In to Dashboard'}
          </button>
        </form>

        <p style={{ marginTop: '32px', textAlign: 'center', fontSize: '12px', color: 'var(--color-text-muted)' }}>
          Contact your administrator if you've forgotten your password.
        </p>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB', // Light gray background
    padding: '24px',
  },
  card: {
    width: '100%',
    maxWidth: '420px',
    padding: '48px 40px',
    backgroundColor: 'white',
    borderRadius: '16px',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
  },
  iconHeader: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '24px',
  },
  lockCircle: {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    backgroundColor: 'var(--color-primary-light)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    display: 'block',
    fontSize: '13px',
    fontWeight: '600',
    marginBottom: '8px',
    color: 'var(--color-text-main)',
  },
  errorBox: {
    backgroundColor: '#FEF2F2',
    color: '#DC2626',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '24px',
    fontSize: '14px',
    textAlign: 'center',
    border: '1px solid #FEE2E2',
    fontWeight: '500',
  }
};
