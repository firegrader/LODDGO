/**
 * Organizer Login Page
 * /admin/login
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [authenticating, setAuthenticating] = useState<string | null>(null);

  const handleAuth = async (provider: 'vipps' | 'google' | 'apple' | 'feide') => {
    setAuthenticating(provider);
    
    // Simulate authentication delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Store simulated auth in localStorage
    localStorage.setItem('loddgo_organizer_auth', JSON.stringify({
      provider,
      user_id: `sim_${provider}_${Date.now()}`,
      email: `user@${provider}.example.com`,
      name: `${provider.charAt(0).toUpperCase() + provider.slice(1)} User`,
      authenticated_at: new Date().toISOString(),
    }));
    
    // Dispatch custom event to notify other pages of auth change
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('loddgo_auth_change'));
    }
    
    // Redirect to create event page
    router.push('/admin');
  };

  return (
    <div style={{ minHeight: '100vh', padding: '20px', background: '#eff6ff' }}>
      <div style={{ maxWidth: '500px', margin: '0 auto', background: '#ffffff', padding: '40px 32px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px', color: '#2563eb', textAlign: 'center' }}>LODDGO</h1>
        <p style={{ marginBottom: '32px', color: '#64748b', textAlign: 'center' }}>Sign in to create and manage events</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button
            onClick={() => handleAuth('vipps')}
            disabled={!!authenticating}
            className="blue-button"
            style={{
              width: '100%',
              padding: '14px 20px',
              fontSize: '16px',
              fontWeight: '600',
              color: '#ffffff',
              background: authenticating === 'vipps' ? '#93c5fd' : '#2563eb',
              border: 'none',
              borderRadius: '8px',
              cursor: authenticating ? 'not-allowed' : 'pointer',
              opacity: authenticating && authenticating !== 'vipps' ? 0.5 : 1,
              transition: 'background 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px'
            }}
          >
            {authenticating === 'vipps' ? 'Signing in...' : 'Continue with Vipps'}
          </button>

          <button
            onClick={() => handleAuth('google')}
            disabled={!!authenticating}
            className="blue-button"
            style={{
              width: '100%',
              padding: '14px 20px',
              fontSize: '16px',
              fontWeight: '600',
              color: '#ffffff',
              background: authenticating === 'google' ? '#93c5fd' : '#2563eb',
              border: 'none',
              borderRadius: '8px',
              cursor: authenticating ? 'not-allowed' : 'pointer',
              opacity: authenticating && authenticating !== 'google' ? 0.5 : 1,
              transition: 'background 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px'
            }}
          >
            {authenticating === 'google' ? 'Signing in...' : 'Continue with Google'}
          </button>

          <button
            onClick={() => handleAuth('apple')}
            disabled={!!authenticating}
            className="blue-button"
            style={{
              width: '100%',
              padding: '14px 20px',
              fontSize: '16px',
              fontWeight: '600',
              color: '#ffffff',
              background: authenticating === 'apple' ? '#93c5fd' : '#2563eb',
              border: 'none',
              borderRadius: '8px',
              cursor: authenticating ? 'not-allowed' : 'pointer',
              opacity: authenticating && authenticating !== 'apple' ? 0.5 : 1,
              transition: 'background 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px'
            }}
          >
            {authenticating === 'apple' ? 'Signing in...' : 'Continue with Apple'}
          </button>

          <button
            onClick={() => handleAuth('feide')}
            disabled={!!authenticating}
            className="blue-button"
            style={{
              width: '100%',
              padding: '14px 20px',
              fontSize: '16px',
              fontWeight: '600',
              color: '#ffffff',
              background: authenticating === 'feide' ? '#93c5fd' : '#2563eb',
              border: 'none',
              borderRadius: '8px',
              cursor: authenticating ? 'not-allowed' : 'pointer',
              opacity: authenticating && authenticating !== 'feide' ? 0.5 : 1,
              transition: 'background 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px'
            }}
          >
            {authenticating === 'feide' ? 'Signing in...' : 'Continue with Feide'}
          </button>
        </div>

        <div style={{ marginTop: '32px', paddingTop: '20px', borderTop: '1px solid #e5e7eb', textAlign: 'center' }}>
          <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>
            Authentication is simulated for development. Real OAuth integration will be added later.
          </p>
        </div>

        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <a href="/" style={{ color: '#2563eb', textDecoration: 'none', fontSize: '14px' }}>← Back to home</a>
        </div>
      </div>
    </div>
  );
}
