/**
 * Draw Result Page
 * /e/[code]/result
 */

'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface DrawResult {
  draw: {
    winning_ticket_number: number;
    method: string;
    drawn_at: string;
  };
  winner: {
    buyer_display_name: string | null;
    order_id: string;
    tickets_purchased: number;
    order_date: string;
  } | null;
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

  const drawDate = new Date(result.draw.drawn_at).toLocaleString('no-NO');

  return (
    <main>
      <h1>Draw Result</h1>
      <h2>{result.event.title}</h2>

      <div className="success" style={{ fontSize: '1.2em', padding: '20px', textAlign: 'center' }}>
        <p><strong>Winning Ticket Number:</strong></p>
        <p style={{ fontSize: '2em', fontWeight: 'bold', color: '#2563eb' }}>
          #{result.draw.winning_ticket_number}
        </p>
      </div>

      {result.winner && (
        <div>
          <h2>Winner</h2>
          {result.winner.buyer_display_name ? (
            <p><strong>Name:</strong> {result.winner.buyer_display_name}</p>
          ) : (
            <p><strong>Name:</strong> Not provided</p>
          )}
          <p><strong>Tickets Purchased:</strong> {result.winner.tickets_purchased}</p>
          <p><strong>Order Date:</strong> {new Date(result.winner.order_date).toLocaleString('no-NO')}</p>
        </div>
      )}

      <div style={{ marginTop: '20px', padding: '15px', background: '#f9fafb', borderRadius: '4px' }}>
        <p><strong>Draw Method:</strong> {result.draw.method}</p>
        <p><strong>Drawn At:</strong> {drawDate}</p>
      </div>

      <p style={{ marginTop: '20px' }}>
        <a href={`/e/${code}`}>← Back to event</a>
      </p>
      <p>
        <a href="/">← Back to home</a>
      </p>
    </main>
  );
}
