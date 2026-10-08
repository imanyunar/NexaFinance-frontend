import React from 'react';
import { GoogleIcon } from './GoogleIcon';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  googleIcon?: string;
  fullWidth?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  googleIcon,
  fullWidth = true,
  className = '',
  style,
  id,
  ...rest
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        width: fullWidth ? '100%' : 'auto',
        marginBottom: '16px',
      }}
    >
      {label && (
        <label
          htmlFor={inputId}
          style={{
            fontSize: '12.5px',
            fontWeight: 600,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            color: '#171b26',
          }}
        >
          {label}
        </label>
      )}
      <div style={{ position: 'relative', width: '100%' }}>
        {googleIcon && (
          <div
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#6d7a72',
              display: 'flex',
              alignItems: 'center',
              pointerEvents: 'none',
            }}
          >
            <GoogleIcon name={googleIcon} size={18} color="#6d7a72" />
          </div>
        )}
        <input
          id={inputId}
          className={`form-input ${className}`}
          style={{
            width: '100%',
            padding: googleIcon ? '9px 14px 9px 38px' : '9px 14px',
            fontSize: '14px',
            borderRadius: '8px',
            border: error ? '1px solid #ba1a1a' : '1px solid #cbd5e1',
            backgroundColor: '#ffffff',
            color: '#171b26',
            outline: 'none',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            boxSizing: 'border-box',
            transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
            ...style,
          }}
          {...rest}
        />
      </div>
      {error && (
        <span style={{ fontSize: '12px', color: '#ba1a1a', marginTop: '2px' }}>
          {error}
        </span>
      )}
    </div>
  );
};
