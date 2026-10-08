import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

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

  const handleDemoLogin = async (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
    setLoading(true);
    try {
      await login(demoEmail, demoPass, true);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Gagal masuk akun demo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-space-md relative overflow-hidden font-body-md antialiased text-on-surface">
      {/* Dynamic Background Ambient Accents */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-fixed/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary-fixed/20 rounded-full blur-3xl pointer-events-none"></div>

      {/* Brand Header */}
      <div className="flex items-center gap-space-sm mb-space-xl relative z-10">
        <div className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center font-bold text-xl shadow-sm">
          N
        </div>
        <span className="font-headline-md text-headline-md font-bold text-on-surface tracking-tight">
          NexaFinance
        </span>
      </div>

      {/* Main Auth Card */}
      <div className="w-full max-w-md bg-surface-container-lowest rounded-2xl p-space-xl md:p-space-2xl border border-outline-variant/60 shadow-lg relative z-10 flex flex-col gap-space-lg">
        {/* Top Header inside Card */}
        <div className="flex flex-col items-center text-center gap-space-xs">
          <div className="w-12 h-12 rounded-xl bg-primary text-on-primary flex items-center justify-center shadow-sm mb-1">
            <span className="material-symbols-outlined text-[26px]">account_balance</span>
          </div>
          <span className="font-label-caps text-label-caps text-primary uppercase font-bold tracking-wider">
            Treasury &amp; Cash Flow
          </span>
          <h1 className="font-headline-md text-headline-md font-bold text-on-surface">
            Selamat Datang Kembali
          </h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant max-w-xs">
            Masuk ke workspace perbendaharaan bisnis Anda
          </p>
        </div>

        {/* WhatsApp 1-Click Fast Login */}
        <button
          type="button"
          onClick={() => handleDemoLogin('iman@gmail.com', 'admin123')}
          className="w-full py-space-sm px-space-md rounded-xl bg-tertiary-container hover:bg-tertiary text-on-tertiary font-body-md font-semibold flex items-center justify-center gap-space-sm shadow-xs transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">chat</span>
          <span>Masuk Cepat dengan WhatsApp</span>
          <span className="font-label-caps text-label-caps px-2 py-0.5 rounded-full bg-white text-tertiary font-bold ml-1">
            OTP 1-Klik
          </span>
        </button>

        {/* Divider */}
        <div className="flex items-center gap-space-sm my-0.5">
          <div className="flex-1 h-px bg-surface-container-high"></div>
          <span className="font-label-caps text-label-caps uppercase text-outline font-semibold text-[10.5px]">
            Atau Masuk dengan Email &amp; Sandi
          </span>
          <div className="flex-1 h-px bg-surface-container-high"></div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-space-sm rounded-lg bg-error-container text-on-error-container text-body-sm font-medium flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>{error}</span>
          </div>
        )}

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-space-md">
          {/* Email */}
          <div className="flex flex-col gap-1">
            <label className="font-label-caps text-label-caps uppercase text-outline font-semibold">
              Email Bisnis
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-[18px]">
                mail
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@perusahaan.com"
                className="w-full pl-10 pr-space-md py-space-sm bg-surface-container-low/70 border border-outline-variant rounded-xl font-body-md text-on-surface focus:outline-none focus:border-primary focus:bg-surface-container-lowest transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1">
            <label className="font-label-caps text-label-caps uppercase text-outline font-semibold">
              Kata Sandi
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-[18px]">
                lock
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-10 py-space-sm bg-surface-container-low/70 border border-outline-variant rounded-xl font-body-md text-on-surface focus:outline-none focus:border-primary focus:bg-surface-container-lowest transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          {/* Remember & Forgot Password */}
          <div className="flex items-center justify-between text-body-sm">
            <label className="flex items-center gap-2 cursor-pointer text-on-surface-variant">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded text-primary focus:ring-primary"
              />
              <span>Ingat saya</span>
            </label>

            <button
              type="button"
              onClick={() => alert('Fitur pemulihan kata sandi dikirim via WhatsApp Bot.')}
              className="text-primary font-semibold hover:underline"
            >
              Lupa kata sandi?
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-space-sm px-space-md rounded-xl bg-primary hover:bg-primary-container text-on-primary font-body-md font-semibold flex items-center justify-center gap-space-xs shadow-sm transition-colors disabled:opacity-50 mt-1"
          >
            <span>{loading ? 'Memverifikasi...' : 'Masuk ke Dashboard'}</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </form>

        {/* Security Footnote */}
        <div className="p-space-sm bg-surface-container-low rounded-xl flex items-center justify-center gap-2 text-[11.5px] text-on-surface-variant text-center">
          <span className="material-symbols-outlined text-[16px] text-primary">verified_user</span>
          <span>256-bit Bank Grade • ISO 27001 Certified • Data Terisolasi Per-Workspace</span>
        </div>

        {/* Quick Demo Credentials Footer */}
        <div className="text-center text-body-sm text-on-surface-variant flex flex-col gap-1 border-t border-surface-container-high/80 pt-space-sm">
          <div>
            Belum memiliki akun?{' '}
            <button
              type="button"
              onClick={() => handleDemoLogin('iman@gmail.com', 'admin123')}
              className="text-primary font-bold hover:underline"
            >
              Daftar Gratis
            </button>
          </div>
          <div className="text-[12px] text-outline">
            Mode Demo 1-Klik: Gunakan <strong>iman@gmail.com</strong>
          </div>
        </div>
      </div>

      {/* Bottom Legal Footer */}
      <footer className="mt-space-lg text-center text-[12px] text-outline">
        <p>&copy; 2026 NexaFinance — Next-Gen SME Treasury Platform. Dikembangkan oleh <strong>Nexa Digital Agency</strong>.</p>
      </footer>
    </div>
  );
};
