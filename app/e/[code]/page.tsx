/**
 * Buy Tickets Page
 * /e/[code]
 */

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface Event {
  id: string;
  code: string;
  title: string;
  price_nok: number;
  status: string;
}

export default function BuyPage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;
  
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [buying, setBuying] = useState(false);
  const [qty, setQty] = useState(1);
  const [buyerName, setBuyerName] = useState('');

  useEffect(() => {
    fetch(`/api/events/${code}`)
      .then(res => {
        if (!res.ok) {
          throw new Error('Event not found');
        }
        return res.json();
      })
      .then(data => {
        setEvent(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [code]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBuying(true);
    setError(null);

    try {
      console.log('Submitting purchase:', { event_code: code, qty, buyer_display_name: buyerName });
      
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_code: code,
          qty: qty,
          buyer_display_name: buyerName || null,
        }),
      });

      const data = await response.json();
      console.log('Purchase response:', { status: response.status, data });

      if (!response.ok) {
        const errorMsg = data.error || `Failed to purchase tickets (${response.status})`;
        console.error('Purchase failed:', errorMsg);
        throw new Error(errorMsg);
      }

      console.log('Purchase successful, redirecting to:', `/order/${data.order.id}`);
      // Redirect to confirmation page
      router.push(`/order/${data.order.id}`);
    } catch (err: any) {
      console.error('Purchase error:', err);
      setError(err.message || 'An unexpected error occurred. Please try again.');
      setBuying(false);
    }
  };

  if (loading) {
    return (
      <main>
        <h1>Loading...</h1>
      </main>
    );
  }

  if (error || !event) {
    return (
      <main>
        <h1>Event Not Found</h1>
        <p className="error">{error || 'The event you are looking for does not exist.'}</p>
        <p><a href="/">← Back to home</a></p>
      </main>
    );
  }

  if (event.status !== 'live') {
    return (
      <main>
        <h1>{event.title}</h1>
        <p className="error">This event is not currently accepting ticket purchases. Status: {event.status}</p>
        <p><a href="/">← Back to home</a></p>
      </main>
    );
  }

  const total = event.price_nok * qty;

  return (
    <main>
      <h1>{event.title}</h1>
      <p>Price per ticket: <strong>{event.price_nok} NOK</strong></p>
      
      {error && (
        <div className="error" style={{ marginBottom: '20px', padding: '15px' }}>
          <strong>Error:</strong> {error}
          <br />
          <small style={{ marginTop: '10px', display: 'block' }}>
            Check the browser console (F12) for more details.
          </small>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <label htmlFor="buyerName">Your Name (optional):</label>
        <input
          type="text"
          id="buyerName"
          value={buyerName}
          onChange={(e) => setBuyerName(e.target.value)}
          placeholder="Enter your name"
        />

        <label htmlFor="qty">Number of Tickets:</label>
        <select
          id="qty"
          value={qty}
          onChange={(e) => setQty(Number(e.target.value))}
        >
          {Array.from({ length: 10 }, (_, i) => i + 1).map(num => (
            <option key={num} value={num}>{num}</option>
          ))}
        </select>

        <p><strong>Total: {total} NOK</strong></p>

        <button type="submit" disabled={buying}>
          {buying ? 'Processing...' : 'Buy Tickets'}
        </button>
      </form>

      <p style={{ marginTop: '20px' }}>
        <a href="/">← Back to home</a>
      </p>
    </main>
  );
}
