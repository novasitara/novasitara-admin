import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'dark' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary', size = 'md', isLoading = false,
  leftIcon, rightIcon, children, disabled, style = {}, ...props
}) => {
  const variantStyles: Record<string, React.CSSProperties> = {
    primary: { backgroundColor: 'var(--color-primary)', color: '#fff', border: '1px solid var(--color-primary)' },
    secondary: { backgroundColor: '#fff', color: '#000', border: '1.5px solid #000' },
    outline: { backgroundColor: 'transparent', color: '#000', border: '1.5px solid var(--color-border)' },
    dark: { backgroundColor: '#000', color: '#fff', border: '1px solid #000' },
    ghost: { backgroundColor: 'transparent', color: '#000', border: 'none' },
    danger: { backgroundColor: '#FEF2F2', color: '#EF4444', border: '1.5px solid #FECACA' },
  };
  const sizeStyles: Record<string, React.CSSProperties> = {
    sm: { padding: '0.45rem 1rem', fontSize: '0.85rem', borderRadius: 'var(--radius-sm)' },
    md: { padding: '0.7rem 1.5rem', fontSize: '0.925rem', borderRadius: 'var(--radius-sm)' },
    lg: { padding: '0.9rem 2rem', fontSize: '1rem', borderRadius: 'var(--radius-sm)' },
  };

  return (
    <button
      disabled={disabled || isLoading}
      style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: 600, cursor: disabled || isLoading ? 'not-allowed' : 'pointer', opacity: disabled || isLoading ? 0.7 : 1, transition: 'all 180ms ease', lineHeight: 1.2, letterSpacing: '-0.01em', ...variantStyles[variant], ...sizeStyles[size], ...style }}
      {...props}
    >
      {isLoading ? <Loader2 size={16} className="spin" /> : <>{leftIcon}{children}{rightIcon}</>}
      <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </button>
  );
};
