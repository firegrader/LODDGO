/**
 * Admin Page - Create Events
 * /admin
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface AuthData {
  provider: string;
  user_id: string;
  email: string;
  name: string;
  authenticated_at: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [auth, setAuth] = useState<AuthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    price_nok: 10,
    status: 'live' as 'draft' | 'live' | 'closed' | 'drawn',
  });

  useEffect(() => {
    // Check for simulated auth
    if (typeof window !== 'undefined') {
      const authData = localStorage.getItem('loddgo_organizer_auth');
      if (authData) {
        try {
          setAuth(JSON.parse(authData));
        } catch (e) {
          console.error('Failed to parse auth data:', e);
          localStorage.removeItem('loddgo_organizer_auth');
          router.replace('/admin/login');
          return;
        }
      } else {
        // Redirect to login if not authenticated (replace instead of push to avoid back button issues)
        router.replace('/admin/login');
        return;
      }
    }
    setLoading(false);
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError(null);

    try {
      // Get organizer_id from auth
      const organizer_id = auth?.user_id || null;

      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(organizer_id && { 'x-organizer-id': organizer_id }),
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create event');
      }

      // Automatically redirect to Event Control Panel
      router.push(`/e/${data.code}/control`);
    } catch (err: any) {
      setError(err.message);
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#eff6ff' }}>
        <div style={{ fontSize: '18px', color: '#64748b' }}>Loading...</div>
      </div>
    );
  }

  if (!auth) {
    return null; // Will redirect
  }

  return (
    <div style={{ minHeight: '100vh', padding: '20px', background: '#eff6ff' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', background: '#ffffff', padding: '32px 24px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #e5e7eb' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '4px', color: '#2563eb' }}>Create Event</h1>
            <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>Signed in as {auth.name} ({auth.provider})</p>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem('loddgo_organizer_auth');
              // Dispatch custom event to notify other pages of auth change
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new Event('loddgo_auth_change'));
              }
              router.push('/admin/login');
            }}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              color: '#64748b',
              background: 'transparent',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f9fafb';
              e.currentTarget.style.borderColor = '#9ca3af';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = '#d1d5db';
            }}
          >
            Sign out
          </button>
        </div>

        {error && (
          <div style={{ 
            background: '#fee2e2', 
            color: '#dc2626', 
            padding: '12px 16px', 
            borderRadius: '8px',
            marginBottom: '24px',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '24px' }}>
            <label htmlFor="title" style={{ 
              display: 'block', 
              fontSize: '16px', 
              fontWeight: '500', 
              color: '#374151', 
              marginBottom: '8px' 
            }}>
              Event Title:
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., School Fundraiser 2024"
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                fontSize: '16px',
                border: '1px solid #2563eb',
                borderRadius: '8px',
                background: '#f0f9ff',
                color: '#111827',
                marginBottom: '4px'
              }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label htmlFor="price_nok" style={{ 
              display: 'block', 
              fontSize: '16px', 
              fontWeight: '500', 
              color: '#374151', 
              marginBottom: '8px' 
            }}>
              Price per Ticket (NOK):
            </label>
            <input
              type="number"
              id="price_nok"
              value={formData.price_nok}
              onChange={(e) => setFormData({ ...formData, price_nok: parseInt(e.target.value) || 0 })}
              min="0"
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                fontSize: '16px',
                border: '1px solid #2563eb',
                borderRadius: '8px',
                background: '#f0f9ff',
                color: '#111827',
                marginBottom: '4px'
              }}
            />
            <small style={{ fontSize: '14px', color: '#64748b' }}>Default: 10 NOK</small>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <label htmlFor="status" style={{ 
              display: 'block', 
              fontSize: '16px', 
              fontWeight: '500', 
              color: '#374151', 
              marginBottom: '8px' 
            }}>
              Status:
            </label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              style={{
                width: '100%',
                padding: '12px 16px',
                fontSize: '16px',
                border: '1px solid #2563eb',
                borderRadius: '8px',
                background: '#f0f9ff',
                color: '#111827'
              }}
            >
              <option value="draft">Draft</option>
              <option value="live">Live</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          <button 
            type="submit" 
            disabled={creating}
            className="blue-button"
            style={{
              width: '100%',
              padding: '16px',
              fontSize: '18px',
              fontWeight: '600',
              color: '#ffffff',
              background: creating ? '#93c5fd' : '#2563eb',
              border: 'none',
              borderRadius: '8px',
              cursor: creating ? 'not-allowed' : 'pointer',
              marginBottom: '24px',
              opacity: creating ? 0.7 : 1,
              transition: 'background 0.2s'
            }}
          >
            {creating ? 'Creating...' : 'Create Event'}
          </button>
        </form>

        <div style={{ marginTop: '32px', padding: '20px', background: '#f0f9ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', color: '#2563eb' }}>After Creating:</h3>
          <p style={{ marginBottom: '8px', color: '#475569' }}>The event code will be automatically generated from your title.</p>
          <p style={{ margin: 0, color: '#475569' }}>You'll be automatically redirected to the Event Control Panel after creation.</p>
        </div>

        <div style={{ marginTop: '32px', paddingTop: '20px', borderTop: '1px solid #e5e7eb' }}>
          <p style={{ margin: 0 }}>
            <a href="/" style={{ color: '#2563eb', textDecoration: 'none' }}>← Back to home</a>
          </p>
        </div>
      </div>
    </div>
  );
}
