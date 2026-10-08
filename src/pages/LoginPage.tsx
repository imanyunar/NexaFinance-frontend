import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GoogleIcon, Button, Input } from '../components/ui';

const HIGHLIGHT_SLIDES = [
  {
    badge: 'MANAJEMEN KAS',
    title: 'Pantau Saldo & Arus Kas Bisnis Secara Real-Time',
    description:
      'Pencatatan kas dan mutasi multi-rekening yang rapi dan terpusat. Pisahkan keuangan pribadi dan operasional bisnis dalam satu sistem.',
    metric: 'Real-Time',
    metricLabel: 'Sinkronisasi Mutasi',
    tag: 'Multi-Rekening Bank',
  },
  {
    badge: 'PENCATATAN PRAKTIS',
    title: 'Catat Pengeluaran Harian Semudah Mengetik Pesan',
    description:
      'Cukup ketik transaksi harian seperti belanja atau tagihan dalam bahasa sehari-hari, sistem langsung mengelompokkan kategori dan saldo.',
    metric: 'Instan',
    metricLabel: 'Pencatatan Otomatis',
    tag: 'Kategori Cerdas',
  },
  {
    badge: 'INTEGRASI WHATSAPP',
    title: 'Kelola Transaksi Finansial Langsung Lewat WhatsApp',
    description:
      'Catat mutasi belanja, periksa sisa saldo kas, dan terima ringkasan harian langsung dari obrolan WhatsApp tanpa repot.',
    metric: '24/7 Siaga',
    metricLabel: 'Akses WhatsApp Bot',
    tag: 'Notifikasi Otomatis',
  },
  {
    badge: 'PAGU ANGGARAN',
    title: 'Kontrol Anggaran Bulanan & Cegah Pengeluaran Berlebih',
    description:
      'Tetapkan batas pengeluaran per kategori dan pantau pemakaian secara visual agar cash flow operasional selalu sehat dan terkendali.',
    metric: '100% Kontrol',
    metricLabel: 'Transparansi Anggaran',
    tag: 'Peringatan Limit',
  },
];

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Rotating slide index
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  // Slide autoplay every 4.8 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentSlide((prev) => (prev + 1) % HIGHLIGHT_SLIDES.length);
        setIsTransitioning(false);
      }, 220);
    }, 4800);

    return () => clearInterval(timer);
  }, []);

  const handleSelectSlide = (idx: number) => {
    if (idx === currentSlide) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentSlide(idx);
      setIsTransitioning(false);
    }, 220);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setError(null);
    setLoading(true);

    try {
      await login(email, password, rememberMe);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Email atau kata sandi tidak cocok.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('admin123');
  };

  const slide = HIGHLIGHT_SLIDES[currentSlide];

  return (
    <div className="login-root-container">
      {/* ============================================================ */}
      {/* SEBELAH KIRI (DESKTOP) / ATAS COMPACT (MOBILE): Showcase Brand */}
      {/* ============================================================ */}
      <div className="login-showcase-panel">
        {/* Ambient Lights */}
        <div className="ambient-orb-top" />
        <div className="ambient-orb-bottom" />

        {/* Top Header: Brand Logo */}
        <div className="showcase-header">
          <div className="showcase-brand">
            <div className="showcase-logo-box">
              <svg width="22" height="22" viewBox="0 0 128 128" fill="none">
                <path d="M34 32 H48 V96 H34 Z" fill="#ffffff" />
                <path d="M80 32 H94 V96 H80 Z" fill="#ffffff" />
                <path d="M42 32 L86 96 H72 L34 40 Z" fill="#7dd3fc" />
                <circle cx="87" cy="34" r="5" fill="#38bdf8" />
              </svg>
            </div>
            <div>
              <div className="showcase-brand-name">
                Nexa<span>Finance</span>
              </div>
              <div className="showcase-brand-subtitle">
                Manajemen Kas & Treasury
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Feature Showcase */}
        <div className="showcase-content">
          <div className={'showcase-slide-wrapper ' + (isTransitioning ? 'transitioning' : '')}>
            <div className="showcase-badge">
              {slide.badge}
            </div>

            <h2 className="showcase-title">
              {slide.title}
            </h2>

            <p className="showcase-desc">
              {slide.description}
            </p>

            <div className="showcase-metrics-row">
              <div className="metric-card metric-card-primary">
                <div className="metric-val">{slide.metric}</div>
                <div className="metric-lbl">{slide.metricLabel}</div>
              </div>

              <div className="metric-card metric-card-secondary">
                <div className="metric-tag">{slide.tag}</div>
                <div className="metric-sub">Sistem Terintegrasi</div>
              </div>
            </div>
          </div>

          {/* Slide Progress Dots */}
          <div className="showcase-dots">
            {HIGHLIGHT_SLIDES.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectSlide(idx)}
                title={'Buka ringkasan ' + (idx + 1)}
                className={'dot-button ' + (currentSlide === idx ? 'active' : '')}
              />
            ))}
          </div>
        </div>

        {/* Mobile-only Compact Rotating Tagline */}
        <div className="mobile-showcase-bar">
          <div className={'mobile-slide-text ' + (isTransitioning ? 'transitioning' : '')}>
            <span className="mobile-badge">{slide.badge}</span>
            <span className="mobile-title">{slide.title}</span>
          </div>
        </div>

        {/* Bottom Proof Strip (Visible on Desktop) */}
        <div className="showcase-footer">
          <div className="footer-cert">
            <GoogleIcon name="lock" size={15} color="#38bdf8" />
            <span>Koneksi Aman Terenkripsi SSL/TLS 256-bit</span>
          </div>
          <div>© {new Date().getFullYear()} NexaFinance Inc.</div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* SEBELAH KANAN (DESKTOP) / KARTU UTAMA (MOBILE): Login Form    */}
      {/* ============================================================ */}
      <div className="login-form-panel">
        <div className="login-form-card">
          {/* Header */}
          <div className="form-header">
            <h1 className="form-main-title">
              Masuk ke Akun Anda
            </h1>
            <p className="form-sub-title">
              Masukkan email dan kata sandi untuk mengelola keuangan Anda.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="form-error-alert">
              <GoogleIcon name="error" size={18} color="#b91c1c" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="login-form">
            <Input
              label="Alamat Email"
              type="email"
              placeholder="nama@email.com"
              required
              googleIcon="mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <div style={{ position: 'relative' }}>
              <Input
                label="Kata Sandi"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                required
                googleIcon="lock"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '38px',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '6px',
                  borderRadius: '50%',
                  transition: 'color 0.15s ease',
                }}
              >
                <GoogleIcon name={showPassword ? 'visibility_off' : 'visibility'} size={18} color="#64748b" />
              </button>
            </div>

            <div className="form-aux-row">
              <label className="remember-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="checkbox-input"
                />
                <span>Ingat saya</span>
              </label>

              <a
                href="#forgot"
                onClick={(e) => {
                  e.preventDefault();
                  alert('Silakan hubungi administrator workspace untuk pemulihan kata sandi.');
                }}
                className="forgot-link"
              >
                Lupa kata sandi?
              </a>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              googleIcon="arrow_forward"
              iconPosition="right"
              style={{
                width: '100%',
                marginTop: '8px',
                borderRadius: '48px',
                padding: '13px 28px',
                fontSize: '15px',
                fontWeight: 700,
                boxShadow: '0 4px 14px rgba(0, 92, 170, 0.25)',
              }}
            >
              {loading ? 'Memverifikasi...' : 'Masuk ke NexaFinance'}
            </Button>
          </form>

          {/* Quick Demo Helper */}
          <div className="demo-fill-card">
            <span className="demo-text">Akun Demo Cepat:</span>
            <button
              type="button"
              onClick={() => handleFillDemo('iman@gmail.com')}
              className="demo-btn"
            >
              Isi Akun Admin
            </button>
          </div>

          {/* Security Notice */}
          <div className="form-security-footer">
            <GoogleIcon name="verified_user" size={15} color="#005caa" />
            <span>Kerahasiaan data terjamin dengan enkripsi end-to-end</span>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 60FPS HARDWARE-ACCELERATED UNIVERSAL RESPONSIVE CSS          */}
      {/* ============================================================ */}
      <style>{`
        .login-root-container {
          min-height: 100vh;
          min-height: 100dvh;
          display: flex;
          flex-direction: column;
          background-color: #f8fafc;
          font-family: 'Open Sans', -apple-system, BlinkMacSystemFont, sans-serif;
          overflow-x: hidden;
          width: 100%;
          margin: 0;
          padding: 0;
        }

        @media (min-width: 960px) {
          .login-root-container {
            flex-direction: row;
          }
        }

        /* -------------------------------------------------------------
         * SHOWCASE PANEL (LEFT DESKTOP, TOP COMPACT MOBILE)
         * ----------------------------------------------------------- */
        .login-showcase-panel {
          position: relative;
          background: linear-gradient(145deg, #001428 0%, #002244 55%, #003666 100%);
          color: #ffffff;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justifyContent: space-between;
          padding: 18px 20px;
          flex: 0 0 auto;
          box-shadow: 0 4px 20px rgba(0, 20, 40, 0.2);
        }

        @media (min-width: 600px) {
          .login-showcase-panel {
            padding: 24px 28px;
          }
        }

        @media (min-width: 960px) {
          .login-showcase-panel {
            flex: 1 1 52%;
            padding: 48px 56px;
            min-height: 100vh;
            min-height: 100dvh;
            box-shadow: none;
          }
        }

        .ambient-orb-top {
          position: absolute;
          top: -20%;
          left: -15%;
          width: 480px;
          height: 480px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(56, 189, 248, 0.16) 0%, rgba(0, 92, 170, 0) 70%);
          pointer-events: none;
          z-index: 1;
        }

        .ambient-orb-bottom {
          position: absolute;
          bottom: -15%;
          right: -15%;
          width: 440px;
          height: 440px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(0, 92, 170, 0.25) 0%, rgba(0, 20, 40, 0) 70%);
          pointer-events: none;
          z-index: 1;
        }

        .showcase-header {
          display: flex;
          align-items: center;
          justifyContent: space-between;
          position: relative;
          z-index: 2;
          width: 100%;
        }

        .showcase-brand {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .showcase-logo-box {
          width: 38px;
          height: 38px;
          border-radius: 12px;
          background: linear-gradient(135deg, #005caa, #0284c7);
          display: flex;
          align-items: center;
          justifyContent: center;
          box-shadow: 0 4px 12px rgba(56, 189, 248, 0.25);
          border: 1px solid rgba(56, 189, 248, 0.35);
          flex-shrink: 0;
        }

        @media (min-width: 960px) {
          .showcase-logo-box {
            width: 44px;
            height: 44px;
            border-radius: 14px;
          }
        }

        .showcase-brand-name {
          font-size: 18px;
          font-weight: 800;
          letter-spacing: -0.3px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          color: #ffffff;
          line-height: 1.2;
        }

        @media (min-width: 960px) {
          .showcase-brand-name {
            font-size: 20px;
          }
        }

        .showcase-brand-name span {
          color: #38bdf8;
        }

        .showcase-brand-subtitle {
          font-size: 11px;
          color: #94a3b8;
          letter-spacing: 0.3px;
          font-weight: 500;
        }

        /* Desktop Content: Visible only on tablet/desktop >= 960px */
        .showcase-content {
          display: none;
        }

        @media (min-width: 960px) {
          .showcase-content {
            display: block;
            position: relative;
            z-index: 2;
            margin: 40px 0;
          }
        }

        /* Mobile Showcase Bar: Visible only on screens < 960px */
        .mobile-showcase-bar {
          display: block;
          position: relative;
          z-index: 2;
          margin-top: 10px;
          padding-top: 10px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        @media (min-width: 960px) {
          .mobile-showcase-bar {
            display: none;
          }
        }

        .mobile-slide-text {
          display: flex;
          align-items: center;
          gap: 8px;
          opacity: 1;
          transform: translate3d(0, 0, 0);
          transition: opacity 0.35s cubic-bezier(0.16, 1, 0.3, 1), transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
          will-change: transform, opacity;
          backface-visibility: hidden;
        }

        .mobile-slide-text.transitioning {
          opacity: 0;
          transform: translate3d(0, 4px, 0);
          transition: opacity 0.2s cubic-bezier(0.4, 0, 1, 1), transform 0.2s cubic-bezier(0.4, 0, 1, 1);
        }

        .mobile-badge {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 4px;
          background-color: rgba(56, 189, 248, 0.18);
          color: #7dd3fc;
          font-size: 9.5px;
          font-weight: 700;
          letter-spacing: 0.4px;
          white-space: nowrap;
        }

        .mobile-title {
          font-size: 12px;
          color: #e2e8f0;
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* 60FPS GPU Crossfade for Desktop Slide */
        .showcase-slide-wrapper {
          opacity: 1;
          transform: translate3d(0, 0, 0);
          transition: opacity 0.35s cubic-bezier(0.16, 1, 0.3, 1), transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
          will-change: transform, opacity;
          backface-visibility: hidden;
        }

        .showcase-slide-wrapper.transitioning {
          opacity: 0;
          transform: translate3d(0, 10px, 0);
          transition: opacity 0.2s cubic-bezier(0.4, 0, 1, 1), transform 0.2s cubic-bezier(0.4, 0, 1, 1);
        }

        .showcase-badge {
          display: inline-block;
          padding: 3px 10px;
          border-radius: 6px;
          background-color: rgba(56, 189, 248, 0.15);
          color: #7dd3fc;
          font-size: 10.5px;
          font-weight: 700;
          letter-spacing: 0.8px;
          margin-bottom: 14px;
          border: 1px solid rgba(56, 189, 248, 0.25);
        }

        .showcase-title {
          font-size: clamp(22px, 3.2vw, 32px);
          font-weight: 800;
          line-height: 1.25;
          margin: 0 0 14px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          letter-spacing: -0.5px;
          color: #ffffff;
        }

        .showcase-desc {
          font-size: 14.5px;
          line-height: 1.6;
          color: #cbd5e1;
          margin: 0 0 24px;
          max-width: 520px;
        }

        .showcase-metrics-row {
          display: flex;
          align-items: center;
          gap: 14px;
          flex-wrap: wrap;
        }

        .metric-card {
          padding: 12px 18px;
          border-radius: 14px;
          background-color: rgba(0, 20, 40, 0.65);
          backdrop-filter: blur(8px);
          will-change: transform;
          backface-visibility: hidden;
          transform: translate3d(0, 0, 0);
        }

        .metric-card-primary {
          border: 1px solid rgba(56, 189, 248, 0.25);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
        }

        .metric-val {
          font-size: 20px;
          font-weight: 800;
          color: #38bdf8;
        }

        .metric-lbl {
          font-size: 11px;
          color: #94a3b8;
          margin-top: 2px;
          font-weight: 600;
        }

        .metric-card-secondary {
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .metric-tag {
          font-size: 12px;
          font-weight: 700;
          color: #ffffff;
        }

        .metric-sub {
          font-size: 10.5px;
          color: #64748b;
          margin-top: 2px;
        }

        .showcase-dots {
          display: flex;
          align-items: center;
          gap: 7px;
          margin-top: 32px;
        }

        .dot-button {
          height: 6px;
          border-radius: 4px;
          border: none;
          cursor: pointer;
          padding: 0;
          transition: width 0.3s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.25s ease;
          width: 8px;
          background-color: rgba(255, 255, 255, 0.25);
          will-change: width, background-color;
        }

        .dot-button.active {
          width: 26px;
          background-color: #38bdf8;
        }

        .showcase-footer {
          display: none;
        }

        @media (min-width: 960px) {
          .showcase-footer {
            display: flex;
            position: relative;
            z-index: 2;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            padding-top: 16px;
            align-items: center;
            justifyContent: space-between;
            font-size: 11.5px;
            color: #94a3b8;
            flex-wrap: wrap;
            gap: 8px;
          }
        }

        .footer-cert {
          display: flex;
          align-items: center;
          gap: 7px;
        }

        /* -------------------------------------------------------------
         * FORM PANEL (RIGHT DESKTOP, MAIN VIEW MOBILE)
         * ----------------------------------------------------------- */
        .login-form-panel {
          flex: 1 1 auto;
          background-color: #ffffff;
          display: flex;
          flex-direction: column;
          align-items: center;
          justifyContent: center;
          padding: 28px 18px;
          position: relative;
          width: 100%;
        }

        @media (min-width: 600px) {
          .login-form-panel {
            padding: 40px 32px;
          }
        }

        @media (min-width: 960px) {
          .login-form-panel {
            flex: 1 1 48%;
            padding: 48px 48px;
            min-height: 100vh;
            min-height: 100dvh;
          }
        }

        .login-form-card {
          width: 100%;
          max-width: 400px;
        }

        .form-header {
          margin-bottom: 24px;
        }

        .form-main-title {
          font-size: clamp(22px, 3.5vw, 26px);
          font-weight: 800;
          color: #001428;
          margin: 0 0 6px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          letter-spacing: -0.4px;
        }

        .form-sub-title {
          font-size: 13.5px;
          color: #64748b;
          margin: 0;
          line-height: 1.5;
        }

        .form-error-alert {
          margin-bottom: 18px;
          padding: 11px 14px;
          border-radius: 12px;
          background-color: #fef2f2;
          border: 1px solid #fecaca;
          color: #991b1b;
          font-size: 13px;
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .login-form input {
          font-size: 16px !important; /* Prevents auto-zoom on iOS Safari */
        }

        .form-aux-row {
          display: flex;
          align-items: center;
          justifyContent: space-between;
          margin: 6px 0 16px;
          font-size: 13px;
        }

        .remember-label {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          color: #334155;
          user-select: none;
        }

        .checkbox-input {
          width: 16px;
          height: 16px;
          accent-color: #005caa;
          cursor: pointer;
        }

        .forgot-link {
          color: #005caa;
          font-weight: 600;
          text-decoration: none;
          transition: color 0.15s ease;
        }

        .forgot-link:hover {
          color: #00407a;
          text-decoration: underline;
        }

        .demo-fill-card {
          margin-top: 22px;
          padding: 11px 14px;
          border-radius: 12px;
          background-color: #f0f6fa;
          border: 1px dashed #b8d5ed;
          display: flex;
          align-items: center;
          justifyContent: space-between;
          gap: 10px;
        }

        .demo-text {
          font-size: 12.5px;
          color: #003666;
          font-weight: 500;
        }

        .demo-btn {
          background-color: #ffffff;
          border: 1px solid #005caa;
          color: #005caa;
          font-size: 12px;
          font-weight: 700;
          padding: 6px 14px;
          border-radius: 20px;
          cursor: pointer;
          transition: background-color 0.15s ease, color 0.15s ease;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .demo-btn:hover {
          background-color: #005caa;
          color: #ffffff;
        }

        .form-security-footer {
          margin-top: 24px;
          display: flex;
          align-items: center;
          justifyContent: center;
          gap: 6px;
          font-size: 11.5px;
          color: #64748b;
          text-align: center;
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
