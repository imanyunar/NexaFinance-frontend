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
    // Stage 1: Emblem presentation (0ms - 450ms)
    const openTimer = window.setTimeout(() => {
      setPhase('opening');
    }, 450);

    // Stage 2: Hardware-accelerated shutter curtains glide open (450ms - 900ms)
    const finishTimer = window.setTimeout(() => {
      setPhase('done');
      onComplete?.();
    }, 920);

    return () => {
      window.clearTimeout(openTimer);
      window.clearTimeout(finishTimer);
    };
  }, [onComplete]);

  // Click or touch to skip immediately
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
        backgroundColor: 'transparent',
      }}
    >
      {/* Top Vault Shutter Curtain (GPU translate3d compositor) */}
      <div className={`nexa-splash-curtain-top ${isOpening ? 'opening' : ''}`} />

      {/* Bottom Vault Shutter Curtain (GPU translate3d compositor) */}
      <div className={`nexa-splash-curtain-bottom ${isOpening ? 'opening' : ''}`} />

      {/* Ambient Radial Spotlight Backing */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at 50% 50%, rgba(0, 92, 170, 0.4) 0%, rgba(0, 20, 40, 0.96) 70%)',
          opacity: isOpening ? 0 : 1,
          transition: 'opacity 0.4s ease',
          pointerEvents: 'none',
          zIndex: 2,
        }}
      />

      {/* Central Emblem & Brand Motion Stage (GPU Compositor Layer) */}
      <div className={`nexa-splash-stage ${isOpening ? 'opening' : ''}`}>
        {/* Logo Emblem Icon */}
        <div
          style={{
            position: 'relative',
            width: '80px',
            height: '80px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Static Ambient Glow (No CPU-taxing SVG filter during motion) */}
          <div
            style={{
              position: 'absolute',
              inset: '-12px',
              borderRadius: '28px',
              background: 'radial-gradient(circle, rgba(56, 189, 248, 0.45) 0%, rgba(0, 92, 170, 0) 70%)',
              pointerEvents: 'none',
            }}
          />

          {/* Clean Vector Monogram SVG */}
          <svg
            viewBox="0 0 128 128"
            width="80"
            height="80"
            style={{
              position: 'relative',
              zIndex: 2,
            }}
          >
            <defs>
              <linearGradient id="splashBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#001a33" />
                <stop offset="50%" stopColor="#003566" />
                <stop offset="100%" stopColor="#005caa" />
              </linearGradient>
              <linearGradient id="splashNGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="50%" stopColor="#0284c7" />
                <stop offset="100%" stopColor="#005caa" />
              </linearGradient>
              <linearGradient id="splashBeam" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#7dd3fc" />
                <stop offset="60%" stopColor="#0284c7" />
                <stop offset="100%" stopColor="#003566" />
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
              strokeWidth="3"
              strokeOpacity="0.5"
            />
            <rect
              x="10"
              y="10"
              width="108"
              height="108"
              rx="28"
              fill="none"
              stroke="#ffffff"
              strokeWidth="1.2"
              strokeOpacity="0.15"
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
              fontSize: '25px',
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
              fontSize: '12px',
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
            padding: '4px 12px',
            fontSize: '10.5px',
            fontWeight: 600,
            color: '#38bdf8',
            letterSpacing: '0.4px',
            marginTop: '4px',
          }}
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: '#38bdf8',
              boxShadow: '0 0 6px #38bdf8',
            }}
          />
          ENTERPRISE VAULT ENCRYPTION • ACTIVE
        </div>
      </div>
    </div>
  );
};
