import React from 'react';
import { GoogleIcon } from './GoogleIcon';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'success' | 'danger' | 'warning' | 'neutral' | 'indigo' | 'whatsapp';
  googleIcon?: string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  googleIcon,
  size = 'md',
  className = '',
  style,
  ...rest
}) => {
  const getVariantStyles = (): { bg: string; color: string; border: string } => {
    switch (variant) {
      case 'success':
        return { bg: '#dcfce7', color: '#16a34a', border: '#bbf7d0' };
      case 'danger':
        return { bg: '#ffe4e6', color: '#e11d48', border: '#fecdd3' };
      case 'warning':
        return { bg: '#fef3c7', color: '#d97706', border: '#fde68a' };
      case 'neutral':
        return { bg: '#f1f5f9', color: '#475569', border: '#e2e8f0' };
      case 'indigo':
        return { bg: '#e0e7ff', color: '#3730a3', border: '#c7d2fe' };
      case 'whatsapp':
        return { bg: '#dcfce7', color: '#005322', border: '#bbf7d0' };
      case 'primary':
      default:
        return { bg: '#f0fdf4', color: '#006948', border: '#bbf7d0' };
    }
  };

  const { bg, color, border } = getVariantStyles();

  return (
    <span
      className={`badge ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontSize: size === 'sm' ? '11px' : '12px',
        fontWeight: 600,
        padding: size === 'sm' ? '2px 8px' : '3px 10px',
        borderRadius: '9999px',
        backgroundColor: bg,
        color: color,
        border: `1px solid ${border}`,
        lineHeight: 1.2,
        userSelect: 'none',
        ...style,
      }}
      {...rest}
    >
      {googleIcon && <GoogleIcon name={googleIcon} size={size === 'sm' ? 12 : 14} color={color} />}
      {children}
    </span>
  );
};
