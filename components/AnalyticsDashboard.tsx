'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Users, Database, CheckCircle2, CloudUpload, XCircle, 
  Trophy, BarChart3, TrendingUp, AlertCircle, RefreshCcw,
  Calendar, Download, ArrowUpRight, ArrowDownRight, Target
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts';

interface AnalyticsData {
  kpis: {
    totalLeads: number;
    analyzedLeads: number;
    pushedLeads: number;
    disqualifiedLeads: number;
  };
  agentPerformance: Array<{
    agentName: string;
    totalAdded: number;
    analyzedCount: number;
    pushedCount: number;
    avgScore: number | null;
    goodToGoCount: number;
    notQualifiedCount: number;
  }>;
  verdicts: {
    sql: number;
    borderline: number;
    notQualified: number;
  };
}

export default function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchAnalytics = async (silent = false) => {
    if (!silent) setIsLoading(true);
    else setIsRefreshing(true);
    
    setError(null);
    try {
      const response = await axios.get('/api/analytics');
      setData(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load analytics data.');
      console.error(err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (isLoading) {
    return (
      <div style={styles.loadingWrapper}>
        <div className="spin-animation" style={styles.loadingSpinner} />
        <p style={{ color: 'var(--color-text-muted)', fontWeight: '500' }}>Loading overview...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-red)' }}>
        <AlertCircle size={48} style={{ margin: '0 auto 16px' }} />
        <h2 className="outfit-font">Failed to load dashboard</h2>
        <p>{error}</p>
        <button className="primary-button" onClick={() => fetchAnalytics()} style={{ marginTop: '24px' }}>Try Again</button>
      </div>
    );
  }

  if (!data) return null;

  const totalVerdicts = data.verdicts.sql + data.verdicts.borderline + data.verdicts.notQualified;
  const conversionRate = data.kpis.analyzedLeads > 0 
    ? Math.round((data.verdicts.sql / data.kpis.analyzedLeads) * 100) 
    : 0;

  const pieData = [
    { name: 'Qualified (SQL)', value: data.verdicts.sql, color: '#10B981' }, // Green
    { name: 'Borderline', value: data.verdicts.borderline, color: '#F59E0B' }, // Amber
    { name: 'Disqualified', value: data.verdicts.notQualified, color: '#EF4444' }, // Red
  ].filter(item => item.value > 0);

  const agentChartData = data.agentPerformance.map(agent => ({
    name: agent.agentName ? agent.agentName.substring(0, 15) : 'Unknown',
    'Total Leads Added': agent.totalAdded,
    'Pushed to CRM': agent.pushedCount,
  }));

  const today = new Date();
  const dateOptions: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };

  return (
    <div style={styles.container}>
      {/* --- PAGE HEADER --- */}
      <div style={styles.pageHeader}>
        <div>
          <h1 style={styles.pageTitle}>Overview</h1>
          <p style={styles.pageSubtitle}>Track lead volume, quality distribution, and agent performance.</p>
        </div>
        <div style={styles.headerActions}>
          <div style={styles.datePickerFake}>
            <Calendar size={16} />
            <span>Last 30 Days</span>
          </div>
          <button style={styles.iconButton} onClick={() => fetchAnalytics(true)} title="Refresh Data">
            <RefreshCcw size={16} className={isRefreshing ? "spin-animation" : ""} />
          </button>
          <button style={styles.secondaryButton}>
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      {/* --- KPI CARDS ROW --- */}
      <div style={styles.kpiGrid}>
        <div className="saas-card" style={styles.kpiCard}>
          <div style={styles.kpiHeader}>
            <span style={styles.kpiLabel}>Total Leads</span>
            <Database size={16} color="var(--color-text-muted)" />
          </div>
          <div style={styles.kpiBody}>
            <h2 style={styles.kpiValue}>{data.kpis.totalLeads}</h2>
            <span style={styles.kpiTrendPositive}>
              <ArrowUpRight size={14} /> 12% vs last month
            </span>
          </div>
        </div>

        <div className="saas-card" style={styles.kpiCard}>
          <div style={styles.kpiHeader}>
            <span style={styles.kpiLabel}>Analyzed Calls</span>
            <CheckCircle2 size={16} color="var(--color-text-muted)" />
          </div>
          <div style={styles.kpiBody}>
            <h2 style={styles.kpiValue}>{data.kpis.analyzedLeads}</h2>
            <span style={styles.kpiTrendPositive}>
              <ArrowUpRight size={14} /> 8% vs last month
            </span>
          </div>
        </div>

        <div className="saas-card" style={styles.kpiCard}>
          <div style={styles.kpiHeader}>
            <span style={styles.kpiLabel}>Qualified Rate (SQL)</span>
            <Target size={16} color="var(--color-text-muted)" />
          </div>
          <div style={styles.kpiBody}>
            <h2 style={styles.kpiValue}>{conversionRate}%</h2>
            <span style={styles.kpiTrendNegative}>
              <ArrowDownRight size={14} /> 2% vs last month
            </span>
          </div>
        </div>

        <div className="saas-card" style={styles.kpiCard}>
          <div style={styles.kpiHeader}>
            <span style={styles.kpiLabel}>Pushed to CRM</span>
            <CloudUpload size={16} color="var(--color-text-muted)" />
          </div>
          <div style={styles.kpiBody}>
            <h2 style={styles.kpiValue}>{data.kpis.pushedLeads}</h2>
            <span style={styles.kpiTrendPositive}>
              <ArrowUpRight size={14} /> 15% vs last month
            </span>
          </div>
        </div>
      </div>

      {/* --- MAIN CONTENT GRID --- */}
      <div style={styles.mainGrid}>
        
        {/* Main Chart: Agent Performance */}
        <div className="saas-card" style={{ ...styles.sectionCard, gridColumn: 'span 2' }}>
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>Agent Volume & Conversion</h3>
          </div>
          <div style={{ height: '300px', width: '100%', marginTop: '20px' }}>
            {agentChartData.length === 0 ? (
              <div style={styles.emptyState}>No agent data available.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={agentChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }} />
                  <RechartsTooltip 
                    cursor={{ fill: 'var(--color-bg-app)' }}
                    contentStyle={{ borderRadius: '8px', border: '1px solid var(--color-border)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="Total Leads Added" fill="var(--color-primary-light)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Pushed to CRM" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Quality Distribution Doughnut */}
        <div className="saas-card" style={{ ...styles.sectionCard, gridColumn: 'span 1' }}>
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>Quality Distribution</h3>
          </div>
          <div style={{ height: '240px', marginTop: '10px' }}>
            {totalVerdicts === 0 ? (
              <div style={styles.emptyState}>Not enough analyzed data.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={pieData} 
                    innerRadius={70} 
                    outerRadius={90} 
                    paddingAngle={2} 
                    dataKey="value" 
                    stroke="none"
                  >
                    {pieData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '8px', border: '1px solid var(--color-border)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div style={styles.legendList}>
            {pieData.map((item, i) => (
              <div key={i} style={styles.legendRow}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: item.color }} />
                  <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>{item.name}</span>
                </div>
                <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--color-text-main)' }}>
                  {item.value} <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: '400' }}>({Math.round((item.value/totalVerdicts)*100)}%)</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Agent Leaderboard Table */}
        <div className="saas-card" style={{ ...styles.sectionCard, gridColumn: 'span 3', padding: '0' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--color-border)' }}>
            <h3 style={styles.sectionTitle}>Agent Performance Details</h3>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Agent Name</th>
                  <th style={styles.th}>Total Added</th>
                  <th style={styles.th}>Analyzed</th>
                  <th style={styles.th}>Avg Score</th>
                  <th style={styles.th}>Qualified (SQL)</th>
                  <th style={styles.th}>CRM Pushed</th>
                </tr>
              </thead>
              <tbody>
                {data.agentPerformance.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                      No agent data available yet.
                    </td>
                  </tr>
                ) : (
                  data.agentPerformance.map((agent, i) => (
                    <tr key={i} style={styles.tr}>
                      <td style={styles.td}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={styles.avatar}>
                            {agent.agentName ? agent.agentName.charAt(0).toUpperCase() : '?'}
                          </div>
                          <span style={{ fontWeight: '500', color: 'var(--color-text-main)' }}>
                            {agent.agentName || 'Unknown'}
                          </span>
                          {i === 0 && (
                            <span title="Top Performer" style={{ display: 'flex' }}>
                              <Trophy size={14} color="#F59E0B" />
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={styles.td}>{agent.totalAdded}</td>
                      <td style={styles.td}>{agent.analyzedCount}</td>
                      <td style={styles.td}>
                        {agent.avgScore !== null ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontWeight: '600' }}>{agent.avgScore.toFixed(1)}</span>
                            <div style={styles.scoreBarBg}>
                              <div style={{ 
                                ...styles.scoreBarFill, 
                                width: `${agent.avgScore}%`, 
                                backgroundColor: agent.avgScore >= 70 ? 'var(--color-green)' : agent.avgScore >= 40 ? 'var(--color-amber)' : 'var(--color-red)'
                              }} />
                            </div>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--color-text-muted)' }}>N/A</span>
                        )}
                      </td>
                      <td style={styles.td}>
                        <span style={{ ...styles.badge, backgroundColor: 'var(--color-green-bg)', color: 'var(--color-green)' }}>
                          {agent.goodToGoCount}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <span style={{ ...styles.badge, backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
                          {agent.pushedCount}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '24px 32px 64px',
    maxWidth: '1400px',
    margin: '0 auto',
    animation: 'fadeIn 0.4s ease-out',
  },
  loadingWrapper: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '16px'
  },
  loadingSpinner: {
    width: '32px', height: '32px', border: '3px solid var(--color-border)', borderTopColor: 'var(--color-primary)', borderRadius: '50%'
  },
  
  // --- PAGE HEADER ---
  pageHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px'
  },
  pageTitle: {
    fontSize: '24px', fontWeight: '700', color: 'var(--color-text-main)', marginBottom: '4px', letterSpacing: '-0.5px'
  },
  pageSubtitle: {
    fontSize: '14px', color: 'var(--color-text-muted)'
  },
  headerActions: {
    display: 'flex', alignItems: 'center', gap: '12px'
  },
  datePickerFake: {
    display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px',
    backgroundColor: 'white', border: '1px solid var(--color-border)', borderRadius: '8px',
    fontSize: '13px', fontWeight: '500', color: 'var(--color-text-main)', cursor: 'pointer'
  },
  iconButton: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px',
    backgroundColor: 'white', border: '1px solid var(--color-border)', borderRadius: '8px',
    color: 'var(--color-text-muted)', cursor: 'pointer'
  },
  secondaryButton: {
    display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', height: '36px',
    backgroundColor: 'white', border: '1px solid var(--color-border)', borderRadius: '8px',
    fontSize: '13px', fontWeight: '500', color: 'var(--color-text-main)', cursor: 'pointer'
  },

  // --- KPI CARDS ---
  kpiGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '24px'
  },
  kpiCard: {
    padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px'
  },
  kpiHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
  },
  kpiLabel: {
    fontSize: '13px', fontWeight: '500', color: 'var(--color-text-muted)'
  },
  kpiBody: {
    display: 'flex', alignItems: 'baseline', gap: '12px'
  },
  kpiValue: {
    fontSize: '28px', fontWeight: '700', color: 'var(--color-text-main)', margin: 0, letterSpacing: '-0.5px'
  },
  kpiTrendPositive: {
    display: 'flex', alignItems: 'center', gap: '2px', fontSize: '12px', fontWeight: '500', color: 'var(--color-green)'
  },
  kpiTrendNegative: {
    display: 'flex', alignItems: 'center', gap: '2px', fontSize: '12px', fontWeight: '500', color: 'var(--color-red)'
  },

  // --- MAIN GRID ---
  mainGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px'
  },
  sectionCard: {
    padding: '24px', display: 'flex', flexDirection: 'column'
  },
  sectionHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
  },
  sectionTitle: {
    fontSize: '16px', fontWeight: '600', color: 'var(--color-text-main)', margin: 0
  },
  emptyState: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%',
    color: 'var(--color-text-muted)', fontSize: '14px'
  },

  legendList: {
    display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px'
  },
  legendRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    paddingBottom: '12px', borderBottom: '1px solid var(--color-border)'
  },

  // --- TABLE ---
  table: {
    width: '100%', borderCollapse: 'collapse', textAlign: 'left'
  },
  th: {
    padding: '12px 24px', fontSize: '12px', fontWeight: '500', color: 'var(--color-text-muted)', 
    borderBottom: '1px solid var(--color-border)', backgroundColor: '#F9FAFB', textTransform: 'uppercase', letterSpacing: '0.5px'
  },
  tr: {
    borderBottom: '1px solid var(--color-border)', transition: 'background-color 0.15s'
  },
  td: {
    padding: '16px 24px', fontSize: '14px', color: 'var(--color-text-main)'
  },
  avatar: {
    width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--color-primary-light)',
    color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '12px', fontWeight: '600'
  },
  scoreBarBg: {
    width: '60px', height: '6px', backgroundColor: 'var(--color-border)', borderRadius: '3px', overflow: 'hidden'
  },
  scoreBarFill: {
    height: '100%', borderRadius: '3px'
  },
  badge: {
    display: 'inline-flex', alignItems: 'center', padding: '2px 8px', borderRadius: '12px',
    fontSize: '12px', fontWeight: '500'
  }
};
