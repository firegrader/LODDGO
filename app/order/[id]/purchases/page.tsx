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
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff7ed' }}>
        <div style={{ fontSize: '18px', color: '#64748b' }}>Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', padding: '20px', background: '#fff7ed' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', background: '#ffffff', padding: '32px 24px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '12px', color: '#f97316' }}>Your Purchases</h1>
          <p style={{ color: '#dc2626', marginBottom: '20px' }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', padding: '20px', background: '#fff7ed' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', background: '#ffffff', padding: '32px 24px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '8px', color: '#f97316' }}>Your Purchases</h1>
        {event && <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '24px', color: '#111827' }}>{event.title}</h2>}

        {purchases.map((purchase) => (
          <div
            key={purchase.id}
            style={{ marginTop: '20px', padding: '20px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}
          >
            <div
              style={{
                fontSize: '1.1em',
                padding: '12px',
                textAlign: 'center',
                background: '#dcfce7',
                color: '#166534',
                borderRadius: '8px',
                marginBottom: '16px'
              }}
            >
              <p style={{ marginBottom: '4px', fontWeight: '600' }}>Thank you for your purchase!</p>
              <p style={{ margin: 0 }}>Your tickets have been purchased successfully.</p>
            </div>

            <div style={{ marginTop: '12px' }}>
              <p style={{ marginBottom: '8px' }}><strong>Order ID:</strong> <span className="code">{purchase.id}</span></p>
              {purchase.buyer_display_name && (
                <p style={{ marginBottom: '8px' }}><strong>Buyer:</strong> {purchase.buyer_display_name}</p>
              )}
              <p style={{ marginBottom: '8px' }}><strong>Number of Tickets:</strong> {purchase.qty}</p>
              <p style={{ marginBottom: '8px' }}><strong>Total Amount:</strong> {purchase.amount_nok} NOK</p>
              <p style={{ marginBottom: '8px' }}><strong>Status:</strong> {purchase.paid ? 'Paid' : 'Pending'}</p>
              <p style={{ margin: 0 }}><strong>Purchased At:</strong> {new Date(purchase.created_at).toLocaleString('no-NO')}</p>
            </div>
          </div>
        ))}

        <div style={{ marginTop: '32px', paddingTop: '20px', borderTop: '1px solid #e5e7eb' }}>
          <p style={{ margin: 0 }}>
            <a href={`/order/${orderId}`} style={{ color: '#f97316', textDecoration: 'none' }}>← Back to tickets</a>
          </p>
        </div>
      </div>
    </div>
  );
}
