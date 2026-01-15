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
}

export default function OrderPage() {
  const params = useParams();
  const orderId = params.id as string;
  
  const [order, setOrder] = useState<Order | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/orders/${orderId}`)
      .then(res => {
        if (!res.ok) {
          throw new Error('Order not found');
        }
        return res.json();
      })
      .then(data => {
        setOrder(data.order);
        setTickets(data.tickets);
        setEvent(data.event);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [orderId]);

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
      <h1>Order Confirmed!</h1>
      <div className="success">
        <p><strong>Thank you for your purchase!</strong></p>
        <p>Your tickets have been purchased successfully.</p>
      </div>

      <h2>Order Details</h2>
      <p><strong>Order ID:</strong> <span className="code">{order.id}</span></p>
      {order.buyer_display_name && (
        <p><strong>Buyer:</strong> {order.buyer_display_name}</p>
      )}
      <p><strong>Number of Tickets:</strong> {order.qty}</p>
      <p><strong>Total Amount:</strong> {order.amount_nok} NOK</p>
      <p><strong>Status:</strong> {order.paid ? 'Paid' : 'Pending'}</p>

      <h2>Your Tickets</h2>
      <ul className="ticket-list">
        {tickets.map((ticket) => (
          <li key={ticket.id}>
            Ticket #{ticket.ticket_number}
          </li>
        ))}
      </ul>

      {event && (
        <p>
          <a href={`/e/${event.code}/result`}>View draw results →</a>
        </p>
      )}

      <p style={{ marginTop: '20px' }}>
        <a href="/">← Back to home</a>
      </p>
    </main>
  );
}
