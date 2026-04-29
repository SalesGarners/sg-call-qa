'use client';

import React, { useCallback, useState, useEffect, useRef } from 'react';
import { Upload, X, FileText, ChevronRight, Settings, Search, UserCheck, PenLine, Database } from 'lucide-react';
import { AIProvider, LeadData, LeadRecord } from '@/types';

interface Step1UploadProps {
  audioFile: File | null;
  setAudioFile: (file: File | null) => void;
  selectedProvider: AIProvider;
  setSelectedProvider: (provider: AIProvider) => void;
  manualTranscript: string;
  setManualTranscript: (text: string) => void;
  useManualTranscript: boolean;
  setUseManualTranscript: (use: boolean) => void;
  onStart: () => void;
  leadData: LeadData;
  setLeadData: (data: any) => void;
  selectedLeadId: string | null;
  setSelectedLeadId: (id: string | null) => void;
  selectedLeadStatus: string | null;
  setSelectedLeadStatus: (status: string | null) => void;
}

const CATEGORIES = [
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

const Step1_Upload: React.FC<Step1UploadProps> = ({
  audioFile, setAudioFile, selectedProvider, setSelectedProvider,
  manualTranscript, setManualTranscript, useManualTranscript, setUseManualTranscript,
  onStart, leadData, setLeadData, selectedLeadId, setSelectedLeadId,
  selectedLeadStatus, setSelectedLeadStatus,
}) => {
  const [entryMode, setEntryMode] = useState<'search' | 'manual'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LeadRecord[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/leads?q=${encodeURIComponent(searchQuery.trim())}`);
        const data = await res.json();
        setSearchResults(Array.isArray(data) ? data : []);
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchQuery]);

  const handleSelectLead = (lead: LeadRecord) => {
    setSelectedLeadId(lead.id);
    setSelectedLeadStatus(lead.status);
    setLeadData({
      firstName: lead.firstName,
      lastName: lead.lastName,
      email: lead.email,
      phone: lead.phone,
      category: lead.category,
      employeeCount: lead.employeeCount,
      jobTitle: lead.jobTitle || '',
      aiProvider: lead.aiProvider || '',
    });
    if (lead.aiProvider) {
      setSelectedProvider(lead.aiProvider as AIProvider);
    }
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleClearSelection = () => {
    setSelectedLeadId(null);
    setSelectedLeadStatus(null);
    setLeadData({ firstName: '', lastName: '', email: '', phone: '+1', category: 'Other', employeeCount: '', jobTitle: '' });
    setSearchQuery('');
  };

  const handleLeadChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setLeadData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
    setLeadData((prev: any) => ({ ...prev, phone: `+1${digits}` }));
  };

  const phoneDigits = leadData.phone.startsWith('+1') ? leadData.phone.slice(2) : leadData.phone;

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && (file.type.startsWith('audio/') || file.type === 'video/mp4')) {
      setAudioFile(file);
    }
  }, [setAudioFile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setAudioFile(file);
  };

  const isLeadValid = leadData.firstName && leadData.lastName && leadData.email && leadData.phone.length === 12 && parseInt(leadData.employeeCount) > 0 && leadData.jobTitle;
  const isFormValid = isLeadValid && (useManualTranscript ? manualTranscript.length > 50 : audioFile !== null);

  // Read-only when a lead is selected from search
  const isReadOnly = !!selectedLeadId;

  return (
    <div className="card fade-in" style={styles.card}>
      {/* Lead Information */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <FileText size={16} />
          <span style={styles.sectionTitle}>Lead Information</span>
        </div>

        {/* Mode Toggle */}
        {!isReadOnly && (
          <div style={styles.modeToggle}>
            <button
              type="button"
              onClick={() => { setEntryMode('search'); handleClearSelection(); }}
              style={{
                ...styles.modeBtn,
                backgroundColor: entryMode === 'search' ? 'var(--color-primary-light)' : 'transparent',
                color: entryMode === 'search' ? 'var(--color-primary)' : 'var(--color-text-muted)',
                borderColor: entryMode === 'search' ? 'var(--color-primary)' : 'var(--color-border)',
              }}
            >
              <Search size={14} /> Search Existing Lead
            </button>
            <button
              type="button"
              onClick={() => { setEntryMode('manual'); handleClearSelection(); }}
              style={{
                ...styles.modeBtn,
                backgroundColor: entryMode === 'manual' ? 'var(--color-primary-light)' : 'transparent',
                color: entryMode === 'manual' ? 'var(--color-primary)' : 'var(--color-text-muted)',
                borderColor: entryMode === 'manual' ? 'var(--color-primary)' : 'var(--color-border)',
              }}
            >
              <PenLine size={14} /> Enter Manually
            </button>
          </div>
        )}

        {/* Search Mode */}
        {entryMode === 'search' && !isReadOnly && (
          <div style={{ marginBottom: '16px' }}>
            <div style={styles.searchInputWrapper}>
              <Search size={16} color="var(--color-text-muted)" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={styles.searchInput}
                placeholder="Search by email, name, or phone..."
              />
              {isSearching && <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Searching...</span>}
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div style={styles.resultsContainer}>
                {searchResults.map((lead) => (
                  <button
                    key={lead.id}
                    type="button"
                    onClick={() => handleSelectLead(lead)}
                    style={styles.resultCard}
                    onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.style.backgroundColor = 'var(--color-primary-light)'; }}
                    onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.backgroundColor = 'white'; }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600', fontSize: '14px' }}>{lead.firstName} {lead.lastName}</div>
                      <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{lead.email} · {lead.phone}</div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>{lead.category} · {lead.employeeCount} employees</div>
                    </div>
                    <span style={{
                      fontSize: '11px', fontWeight: '600', padding: '3px 8px', borderRadius: '99px',
                      backgroundColor: lead.status === 'PENDING' ? 'var(--color-amber-bg)' : lead.status === 'ANALYZED' ? 'var(--color-green-bg)' : '#e0e7ff',
                      color: lead.status === 'PENDING' ? 'var(--color-amber)' : lead.status === 'ANALYZED' ? 'var(--color-green)' : '#4338ca',
                    }}>
                      {lead.status}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {searchQuery.trim().length >= 2 && !isSearching && searchResults.length === 0 && (
              <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', textAlign: 'center', padding: '16px 0' }}>
                No leads found. Try a different search or <button type="button" onClick={() => setEntryMode('manual')} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontWeight: '600', cursor: 'pointer', padding: 0, fontSize: '13px' }}>enter details manually</button>.
              </p>
            )}
          </div>
        )}

        {/* Selected Lead Banner */}
        {isReadOnly && (
          <div style={styles.selectedBanner}>
            <UserCheck size={18} color="var(--color-green)" />
            <div style={{ flex: 1 }}>
              <span style={{ fontWeight: '600', fontSize: '14px' }}>{leadData.firstName} {leadData.lastName}</span>
              <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginLeft: '8px' }}>{leadData.email}</span>
            </div>
            <button type="button" onClick={handleClearSelection} style={styles.clearBtn}>
              <X size={14} /> Clear
            </button>
          </div>
        )}

        {/* Lead Form Fields (shown in manual mode OR read-only when lead selected) */}
        {(entryMode === 'manual' || isReadOnly) && (
          <>
            <div style={styles.leadGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>First Name *</label>
                <input type="text" name="firstName" value={leadData.firstName} onChange={handleLeadChange} style={{ ...styles.input, ...(isReadOnly && styles.readOnly) }} placeholder="John" readOnly={isReadOnly} />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Last Name *</label>
                <input type="text" name="lastName" value={leadData.lastName} onChange={handleLeadChange} style={{ ...styles.input, ...(isReadOnly && styles.readOnly) }} placeholder="Doe" readOnly={isReadOnly} />
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Job Title *</label>
              <input type="text" name="jobTitle" value={leadData.jobTitle} onChange={handleLeadChange} style={{ ...styles.input, ...(isReadOnly && styles.readOnly) }} placeholder="e.g. Managing Partner, Legal Ops Director" readOnly={isReadOnly} />
            </div>

            <div style={{ ...styles.leadGrid, marginTop: '16px' }}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Email Address *</label>
                <input type="email" name="email" value={leadData.email} onChange={handleLeadChange} style={{ ...styles.input, ...(isReadOnly && styles.readOnly) }} placeholder="john@company.com" readOnly={isReadOnly} />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Phone Number *</label>
                <div style={styles.phoneInputGroup}>
                  <span style={styles.phonePrefix}>+1</span>
                  <input
                    type="tel" name="phone" value={phoneDigits} onChange={handlePhoneChange}
                    style={{ ...styles.phoneInput, ...(isReadOnly && styles.readOnly) }}
                    placeholder="(555) 000-0000" maxLength={10} inputMode="numeric" readOnly={isReadOnly}
                  />
                </div>
              </div>
            </div>

            <div style={{ ...styles.leadGrid, marginTop: '16px' }}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Category *</label>
                <select name="category" value={leadData.category} onChange={handleLeadChange} style={{ ...styles.select, ...(isReadOnly && styles.readOnly) }} disabled={isReadOnly}>
                  {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Employee Count *</label>
                <input
                  type="number" name="employeeCount" value={leadData.employeeCount} onChange={handleLeadChange}
                  style={{ ...styles.input, ...(isReadOnly && styles.readOnly) }} placeholder="e.g. 50" min={1}
                  onKeyDown={(e) => ['-', '+', 'e', 'E', '.'].includes(e.key) && e.preventDefault()}
                  readOnly={isReadOnly}
                />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Model Configuration */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <Settings size={16} />
          <span style={styles.sectionTitle}>Model Configuration</span>
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>AI Provider</label>
          <select value={selectedProvider} onChange={(e) => setSelectedProvider(e.target.value as AIProvider)} style={styles.select}>
            <option value="groq">Groq (Llama 3.3 70B)</option>
            <option value="gemini">Gemini (Flash-Latest)</option>
            <option value="openai">OpenAI (GPT-4o Mini)</option>
            <option value="claude">Claude (Sonnet 4.6)</option>
          </select>
        </div>
      </div>

      <div style={styles.toggleRow}>
        <button
          onClick={() => setUseManualTranscript(!useManualTranscript)}
          style={{
            ...styles.toggleBtn,
            backgroundColor: useManualTranscript ? 'var(--color-primary-light)' : 'transparent',
            borderColor: useManualTranscript ? 'var(--color-primary)' : 'var(--color-border)',
            color: useManualTranscript ? 'var(--color-primary)' : 'var(--color-text-muted)',
          }}
        >
          <FileText size={18} />
          {useManualTranscript ? 'Use Audio File instead' : 'Use transcript instead'}
        </button>
      </div>

      {!useManualTranscript ? (
        <div onDrop={onDrop} onDragOver={(e) => e.preventDefault()} style={styles.dropzone}>
          <input type="file" id="audio-upload" hidden accept="audio/*,video/mp4" onChange={handleFileChange} />
          {!audioFile ? (
            <label htmlFor="audio-upload" style={styles.uploadLabel}>
              <div style={styles.iconCircle}><Upload size={24} color="var(--color-primary)" /></div>
              <h3 style={{ fontSize: '18px', fontWeight: '600' }}>Drop call recording here</h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>MP3, WAV, M4A, OGG, FLAC</p>
              <span style={styles.browseBtn}>Browse files</span>
            </label>
          ) : (
            <div style={styles.filePreview}>
              <div style={styles.iconCircle}><FileText size={24} color="var(--color-primary)" /></div>
              <div style={styles.fileInfo}>
                <p style={{ fontWeight: '600', fontSize: '14px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{audioFile.name}</p>
                <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{(audioFile.size / (1024 * 1024)).toFixed(2)} MB</p>
              </div>
              <button onClick={(e) => { e.stopPropagation(); setAudioFile(null); }} style={styles.removeBtn}><X size={18} /></button>
            </div>
          )}
        </div>
      ) : (
        <div style={styles.manualContainer}>
          <label style={styles.label}>Paste Call Transcript</label>
          <textarea placeholder="Paste the conversation text here..." value={manualTranscript} onChange={(e) => setManualTranscript(e.target.value)} style={styles.textarea} />
        </div>
      )}

      {selectedLeadStatus === 'PUSHED_TO_CRM' && (
        <div style={{ 
          marginTop: '20px', display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', 
          backgroundColor: '#eff6ff', color: '#1d4ed8', borderRadius: '10px',
          fontSize: '13px', fontWeight: '500', border: '1px solid #dbeafe'
        }}>
          <Database size={16} />
          <span>This lead is already in your CRM. Re-analysis is restricted.</span>
        </div>
      )}

      <button 
        className="primary-button" 
        disabled={!isFormValid || selectedLeadStatus === 'PUSHED_TO_CRM'} 
        onClick={onStart}
        style={{ 
          width: '100%', 
          marginTop: '24px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          gap: '8px',
          opacity: selectedLeadStatus === 'PUSHED_TO_CRM' ? 0.6 : 1
        }}
      >
        Analyze Call <ChevronRight size={18} />
      </button>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  card: { maxWidth: '620px', margin: '0 auto', overflow: 'hidden' },
  modeToggle: { display: 'flex', gap: '8px', marginBottom: '16px' },
  modeBtn: {
    display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px',
    borderRadius: '8px', border: '1px solid', fontSize: '13px', fontWeight: '500', cursor: 'pointer',
    transition: 'all 0.2s', background: 'transparent',
  },
  searchInputWrapper: {
    display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px',
    borderRadius: '8px', border: '1px solid var(--color-border)', backgroundColor: 'white',
  },
  searchInput: {
    flex: 1, border: 'none', outline: 'none', fontSize: '14px', backgroundColor: 'transparent',
  },
  resultsContainer: {
    marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px',
    maxHeight: '250px', overflowY: 'auto',
  },
  resultCard: {
    display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px',
    borderRadius: '8px', border: '1px solid var(--color-border)', backgroundColor: 'white',
    cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s', width: '100%',
  },
  selectedBanner: {
    display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px',
    borderRadius: '8px', backgroundColor: 'var(--color-green-bg)', border: '1px solid var(--color-green)',
    marginBottom: '16px',
  },
  clearBtn: {
    display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px',
    borderRadius: '6px', border: '1px solid var(--color-border)', backgroundColor: 'white',
    fontSize: '12px', fontWeight: '500', cursor: 'pointer', color: 'var(--color-text-muted)',
  },
  readOnly: {
    backgroundColor: '#f5f5f5', color: 'var(--color-text-muted)', cursor: 'default',
  },
  toggleRow: { display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' },
  toggleBtn: {
    display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px',
    borderRadius: '6px', border: '1px solid', fontSize: '13px', fontWeight: '500',
  },
  dropzone: {
    border: '2px dashed var(--color-border)', borderRadius: '12px', padding: '40px 20px',
    textAlign: 'center', transition: 'all 0.2s ease', backgroundColor: '#FAFAFA',
  },
  uploadLabel: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', cursor: 'pointer' },
  iconCircle: {
    width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'white',
    display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
  },
  browseBtn: { color: 'var(--color-primary)', fontWeight: '600', fontSize: '14px', textDecoration: 'underline' },
  filePreview: {
    display: 'flex', alignItems: 'center', gap: '16px', textAlign: 'left', padding: '12px',
    backgroundColor: 'white', borderRadius: '8px', border: '0.5px solid var(--color-border)',
  },
  fileInfo: { flex: 1, minWidth: 0 },
  removeBtn: {
    padding: '8px', backgroundColor: 'transparent', border: 'none',
    color: 'var(--color-text-muted)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  manualContainer: { display: 'flex', flexDirection: 'column', gap: '8px' },
  section: {
    marginBottom: '24px', padding: '16px', backgroundColor: 'var(--color-bg-app)',
    borderRadius: '8px', border: '0.5px solid var(--color-border)', overflow: 'hidden',
  },
  sectionHeader: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: 'var(--color-text-muted)' },
  sectionTitle: { fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' },
  formGroup: { display: 'flex', flexDirection: 'column', gap: '6px', minWidth: 0 },
  select: {
    width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--color-border)',
    backgroundColor: 'white', fontSize: '14px', color: 'var(--color-text-main)', outline: 'none', boxSizing: 'border-box',
  },
  label: { fontSize: '13px', fontWeight: '600', color: 'var(--color-text-main)' },
  textarea: {
    width: '100%', height: '200px', borderRadius: '8px', border: '1px solid var(--color-border)',
    padding: '12px', fontSize: '14px', fontFamily: 'inherit', resize: 'none', outline: 'none', boxSizing: 'border-box',
  },
  leadGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' },
  input: {
    width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--color-border)',
    fontSize: '14px', outline: 'none', boxSizing: 'border-box',
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
};

export default Step1_Upload;
