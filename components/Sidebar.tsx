'use client';

import React from 'react';
import { LayoutDashboard, Mic2, Settings, User, Menu, ChevronLeft, ChevronRight, PieChart, Database } from 'lucide-react';

interface SidebarProps {
  activeView: 'analytics' | 'dashboard' | 'analyzer';
  onViewChange: (view: 'analytics' | 'dashboard' | 'analyzer') => void;
  userName?: string | null;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export default function Sidebar({ activeView, onViewChange, userName, isCollapsed, setIsCollapsed }: SidebarProps) {
  const menuItems = [
    { id: 'analytics', label: 'Home Analytics', icon: <PieChart size={20} /> },
    { id: 'dashboard', label: 'Leads Database', icon: <Database size={20} /> },
    { id: 'analyzer', label: 'Call Analyzer', icon: <Mic2 size={20} /> },
  ];

  const sidebarWidth = isCollapsed ? '80px' : '260px';

  return (
    <aside style={{ ...styles.sidebar, width: sidebarWidth }}>
      <div style={styles.topSection}>
        {/* Toggle Button */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)} 
          style={styles.toggleBtn}
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
        </button>

        <div style={styles.menuList}>
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id as any)}
              style={{
                ...styles.menuItem,
                backgroundColor: activeView === item.id ? 'var(--color-primary-light)' : 'transparent',
                color: activeView === item.id ? 'var(--color-primary)' : 'var(--color-text-muted)',
                justifyContent: isCollapsed ? 'center' : 'flex-start',
                padding: isCollapsed ? '12px' : '12px 16px',
              }}
              title={isCollapsed ? item.label : ""}
            >
              <span style={{ 
                display: 'flex', 
                color: activeView === item.id ? 'var(--color-primary)' : 'var(--color-text-muted)' 
              }}>
                {item.icon}
              </span>
              {!isCollapsed && <span style={styles.menuLabel}>{item.label}</span>}
              {!isCollapsed && activeView === item.id && <div style={styles.activeIndicator} />}
            </button>
          ))}
        </div>
      </div>

      <div style={styles.bottomSection}>
        <div style={{ ...styles.userProfile, justifyContent: isCollapsed ? 'center' : 'flex-start' }}>
          <div style={styles.avatar}>
            <User size={16} color="var(--color-primary)" />
          </div>
          {!isCollapsed && (
            <div style={styles.userInfo}>
              <div style={styles.userName}>{userName || 'Analyst'}</div>
              <div style={styles.userRole}>Quality Analyst</div>
            </div>
          )}
        </div>
        {!isCollapsed && <div style={styles.version}>v1.2.0</div>}
      </div>
    </aside>
  );
}

const styles: Record<string, React.CSSProperties> = {
  sidebar: {
    height: 'calc(100vh - 60px)',
    position: 'fixed',
    left: 0,
    top: '60px',
    backgroundColor: 'white',
    borderRight: '1px solid var(--color-border)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '24px 16px',
    zIndex: 90,
    transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    overflow: 'hidden',
  },
  toggleBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: '40px', height: '40px', borderRadius: '10px', border: '1px solid var(--color-border)',
    backgroundColor: 'white', color: 'var(--color-text-muted)', cursor: 'pointer',
    marginBottom: '20px', transition: 'all 0.2s', alignSelf: 'center',
  },
  topSection: { display: 'flex', flexDirection: 'column' },
  menuList: { display: 'flex', flexDirection: 'column', gap: '8px' },
  menuItem: {
    display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px',
    borderRadius: '10px', border: 'none', cursor: 'pointer', transition: 'all 0.2s',
    position: 'relative', textAlign: 'left', width: '100%',
  },
  menuLabel: { fontSize: '14px', fontWeight: '600', whiteSpace: 'nowrap' },
  activeIndicator: {
    position: 'absolute', right: '12px', width: '6px', height: '6px',
    borderRadius: '50%', backgroundColor: 'var(--color-primary)',
  },
  bottomSection: { borderTop: '1px solid var(--color-border)', paddingTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px' },
  userProfile: { display: 'flex', alignItems: 'center', gap: '12px' },
  avatar: {
    width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'var(--color-primary-light)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  userInfo: { display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  userName: { fontSize: '14px', fontWeight: '700', color: 'var(--color-text-main)', whiteSpace: 'nowrap' },
  userRole: { fontSize: '11px', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' },
  version: { fontSize: '10px', color: 'var(--color-text-muted)', textAlign: 'center' },
};
