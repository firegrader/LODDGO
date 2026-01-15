/**
 * Event Control Panel - Real-time monitoring for organizers
 * /e/[code]/control
 */

'use client';

import { useEffect, useState } from 'react';
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
  }>;
}

export default function ControlPanel() {
  const params = useParams();
  const code = params.code as string;
  
  const [stats, setStats] = useState<EventStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [drawError, setDrawError] = useState<string | null>(null);
  const [drawing, setDrawing] = useState(false);

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

    // Auto-refresh every 3 seconds if enabled
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(fetchStats, 3000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [code, autoRefresh]);

  if (loading && !stats) {
    return (
      <main>
        <h1>Loading Control Panel...</h1>
      </main>
    );
  }

  if (error || !stats) {
    return (
      <main>
        <h1>Event Control Panel</h1>
        <p className="error">{error || 'Event not found'}</p>
        <p><a href="/">← Back to home</a></p>
      </main>
    );
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('no-NO');
  };

  return (
    <main>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Event Control Panel</h1>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '5px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            <span>Auto-refresh (3s)</span>
          </label>
          {lastRefresh && (
            <small style={{ color: '#64748b', fontSize: '0.85em' }}>
              Last updated: {lastRefresh.toLocaleTimeString()}
            </small>
          )}
        </div>
      </div>

      <h2>{stats.event.title}</h2>
      <p>Event Code: <span className="code">{stats.event.code}</span></p>
      <p>Status: <strong>{stats.event.status}</strong></p>
      <p>Price per ticket: <strong>{stats.event.price_nok} NOK</strong></p>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '15px', 
        marginTop: '30px' 
      }}>
        <div style={{ padding: '20px', background: '#eff6ff', borderRadius: '4px', textAlign: 'center' }}>
          <div style={{ fontSize: '2em', fontWeight: 'bold', color: '#2563eb' }}>
            {stats.stats.total_orders}
          </div>
          <div style={{ color: '#64748b', marginTop: '5px' }}>Total Orders</div>
        </div>

        <div style={{ padding: '20px', background: '#f0fdf4', borderRadius: '4px', textAlign: 'center' }}>
          <div style={{ fontSize: '2em', fontWeight: 'bold', color: '#16a34a' }}>
            {stats.stats.total_tickets}
          </div>
          <div style={{ color: '#64748b', marginTop: '5px' }}>Tickets Sold</div>
        </div>

        <div style={{ padding: '20px', background: '#fef3c7', borderRadius: '4px', textAlign: 'center' }}>
          <div style={{ fontSize: '2em', fontWeight: 'bold', color: '#d97706' }}>
            {stats.stats.total_revenue} NOK
          </div>
          <div style={{ color: '#64748b', marginTop: '5px' }}>Total Revenue</div>
        </div>

        <div style={{ padding: '20px', background: '#fce7f3', borderRadius: '4px', textAlign: 'center' }}>
          <div style={{ fontSize: '2em', fontWeight: 'bold', color: '#db2777' }}>
            {stats.stats.unique_buyers}
          </div>
          <div style={{ color: '#64748b', marginTop: '5px' }}>Unique Buyers</div>
        </div>
        <div style={{ padding: '20px', background: '#ede9fe', borderRadius: '4px', textAlign: 'center' }}>
          <div style={{ fontSize: '2em', fontWeight: 'bold', color: '#7c3aed' }}>
            {stats.stats.remaining_tickets}
          </div>
          <div style={{ color: '#64748b', marginTop: '5px' }}>Remaining Tickets</div>
        </div>
      </div>

      <h3 style={{ marginTop: '40px' }}>Recent Purchases</h3>
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
                borderRadius: '4px',
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

      <h3 style={{ marginTop: '40px' }}>Draw Control</h3>
      {drawError && <div className="error">{drawError}</div>}
      <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginTop: '15px' }}>
        <button onClick={handleDrawNext} disabled={drawing || stats.stats.remaining_tickets === 0}>
          {drawing ? 'Drawing...' : 'Draw Next Winner'}
        </button>
        <div style={{ color: '#64748b' }}>
          Draws completed: {stats.stats.total_draws}
        </div>
      </div>

      <h3 style={{ marginTop: '30px' }}>Drawn Tickets</h3>
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
                borderRadius: '4px',
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
              </div>
              <div style={{ color: '#64748b', fontSize: '0.9em' }}>
                {formatDateTime(draw.drawn_at)}
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: '30px', padding: '15px', background: '#f9fafb', borderRadius: '4px' }}>
        <h3>Share Event</h3>
        <p>Share this link with participants:</p>
        <p><span className="code">/e/{stats.event.code}</span></p>
        <p><a href={`/e/${stats.event.code}`} target="_blank">Open event page →</a></p>
      </div>

      <div style={{ marginTop: '20px', display: 'flex', gap: '15px' }}>
        <button onClick={fetchStats} style={{ padding: '10px 20px' }}>
          Refresh Now
        </button>
        <a href={`/e/${stats.event.code}`} style={{ padding: '10px 20px', background: '#64748b', color: 'white', textDecoration: 'none', borderRadius: '4px', display: 'inline-block' }}>
          View Event Page
        </a>
        <a href="/" style={{ padding: '10px 20px', color: '#64748b', textDecoration: 'none' }}>
          ← Back to home
        </a>
      </div>
    </main>
  );
}
