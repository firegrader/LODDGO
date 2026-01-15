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
      <main>
        <h1>Loading...</h1>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main>
        <h1>Order Not Found</h1>
        <p className="error">{error || 'The order you are looking for does not exist.'}</p>
        <p><a href="/">← Back to home</a></p>
      </main>
    );
  }

  return (
    <main>
      <h1>You are in! Good luck!</h1>

      <h2>You have {totalTickets} ticket{totalTickets === 1 ? '' : 's'}</h2>
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
        <div style={{ marginTop: '30px', padding: '16px', background: '#f9fafb', borderRadius: '8px' }}>
          <h2>Buy More Tickets</h2>
          {moreError && <div className="error">{moreError}</div>}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setMoreQty((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
                style={{ width: '36px', height: '36px' }}
              >
                -
              </button>
              <input
                type="number"
                min="1"
                value={moreQty}
                onChange={(e) => setMoreQty(Math.max(1, Number(e.target.value) || 1))}
                style={{ width: '60px', textAlign: 'center', height: '36px' }}
              />
              <button
                type="button"
                onClick={() => setMoreQty((q) => q + 1)}
                aria-label="Increase quantity"
                style={{ width: '36px', height: '36px' }}
              >
                +
              </button>
              <div style={{ marginLeft: 'auto', marginRight: '10px' }}>
                Total: <strong>{(event.price_nok ?? 0) * moreQty} NOK</strong>
              </div>
              <button type="submit" disabled={buyingMore} style={{ width: '90px', height: '36px' }}>
                {buyingMore ? '...' : 'Buy'}
              </button>
            </div>
          </form>
        </div>
      )}

      <p style={{ marginTop: '10px' }}>
        <a href={`/order/${order.id}/purchases`}>Your purchases →</a>
      </p>

      {event && (
        <p>
          <a href={`/e/${event.code}/result`}>View draw results →</a>
        </p>
      )}

    </main>
  );
}
