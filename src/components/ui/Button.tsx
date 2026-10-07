import React from 'react';
import { GoogleIcon } from './GoogleIcon';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  googleIcon?: string;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  googleIcon,
  iconPosition = 'left',
  loading = false,
  className = '',
  disabled,
  style,
  ...rest
}) => {
  const getVariantStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'secondary':
        return {
          backgroundColor: '#ffffff',
          color: '#005caa',
          border: '1px solid #005caa',
        };
      case 'outline':
        return {
          backgroundColor: '#ffffff',
          color: '#000000',
          border: '1px solid #e5e5e5',
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          color: '#666666',
          border: '1px solid transparent',
        };
      case 'primary':
      default:
        return {
          backgroundColor: '#005caa',
          color: '#ffffff',
          border: '1px solid #005caa',
          boxShadow: '0 2px 8px rgba(0, 92, 170, 0.15)',
        };
    }
  };

  const getSizeStyles = (): React.CSSProperties => {
    switch (size) {
      case 'sm':
        return {
          padding: '6px 16px',
          fontSize: '13px',
          borderRadius: '48px',
          gap: '6px',
        };
      case 'lg':
        return {
          padding: '12px 32px',
          fontSize: '15px',
          borderRadius: '48px',
          gap: '10px',
        };
      case 'md':
      default:
        return {
          padding: '10px 24px',
          fontSize: '14px',
          borderRadius: '48px',
          gap: '8px',
        };
    }
  };

  return (
    <button
      className={`btn btn-${variant} ${className}`}
      disabled={disabled || loading}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Open Sans', sans-serif",
        fontWeight: 600,
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        userSelect: 'none',
        ...getVariantStyles(),
        ...getSizeStyles(),
        ...style,
      }}
      {...rest}
    >
      {loading ? (
        <span
          style={{
            display: 'inline-block',
            width: 14,
            height: 14,
            border: '2px solid currentColor',
            borderRightColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 0.6s linear infinite',
          }}
        />
      ) : (
        googleIcon && iconPosition === 'left' && <GoogleIcon name={googleIcon} size={size === 'sm' ? 16 : 18} />
      )}
      {children}
      {!loading && googleIcon && iconPosition === 'right' && (
        <GoogleIcon name={googleIcon} size={size === 'sm' ? 16 : 18} />
      )}
    </button>
  );
};
