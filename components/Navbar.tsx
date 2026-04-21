'use client';

import Image from 'next/image';

export default function Navbar() {
  return (
    <nav style={styles.nav}>
      <div style={styles.inner}>
        {/* Logo */}
        <div style={styles.logoGroup}>
          <a href='https://salesgarners.com/'>
          <Image
            src="/SalesGarners_Logo.webp"
            alt="SalesGarners"
            width={160}
            height={36}
            style={{ objectFit: 'contain', display: 'block' }}
            priority
          /></a>
        </div>
      </div>
    </nav>
  );
}

const styles: Record<string, React.CSSProperties> = {
  nav: {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.85)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderBottom: '1px solid var(--color-border)',
    boxShadow: '0 1px 12px rgba(0,0,0,0.04)',
  },
  inner: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '0 20px',
    height: '60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoGroup: {
    display: 'flex',
    alignItems: 'center',
  },
  badge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--color-purple)',
    backgroundColor: 'var(--color-purple-light)',
    padding: '5px 12px',
    borderRadius: '99px',
    border: '1px solid rgba(127,119,221,0.3)',
    letterSpacing: '0.3px',
  },
  badgeDot: {
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    backgroundColor: 'var(--color-purple)',
    display: 'inline-block',
    boxShadow: '0 0 6px rgba(127,119,221,0.7)',
    animation: 'pulse 2s infinite',
  },
};
