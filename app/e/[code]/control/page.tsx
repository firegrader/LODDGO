/**
 * Event Control Panel - Real-time monitoring for organizers
 * /e/[code]/control
 */

'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { useParams } from 'next/navigation';

interface EventStats {
  event: {
    code: string;
    title: string;
    price_nok: number;
    status: string;
  };
  stats: {
    total_orders: number;
    total_tickets: number;
    total_revenue: number;
    unique_buyers: number;
    total_draws: number;
    remaining_tickets: number;
  };
  recent_orders: Array<{
    id: string;
    buyer_name: string;
    qty: number;
    amount_nok: number;
    created_at: string;
  }>;
  draws: Array<{
    id: string;
    winning_ticket_number: number;
    winning_order_id: string;
    method: string;
    drawn_at: string;
    winner_name: string;
  }>;
}

export default function ControlPanel() {
  const params = useParams();
  const code = params.code as string;
  
  const [stats, setStats] = useState<EventStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [drawError, setDrawError] = useState<string | null>(null);
  const [drawing, setDrawing] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [eventUrl, setEventUrl] = useState<string>('');

  const fetchStats = async () => {
    try {
      const response = await fetch(`/api/events/${code}/stats?t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to load statistics');
      }
      const data = await response.json();
      console.log('Stats fetched:', data);
      console.log('Total orders:', data.stats?.total_orders);
      console.log('Recent orders count:', data.recent_orders?.length);
      console.log('Recent orders:', data.recent_orders);
      setStats(data);
      setLastRefresh(new Date());
      setLoading(false);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching stats:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  const handleDrawNext = async () => {
    setDrawError(null);
    setDrawing(true);
    try {
      const response = await fetch(`/api/events/${code}/draw`, {
        method: 'POST',
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to draw next ticket');
      }
      await fetchStats();
    } catch (err: any) {
      setDrawError(err.message);
    } finally {
      setDrawing(false);
    }
  };

  useEffect(() => {
    fetchStats();

    const interval = setInterval(fetchStats, 3000);

    return () => {
      clearInterval(interval);
    };
  }, [code]);

  useEffect(() => {
    const buildQr = async () => {
      if (!code) {
        setQrDataUrl(null);
        return;
      }
      const link = `${window.location.origin}/e/${code}`;
      setEventUrl(link); // Store the full URL for display
      try {
        const dataUrl = await QRCode.toDataURL(link, {
          width: 220,
          margin: 1,
          color: { dark: '#111827', light: '#ffffff' },
        });
        setQrDataUrl(dataUrl);
      } catch (err) {
        console.error('Failed to generate QR code:', err);
        setQrDataUrl(null);
      }
    };

    if (typeof window !== 'undefined') {
      buildQr();
    }
  }, [code]);

  if (loading && !stats) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#eff6ff' }}>
        <div style={{ fontSize: '18px', color: '#64748b' }}>Loading Control Panel...</div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div style={{ minHeight: '100vh', padding: '20px', background: '#eff6ff' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', background: '#ffffff', padding: '32px 24px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '12px', color: '#2563eb' }}>Event Control Panel</h1>
          <p style={{ color: '#dc2626', marginBottom: '20px' }}>{error || 'Event not found'}</p>
          <p><a href="/" style={{ color: '#2563eb', textDecoration: 'none' }}>← Back to home</a></p>
        </div>
      </div>
    );
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('no-NO');
  };

  return (
    <div style={{ minHeight: '100vh', padding: '20px', background: '#eff6ff' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', background: '#ffffff', padding: '32px 24px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '8px', color: '#2563eb' }}>Event Control Panel</h1>

        <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#111827' }}>{stats.event.title}</h2>
        <p style={{ marginBottom: '8px' }}>Event Code: <span className="code">{stats.event.code}</span></p>
        <p style={{ marginBottom: '16px' }}>
          Event link:{' '}
          {eventUrl ? (
            <a 
              href={eventUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ 
                color: '#2563eb', 
                textDecoration: 'none',
                wordBreak: 'break-all'
              }}
              className="code"
            >
              {eventUrl}
            </a>
          ) : (
            <span className="code">/e/{stats.event.code}</span>
          )}
        </p>
        {qrDataUrl && (
          <div style={{ marginTop: '16px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '15px' }}>
            <img src={qrDataUrl} alt="Event QR code" width={220} height={220} />
            <div style={{ color: '#64748b' }}>
              <div><strong>Scan to join</strong></div>
              <div style={{ fontSize: '0.9em', marginTop: '6px' }}>
                Works locally and on Vercel
              </div>
            </div>
          </div>
        )}
        <p style={{ marginBottom: '8px' }}>
          Status: <strong>{stats.event.status}</strong>
          {lastRefresh && (
            <span style={{ color: '#64748b', fontSize: '0.85em', marginLeft: '10px' }}>
              (Last updated: {lastRefresh.toLocaleTimeString()})
            </span>
          )}
        </p>
        <p style={{ marginBottom: '32px' }}>Price per ticket: <strong>{stats.event.price_nok} NOK</strong></p>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '15px', 
          marginTop: '30px' 
        }}>
          <div style={{ padding: '20px', background: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe', textAlign: 'center' }}>
            <div style={{ fontSize: '2em', fontWeight: 'bold', color: '#2563eb' }}>
              {stats.stats.total_orders}
            </div>
            <div style={{ color: '#64748b', marginTop: '5px' }}>Total Orders</div>
          </div>

          <div style={{ padding: '20px', background: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe', textAlign: 'center' }}>
            <div style={{ fontSize: '2em', fontWeight: 'bold', color: '#2563eb' }}>
              {stats.stats.total_tickets}
            </div>
            <div style={{ color: '#64748b', marginTop: '5px' }}>Tickets Sold</div>
          </div>

          <div style={{ padding: '20px', background: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe', textAlign: 'center' }}>
            <div style={{ fontSize: '2em', fontWeight: 'bold', color: '#2563eb' }}>
              {stats.stats.total_revenue} NOK
            </div>
            <div style={{ color: '#64748b', marginTop: '5px' }}>Total Revenue</div>
          </div>

          <div style={{ padding: '20px', background: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe', textAlign: 'center' }}>
            <div style={{ fontSize: '2em', fontWeight: 'bold', color: '#2563eb' }}>
              {stats.stats.unique_buyers}
            </div>
            <div style={{ color: '#64748b', marginTop: '5px' }}>Unique Buyers</div>
          </div>
          <div style={{ padding: '20px', background: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe', textAlign: 'center' }}>
            <div style={{ fontSize: '2em', fontWeight: 'bold', color: '#2563eb' }}>
              {stats.stats.remaining_tickets}
            </div>
            <div style={{ color: '#64748b', marginTop: '5px' }}>Remaining Tickets</div>
          </div>
        </div>

        <h3 style={{ fontSize: '20px', fontWeight: '600', marginTop: '32px', marginBottom: '16px', color: '#2563eb' }}>Recent Purchases</h3>
        {stats.recent_orders.length === 0 ? (
          <p style={{ color: '#64748b', fontStyle: 'italic' }}>No purchases yet</p>
        ) : (
          <div style={{ marginTop: '15px' }}>
            {stats.recent_orders.map((order) => (
              <div
                key={order.id}
                style={{
                  padding: '15px',
                  background: '#f9fafb',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  marginBottom: '10px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <strong>{order.buyer_name}</strong>
                  <div style={{ color: '#64748b', fontSize: '0.9em', marginTop: '5px' }}>
                    {order.qty} ticket{order.qty > 1 ? 's' : ''} • {order.amount_nok} NOK
                  </div>
                </div>
                <div style={{ color: '#64748b', fontSize: '0.9em' }}>
                  {formatDateTime(order.created_at)}
                </div>
              </div>
            ))}
          </div>
        )}

        <h3 style={{ fontSize: '20px', fontWeight: '600', marginTop: '40px', marginBottom: '16px', color: '#2563eb' }}>Draw Control</h3>
        {drawError && (
          <div style={{ 
            background: '#fee2e2', 
            color: '#dc2626', 
            padding: '12px 16px', 
            borderRadius: '8px',
            marginBottom: '16px',
            fontSize: '14px'
          }}>
            {drawError}
          </div>
        )}
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginTop: '15px' }}>
          <button 
            onClick={handleDrawNext} 
            disabled={drawing || stats.stats.remaining_tickets === 0}
            className="blue-button"
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: '600',
              color: '#ffffff',
              background: (drawing || stats.stats.remaining_tickets === 0) ? '#93c5fd' : '#2563eb',
              border: 'none',
              borderRadius: '8px',
              cursor: (drawing || stats.stats.remaining_tickets === 0) ? 'not-allowed' : 'pointer',
              opacity: (drawing || stats.stats.remaining_tickets === 0) ? 0.7 : 1,
              transition: 'background 0.2s'
            }}
          >
            {drawing
              ? 'Drawing...'
              : stats.stats.remaining_tickets === 0
                ? 'All Tickets Drawn'
                : 'Draw Next Ticket'}
          </button>
          <div style={{ color: '#64748b' }}>
            Draws completed: {stats.stats.total_draws}
          </div>
        </div>

        <h3 style={{ fontSize: '20px', fontWeight: '600', marginTop: '40px', marginBottom: '16px', color: '#2563eb' }}>Drawn Tickets</h3>
        {stats.draws.length === 0 ? (
          <p style={{ color: '#64748b', fontStyle: 'italic' }}>No tickets drawn yet</p>
        ) : (
          <div style={{ marginTop: '15px' }}>
            {stats.draws.map((draw) => (
              <div
                key={draw.id}
                style={{
                  padding: '15px',
                  background: '#f9fafb',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  marginBottom: '10px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <strong>Ticket #{draw.winning_ticket_number}</strong>
                  <div style={{ color: '#64748b', fontSize: '0.9em', marginTop: '5px' }}>
                    Method: {draw.method}
                  </div>
                  <div style={{ color: '#64748b', fontSize: '0.9em', marginTop: '5px' }}>
                    Winner: {draw.winner_name || 'Anonymous'}
                  </div>
                </div>
                <div style={{ color: '#64748b', fontSize: '0.9em' }}>
                  {formatDateTime(draw.drawn_at)}
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: '32px', paddingTop: '20px', borderTop: '1px solid #e5e7eb' }}>
          <p style={{ margin: 0 }}>
            <a href="/" style={{ color: '#2563eb', textDecoration: 'none' }}>← Back to home</a>
          </p>
        </div>
      </div>
    </div>
  );
}
