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
  padding = '24px',
  elevation = 'normal',
  className = '',
  style,
  ...rest
}) => {
  const getShadow = () => {
    if (elevation === 'none') return 'none';
    if (elevation === 'subtle') return 'rgba(112, 144, 176, 0.08) 0px 2px 12px 0px';
    return 'rgba(112, 144, 176, 0.1) 0px 0px 40px 8px';
  };

  return (
    <div
      className={`card ${className}`}
      style={{
        background: '#ffffff',
        borderRadius: '24px',
        border: '1px solid #e5e5e5',
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
                  borderRadius: '12px',
                  background: '#e8f2fa',
                  color: '#005caa',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <GoogleIcon name={googleIcon} size={20} color="#005caa" />
              </div>
            )}
            <div>
              {title && (
                <h3
                  style={{
                    margin: 0,
                    fontSize: '16px',
                    fontWeight: 700,
                    fontFamily: "'Open Sans', sans-serif",
                    color: '#000000',
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
                    color: '#666666',
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
