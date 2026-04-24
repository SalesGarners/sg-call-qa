'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { AnalysisResult } from '@/types';

interface HubspotFormProps {
  analysisResult: AnalysisResult;
}

const HubspotForm: React.FC<HubspotFormProps> = ({ analysisResult }) => {
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    employee_count: '',
    category: 'Other',
    email_notes: analysisResult.reasoning || '',
    qa_score: analysisResult.verdict || '',
    score_attained: analysisResult.score?.toString() || '',
  });

  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMessage('');

    try {
      // Hubspot forms endpoint expects multipart/form-data or application/x-www-form-urlencoded
      // for this specific endpoint they provided
      const hData = new FormData();
      hData.append('0-1/firstname', formData.firstname);
      hData.append('0-1/lastname', formData.lastname);
      hData.append('0-1/email', formData.email);
      hData.append('0-1/phone', formData.phone);
      hData.append('0-1/email_notes', formData.email_notes);
      hData.append('0-1/contact_employee_count', formData.employee_count);
      hData.append('0-1/category', formData.category);
      hData.append('0-1/qa_score', formData.qa_score);
      hData.append('0-1/score_attained', formData.score_attained);
      hData.append('0-1/lead_source', 'Channel Partner');
      hData.append('0-1/converting_asset', 'SalesGarner');

      // Add HubSpot Context
      const hsContext = {
        pageUri: window.location.href,
        pageName: document.title,
        source: 'forms-embed-static'
      };
      hData.append('hs_context', JSON.stringify(hsContext));

      await axios.post(
        'https://forms.hsforms.com/submissions/v3/public/submit/formsnext/multipart/6107502/0bf35c2a-3bb0-4aaf-9acb-9e72c9f1b105',
        hData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      setStatus('success');
    } catch (error: any) {
      console.error('Hubspot Submission Error:', error);
      setStatus('error');
      setErrorMessage(error.response?.data?.message || 'Failed to submit form. Please try again.');
    }
  };

  if (status === 'success') {
    return (
      <div className="card fade-in" style={styles.successCard}>
        <CheckCircle size={48} color="var(--color-green)" style={{ marginBottom: '16px' }} />
        <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>Application Submitted!</h3>
        <p style={{ color: 'var(--color-text-muted)', textAlign: 'center' }}>
          The lead data and QA results have been successfully synced to HubSpot.
        </p>
      </div>
    );
  }

  return (
    <div className="card fade-in" style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>Submit Lead to HubSpot</h3>
        <p style={styles.subtitle}>Keep a record of this recording and AI analysis.</p>
      </div>

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.row}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>First Name *</label>
            <input
              type="text"
              name="firstname"
              value={formData.firstname}
              onChange={handleChange}
              required
              style={styles.input}
              placeholder="John"
            />
          </div>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Last Name *</label>
            <input
              type="text"
              name="lastname"
              value={formData.lastname}
              onChange={handleChange}
              required
              style={styles.input}
              placeholder="Doe"
            />
          </div>
        </div>

        <div style={styles.row}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Email Address *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              style={styles.input}
              placeholder="john@company.com"
            />
          </div>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Phone Number *</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              style={styles.input}
              placeholder="+1 (555) 000-0000"
            />
          </div>
        </div>

        <div style={styles.row}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Category *</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              style={styles.input}
            >
              <option value="Accounting">Accounting</option>
              <option value="Construction Management">Construction Management</option>
              <option value="CRM">CRM</option>
              <option value="HR">HR</option>
              <option value="Insurance">Insurance</option>
              <option value="Legal Practice Management">Legal Practice Management</option>
              <option value="LMS">LMS</option>
              <option value="Manufacturing Software">Manufacturing Software</option>
              <option value="Marketing Automation">Marketing Automation</option>
              <option value="Marketing Software">Marketing Software</option>
              <option value="Medical">Medical</option>
              <option value="Other">Other</option>
              <option value="Payroll for Nannies/Caregivers">Payroll for Nannies/Caregivers</option>
              <option value="Project Management">Project Management</option>
              <option value="Property Management">Property Management</option>
              <option value="Software Development">Software Development</option>
              <option value="ERP">ERP</option>
              <option value="CMMS">CMMS</option>
              <option value="Service Software">Service Software</option>
              <option value="Management Software">Management Software</option>
              <option value="Analytics Tools & Software">Analytics Tools & Software</option>
              <option value="Artificial Intelligence">Artificial Intelligence</option>
              <option value="Auto Repair">Auto Repair</option>
              <option value="Call Center">Call Center</option>
              <option value="Collaboration & Productivity">Collaboration & Productivity</option>
              <option value="Content Management">Content Management</option>
              <option value="Customer Service">Customer Service</option>
              <option value="Cyber Security">Cyber Security</option>
              <option value="E-Commerce">E-Commerce</option>
              <option value="EMR">EMR</option>
              <option value="Enterprise Resource Planning">Enterprise Resource Planning</option>
              <option value="Event Management">Event Management</option>
              <option value="Field Service">Field Service</option>
              <option value="Fleet Management">Fleet Management</option>
              <option value="Non-Profit">Non-Profit</option>
              <option value="Retail POS Systems">Retail POS Systems</option>
              <option value="Sales Tools">Sales Tools</option>
              <option value="Supply Chain Management">Supply Chain Management</option>
              <option value="Corporate Insurance And Risk Management">Corporate Insurance And Risk Management</option>
              <option value="Ecosystem Service Providers">Ecosystem Service Providers</option>
              <option value="Search Result">Search Result</option>
              <option value="Ecommerce Software">Ecommerce Software</option>
              <option value="Best Background Check">Best Background Check</option>
              <option value="Agile Project Management Tools">Agile Project Management Tools</option>
              <option value="ATS">ATS</option>
              <option value="Design Software">Design Software</option>
              <option value="For Marketers">For Marketers</option>
              <option value="Finance">Finance</option>
              <option value="Compliance">Compliance</option>
              <option value="Email Marketing Software">Email Marketing Software</option>
              <option value="Moving Company Software">Moving Company Software</option>
            </select>
          </div>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Employee Count *</label>
            <input
              type="number"
              name="employee_count"
              value={formData.employee_count}
              onChange={handleChange}
              required
              style={styles.input}
              placeholder="e.g. 50"
            />
          </div>
        </div>

        <div style={styles.divider}>AI Result Data (Auto-filled)</div>

        <div style={styles.row}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>QA Score</label>
            <input
              type="text"
              name="qa_score"
              value={formData.qa_score}
              readOnly
              style={{ ...styles.input, backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
            />
          </div>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Score Attained</label>
            <input
              type="text"
              name="score_attained"
              value={formData.score_attained}
              readOnly
              style={{ ...styles.input, backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
            />
          </div>
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.label}>Analyst Notes</label>
          <textarea
            name="email_notes"
            value={formData.email_notes}
            onChange={handleChange}
            style={{ ...styles.input, minHeight: '100px', resize: 'vertical' }}
          />
        </div>

        {status === 'error' && (
          <div style={styles.errorBanner}>
            <AlertCircle size={18} />
            <span>{errorMessage}</span>
          </div>
        )}

        <button
          type="submit"
          className="primary-button"
          disabled={status === 'submitting'}
          style={styles.submitBtn}
        >
          {status === 'submitting' ? (
            <>
              <Loader2 className="animate-spin" size={18} />
              Submitting...
            </>
          ) : (
            <>
              <Send size={18} />
              Submit to HubSpot
            </>
          )}
        </button>
      </form>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    marginTop: '32px',
    padding: '32px',
    border: '1.5px solid var(--color-primary)',
    background: 'rgba(127, 119, 221, 0.02)',
  },
  header: {
    marginBottom: '24px',
    textAlign: 'center',
  },
  title: {
    fontSize: '22px',
    fontWeight: '800',
    color: 'var(--color-text-main)',
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: '14px',
    color: 'var(--color-text-muted)',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  row: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--color-text-main)',
  },
  input: {
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid var(--color-border)',
    fontSize: '14px',
    fontFamily: 'var(--font-inter)',
    transition: 'border-color 0.2s ease',
    outline: 'none',
  },
  divider: {
    fontSize: '12px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    color: 'var(--color-primary)',
    margin: '12px 0 4px 0',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  submitBtn: {
    marginTop: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    width: '100%',
  },
  errorBanner: {
    padding: '12px 16px',
    backgroundColor: 'var(--color-red-bg)',
    color: 'var(--color-red)',
    borderRadius: '8px',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    border: '1px solid var(--color-red)',
  },
  successCard: {
    marginTop: '32px',
    padding: '48px 32px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'var(--color-green-bg)',
    border: '1px solid var(--color-green)',
  }
};

export default HubspotForm;
