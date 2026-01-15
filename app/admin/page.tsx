/**
 * Admin Page - Create Events
 * /admin
 */

'use client';

import { useState } from 'react';

export default function AdminPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    price_nok: 10,
    status: 'live' as 'draft' | 'live' | 'closed' | 'drawn',
  });
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

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

      setSuccess(`Event created successfully!`);
      setGeneratedCode(data.code);
      
      // Clear form (keep price and status for convenience)
      setFormData({
        title: '',
        price_nok: 10,
        status: formData.status,
      });
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
      {success && <div className="success">{success}</div>}

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

      {generatedCode && (
        <div style={{ marginTop: '30px', padding: '15px', background: '#dcfce7', borderRadius: '4px', border: '1px solid #16a34a' }}>
          <h3>Event Created!</h3>
          <p><strong>Event Code:</strong> <span className="code">{generatedCode}</span></p>
          <p>Share this link with participants:</p>
          <p><span className="code">/e/{generatedCode}</span></p>
          <div style={{ marginTop: '15px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <a href={`/e/${generatedCode}`} style={{ padding: '8px 16px', background: '#2563eb', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>
              View Event Page →
            </a>
            <a href={`/e/${generatedCode}/control`} style={{ padding: '8px 16px', background: '#16a34a', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>
              Open Control Panel →
            </a>
          </div>
        </div>
      )}

      {!generatedCode && (
        <div style={{ marginTop: '30px', padding: '15px', background: '#f9fafb', borderRadius: '4px' }}>
          <h3>After Creating:</h3>
          <p>The event code will be automatically generated from your title.</p>
          <p>You'll receive a unique code and shareable link after creation.</p>
        </div>
      )}

      <p style={{ marginTop: '20px' }}>
        <a href="/">← Back to home</a>
      </p>
    </main>
  );
}
