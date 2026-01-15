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
      <main>
        <h1>Loading...</h1>
      </main>
    );
  }

  if (error || !result) {
    return (
      <main>
        <h1>Draw Result</h1>
        <p className="error">{error || 'No draw result available for this event yet.'}</p>
        <p><a href={`/e/${code}`}>← Back to event</a></p>
        <p><a href="/">← Back to home</a></p>
      </main>
    );
  }

  return (
    <main>
      <h1>Draw Result</h1>
      <h2>{result.event.title}</h2>

      <h3 style={{ marginTop: '20px' }}>Drawn Tickets</h3>
      {result.draws.map((draw) => (
        <div
          key={draw.id}
          style={{ marginTop: '15px', padding: '15px', background: '#f9fafb', borderRadius: '4px' }}
        >
          <div className="success" style={{ fontSize: '1.1em', padding: '10px', textAlign: 'center' }}>
            <p><strong>Winning Ticket Number:</strong></p>
            <p style={{ fontSize: '1.8em', fontWeight: 'bold', color: '#2563eb' }}>
              #{draw.winning_ticket_number}
            </p>
          </div>

          {draw.winner && (
            <div style={{ marginTop: '10px' }}>
              <p><strong>Winner:</strong> {draw.winner.buyer_display_name || 'Not provided'}</p>
              <p><strong>Tickets Purchased:</strong> {draw.winner.tickets_purchased}</p>
              <p><strong>Order Date:</strong> {new Date(draw.winner.order_date).toLocaleString('no-NO')}</p>
            </div>
          )}

          <div style={{ marginTop: '10px', color: '#64748b' }}>
            <p><strong>Draw Method:</strong> {draw.method}</p>
            <p><strong>Drawn At:</strong> {new Date(draw.drawn_at).toLocaleString('no-NO')}</p>
          </div>
        </div>
      ))}

      <p style={{ marginTop: '20px' }}>
        <a href={`/e/${code}`}>← Back to event</a>
      </p>
      <p>
        <a href="/">← Back to home</a>
      </p>
    </main>
  );
}
