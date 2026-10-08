import React, { useState, useEffect } from 'react';

interface AppRevealSplashProps {
  onComplete?: () => void;
  title?: string;
  subtitle?: string;
}

export const AppRevealSplash: React.FC<AppRevealSplashProps> = ({
  onComplete,
  title = 'NexaFinance',
  subtitle = 'Next-Gen SME Treasury & Autonomous Platform',
}) => {
  const [phase, setPhase] = useState<'intro' | 'opening' | 'done'>('intro');

  useEffect(() => {
    // Stage 1: Fast emblem presentation (0ms - 380ms)
    const openTimer = window.setTimeout(() => {
      setPhase('opening');
    }, 380);

    // Stage 2: Hardware-accelerated curtains glide open (380ms - 750ms)
    const finishTimer = window.setTimeout(() => {
      setPhase('done');
      onComplete?.();
    }, 780);

    return () => {
      window.clearTimeout(openTimer);
      window.clearTimeout(finishTimer);
    };
  }, [onComplete]);

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
      {/* Top Vault Shutter Curtain */}
      <div className={`nexa-splash-curtain-top ${isOpening ? 'opening' : ''}`} style={{ backgroundColor: '#0b0f19' }} />

      {/* Bottom Vault Shutter Curtain */}
      <div className={`nexa-splash-curtain-bottom ${isOpening ? 'opening' : ''}`} style={{ backgroundColor: '#0b0f19' }} />

      {/* Ambient Radial Spotlight Backing */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at 50% 50%, rgba(0, 105, 72, 0.35) 0%, rgba(11, 15, 25, 0.98) 70%)',
          opacity: isOpening ? 0 : 1,
          transition: 'opacity 0.35s ease',
          pointerEvents: 'none',
          zIndex: 2,
        }}
      />

      {/* Central Emblem & Brand Motion Stage */}
      <div className={`nexa-splash-stage ${isOpening ? 'opening' : ''}`}>
        <div
          style={{
            position: 'relative',
            width: '72px',
            height: '72px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg
            viewBox="0 0 128 128"
            width="72"
            height="72"
            style={{
              position: 'relative',
              zIndex: 2,
            }}
          >
            <defs>
              <linearGradient id="splashEmeraldBg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#004d34" />
                <stop offset="50%" stopColor="#006948" />
                <stop offset="100%" stopColor="#00855d" />
              </linearGradient>
            </defs>
            <rect
              x="6"
              y="6"
              width="116"
              height="116"
              rx="30"
              fill="url(#splashEmeraldBg)"
              stroke="#68dba9"
              strokeWidth="2.5"
              strokeOpacity="0.4"
            />
            <path d="M36 34 H48 V94 H36 Z" fill="#ffffff" />
            <path d="M80 34 H92 V94 H80 Z" fill="#ffffff" />
            <path d="M42 34 L86 94 H74 L36 40 Z" fill="#85f8c4" />
          </svg>
        </div>

        {/* Brand Text Header */}
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              fontSize: '24px',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <span>Nexa</span>
            <span style={{ color: '#68dba9' }}>Finance</span>
          </div>

          <div
            style={{
              fontSize: '11px',
              color: '#94a3b8',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              fontWeight: 600,
              marginTop: '4px',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            {subtitle}
          </div>
        </div>

        {/* Status Chip */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'rgba(0, 105, 72, 0.25)',
            border: '1px solid rgba(104, 219, 169, 0.3)',
            borderRadius: '9999px',
            padding: '3px 12px',
            fontSize: '10.5px',
            fontWeight: 600,
            color: '#85f8c4',
            letterSpacing: '0.04em',
            marginTop: '2px',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: '#68dba9',
            }}
          />
          TREASURY PRECISION • IDN
        </div>
      </div>
    </div>
  );
};
