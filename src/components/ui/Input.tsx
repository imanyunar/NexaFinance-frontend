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
            fontSize: '13px',
            fontWeight: 600,
            fontFamily: "'Open Sans', sans-serif",
            color: '#000000',
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
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#666666',
              display: 'flex',
              alignItems: 'center',
              pointerEvents: 'none',
            }}
          >
            <GoogleIcon name={googleIcon} size={18} color="#666666" />
          </div>
        )}
        <input
          id={inputId}
          className={`form-input ${className}`}
          style={{
            width: '100%',
            padding: googleIcon ? '11px 16px 11px 40px' : '11px 16px',
            fontSize: '14px',
            borderRadius: '16px',
            border: error ? '1px solid #c5221f' : '1px solid #e5e5e5',
            backgroundColor: '#ffffff',
            color: '#000000',
            outline: 'none',
            fontFamily: 'ui-sans-serif, system-ui, sans-serif',
            boxSizing: 'border-box',
            transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
            ...style,
          }}
          {...rest}
        />
      </div>
      {error && (
        <span style={{ fontSize: '12px', color: '#c5221f', marginTop: '2px' }}>
          {error}
        </span>
      )}
    </div>
  );
};
