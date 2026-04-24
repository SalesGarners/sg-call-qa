'use client';

import React, { useState } from 'react';
import { FileText, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { LeadData } from '@/types';
import { useSession } from 'next-auth/react';

const INITIAL_LEAD: LeadData = {
// ... (rest same)
  firstName: '',
  lastName: '',
  email: '',
  phone: '+1',
  category: 'Other',
  employeeCount: '',
  jobTitle: '',
};

const CATEGORIES = [
// ... (rest same)
  'Accounting', 'Construction Management', 'CRM', 'HR', 'Insurance',
  'Legal Practice Management', 'LMS', 'Manufacturing Software',
  'Marketing Automation', 'Marketing Software', 'Medical', 'Other',
  'Payroll for Nannies/Caregivers', 'Project Management', 'Property Management',
  'Software Development', 'ERP', 'CMMS', 'Service Software', 'Management Software',
  'Analytics Tools & Software', 'Artificial Intelligence', 'Auto Repair',
  'Call Center', 'Collaboration & Productivity', 'Content Management',
  'Customer Service', 'Cyber Security', 'E-Commerce', 'EMR',
  'Enterprise Resource Planning', 'Event Management', 'Field Service',
  'Fleet Management', 'Non-Profit', 'Retail POS Systems', 'Sales Tools',
  'Supply Chain Management', 'Corporate Insurance And Risk Management',
  'Ecosystem Service Providers', 'Search Result', 'Ecommerce Software',
  'Best Background Check', 'Agile Project Management Tools', 'ATS',
  'Design Software', 'For Marketers', 'Finance', 'Compliance',
  'Email Marketing Software', 'Moving Company Software',
];

export default function AgentLeadForm() {
  const { data: session } = useSession();
  const [leadData, setLeadData] = useState<LeadData>(INITIAL_LEAD);
  const [submitState, setSubmitState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setLeadData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
    setLeadData(prev => ({ ...prev, phone: `+1${digits}` }));
  };

  const phoneDigits = leadData.phone.startsWith('+1') ? leadData.phone.slice(2) : leadData.phone;

  const isValid =
    leadData.firstName.trim() &&
    leadData.lastName.trim() &&
    leadData.email.trim() &&
    leadData.phone.length === 12 &&
    parseInt(leadData.employeeCount) > 0 &&
    leadData.jobTitle.trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitState('loading');
    setErrorMsg('');

    try {
      const res = await fetch('/api/leads/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...leadData,
          addedBy: session?.user?.name || 'Unknown Agent',
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to submit');
      }

      setSubmitState('success');
      setLeadData(INITIAL_LEAD);

      // Reset after 3 seconds to allow another submission
      setTimeout(() => setSubmitState('idle'), 3000);
    } catch (err: any) {
      setSubmitState('error');
      setErrorMsg(err.message || 'Something went wrong');
    }
  };

  if (submitState === 'success') {
    return (
      <div className="card fade-in" style={styles.card}>
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ ...styles.iconCircle, backgroundColor: 'var(--color-green-bg)', margin: '0 auto 16px' }}>
            <CheckCircle2 size={28} color="var(--color-green)" />
          </div>
          <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>Lead Submitted!</h3>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>
            The lead has been saved and is ready for quality analysis.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card fade-in" style={styles.card}>
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <FileText size={16} />
          <span style={styles.sectionTitle}>Lead Information</span>
        </div>

        <div style={styles.leadGrid}>
          <div style={styles.formGroup}>
            <label style={styles.label}>First Name *</label>
            <input type="text" name="firstName" value={leadData.firstName} onChange={handleChange} style={styles.input} placeholder="John" />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Last Name *</label>
            <input type="text" name="lastName" value={leadData.lastName} onChange={handleChange} style={styles.input} placeholder="Doe" />
          </div>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Job Title *</label>
          <input type="text" name="jobTitle" value={leadData.jobTitle} onChange={handleChange} style={styles.input} placeholder="e.g. Managing Partner, HR Director" />
        </div>

        <div style={{ ...styles.leadGrid, marginTop: '16px' }}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Email Address *</label>
            <input type="email" name="email" value={leadData.email} onChange={handleChange} style={styles.input} placeholder="john@company.com" />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Phone Number *</label>
            <div style={styles.phoneInputGroup}>
              <span style={styles.phonePrefix}>+1</span>
              <input
                type="tel" name="phone" value={phoneDigits} onChange={handlePhoneChange}
                style={styles.phoneInput} placeholder="(555) 000-0000" maxLength={10} inputMode="numeric"
              />
            </div>
          </div>
        </div>

        <div style={{ ...styles.leadGrid, marginTop: '16px' }}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Category *</label>
            <select name="category" value={leadData.category} onChange={handleChange} style={styles.select}>
              {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Employee Count *</label>
            <input
              type="number" name="employeeCount" value={leadData.employeeCount} onChange={handleChange}
              style={styles.input} placeholder="e.g. 50" min={1}
              onKeyDown={(e) => ['-', '+', 'e', 'E', '.'].includes(e.key) && e.preventDefault()}
            />
          </div>
        </div>
      </div>

      {submitState === 'error' && (
        <div style={{ backgroundColor: 'var(--color-red-bg)', color: 'var(--color-red)', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={16} /> {errorMsg}
        </div>
      )}

      <button type="submit" className="primary-button" disabled={!isValid || submitState === 'loading'}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
        {submitState === 'loading' ? <Loader2 size={18} className="spin" /> : 'Submit Lead'}
      </button>
    </form>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: { maxWidth: '620px', margin: '0 auto', overflow: 'hidden' },
  section: {
    marginBottom: '24px', padding: '16px', backgroundColor: 'var(--color-bg-app)',
    borderRadius: '8px', border: '0.5px solid var(--color-border)', overflow: 'hidden',
  },
  sectionHeader: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: 'var(--color-text-muted)' },
  sectionTitle: { fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' },
  formGroup: { display: 'flex', flexDirection: 'column', gap: '6px', minWidth: 0 },
  leadGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' },
  label: { fontSize: '13px', fontWeight: '600', color: 'var(--color-text-main)' },
  input: {
    width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--color-border)',
    fontSize: '14px', outline: 'none', boxSizing: 'border-box',
  },
  select: {
    width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--color-border)',
    backgroundColor: 'white', fontSize: '14px', color: 'var(--color-text-main)', outline: 'none', boxSizing: 'border-box',
  },
  phoneInputGroup: {
    display: 'flex', alignItems: 'center', border: '1px solid var(--color-border)',
    borderRadius: '8px', overflow: 'hidden', width: '100%', boxSizing: 'border-box' as const,
  },
  phonePrefix: {
    padding: '10px 12px', backgroundColor: 'var(--color-bg-app)', borderRight: '1px solid var(--color-border)',
    fontSize: '14px', fontWeight: '600', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' as const, userSelect: 'none' as const,
  },
  phoneInput: {
    flex: 1, padding: '10px 12px', border: 'none', outline: 'none', fontSize: '14px',
    width: '100%', boxSizing: 'border-box' as const, backgroundColor: 'white',
  },
  iconCircle: {
    width: '56px', height: '56px', borderRadius: '50%', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
  },
};
