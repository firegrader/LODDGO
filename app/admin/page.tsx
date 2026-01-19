/**
 * Admin Page - Create Events
 * /admin
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    price_nok: 10,
    status: 'live' as 'draft' | 'live' | 'closed' | 'drawn',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create event');
      }

      // Automatically redirect to Event Control Panel
      router.push(`/e/${data.code}/control`);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <main>
      <h1>Create Event</h1>
      <p>Organizer admin page for creating raffle events</p>

      {error && <div className="error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <label htmlFor="title">Event Title:</label>
        <input
          type="text"
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="e.g., School Fundraiser 2024"
          required
        />

        <label htmlFor="price_nok">Price per Ticket (NOK):</label>
        <input
          type="number"
          id="price_nok"
          value={formData.price_nok}
          onChange={(e) => setFormData({ ...formData, price_nok: parseInt(e.target.value) || 0 })}
          min="0"
          required
        />
        <small>Default: 10 NOK</small>

        <label htmlFor="status">Status:</label>
        <select
          id="status"
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
        >
          <option value="draft">Draft</option>
          <option value="live">Live</option>
          <option value="closed">Closed</option>
        </select>

        <button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Event'}
        </button>
      </form>

      <div style={{ marginTop: '30px', padding: '15px', background: '#f9fafb', borderRadius: '4px' }}>
        <h3>After Creating:</h3>
        <p>The event code will be automatically generated from your title.</p>
        <p>You'll be automatically redirected to the Event Control Panel after creation.</p>
      </div>

      <p style={{ marginTop: '20px' }}>
        <a href="/">← Back to home</a>
      </p>
    </main>
  );
}
