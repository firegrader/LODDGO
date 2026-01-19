/**
 * Draw Result Page
 * /e/[code]/result
 */

'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface DrawResult {
  draws: Array<{
    id: string;
    winning_ticket_number: number;
    method: string;
    drawn_at: string;
    winner: {
      buyer_display_name: string | null;
      order_id: string;
      tickets_purchased: number;
      order_date: string;
    } | null;
  }>;
  event: {
    code: string;
    title: string;
  };
}

export default function ResultPage() {
  const params = useParams();
  const code = params.code as string;
  
  const [result, setResult] = useState<DrawResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/events/${code}/result`)
      .then(res => {
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error('Draw not found for this event');
          }
          throw new Error('Failed to load draw result');
        }
        return res.json();
      })
      .then(data => {
        setResult(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [code]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff7ed' }}>
        <div style={{ fontSize: '18px', color: '#64748b' }}>Loading...</div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div style={{ minHeight: '100vh', padding: '20px', background: '#fff7ed' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', background: '#ffffff', padding: '32px 24px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '12px', color: '#f97316' }}>Draw Result</h1>
          <p style={{ color: '#dc2626', marginBottom: '20px' }}>{error || 'No draw result available for this event yet.'}</p>
          <p><a href={`/e/${code}`} style={{ color: '#f97316', textDecoration: 'none' }}>← Back to event</a></p>
          <p style={{ marginTop: '10px' }}><a href="/" style={{ color: '#f97316', textDecoration: 'none' }}>← Back to home</a></p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', padding: '20px', background: '#fff7ed' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', background: '#ffffff', padding: '32px 24px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '8px', color: '#f97316' }}>Draw Result</h1>
        <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '24px', color: '#111827' }}>{result.event.title}</h2>

        <h3 style={{ fontSize: '20px', fontWeight: '600', marginTop: '32px', marginBottom: '16px', color: '#f97316' }}>Drawn Tickets</h3>
        {result.draws.map((draw) => (
          <div
            key={draw.id}
            style={{ marginTop: '16px', padding: '20px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}
          >
            <div style={{ fontSize: '1.1em', padding: '12px', textAlign: 'center', background: '#dcfce7', borderRadius: '8px', marginBottom: '16px' }}>
              <p style={{ marginBottom: '8px', color: '#166534', fontWeight: '500' }}><strong>Winning Ticket Number:</strong></p>
              <p style={{ fontSize: '1.8em', fontWeight: 'bold', color: '#16a34a', margin: 0 }}>
                #{draw.winning_ticket_number}
              </p>
            </div>

            {draw.winner && (
              <div style={{ marginTop: '12px' }}>
                <p style={{ marginBottom: '8px' }}><strong>Winner:</strong> {draw.winner.buyer_display_name || 'Not provided'}</p>
                <p style={{ marginBottom: '8px' }}><strong>Tickets Purchased:</strong> {draw.winner.tickets_purchased}</p>
                <p style={{ marginBottom: '8px' }}><strong>Order Date:</strong> {new Date(draw.winner.order_date).toLocaleString('no-NO')}</p>
              </div>
            )}

            <div style={{ marginTop: '12px', color: '#64748b', fontSize: '14px' }}>
              <p style={{ marginBottom: '4px' }}><strong>Draw Method:</strong> {draw.method}</p>
              <p style={{ margin: 0 }}><strong>Drawn At:</strong> {new Date(draw.drawn_at).toLocaleString('no-NO')}</p>
            </div>
          </div>
        ))}

        <div style={{ marginTop: '32px', paddingTop: '20px', borderTop: '1px solid #e5e7eb' }}>
          <p style={{ marginBottom: '10px' }}>
            <a href={`/e/${code}`} style={{ color: '#f97316', textDecoration: 'none' }}>← Back to event</a>
          </p>
          <p style={{ margin: 0 }}>
            <a href="/" style={{ color: '#f97316', textDecoration: 'none' }}>← Back to home</a>
          </p>
        </div>
      </div>
    </div>
  );
}
