import React from 'react';
import { GoogleIcon } from './GoogleIcon';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'dark';
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
          color: '#171b26',
          border: '1px solid #cbd5e1',
        };
      case 'outline':
        return {
          backgroundColor: '#ffffff',
          color: '#171b26',
          border: '1px solid #e2e8f0',
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          color: '#6d7a72',
          border: '1px solid transparent',
        };
      case 'dark':
        return {
          backgroundColor: '#0b0f19',
          color: '#ffffff',
          border: '1px solid #0b0f19',
        };
      case 'primary':
      default:
        return {
          backgroundColor: '#006948',
          color: '#ffffff',
          border: '1px solid #006948',
          boxShadow: '0 1px 3px rgba(0, 105, 72, 0.2)',
        };
    }
  };

  const getSizeStyles = (): React.CSSProperties => {
    switch (size) {
      case 'sm':
        return {
          padding: '6px 14px',
          fontSize: '13px',
          borderRadius: '8px',
          gap: '6px',
        };
      case 'lg':
        return {
          padding: '12px 28px',
          fontSize: '15px',
          borderRadius: '8px',
          gap: '10px',
        };
      case 'md':
      default:
        return {
          padding: '9px 20px',
          fontSize: '14px',
          borderRadius: '8px',
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
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontWeight: 600,
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        transition: 'transform 0.18s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.15s ease, border-color 0.15s ease, box-shadow 0.18s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.15s ease',
        willChange: 'transform',
        backfaceVisibility: 'hidden',
        transform: 'translate3d(0, 0, 0)',
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
