/**
 * Order Confirmation Page
 * /order/[id]
 */

'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface Order {
  id: string;
  event_id: string;
  buyer_display_name: string | null;
  qty: number;
  amount_nok: number;
  paid: boolean;
  created_at: string;
}

interface Ticket {
  id: string;
  ticket_number: number;
  created_at: string;
}

interface Event {
  code: string;
  title: string;
  price_nok?: number;
}

interface Draw {
  winning_ticket_number: number;
}

export default function OrderPage() {
  const params = useParams();
  const orderId = params.id as string;
  
  const [order, setOrder] = useState<Order | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [totalTickets, setTotalTickets] = useState(0);
  const [event, setEvent] = useState<Event | null>(null);
  const [draws, setDraws] = useState<Draw[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh] = useState(true);
  const [moreQty, setMoreQty] = useState(1);
  const [buyingMore, setBuyingMore] = useState(false);
  const [moreError, setMoreError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/orders/${orderId}?t=${Date.now()}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
          },
        });
        if (!response.ok) {
          throw new Error('Order not found');
        }
        const data = await response.json();
        setOrder(data.order);
        setTickets(data.tickets);
        setTotalTickets(data.total_tickets || data.tickets?.length || 0);
        setEvent(data.event);
        setDraws(data.draws || []);
        setLoading(false);
        setError(null);
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchOrder();

    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(fetchOrder, 5000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [orderId, autoRefresh]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff7ed' }}>
        <div style={{ fontSize: '18px', color: '#64748b' }}>Loading...</div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div style={{ minHeight: '100vh', padding: '20px', background: '#fff7ed' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', background: '#ffffff', padding: '32px 24px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '12px', color: '#f97316' }}>Order Not Found</h1>
          <p style={{ color: '#dc2626', marginBottom: '20px' }}>{error || 'The order you are looking for does not exist.'}</p>
          <p><a href="/" style={{ color: '#f97316', textDecoration: 'none' }}>← Back to home</a></p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', padding: '20px', background: '#fff7ed' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', background: '#ffffff', padding: '32px 24px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '8px', color: '#f97316' }}>You are in! Good luck!</h1>

        <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '24px', color: '#111827' }}>You have {totalTickets} ticket{totalTickets === 1 ? '' : 's'}</h2>
      <ul className="ticket-list">
        {tickets.map((ticket) => {
          const isWinner = draws.some(
            (draw) => draw.winning_ticket_number === ticket.ticket_number
          );
          return (
            <li key={ticket.id} className={`ticket ${isWinner ? 'ticket-winner' : ''}`}>
              <div className="ticket-left">
                <div className="ticket-label">LODDGO</div>
                <div className="ticket-number">#{ticket.ticket_number}</div>
              </div>
              <div className="ticket-right">
                <div className="ticket-meta">Raffle Ticket</div>
                {isWinner ? (
                  <div className="ticket-badge">WINNER</div>
                ) : (
                  <div className="ticket-status">Active</div>
                )}
              </div>
            </li>
          );
        })}
      </ul>

        {event && (
          <div style={{ marginTop: '32px' }}>
            <h2 style={{ 
              fontSize: '20px', 
              fontWeight: '600', 
              color: '#f97316', 
              marginBottom: '16px' 
            }}>
              More chances to win?
            </h2>

            {moreError && (
              <div style={{ background: '#fee2e2', color: '#dc2626', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>
                {moreError}
              </div>
            )}

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setBuyingMore(true);
                setMoreError(null);

                try {
                  const response = await fetch('/api/orders', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      event_code: event.code,
                      qty: moreQty,
                      buyer_display_name: order.buyer_display_name || null,
                    }),
                  });

                  const data = await response.json();
                  if (!response.ok) {
                    throw new Error(data.error || 'Failed to buy more tickets');
                  }

                  // Go to the new order confirmation page
                  window.location.href = `/order/${data.order.id}`;
                } catch (err: any) {
                  setMoreError(err.message || 'Failed to buy more tickets');
                  setBuyingMore(false);
                }
              }}
            >
              <div style={{ marginBottom: '20px' }}>
                <label style={{ 
                  fontSize: '14px', 
                  color: '#6b7280', 
                  marginBottom: '12px',
                  display: 'block'
                }}>
                  Tickets ({event.price_nok} NOK per ticket)
                </label>
                
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
                    onClick={() => setMoreQty((q) => Math.max(1, q - 1))}
                    aria-label="Decrease quantity"
                    className="qty-button"
                    style={{
                      width: '40px',
                      height: '40px',
                      border: '1px solid #d1d5db',
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
                      transition: 'all 0.2s'
                    }}
                  >
                    -
                  </button>
                  <div style={{ 
                    fontSize: '18px', 
                    fontWeight: '600', 
                    color: '#111827',
                    minWidth: '30px',
                    textAlign: 'center',
                    background: '#ffffff',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    padding: '8px 12px'
                  }}>
                    {moreQty}
                  </div>
                  <button
                    type="button"
                    onClick={() => setMoreQty((q) => q + 1)}
                    aria-label="Increase quantity"
                    className="qty-button"
                    style={{
                      width: '40px',
                      height: '40px',
                      border: '1px solid #d1d5db',
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
                      transition: 'all 0.2s'
                    }}
                  >
                    +
                  </button>
                  <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '16px', color: '#6b7280', fontWeight: '500' }}>Total</span>
                    <span style={{ fontSize: '18px', color: '#f97316', fontWeight: '600' }}>{(event.price_nok ?? 0) * moreQty} NOK</span>
                  </div>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={buyingMore}
                className="vipps-button"
                style={{
                  width: '100%',
                  padding: '16px',
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#ffffff',
                  background: buyingMore ? '#fb923c' : '#f97316',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: buyingMore ? 'not-allowed' : 'pointer',
                  marginBottom: '8px',
                  opacity: buyingMore ? 0.7 : 1,
                  transition: 'background 0.2s'
                }}
              >
                {buyingMore ? 'Processing...' : 'Complete purchase in Vipps'}
              </button>
              
              <p style={{ 
                fontSize: '12px', 
                color: '#9ca3af', 
                textAlign: 'center',
                margin: 0
              }}>
                Secure checkout
              </p>
            </form>
          </div>
        )}

        <div style={{ marginTop: '32px', paddingTop: '20px', borderTop: '1px solid #e5e7eb' }}>
          <p style={{ marginBottom: '10px' }}>
            <a href={`/order/${order.id}/purchases`} style={{ color: '#f97316', textDecoration: 'none' }}>Your purchases →</a>
          </p>

          {event && (
            <p style={{ margin: 0 }}>
              <a href={`/e/${event.code}/result`} style={{ color: '#f97316', textDecoration: 'none' }}>View draw results →</a>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
