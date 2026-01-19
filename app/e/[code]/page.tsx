/**
 * Buy Tickets Page
 * /e/[code]
 */

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface Event {
  id: string;
  code: string;
  title: string;
  price_nok: number;
  status: string;
}

// Fun nickname generator - Animal + Number format
const generateNickname = () => {
  const animals = [
    'Tiger', 'Eagle', 'Dolphin', 'Wolf', 'Lion', 'Falcon', 'Bear', 'Fox', 
    'Hawk', 'Panther', 'Shark', 'Dragon', 'Stallion', 'Raven', 'Jaguar', 
    'Leopard', 'Cheetah', 'Lynx', 'Owl', 'Penguin', 'Koala', 'Panda', 
    'Elephant', 'Giraffe', 'Zebra', 'Monkey', 'Kangaroo', 'Whale', 'Seal',
    'Otter', 'Beaver', 'Rabbit', 'Deer', 'Elk', 'Moose', 'Buffalo', 'Bison'
  ];
  const animal = animals[Math.floor(Math.random() * animals.length)];
  const num = Math.floor(Math.random() * 9999) + 1;
  return `${animal}${num}`;
};

export default function BuyPage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;
  
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [buying, setBuying] = useState(false);
  const [qty, setQty] = useState(1);
  const [buyerName, setBuyerName] = useState('John');
  const [useNickname, setUseNickname] = useState(false);

  useEffect(() => {
    // Add cache-busting to ensure fresh data
    fetch(`/api/events/${code}?t=${Date.now()}`, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
      },
    })
      .then(res => {
        if (!res.ok) {
          throw new Error('Event not found');
        }
        return res.json();
      })
      .then(data => {
        setEvent(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [code]);

  const generateUniqueNickname = async (): Promise<string> => {
    const maxAttempts = 20; // Prevent infinite loops
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      const nickname = generateNickname();
      
      try {
        const response = await fetch(`/api/events/${code}/check-nickname?nickname=${encodeURIComponent(nickname)}`);
        if (response.ok) {
          const data = await response.json();
          if (data.available) {
            return nickname;
          }
        }
      } catch (err) {
        // If check fails, use the generated nickname anyway (server will validate)
        console.warn('Failed to check nickname availability, using generated nickname:', err);
        return nickname;
      }
      
      attempts++;
    }
    
    // Fallback: add timestamp to ensure uniqueness
    return `${generateNickname()}${Date.now().toString().slice(-4)}`;
  };

  useEffect(() => {
    if (useNickname) {
      // Generate a unique nickname when checkbox is checked
      generateUniqueNickname().then(nickname => {
        setBuyerName(nickname);
      });
    } else {
      // Reset to default when unchecked
      setBuyerName('John');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useNickname, code]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBuying(true);
    setError(null);

    try {
      let displayName = useNickname ? buyerName : (buyerName.trim() || null);
      
      // If using nickname, ensure it's still available (race condition protection)
      if (useNickname && displayName) {
        const checkResponse = await fetch(`/api/events/${code}/check-nickname?nickname=${encodeURIComponent(displayName)}`);
        if (checkResponse.ok) {
          const checkData = await checkResponse.json();
          if (!checkData.available) {
            // Nickname was taken, generate a new one
            displayName = await generateUniqueNickname();
            setBuyerName(displayName);
          }
        }
      }
      
      // Get user_id if authenticated (for participants, this would come from real auth)
      const authData = typeof window !== 'undefined' 
        ? localStorage.getItem('loddgo_participant_auth') 
        : null;
      const user_id = authData ? JSON.parse(authData).user_id : null;
      
      console.log('Submitting purchase:', { event_code: code, qty, buyer_display_name: displayName, user_id });
      
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(user_id && { 'x-user-id': user_id }),
        },
        body: JSON.stringify({
          event_code: code,
          qty: qty,
          buyer_display_name: displayName,
          is_nickname: useNickname,
        }),
      });

      const data = await response.json();
      console.log('Purchase response:', { status: response.status, data });

      if (!response.ok) {
        // If nickname conflict, try generating a new one and resubmit once
        if (response.status === 409 && useNickname && data.error?.includes('already taken')) {
          const newNickname = await generateUniqueNickname();
          setBuyerName(newNickname);
          
          // Retry with new nickname
          const retryResponse = await fetch('/api/orders', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              ...(user_id && { 'x-user-id': user_id }),
            },
            body: JSON.stringify({
              event_code: code,
              qty: qty,
              buyer_display_name: newNickname,
              is_nickname: true,
            }),
          });
          
          const retryData = await retryResponse.json();
          if (!retryResponse.ok) {
            throw new Error(retryData.error || 'Failed to purchase tickets');
          }
          
          router.push(`/order/${retryData.order.id}`);
          return;
        }
        
        const errorMsg = data.error || `Failed to purchase tickets (${response.status})`;
        console.error('Purchase failed:', errorMsg);
        throw new Error(errorMsg);
      }

      console.log('Purchase successful, redirecting to:', `/order/${data.order.id}`);
      // Redirect to confirmation page
      router.push(`/order/${data.order.id}`);
    } catch (err: any) {
      console.error('Purchase error:', err);
      setError(err.message || 'An unexpected error occurred. Please try again.');
      setBuying(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff7ed' }}>
        <div style={{ fontSize: '18px', color: '#64748b' }}>Loading...</div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div style={{ minHeight: '100vh', padding: '20px', background: '#fff7ed' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', background: '#ffffff', padding: '32px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '12px', color: '#f97316' }}>Event Not Found</h1>
          <p style={{ color: '#dc2626', marginBottom: '20px' }}>{error || 'The event you are looking for does not exist.'}</p>
          <a href="/" style={{ color: '#f97316', textDecoration: 'none' }}>← Back to home</a>
        </div>
      </div>
    );
  }

  if (event.status !== 'live') {
    return (
      <div style={{ minHeight: '100vh', padding: '20px', background: '#fff7ed' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', background: '#ffffff', padding: '32px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '12px', color: '#f97316' }}>{event.title}</h1>
          <p style={{ color: '#dc2626', marginBottom: '20px' }}>This event is not currently accepting ticket purchases. Status: {event.status}</p>
          <a href="/" style={{ color: '#f97316', textDecoration: 'none' }}>← Back to home</a>
        </div>
      </div>
    );
  }

  const total = event.price_nok * qty;

  return (
    <div style={{ minHeight: '100vh', background: '#fff7ed', padding: '20px' }}>
      {/* Main Content Card */}
      <div style={{ 
        maxWidth: '600px', 
        margin: '0 auto', 
        background: '#ffffff', 
        borderRadius: '16px',
        padding: '32px 24px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        {/* Title */}
        <h1 style={{ 
          fontSize: '24px', 
          fontWeight: '600', 
          color: '#f97316', 
          marginBottom: '32px',
          fontFamily: 'sans-serif'
        }}>
          {event.title}
        </h1>

        {error && (
          <div style={{ 
            background: '#fee2e2', 
            color: '#dc2626', 
            padding: '12px 16px', 
            borderRadius: '8px',
            marginBottom: '24px',
            fontSize: '14px'
          }}>
            <strong>Error:</strong> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Your name section */}
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ 
              fontSize: '20px', 
              fontWeight: '600', 
              color: '#f97316', 
              marginBottom: '16px' 
            }}>
              Your name
            </h2>
            
            <div style={{ marginBottom: '12px' }}>
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                cursor: 'pointer',
                fontSize: '16px',
                color: '#374151'
              }}>
                <input
                  type="checkbox"
                  checked={useNickname}
                  onChange={(e) => setUseNickname(e.target.checked)}
                  style={{
                    width: '20px',
                    height: '20px',
                    minWidth: '20px',
                    minHeight: '20px',
                    marginRight: '10px',
                    cursor: 'pointer',
                    borderRadius: '4px',
                    border: '2px solid #d1d5db',
                    accentColor: '#f97316',
                    flexShrink: 0
                  }}
                />
                <span>Create a fun nickname for me instead</span>
              </label>
            </div>

            <input
              type="text"
              id="buyerName"
              value={buyerName}
              onChange={(e) => !useNickname && setBuyerName(e.target.value)}
              disabled={useNickname}
              readOnly={useNickname}
              style={{
                width: '100%',
                padding: '12px 16px',
                fontSize: '16px',
                border: useNickname ? '1px solid #d1d5db' : '1px solid #f97316',
                borderRadius: '8px',
                background: useNickname ? '#f3f4f6' : '#fef9e7',
                color: useNickname ? '#6b7280' : '#111827',
                marginBottom: '8px',
                cursor: useNickname ? 'not-allowed' : 'text',
                opacity: useNickname ? 1 : 1,
                transition: 'all 0.2s ease'
              }}
            />
            <p style={{ 
              fontSize: '14px', 
              color: '#6b7280', 
              margin: 0 
            }}>
              (Shown if you win)
            </p>
          </div>

          {/* How many tickets section */}
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ 
              fontSize: '20px', 
              fontWeight: '600', 
              color: '#f97316', 
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              flexWrap: 'wrap'
            }}>
              <span>How many tickets?</span>
              <span style={{ 
                fontSize: '16px', 
                fontWeight: '400', 
                color: '#6b7280' 
              }}>
                ({event.price_nok} NOK per ticket)
              </span>
            </h2>

            <div style={{ marginBottom: '20px' }}>
              
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '16px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                padding: '12px 16px',
                background: '#ffffff',
                marginBottom: '16px'
              }}>
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                  className="qty-button"
                  style={{
                    width: '44px',
                    height: '44px',
                    minWidth: '44px',
                    minHeight: '44px',
                    border: '2px solid #d1d5db',
                    borderRadius: '8px',
                    background: '#ffffff',
                    fontSize: '20px',
                    fontWeight: '500',
                    color: '#374151',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 0,
                    transition: 'all 0.2s',
                    flexShrink: 0
                  }}
                >
                  -
                </button>
                <div style={{ 
                  fontSize: '18px', 
                  fontWeight: '600', 
                  color: '#111827',
                  minWidth: '44px',
                  height: '44px',
                  textAlign: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#ffffff',
                  border: '2px solid #d1d5db',
                  borderRadius: '8px',
                  padding: '0 12px'
                }}>
                  {qty}
                </div>
                <button
                  type="button"
                  onClick={() => setQty((q) => q + 1)}
                  aria-label="Increase quantity"
                  className="qty-button"
                  style={{
                    width: '44px',
                    height: '44px',
                    minWidth: '44px',
                    minHeight: '44px',
                    border: '2px solid #d1d5db',
                    borderRadius: '8px',
                    background: '#ffffff',
                    fontSize: '20px',
                    fontWeight: '500',
                    color: '#374151',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 0,
                    transition: 'all 0.2s',
                    flexShrink: 0
                  }}
                >
                  +
                </button>
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '16px', color: '#6b7280', fontWeight: '500' }}>Total</span>
                  <span style={{ fontSize: '18px', color: '#f97316', fontWeight: '600' }}>{total} NOK</span>
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={buying}
              className="vipps-button"
              style={{
                width: '100%',
                padding: '16px',
                fontSize: '18px',
                fontWeight: '600',
                color: '#ffffff',
                background: buying ? '#fb923c' : '#f97316',
                border: 'none',
                borderRadius: '8px',
                cursor: buying ? 'not-allowed' : 'pointer',
                marginBottom: '8px',
                opacity: buying ? 0.7 : 1,
                transition: 'background 0.2s'
              }}
            >
              {buying ? 'Processing...' : 'Complete purchase in Vipps'}
            </button>
            
            <p style={{ 
              fontSize: '12px', 
              color: '#9ca3af', 
              textAlign: 'center',
              margin: 0
            }}>
              Secure checkout
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
