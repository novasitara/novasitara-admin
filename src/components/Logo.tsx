import React from 'react';
import { Link } from 'react-router-dom';

interface LogoProps {
  variant?: 'default' | 'dark';
  height?: number;
}

export const Logo: React.FC<LogoProps> = ({ variant = 'default', height = 36 }) => (
  <Link to="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.65rem', textDecoration: 'none', userSelect: 'none', flexShrink: 0 }}>
    <img src="/logo.jpeg" alt="Nova Sitara" style={{ height: `${height}px`, width: 'auto', borderRadius: '4px', objectFit: 'contain' }} />
    <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '1.2rem', letterSpacing: '-0.02em', color: variant === 'dark' ? '#FFFFFF' : '#000000', lineHeight: 1 }}>
      Nova Sitara
    </span>
  </Link>
);
