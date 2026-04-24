'use client';

import AgentLeadForm from '@/components/AgentLeadForm';

export default function AgentPage() {
  return (
    <div className="container">
      <header style={{ textAlign: 'center', marginBottom: '60px' }}>
        <h1 className="outfit-font" style={{ fontSize: '32px', fontWeight: '800', marginBottom: '12px', color: 'var(--color-text-main)' }}>
          Lead Intake Form
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '15px' }}>
          Submit lead details after your call. The quality analyst will review and score the recording.
        </p>
      </header>

      <main>
        <AgentLeadForm />
      </main>

      <footer style={{ marginTop: '80px', textAlign: 'center', fontSize: '12px', color: 'var(--color-text-muted)' }}>
        <p>A product by SalesGarners</p>
      </footer>
    </div>
  );
}
