/**
 * Purchases Page
 * /order/[id]/purchases
 */

'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface Purchase {
  id: string;
  buyer_display_name: string | null;
  qty: number;
  amount_nok: number;
  paid: boolean;
  created_at: string;
}

interface EventInfo {
  code: string;
  title: string;
  price_nok: number;
}

export default function PurchasesPage() {
  const params = useParams();
  const orderId = params.id as string;

  const [event, setEvent] = useState<EventInfo | null>(null);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/orders/${orderId}/purchases?t=${Date.now()}`, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error('Purchases not found');
        }
        return res.json();
      })
      .then((data) => {
        setEvent(data.event);
        setPurchases(data.purchases || []);
        setLoading(false);
        setError(null);
      })
      .catch((err) => {
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

  if (error) {
    return (
      <main>
        <h1>Your Purchases</h1>
        <p className="error">{error}</p>
      </main>
    );
  }

  return (
    <main>
      <h1>Your Purchases</h1>
      {event && <h2>{event.title}</h2>}

      {purchases.map((purchase) => (
        <div
          key={purchase.id}
          style={{ marginTop: '20px', padding: '15px', background: '#f9fafb', borderRadius: '4px' }}
        >
          <div
            className="success"
            style={{
              fontSize: '1.1em',
              padding: '12px',
              textAlign: 'center',
              background: '#dcfce7',
              color: '#166534',
            }}
          >
            <p><strong>Thank you for your purchase!</strong></p>
            <p>Your tickets have been purchased successfully.</p>
          </div>

          <div style={{ marginTop: '10px' }}>
            <p><strong>Order ID:</strong> <span className="code">{purchase.id}</span></p>
            {purchase.buyer_display_name && (
              <p><strong>Buyer:</strong> {purchase.buyer_display_name}</p>
            )}
            <p><strong>Number of Tickets:</strong> {purchase.qty}</p>
            <p><strong>Total Amount:</strong> {purchase.amount_nok} NOK</p>
            <p><strong>Status:</strong> {purchase.paid ? 'Paid' : 'Pending'}</p>
            <p><strong>Purchased At:</strong> {new Date(purchase.created_at).toLocaleString('no-NO')}</p>
          </div>
        </div>
      ))}

      <p style={{ marginTop: '20px' }}>
        <a href={`/order/${orderId}`}>← Back to tickets</a>
      </p>
    </main>
  );
}
