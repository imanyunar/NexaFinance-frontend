import React from 'react';
import { GoogleIcon } from './GoogleIcon';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'success' | 'danger' | 'warning' | 'neutral';
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
        return { bg: '#e6f4ea', color: '#137333', border: '#ceead6' };
      case 'danger':
        return { bg: '#fce8e6', color: '#c5221f', border: '#fad2cf' };
      case 'warning':
        return { bg: '#fef7e0', color: '#b06000', border: '#feefc3' };
      case 'neutral':
        return { bg: '#f1f3f4', color: '#5f6368', border: '#dadce0' };
      case 'primary':
      default:
        return { bg: '#e8f2fa', color: '#005caa', border: '#c3ddf2' };
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
        fontFamily: "'Open Sans', sans-serif",
        fontSize: size === 'sm' ? '11px' : '12px',
        fontWeight: 600,
        padding: size === 'sm' ? '2px 8px' : '4px 12px',
        borderRadius: '48px',
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
