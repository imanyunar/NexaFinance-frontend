import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, login } = useAuth();

  // Form State (Email & Password Only)
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

  // Direct Email & Password Login
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !email.includes('@')) {
      setError('Masukkan alamat email bisnis yang valid.');
      return;
    }

    if (!password) {
      setError('Kata sandi wajib diisi.');
      return;
    }

    setLoading(true);

    try {
      await login(email.trim(), password, rememberMe);
      navigate('/');
    } catch (err: any) {
      setError(err?.message || 'Email atau kata sandi tidak cocok. Silakan coba kembali.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-space-md relative overflow-hidden font-body-md antialiased text-on-surface">
      {/* Ambient Background Accents */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-fixed/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary-fixed/20 rounded-full blur-3xl pointer-events-none"></div>

      {/* Brand Header */}
      <Link to="/" className="flex items-center gap-space-sm mb-space-lg relative z-10 group hover:opacity-90 transition-opacity">
        <div className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center font-bold text-xl shadow-sm group-hover:scale-105 transition-transform">
          N
        </div>
        <span className="font-headline-md text-headline-md font-bold text-on-surface tracking-tight">
          Nexa<span className="text-primary">Finance</span>
        </span>
      </Link>

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-surface-container-lowest rounded-2xl p-space-xl md:p-space-2xl border border-outline-variant/60 shadow-lg relative z-10 flex flex-col gap-space-lg">
        {/* Header inside Card */}
        <div className="flex flex-col items-center text-center gap-space-xs">
          <div className="w-12 h-12 rounded-xl bg-primary text-on-primary flex items-center justify-center shadow-sm mb-1">
            <span className="material-symbols-outlined text-[26px]">lock</span>
          </div>
          <span className="font-label-caps text-label-caps text-primary uppercase font-bold tracking-wider">
            Bank-Grade Treasury Access
          </span>
          <h1 className="font-headline-md text-headline-md font-bold text-on-surface">
            Masuk ke Akun Anda
          </h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant max-w-xs">
            Masukkan alamat email bisnis dan kata sandi Anda untuk mengakses dashboard keuangan.
          </p>
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
          {/* Email Input */}
          <div className="flex flex-col gap-1">
            <label className="font-label-caps text-label-caps uppercase text-outline font-semibold">
              Alamat Email Bisnis
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

          {/* Password Input */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label className="font-label-caps text-label-caps uppercase text-outline font-semibold">
                Kata Sandi
              </label>
              <button
                type="button"
                onClick={() => alert('Fitur reset kata sandi dapat dilakukan melalui bantuan administrator workspace.')}
                className="text-[11.5px] text-primary font-semibold hover:underline"
              >
                Lupa Kata Sandi?
              </button>
            </div>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-[18px]">
                key
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
                className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface p-1"
                title={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
              >
                <span className="material-symbols-outlined text-[18px]">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center justify-between text-body-sm text-on-surface-variant pt-0.5">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer accent-[#006948]"
              />
              <span className="text-[13px]">Ingat sesi saya di perangkat ini</span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-space-sm px-space-md rounded-xl bg-primary hover:bg-primary-container text-on-primary font-body-md font-semibold flex items-center justify-center gap-space-xs shadow-sm transition-colors disabled:opacity-50 mt-1"
          >
            <span>{loading ? 'Memverifikasi Kredensial...' : 'Masuk ke NexaFinance'}</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </form>


        {/* Register Link */}
        <div className="text-center text-body-sm text-on-surface-variant border-t border-surface-container-high/60 pt-3">
          Belum memiliki akun?{' '}
          <Link to="/register" className="text-primary font-bold hover:underline">
            Daftar Akun Baru
          </Link>
        </div>

        {/* Bank Grade Footnote */}
        <div className="p-space-xs bg-surface-container-low rounded-xl flex items-center justify-center gap-1.5 text-[11px] text-on-surface-variant text-center">
          <span className="material-symbols-outlined text-[15px] text-primary">verified_user</span>
          <span>Terenkripsi 256-bit • Otentikasi Email & Sandi Terverifikasi</span>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-space-lg text-center text-[12px] text-outline">
        <p>&copy; 2026 NexaFinance — Next-Gen SME Treasury Platform.</p>
      </footer>
    </div>
  );
};

export default LoginPage;
