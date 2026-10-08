import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GoogleIcon, Button, Input } from '../components/ui';

const HIGHLIGHT_SLIDES = [
  {
    badge: 'PRESISI INSTITUSIONAL',
    title: 'Manajemen Arus Kas & Treasury Berakurasi Tinggi',
    description:
      'Pencatatan integer Rupiah tanpa kompromi floating-point drift. Pisahkan kas pribadi dan operasional bisnis dengan isolasi multi-workspace.',
    metric: '100% Presisi',
    metricLabel: 'Nol Selisih Saldo',
    tag: 'Enterprise Treasury',
  },
  {
    badge: 'INTELLIGENT AI ENGINE',
    title: 'Input Transaksi Natural Tanpa Formulir Rumit',
    description:
      'Ketik kalimat santai seperti "Makan siang 35rb bayar bca", kecerdasan AI kami langsung mengekstrak nominal, rekening, dan kategori secara instan.',
    metric: '< 150ms',
    metricLabel: 'Kecepatan Proses AI',
    tag: 'Groq & Gemini Dual-Engine',
  },
  {
    badge: 'WHATSAPP 2-WAY SYNC',
    title: 'Asisten Keuangan Interaktif Langsung di WhatsApp',
    description:
      'Catat pemasukan, belanja, cek saldo kas, dan terima peringatan overlimit anggaran otomatis langsung dari aplikasi WhatsApp Anda 24/7.',
    metric: 'Real-Time',
    metricLabel: 'Sinkronisasi Cloud Bot',
    tag: 'Fonnte Gateway 2-Way',
  },
  {
    badge: 'VISIBILITAS MENYELURUH',
    title: 'Analitik Pagu Anggaran & Pengawasan Likuiditas',
    description:
      'Dapatkan visualisasi komprehensif pagu anggaran bulanan, rasio burn rate, dan riwayat mutasi kas dalam antarmuka berkinerja tinggi.',
    metric: '93+ Score',
    metricLabel: 'Lighthouse Performance',
    tag: 'Morgan Stanley Standard',
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

  // Slide autoplay every 4.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentSlide((prev) => (prev + 1) % HIGHLIGHT_SLIDES.length);
        setIsTransitioning(false);
      }, 250);
    }, 4500);

    return () => clearInterval(timer);
  }, []);

  const handleSelectSlide = (idx: number) => {
    if (idx === currentSlide) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentSlide(idx);
      setIsTransitioning(false);
    }, 200);
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
      {/* SEBELAH KIRI / ATAS: Showcase Brand & Teks Animasi Dinamis   */}
      {/* ============================================================ */}
      <div className="login-showcase-panel">
        {/* Ambient Lights */}
        <div className="ambient-orb-top" />
        <div className="ambient-orb-bottom" />

        {/* Top Header: Logo + Badge */}
        <div className="showcase-header">
          <div className="showcase-brand">
            <div className="showcase-logo-box">
              <svg width="24" height="24" viewBox="0 0 128 128" fill="none">
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
                Institutional Wealth OS
              </div>
            </div>
          </div>

          <div className="showcase-security-pill">
            <span className="security-dot" />
            <span>AES-256 BANK ENCRYPTION</span>
          </div>
        </div>

        {/* Dynamic Animated Text Section */}
        <div className="showcase-content">
          <div className={`showcase-slide-wrapper ${isTransitioning ? 'transitioning' : ''}`}>
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
                <div className="metric-sub">Active Infrastructure</div>
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
                title={`Buka slide ${idx + 1}`}
                className={`dot-button ${currentSlide === idx ? 'active' : ''}`}
              />
            ))}
          </div>
        </div>

        {/* Bottom Proof Strip (Visible on Desktop / Tablet) */}
        <div className="showcase-footer">
          <div className="footer-cert">
            <GoogleIcon name="verified" size={16} color="#38bdf8" />
            <span>Sertifikasi FinTech Institusional Berkecepatan Tinggi</span>
          </div>
          <div>© {new Date().getFullYear()} NexaFinance Inc.</div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* SEBELAH KANAN / BAWAH: Formulir Masuk (Login Form)            */}
      {/* ============================================================ */}
      <div className="login-form-panel">
        <div className="login-form-card">
          {/* Header */}
          <div className="form-header">
            <div className="form-auth-pill">
              <GoogleIcon name="lock" size={13} color="#005caa" />
              <span>PORTAL AUTENTIKASI AMAN</span>
            </div>

            <h1 className="form-main-title">
              Masuk ke Akun Anda
            </h1>
            <p className="form-sub-title">
              Masukkan email dan kata sandi untuk mengakses workspace keuangan Anda.
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
                  right: '14px',
                  top: '38px',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '4px',
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
                  alert('Silakan hubungi administrator workspace Anda untuk pemulihan kata sandi.');
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
                padding: '13px 32px',
                fontSize: '15px',
                fontWeight: 700,
                boxShadow: '0 4px 14px rgba(0, 92, 170, 0.25)',
              }}
            >
              {loading ? 'Memverifikasi...' : 'Masuk ke Portal Keuangan'}
            </Button>
          </form>

          {/* Quick Demo Helper */}
          <div className="demo-fill-card">
            <span className="demo-text">Ingin tes cepat akun admin?</span>
            <button
              type="button"
              onClick={() => handleFillDemo('iman@gmail.com')}
              className="demo-btn"
            >
              Isi Otomatis
            </button>
          </div>

          {/* Security Notice */}
          <div className="form-security-footer">
            <GoogleIcon name="shield" size={15} color="#005caa" />
            <span>Dilindungi Protokol Zero-Trust & Neon Cloud Database</span>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* SCOPED UNIVERSAL RESPONSIVE CSS                               */}
      {/* ============================================================ */}
      <style>{`
        .login-root-container {
          min-height: 100vh;
          min-height: 100dvh;
          display: flex;
          flex-direction: column;
          background-color: #001428;
          font-family: 'Open Sans', -apple-system, BlinkMacSystemFont, sans-serif;
          overflow-x: hidden;
          width: 100%;
        }

        @media (min-width: 1024px) {
          .login-root-container {
            flex-direction: row;
          }
        }

        /* SHOWCASE PANEL */
        .login-showcase-panel {
          position: relative;
          background: linear-gradient(145deg, #001224 0%, #002244 50%, #003666 100%);
          color: #ffffff;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justifyContent: space-between;
          padding: 24px 20px;
          flex: 0 0 auto;
        }

        @media (min-width: 768px) {
          .login-showcase-panel {
            padding: 36px 40px;
          }
        }

        @media (min-width: 1024px) {
          .login-showcase-panel {
            flex: 1 1 54%;
            padding: 48px 56px;
            min-height: 100vh;
            min-height: 100dvh;
          }
        }

        .ambient-orb-top {
          position: absolute;
          top: -15%;
          left: -10%;
          width: 480px;
          height: 480px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(56, 189, 248, 0.22) 0%, rgba(0, 92, 170, 0) 70%);
          pointer-events: none;
          z-index: 1;
        }

        .ambient-orb-bottom {
          position: absolute;
          bottom: -10%;
          right: -10%;
          width: 420px;
          height: 420px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(0, 92, 170, 0.35) 0%, rgba(0, 20, 40, 0) 70%);
          pointer-events: none;
          z-index: 1;
        }

        .showcase-header {
          display: flex;
          align-items: center;
          justifyContent: space-between;
          position: relative;
          z-index: 2;
          gap: 12px;
          flex-wrap: wrap;
        }

        .showcase-brand {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .showcase-logo-box {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: linear-gradient(135deg, #005caa, #0284c7);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 14px rgba(56, 189, 248, 0.35);
          border: 1.5px solid rgba(56, 189, 248, 0.4);
          flex-shrink: 0;
        }

        @media (min-width: 768px) {
          .showcase-logo-box {
            width: 44px;
            height: 44px;
            border-radius: 13px;
          }
        }

        .showcase-brand-name {
          font-size: 19px;
          font-weight: 800;
          letter-spacing: -0.3px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          color: #ffffff;
        }

        .showcase-brand-name span {
          color: #38bdf8;
        }

        .showcase-brand-subtitle {
          font-size: 10.5px;
          color: #94a3b8;
          letter-spacing: 0.8px;
          text-transform: uppercase;
          font-weight: 600;
        }

        .showcase-security-pill {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 5px 12px;
          border-radius: 30px;
          background-color: rgba(56, 189, 248, 0.1);
          border: 1px solid rgba(56, 189, 248, 0.25);
          font-size: 10.5px;
          font-weight: 600;
          color: #38bdf8;
          letter-spacing: 0.4px;
          white-space: nowrap;
        }

        .security-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background-color: #38bdf8;
          box-shadow: 0 0 8px #38bdf8;
        }

        .showcase-content {
          position: relative;
          z-index: 2;
          margin: 20px 0 16px;
          max-width: 620px;
        }

        @media (min-width: 1024px) {
          .showcase-content {
            margin: 48px 0;
          }
        }

        .showcase-slide-wrapper {
          opacity: 1;
          transform: translate3d(0, 0, 0);
          transition: opacity 0.28s ease, transform 0.28s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .showcase-slide-wrapper.transitioning {
          opacity: 0;
          transform: translate3d(0, 10px, 0);
        }

        .showcase-badge {
          display: inline-block;
          padding: 3px 10px;
          border-radius: 6px;
          background-color: rgba(56, 189, 248, 0.15);
          color: #7dd3fc;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1px;
          margin-bottom: 12px;
          border: 1px solid rgba(56, 189, 248, 0.3);
        }

        .showcase-title {
          font-size: clamp(20px, 4vw, 34px);
          font-weight: 800;
          line-height: 1.25;
          margin: 0 0 12px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          letter-spacing: -0.5px;
          color: #ffffff;
        }

        .showcase-desc {
          font-size: clamp(13px, 1.8vw, 15px);
          line-height: 1.6;
          color: #cbd5e1;
          margin: 0 0 20px;
          max-width: 540px;
        }

        @media (max-width: 767px) {
          .showcase-desc {
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
            margin-bottom: 14px;
          }
        }

        .showcase-metrics-row {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        @media (min-width: 768px) {
          .showcase-metrics-row {
            gap: 16px;
          }
        }

        .metric-card {
          padding: 10px 16px;
          border-radius: 14px;
          background-color: rgba(0, 20, 40, 0.65);
          backdrop-filter: blur(10px);
        }

        @media (min-width: 768px) {
          .metric-card {
            padding: 14px 20px;
            border-radius: 16px;
          }
        }

        .metric-card-primary {
          border: 1px solid rgba(56, 189, 248, 0.25);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
        }

        .metric-val {
          font-size: clamp(17px, 2.5vw, 22px);
          font-weight: 800;
          color: #38bdf8;
        }

        .metric-lbl {
          font-size: 10.5px;
          color: #94a3b8;
          margin-top: 2px;
          font-weight: 600;
        }

        .metric-card-secondary {
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        @media (max-width: 480px) {
          .metric-card-secondary {
            display: none;
          }
        }

        .metric-tag {
          font-size: 11.5px;
          font-weight: 700;
          color: #ffffff;
        }

        .metric-sub {
          font-size: 10px;
          color: #64748b;
          margin-top: 2px;
        }

        .showcase-dots {
          display: flex;
          align-items: center;
          gap: 7px;
          margin-top: 18px;
        }

        @media (min-width: 1024px) {
          .showcase-dots {
            margin-top: 36px;
          }
        }

        .dot-button {
          height: 6px;
          border-radius: 4px;
          border: none;
          cursor: pointer;
          padding: 0;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          width: 8px;
          background-color: rgba(255, 255, 255, 0.25);
        }

        .dot-button.active {
          width: 28px;
          background-color: #38bdf8;
        }

        .showcase-footer {
          position: relative;
          z-index: 2;
          border-top: 1px solid rgba(255, 255, 255, 0.12);
          padding-top: 16px;
          display: flex;
          align-items: center;
          justifyContent: space-between;
          font-size: 11.5px;
          color: #94a3b8;
          flex-wrap: wrap;
          gap: 8px;
        }

        @media (max-width: 767px) {
          .showcase-footer {
            display: none;
          }
        }

        .footer-cert {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        /* FORM PANEL */
        .login-form-panel {
          flex: 1 1 auto;
          background-color: #ffffff;
          display: flex;
          flex-direction: column;
          align-items: center;
          justifyContent: center;
          padding: 32px 20px;
          position: relative;
          width: 100%;
        }

        @media (min-width: 768px) {
          .login-form-panel {
            padding: 44px 32px;
          }
        }

        @media (min-width: 1024px) {
          .login-form-panel {
            flex: 1 1 46%;
            padding: 48px 40px;
            min-height: 100vh;
            min-height: 100dvh;
          }
        }

        .login-form-card {
          width: 100%;
          max-width: 440px;
        }

        .form-header {
          margin-bottom: 24px;
        }

        @media (min-width: 768px) {
          .form-header {
            margin-bottom: 28px;
          }
        }

        .form-auth-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 3px 10px;
          border-radius: 6px;
          background-color: #e8f2fa;
          color: #005caa;
          font-size: 11px;
          font-weight: 700;
          margin-bottom: 10px;
        }

        .form-main-title {
          font-size: clamp(22px, 3vw, 28px);
          font-weight: 800;
          color: #001428;
          margin: 0 0 6px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          letter-spacing: -0.5px;
        }

        .form-sub-title {
          font-size: 13.5px;
          color: #64748b;
          margin: 0;
          line-height: 1.5;
        }

        .form-error-alert {
          display: flex;
          align-items: center;
          gap: 10px;
          background-color: #fef2f2;
          border: 1px solid #fee2e2;
          border-radius: 12px;
          padding: 11px 14px;
          color: #b91c1c;
          font-size: 12.5px;
          margin-bottom: 20px;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .form-aux-row {
          display: flex;
          align-items: center;
          justifyContent: space-between;
          font-size: 13px;
          margin-top: -4px;
          flex-wrap: wrap;
          gap: 8px;
        }

        .remember-label {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          user-select: none;
          color: #475569;
          font-size: 13px;
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
          font-size: 13px;
          text-decoration: none;
        }

        .demo-fill-card {
          margin-top: 20px;
          padding: 10px 14px;
          border-radius: 12px;
          background-color: #f8fafc;
          border: 1px dashed #cbd5e1;
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 12px;
          flex-wrap: wrap;
          gap: 6px;
        }

        .demo-text {
          color: #64748b;
        }

        .demo-btn {
          border: none;
          background: transparent;
          color: #005caa;
          font-weight: 700;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 12px;
        }

        .form-security-footer {
          text-align: center;
          margin-top: 28px;
          padding-top: 18px;
          border-top: 1px solid #f1f5f9;
          font-size: 11.5px;
          color: #94a3b8;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }
      `}</style>
    </div>
  );
};
