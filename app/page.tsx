export default function Home() {
  return (
    <main>
      <h1>LODDGO</h1>
      <p>Live raffle app for school and club fundraisers</p>
      
      <h2>Quick Start Guide</h2>
      
      <div style={{ marginTop: '30px' }}>
        <h3>Step 1: Create an Event (Organizer)</h3>
        <p>Go to the admin page to create a new raffle event:</p>
        <p><a href="/admin" style={{ display: 'inline-block', padding: '10px 20px', background: '#2563eb', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>Create Event →</a></p>
      </div>

      <div style={{ marginTop: '30px' }}>
        <h3>Step 2: Monitor Event (Organizer)</h3>
        <p>After creating an event, open the control panel to monitor in real-time:</p>
        <p>Control Panel: <span className="code">/e/[event-code]/control</span></p>
        <p>Shows: Total orders, tickets sold, revenue, and recent purchases</p>
      </div>

      <div style={{ marginTop: '30px' }}>
        <h3>Step 3: Buy Tickets (Participants)</h3>
        <p>Participants visit the event page using the event code:</p>
        <p>Example: <span className="code">/e/TEST001</span></p>
        <p>Or use an existing test event: <a href="/e/TEST001">/e/TEST001</a></p>
      </div>

      <div style={{ marginTop: '30px' }}>
        <h3>Step 4: View Results</h3>
        <p>After a draw is run, view results at:</p>
        <p><span className="code">/e/[event-code]/result</span></p>
        <p>Example: <a href="/e/TEST001/result">/e/TEST001/result</a></p>
      </div>

      <div style={{ marginTop: '40px', padding: '20px', background: '#f9fafb', borderRadius: '4px' }}>
        <h3>Testing Flow:</h3>
        <ol style={{ marginLeft: '20px', marginTop: '10px' }}>
          <li>Organizer creates event at <a href="/admin">/admin</a></li>
          <li>Organizer opens control panel at <span className="code">/e/[code]/control</span> to monitor</li>
          <li>Share event code with participants</li>
          <li>Participants buy tickets at <span className="code">/e/[code]</span></li>
          <li>Participants see confirmation at <span className="code">/order/[id]</span></li>
          <li>Organizer monitors purchases in real-time on control panel</li>
          <li>Organizer runs draw via API</li>
          <li>Everyone views results at <span className="code">/e/[code]/result</span></li>
        </ol>
      </div>

      <div style={{ marginTop: '30px', padding: '15px', background: '#eff6ff', borderRadius: '4px' }}>
        <h3>For Developers:</h3>
        <p>API endpoints are available. See <span className="code">API_TESTING.md</span> for details.</p>
      </div>
    </main>
  );
}
