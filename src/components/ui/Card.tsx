import React from 'react';
import { GoogleIcon } from './GoogleIcon';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  googleIcon?: string;
  action?: React.ReactNode;
  padding?: number | string;
  elevation?: 'subtle' | 'normal' | 'none';
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  googleIcon,
  action,
  padding = '20px',
  elevation = 'normal',
  className = '',
  style,
  ...rest
}) => {
  const getShadow = () => {
    if (elevation === 'none') return 'none';
    if (elevation === 'subtle') return '0 1px 2px 0 rgba(15, 23, 42, 0.04)';
    return '0 1px 3px 0 rgba(15, 23, 42, 0.05), 0 1px 2px -1px rgba(15, 23, 42, 0.05)';
  };

  return (
    <div
      className={`card ${className}`}
      style={{
        background: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        boxShadow: getShadow(),
        padding: padding,
        display: 'flex',
        flexDirection: 'column',
        ...style,
      }}
      {...rest}
    >
      {(title || action || googleIcon) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {googleIcon && (
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: '#f0fdf4',
                  color: '#006948',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <GoogleIcon name={googleIcon} size={20} color="#006948" />
              </div>
            )}
            <div>
              {title && (
                <h3
                  style={{
                    margin: 0,
                    fontSize: '16px',
                    fontWeight: 700,
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    color: '#171b26',
                  }}
                >
                  {title}
                </h3>
              )}
              {subtitle && (
                <p
                  style={{
                    margin: '2px 0 0',
                    fontSize: '12px',
                    color: '#6d7a72',
                  }}
                >
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};
