import React, { useState, useEffect } from 'react';

interface AppRevealSplashProps {
  onComplete?: () => void;
  title?: string;
  subtitle?: string;
}

export const AppRevealSplash: React.FC<AppRevealSplashProps> = ({
  onComplete,
  title = 'NexaFinance',
  subtitle = 'Institutional Wealth & Treasury Intelligence',
}) => {
  const [phase, setPhase] = useState<'intro' | 'opening' | 'done'>('intro');

  useEffect(() => {
    // Stage 1: Display Logo & Glow (0ms - 850ms)
    const openTimer = setTimeout(() => {
      setPhase('opening');
    }, 950);

    // Stage 2: Curtain & Portal Open Complete (1450ms)
    const finishTimer = setTimeout(() => {
      setPhase('done');
      onComplete?.();
    }, 1550);

    return () => {
      clearTimeout(openTimer);
      clearTimeout(finishTimer);
    };
  }, [onComplete]);

  // Click to skip animation instantly
  const handleSkip = () => {
    setPhase('done');
    onComplete?.();
  };

  if (phase === 'done') return null;

  const isOpening = phase === 'opening';

  return (
    <div
      onClick={handleSkip}
      title="Klik untuk melewati animasi"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        overflow: 'hidden',
        pointerEvents: isOpening ? 'none' : 'auto',
      }}
    >
      {/* Top Vault Shutter Curtain */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '50%',
          backgroundColor: '#001428',
          borderBottom: '1.5px solid rgba(56, 189, 248, 0.4)',
          transform: isOpening ? 'translateY(-101%)' : 'translateY(0)',
          transition: 'transform 0.65s cubic-bezier(0.16, 1, 0.3, 1)',
          willChange: 'transform',
          zIndex: 1,
        }}
      />

      {/* Bottom Vault Shutter Curtain */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '50%',
          backgroundColor: '#001428',
          borderTop: '1.5px solid rgba(56, 189, 248, 0.4)',
          transform: isOpening ? 'translateY(101%)' : 'translateY(0)',
          transition: 'transform 0.65s cubic-bezier(0.16, 1, 0.3, 1)',
          willChange: 'transform',
          zIndex: 1,
        }}
      />

      {/* Ambient Radial Spotlight Backing */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at 50% 50%, rgba(0, 92, 170, 0.35) 0%, rgba(0, 20, 40, 0.95) 75%)',
          opacity: isOpening ? 0 : 1,
          transition: 'opacity 0.5s ease',
          zIndex: 2,
        }}
      />

      {/* Central Emblem & Brand Motion Stage */}
      <div
        style={{
          position: 'relative',
          zIndex: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '18px',
          transform: isOpening ? 'scale(1.35) translateY(-20px)' : 'scale(1) translateY(0)',
          opacity: isOpening ? 0 : 1,
          filter: isOpening ? 'blur(8px)' : 'blur(0)',
          transition: 'transform 0.55s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.45s ease, filter 0.45s ease',
          willChange: 'transform, opacity, filter',
        }}
      >
        {/* Glowing Logo Icon */}
        <div
          style={{
            position: 'relative',
            width: '84px',
            height: '84px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Subtle Outer Glow Ring */}
          <div
            style={{
              position: 'absolute',
              inset: '-8px',
              borderRadius: '28px',
              background: 'radial-gradient(circle, rgba(56, 189, 248, 0.6) 0%, rgba(0, 92, 170, 0) 70%)',
              animation: 'emblem-pulse-glow 1.5s ease-in-out infinite alternate',
            }}
          />

          {/* SVG Monogram Emblem */}
          <svg
            viewBox="0 0 128 128"
            width="84"
            height="84"
            style={{
              filter: 'drop-shadow(0 8px 24px rgba(0, 92, 170, 0.6))',
              position: 'relative',
              zIndex: 2,
            }}
          >
            <defs>
              <linearGradient id="splashBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#001a33" />
                <stop offset="50%" stop-color="#003566" />
                <stop offset="100%" stop-color="#005caa" />
              </linearGradient>
              <linearGradient id="splashNGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#38bdf8" />
                <stop offset="50%" stop-color="#0284c7" />
                <stop offset="100%" stop-color="#005caa" />
              </linearGradient>
              <linearGradient id="splashBeam" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#7dd3fc" />
                <stop offset="60%" stop-color="#0284c7" />
                <stop offset="100%" stop-color="#003566" />
              </linearGradient>
            </defs>
            <rect
              x="4"
              y="4"
              width="120"
              height="120"
              rx="34"
              fill="url(#splashBgGrad)"
              stroke="#38bdf8"
              stroke-width="3"
              stroke-opacity="0.5"
            />
            <rect
              x="10"
              y="10"
              width="108"
              height="108"
              rx="28"
              fill="none"
              stroke="#ffffff"
              stroke-width="1.2"
              stroke-opacity="0.15"
            />
            <path d="M34 32 H48 V96 H34 Z" fill="url(#splashNGrad)" />
            <path d="M80 32 H94 V96 H80 Z" fill="url(#splashNGrad)" />
            <path d="M42 32 L86 96 H72 L34 40 Z" fill="url(#splashBeam)" />
            <circle cx="87" cy="34" r="5" fill="#38bdf8" />
            <circle cx="87" cy="34" r="2.5" fill="#ffffff" />
          </svg>
        </div>

        {/* Brand Text Header */}
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              fontSize: '26px',
              fontWeight: 800,
              letterSpacing: '-0.5px',
              fontFamily: "'Plus Jakarta Sans', 'Open Sans', sans-serif",
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <span>Nexa</span>
            <span
              style={{
                background: 'linear-gradient(90deg, #38bdf8, #60a5fa)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Finance
            </span>
          </div>

          <div
            style={{
              fontSize: '12.5px',
              color: '#94a3b8',
              letterSpacing: '0.6px',
              textTransform: 'uppercase',
              fontWeight: 600,
              marginTop: '4px',
              fontFamily: "'Open Sans', sans-serif",
            }}
          >
            {subtitle}
          </div>
        </div>

        {/* Security / System Active Badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'rgba(56, 189, 248, 0.12)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            borderRadius: '48px',
            padding: '5px 14px',
            fontSize: '11px',
            fontWeight: 600,
            color: '#38bdf8',
            letterSpacing: '0.4px',
            marginTop: '6px',
          }}
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: '#38bdf8',
              boxShadow: '0 0 8px #38bdf8',
            }}
          />
          ENTERPRISE VAULT ENCRYPTION • ACTIVE
        </div>
      </div>
    </div>
  );
};
