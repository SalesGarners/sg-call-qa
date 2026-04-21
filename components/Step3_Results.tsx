'use client';

import React, { useState } from 'react';
import {
  AlertCircle, CheckCircle2, XCircle, RefreshCw,
  MessageSquare, BarChart3, Database, User, Mail,
  Phone, Tag, Users, Send, ChevronRight
} from 'lucide-react';
import axios from 'axios';
import { AnalysisResult } from '@/types';

interface LeadData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  category: string;
  employeeCount: string;
  jobTitle: string;
}

interface Step3ResultsProps {
  analysisResult: AnalysisResult;
  transcript: string;
  onReset: () => void;
  leadId: string | null;
  leadData: LeadData;
  emailStatus: string | null;
}

const Step3_Results: React.FC<Step3ResultsProps> = ({
  analysisResult, transcript, onReset, leadId, leadData, emailStatus
}) => {
  const [activeTab, setActiveTab] = useState<'score' | 'transcript'>('score');
  const [pushStatus, setPushStatus] = useState<'idle' | 'pushing' | 'success' | 'error'>('idle');
  const [pushError, setPushError] = useState('');

  if (!analysisResult) return null;

  const { verdict, score, intent, authority, demo_commitment, timeline, industry_fit, reasoning, risk_level } = analysisResult;

  const getVerdictConfig = () => {
    if (verdict === 'Good to Go (SQL)') return {
      bg: 'var(--color-green-bg)', border: 'var(--color-green)', color: 'var(--color-green)',
      icon: <CheckCircle2 size={20} />, label: 'Good to Go (SQL)',
      guidance: 'Score 70+. Strong potential — proceed with sales follow-up.',
      tagBg: '#d4edda', tagColor: '#155724'
    };
    if (verdict === 'Borderline') return {
      bg: 'var(--color-amber-bg)', border: 'var(--color-amber)', color: 'var(--color-amber)',
      icon: <AlertCircle size={20} />, label: 'Borderline',
      guidance: 'Score 50–69. Review manually — accept if authority is strong.',
      tagBg: '#fff3cd', tagColor: '#856404'
    };
    return {
      bg: 'var(--color-red-bg)', border: 'var(--color-red)', color: 'var(--color-red)',
      icon: <XCircle size={20} />, label: 'Not Qualified',
      guidance: 'Score below 50. Does not meet qualification criteria.',
      tagBg: '#f8d7da', tagColor: '#721c24'
    };
  };

  const verdictConfig = getVerdictConfig();

  const riskColors: Record<string, string> = {
    Low: 'var(--color-green)', Medium: 'var(--color-amber)', High: 'var(--color-red)'
  };

  const metrics = [
    { name: 'Authority',       score: authority,       max: 40, color: '#3B6D11' },
    { name: 'Intent',          score: intent,          max: 25, color: 'var(--color-purple)' },
    { name: 'Demo Commitment', score: demo_commitment, max: 15, color: '#F97316' },
    { name: 'Timeline',        score: timeline,        max: 10, color: '#D97706' },
    { name: 'Industry Fit',    score: industry_fit,    max: 10, color: '#2563EB' },
  ];

  return (
    <div style={styles.wrapper}>

      {/* ── Lead Profile Card ────────────────────────── */}
      <div className="card fade-in" style={styles.profileCard}>
        {/* Header row */}
        <div style={styles.profileHeader}>
          <div style={styles.avatarCircle}>
            <span style={styles.avatarInitials}>
              {leadData.firstName[0]}{leadData.lastName[0]}
            </span>
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={styles.leadName}>{leadData.firstName} {leadData.lastName}</h2>
            <div style={styles.leadMeta}>
              {leadData.jobTitle && (
                <span style={styles.metaChip}>
                  <User size={12} /> {leadData.jobTitle}
                </span>
              )}
              <span style={styles.metaChip}>
                <Tag size={12} /> {leadData.category}
              </span>
              <span style={styles.metaChip}>
                <Users size={12} /> {leadData.employeeCount} employees
              </span>
            </div>
          </div>
          {/* QA Verdict badge */}
          <div style={{
            ...styles.verdictBadge,
            backgroundColor: verdictConfig.tagBg,
            color: verdictConfig.tagColor,
            border: `1px solid ${verdictConfig.color}`,
          }}>
            {verdictConfig.icon}
            <span>{verdictConfig.label}</span>
          </div>
        </div>

        {/* Contact row */}
        <div style={styles.contactRow}>
          <div style={styles.contactItem}>
            <Mail size={14} color="var(--color-text-muted)" />
            <span>{leadData.email}</span>
            {emailStatus && (() => {
              const GREEN = ['Valid', 'Safe to Send'];
              const YELLOW = ['Unknown', 'Catch-All'];
              // Everything else (Invalid, Disposable, Spam Trap, Do Not Mail, Role Account, etc.) → red
              const isGreen  = GREEN.includes(emailStatus);
              const isYellow = YELLOW.includes(emailStatus);
              const bg     = isGreen ? '#d4edda' : isYellow ? '#fff3cd' : '#f8d7da';
              const color  = isGreen ? '#155724' : isYellow ? '#856404' : '#721c24';
              const border = isGreen ? '#3B6D11' : isYellow ? '#D97706' : '#A32D2D';
              return (
                <span style={{ ...styles.emailBadge, backgroundColor: bg, color, border: `1px solid ${border}` }}>
                  ✉ {emailStatus}
                </span>
              );
            })()}
          </div>
          <div style={styles.contactItem}>
            <Phone size={14} color="var(--color-text-muted)" />
            <span>{leadData.phone}</span>
          </div>
        </div>

        {/* Score + Risk strip */}
        <div style={styles.scoreStrip}>
          <div style={styles.scoreBlock}>
            <span style={styles.scoreNumber}>{score}<span style={{ fontSize: '16px', fontWeight: 400 }}>/100</span></span>
            <span style={styles.scoreLabel}>QA Score</span>
          </div>
          <div style={styles.scoreDivider} />
          {/* Score bar only */}
          <div style={{ flex: 1 }}>
            <div style={styles.barTrack}>
              <div style={{
                ...styles.barFill,
                width: `${score}%`,
                backgroundColor: score >= 70 ? 'var(--color-green)' : score >= 40 ? 'var(--color-amber)' : 'var(--color-red)',
              }} />
            </div>
            <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '4px', display: 'block' }}>
              {verdictConfig.guidance}
            </span>
          </div>
        </div>
      </div>

      {/* ── Tab Bar ─────────────────────────────────── */}
      <div style={styles.tabBar}>
        {(['score', 'transcript'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            ...styles.tabBtn,
            borderBottom: activeTab === tab ? '2px solid var(--color-purple)' : '2px solid transparent',
            color: activeTab === tab ? 'var(--color-purple)' : 'var(--color-text-muted)',
            fontWeight: activeTab === tab ? '700' : '500',
          }}>
            {tab === 'score' ? <><BarChart3 size={15} /> Score Breakdown</> : <><MessageSquare size={15} /> Transcript</>}
          </button>
        ))}
      </div>

      {activeTab === 'score' ? (
        <div style={styles.tabContent}>
          {/* Metric bars */}
          <div className="card" style={styles.section}>
            <h3 style={styles.sectionTitle}>Score Breakdown</h3>
            <div style={styles.metricsGrid}>
              {metrics.map(m => (
                <div key={m.name} style={styles.metricRow}>
                  <div style={styles.metricLabelRow}>
                    <span style={styles.metricLabel}>{m.name}</span>
                    <span style={styles.metricValue}>{m.score}<span style={{ fontWeight: 400, color: 'var(--color-text-muted)' }}>/{m.max}</span></span>
                  </div>
                  <div style={styles.barTrack}>
                    <div style={{
                      ...styles.barFill,
                      width: `${(m.score / m.max) * 100}%`,
                      backgroundColor: m.color,
                      transition: 'width 0.8s ease',
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Analyst Notes */}
          <div className="card" style={styles.section}>
            <h3 style={styles.sectionTitle}>Analyst Notes</h3>
            <p style={styles.reasoning}>{reasoning}</p>
          </div>

          {/* CRM Push */}
          {leadId && (
            <div className="card" style={{ ...styles.section, border: '1px solid var(--color-purple)', background: 'rgba(127,119,221,0.03)' }}>
              <div style={styles.crmHeader}>
                <Database size={18} color="var(--color-purple)" />
                <h3 style={styles.sectionTitle}>Push to HubSpot CRM</h3>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '14px' }}>
                Lead is saved locally. Click below to sync it to your HubSpot portal.
              </p>
              {pushStatus === 'success' ? (
                <div style={styles.successBanner}>
                  <CheckCircle2 size={16} />
                  <span>Successfully pushed to HubSpot!</span>
                </div>
              ) : (
                <>
                  <button
                    className="primary-button"
                    disabled={pushStatus === 'pushing'}
                    onClick={async () => {
                      setPushStatus('pushing');
                      try {
                        await axios.post(`/api/leads/${leadId}/push`);
                        setPushStatus('success');
                      } catch (err: any) {
                        setPushStatus('error');
                        setPushError(err.response?.data?.error || 'Failed to push to CRM');
                      }
                    }}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '14px' }}
                  >
                    <Send size={15} />
                    {pushStatus === 'pushing' ? 'Pushing...' : 'Push to HubSpot CRM'}
                  </button>
                  {pushStatus === 'error' && (
                    <p style={{ color: 'var(--color-red)', fontSize: '12px', marginTop: '8px' }}>{pushError}</p>
                  )}
                  {score < 50 && (
                    <p style={{ fontSize: '12px', color: 'var(--color-amber)', marginTop: '8px' }}>
                      ⚠️ Low score — review manually before pushing.
                    </p>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="card fade-in" style={styles.transcriptBox}>
          <h3 style={{ ...styles.sectionTitle, marginBottom: '16px' }}>Call Transcript</h3>
          <p style={styles.transcriptText}>{transcript || 'No transcript available.'}</p>
        </div>
      )}

      {/* Reset */}
      <button className="primary-button" onClick={onReset}
        style={{ marginTop: '32px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
        <RefreshCw size={15} /> Analyze Another Call
      </button>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  wrapper: { maxWidth: '680px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '0' },

  // Profile card
  profileCard: { marginBottom: '0', borderRadius: '12px 12px 0 0', borderBottom: 'none' },
  profileHeader: { display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '16px' },
  avatarCircle: {
    width: '52px', height: '52px', borderRadius: '50%',
    background: 'linear-gradient(135deg, var(--color-purple), #a78bfa)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  avatarInitials: { color: 'white', fontWeight: '700', fontSize: '18px', fontFamily: "'Outfit', sans-serif" },
  leadName: { fontSize: '20px', fontWeight: '700', marginBottom: '6px', color: 'var(--color-text-main)' },
  leadMeta: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  metaChip: {
    display: 'inline-flex', alignItems: 'center', gap: '4px',
    fontSize: '12px', fontWeight: '500', color: 'var(--color-text-muted)',
    backgroundColor: 'var(--color-bg-app)', borderRadius: '99px',
    padding: '3px 10px', border: '1px solid var(--color-border)',
  },
  verdictBadge: {
    display: 'flex', alignItems: 'center', gap: '6px',
    padding: '6px 14px', borderRadius: '99px', fontWeight: '700', fontSize: '13px',
    flexShrink: 0,
  },
  contactRow: { display: 'flex', gap: '24px', marginBottom: '20px', flexWrap: 'wrap' },
  contactItem: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--color-text-muted)' },
  emailBadge: {
    fontSize: '11px', fontWeight: '700', padding: '2px 8px',
    borderRadius: '99px', letterSpacing: '0.3px',
  },
  scoreStrip: {
    display: 'flex', alignItems: 'center', gap: '20px',
    padding: '16px', backgroundColor: 'var(--color-bg-app)',
    borderRadius: '8px', border: '1px solid var(--color-border)',
  },
  scoreBlock: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', minWidth: '70px' },
  scoreNumber: { fontSize: '28px', fontWeight: '800', fontFamily: "'Outfit', sans-serif", color: 'var(--color-text-main)' },
  scoreLabel: { fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--color-text-muted)' },
  scoreDivider: { width: '1px', height: '40px', backgroundColor: 'var(--color-border)' },

  // Tab
  tabBar: {
    display: 'flex', gap: '0',
    backgroundColor: 'white', borderLeft: '0.5px solid var(--color-border)',
    borderRight: '0.5px solid var(--color-border)', borderBottom: '0.5px solid var(--color-border)',
    marginBottom: '20px',
  },
  tabBtn: {
    display: 'flex', alignItems: 'center', gap: '6px',
    padding: '12px 20px', background: 'none', border: 'none',
    fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s',
  },
  tabContent: { display: 'flex', flexDirection: 'column', gap: '16px' },

  // Sections
  section: { marginBottom: '0' },
  sectionTitle: { fontSize: '14px', fontWeight: '700', marginBottom: '14px', color: 'var(--color-text-main)' },

  // Metrics
  metricsGrid: { display: 'flex', flexDirection: 'column', gap: '14px' },
  metricRow: { display: 'flex', flexDirection: 'column', gap: '5px' },
  metricLabelRow: { display: 'flex', justifyContent: 'space-between' },
  metricLabel: { fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: '500' },
  metricValue: { fontSize: '13px', fontWeight: '700', color: 'var(--color-text-main)' },
  barTrack: { height: '7px', backgroundColor: '#F0F0F0', borderRadius: '99px', overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: '99px' },

  // Analyst Notes
  reasoning: { fontSize: '14px', lineHeight: '1.75', color: 'var(--color-text-muted)', whiteSpace: 'pre-wrap' },

  // CRM
  crmHeader: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' },
  successBanner: {
    display: 'flex', alignItems: 'center', gap: '8px',
    color: 'var(--color-green)', fontWeight: '600', fontSize: '14px',
    padding: '10px 14px', backgroundColor: 'var(--color-green-bg)', borderRadius: '8px',
  },

  // Transcript
  transcriptBox: { marginTop: '4px' },
  transcriptText: { fontSize: '14px', lineHeight: '1.8', color: 'var(--color-text-muted)', whiteSpace: 'pre-wrap' },
};

export default Step3_Results;
