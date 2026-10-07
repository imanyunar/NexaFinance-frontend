import React from 'react';

interface GoogleIconProps {
  name: string;
  size?: number | string;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Reusable Google Material Symbols icon component.
 * Provides clean, unique Google icons without AI-slop visual clutter.
 */
export const GoogleIcon: React.FC<GoogleIconProps> = ({
  name,
  size = 20,
  color,
  className = '',
  style,
}) => {
  return (
    <span
      className={`google-icon ${className}`}
      style={{
        fontSize: typeof size === 'number' ? `${size}px` : size,
        width: typeof size === 'number' ? `${size}px` : size,
        height: typeof size === 'number' ? `${size}px` : size,
        color: color || 'inherit',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        lineHeight: 1,
        ...style,
      }}
      aria-hidden="true"
    >
      {name}
    </span>
  );
};
