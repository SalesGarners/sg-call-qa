import React, { useCallback } from 'react';
import { Upload, X, FileText, ChevronRight, Settings } from 'lucide-react';
import { AIProvider } from '@/types';

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
  leadData: any;
  setLeadData: (data: any) => void;
}

const Step1_Upload: React.FC<Step1UploadProps> = ({
  audioFile,
  setAudioFile,
  selectedProvider,
  setSelectedProvider,
  manualTranscript,
  setManualTranscript,
  useManualTranscript,
  setUseManualTranscript,
  onStart,
  leadData,
  setLeadData
}) => {
  const handleLeadChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setLeadData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Strip any non-digit characters and cap at 10 digits
    const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
    setLeadData((prev: any) => ({ ...prev, phone: `+1${digits}` }));
  };

  // Strip the +1 prefix for display in the input
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

  return (
    <div className="card fade-in" style={styles.card}>
      {/* Lead Information */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <FileText size={16} />
          <span style={styles.sectionTitle}>Lead Information</span>
        </div>
        
        <div style={styles.leadGrid}>
          <div style={styles.formGroup}>
            <label style={styles.label}>First Name *</label>
            <input
              type="text"
              name="firstName"
              value={leadData.firstName}
              onChange={handleLeadChange}
              style={styles.input}
              placeholder="John"
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Last Name *</label>
            <input
              type="text"
              name="lastName"
              value={leadData.lastName}
              onChange={handleLeadChange}
              style={styles.input}
              placeholder="Doe"
            />
          </div>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Job Title *</label>
          <input
            type="text"
            name="jobTitle"
            value={leadData.jobTitle}
            onChange={handleLeadChange}
            style={styles.input}
            placeholder="e.g. Managing Partner, Legal Ops Director"
          />
        </div>

        <div style={styles.leadGrid}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Email Address *</label>
            <input
              type="email"
              name="email"
              value={leadData.email}
              onChange={handleLeadChange}
              style={styles.input}
              placeholder="john@company.com"
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Phone Number *</label>
            <div style={styles.phoneInputGroup}>
              <span style={styles.phonePrefix}>+1</span>
              <input
                type="tel"
                name="phone"
                value={phoneDigits}
                onChange={handlePhoneChange}
                style={styles.phoneInput}
                placeholder="(555) 000-0000"
                maxLength={10}
                inputMode="numeric"
              />
            </div>
          </div>
        </div>

        <div style={styles.leadGrid}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Category *</label>
            <select
              name="category"
              value={leadData.category}
              onChange={handleLeadChange}
              style={styles.select}
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
          <div style={styles.formGroup}>
            <label style={styles.label}>Employee Count *</label>
            <input
              id="employeeCount"
              type="number"
              name="employeeCount"
              value={leadData.employeeCount}
              onChange={handleLeadChange}
              style={styles.input}
              placeholder="e.g. 50"
              min={1}
              onKeyDown={(e) => ['-', '+', 'e', 'E', '.'].includes(e.key) && e.preventDefault()}
            />
          </div>
        </div>
      </div>

      {/* Model Configuration */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <Settings size={16} />
          <span style={styles.sectionTitle}>Model Configuration</span>
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>AI Provider</label>
          <select
            value={selectedProvider}
            onChange={(e) => setSelectedProvider(e.target.value as AIProvider)}
            style={styles.select}
          >
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
            backgroundColor: useManualTranscript ? 'var(--color-purple-light)' : 'transparent',
            borderColor: useManualTranscript ? 'var(--color-purple)' : 'var(--color-border)',
            color: useManualTranscript ? 'var(--color-purple)' : 'var(--color-text-muted)',
          }}
        >
          <FileText size={18} />
          {useManualTranscript ? 'Use Audio File instead' : 'Use transcript instead'}
        </button>
      </div>

      {!useManualTranscript ? (
        <div
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
          style={styles.dropzone}
        >
          <input
            type="file"
            id="audio-upload"
            hidden
            accept="audio/*,video/mp4"
            onChange={handleFileChange}
          />

          {!audioFile ? (
            <label htmlFor="audio-upload" style={styles.uploadLabel}>
              <div style={styles.iconCircle}>
                <Upload size={24} color="var(--color-purple)" />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '600' }}>Drop call recording here</h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>
                MP3, WAV, M4A, OGG, FLAC
              </p>
              <span style={styles.browseBtn}>Browse files</span>
            </label>
          ) : (
            <div style={styles.filePreview}>
              <div style={styles.iconCircle}>
                <FileText size={24} color="var(--color-purple)" />
              </div>
              <div style={styles.fileInfo}>
                <p style={{ fontWeight: '600', fontSize: '14px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {audioFile.name}
                </p>
                <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                  {(audioFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setAudioFile(null);
                }}
                style={styles.removeBtn}
              >
                <X size={18} />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div style={styles.manualContainer}>
          <label style={styles.label}>Paste Call Transcript</label>
          <textarea
            placeholder="Paste the conversation text here..."
            value={manualTranscript}
            onChange={(e) => setManualTranscript(e.target.value)}
            style={styles.textarea}
          />
        </div>
      )}

      <button
        className="primary-button"
        disabled={!isFormValid}
        onClick={onStart}
        style={{ width: '100%', marginTop: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
      >
        Analyze Call
        <ChevronRight size={18} />
      </button>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  card: {
    maxWidth: '620px',
    margin: '0 auto',
    overflow: 'hidden',
  },
  toggleRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginBottom: '20px',
  },
  toggleBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid',
    fontSize: '13px',
    fontWeight: '500',
  },
  dropzone: {
    border: '2px dashed var(--color-border)',
    borderRadius: '12px',
    padding: '40px 20px',
    textAlign: 'center',
    transition: 'all 0.2s ease',
    backgroundColor: '#FAFAFA',
  },
  uploadLabel: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    cursor: 'pointer',
  },
  iconCircle: {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    backgroundColor: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
  },
  browseBtn: {
    color: 'var(--color-purple)',
    fontWeight: '600',
    fontSize: '14px',
    textDecoration: 'underline',
  },
  filePreview: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    textAlign: 'left',
    padding: '12px',
    backgroundColor: 'white',
    borderRadius: '8px',
    border: '0.5px solid var(--color-border)',
  },
  fileInfo: {
    flex: 1,
    minWidth: 0,
  },
  removeBtn: {
    padding: '8px',
    backgroundColor: 'transparent',
    border: 'none',
    color: 'var(--color-text-muted)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  manualContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  section: {
    marginBottom: '24px',
    padding: '16px',
    backgroundColor: 'var(--color-bg-app)',
    borderRadius: '8px',
    border: '0.5px solid var(--color-border)',
    overflow: 'hidden',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '16px',
    color: 'var(--color-text-muted)',
  },
  sectionTitle: {
    fontSize: '12px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    minWidth: 0,
  },
  select: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid var(--color-border)',
    backgroundColor: 'white',
    fontSize: '14px',
    color: 'var(--color-text-main)',
    outline: 'none',
    boxSizing: 'border-box',
  },
  label: {
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--color-text-main)',
  },
  textarea: {
    width: '100%',
    height: '200px',
    borderRadius: '8px',
    border: '1px solid var(--color-border)',
    padding: '12px',
    fontSize: '14px',
    fontFamily: 'inherit',
    resize: 'none',
    outline: 'none',
    boxSizing: 'border-box',
  },
  leadGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    marginBottom: '16px',
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid var(--color-border)',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
  },
  phoneInputGroup: {
    display: 'flex',
    alignItems: 'center',
    border: '1px solid var(--color-border)',
    borderRadius: '8px',
    overflow: 'hidden',
    width: '100%',
    boxSizing: 'border-box' as const,
  },
  phonePrefix: {
    padding: '10px 12px',
    backgroundColor: 'var(--color-bg-app)',
    borderRight: '1px solid var(--color-border)',
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--color-text-muted)',
    whiteSpace: 'nowrap' as const,
    userSelect: 'none' as const,
  },
  phoneInput: {
    flex: 1,
    padding: '10px 12px',
    border: 'none',
    outline: 'none',
    fontSize: '14px',
    width: '100%',
    boxSizing: 'border-box' as const,
    backgroundColor: 'white',
  },
};

export default Step1_Upload;

