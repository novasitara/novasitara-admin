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
  leftIcon, rightIcon, children, disabled, className = '', ...props
}) => (
  <button
    disabled={disabled || isLoading}
    className={`btn btn-${variant} btn-${size} ${isLoading ? 'btn-loading' : ''} ${className}`}
    {...props}
  >
    {isLoading ? <Loader2 size={16} className="spin" /> : <>{leftIcon}{children}{rightIcon}</>}
  </button>
);
