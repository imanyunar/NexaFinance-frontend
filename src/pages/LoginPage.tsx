import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, loginWithOtp, login } = useAuth();

  // Authentication State
  const [step, setStep] = useState<'email' | 'otp' | 'password'>('email');
  const [email, setEmail] = useState('iman@gmail.com');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [sendToWhatsApp, setSendToWhatsApp] = useState(true);
  const [whatsappNumber, setWhatsappNumber] = useState('0812-9988-7766');

  // OTP State (6 digits)
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [activeOtpCode, setActiveOtpCode] = useState<string>('882194');
  const [countdown, setCountdown] = useState<number>(45);
  const [canResend, setCanResend] = useState<boolean>(false);
  const [notificationToast, setNotificationToast] = useState<{ title: string; body: string; channel: 'wa' | 'email' } | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  // Countdown timer for OTP resend
  useEffect(() => {
    let timer: any = null;
    if (step === 'otp' && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [step, countdown]);

  // Step 1: Send OTP to Email & WhatsApp Notification
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Masukkan alamat email bisnis yang valid.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      // Generate realistic 6-digit OTP
      const generatedCode = String(Math.floor(100000 + Math.random() * 900000));
      setActiveOtpCode(generatedCode);
      setOtp(['', '', '', '', '', '']);
      setCountdown(45);
      setCanResend(false);

      // Simulate network dispatch
      await new Promise((resolve) => setTimeout(resolve, 600));

      setStep('otp');

      // Trigger notification popup
      if (sendToWhatsApp) {
        setNotificationToast({
          channel: 'wa',
          title: 'WhatsApp Bot NexaFinance',
          body: `Halo! Kode OTP login Anda: ${generatedCode}. Berlaku selama 5 menit.`,
        });
      } else {
        setNotificationToast({
          channel: 'email',
          title: 'Email Verifikasi Terkirim',
          body: `Kode OTP ${generatedCode} telah dikirim ke ${email}.`,
        });
      }

      // Auto-hide toast after 8 seconds
      setTimeout(() => {
        setNotificationToast(null);
      }, 8000);

      // Auto-focus first OTP input box
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 200);
    } catch {
      setError('Gagal mengirim kode verifikasi. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Handle single digit input
  const handleOtpChange = (index: number, value: string) => {
    // Only accept numeric digit
    const cleaned = value.replace(/\D/g, '');
    const newOtp = [...otp];

    if (!cleaned) {
      newOtp[index] = '';
      setOtp(newOtp);
      return;
    }

    // Single digit input
    newOtp[index] = cleaned[cleaned.length - 1];
    setOtp(newOtp);

    // Auto-focus next input
    if (index < 5 && cleaned) {
      otpInputRefs.current[index + 1]?.focus();
    }

    // Auto-submit if all 6 digits filled
    const fullCode = newOtp.join('');
    if (fullCode.length === 6) {
      verifyAndLogin(fullCode);
    }
  };

  // Handle backspace navigation
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste full 6-digit code
  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;

    const digits = pasted.split('');
    const newOtp = ['', '', '', '', '', ''];
    digits.forEach((d, i) => {
      newOtp[i] = d;
    });
    setOtp(newOtp);

    if (pasted.length === 6) {
      verifyAndLogin(pasted);
    } else {
      otpInputRefs.current[Math.min(pasted.length, 5)]?.focus();
    }
  };

  // Verify OTP and complete login
  const verifyAndLogin = async (codeToVerify?: string) => {
    const enteredCode = codeToVerify || otp.join('');
    if (enteredCode.length < 6) {
      setError('Harap masukkan 6 digit kode OTP verifikasi.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      // In production/demo, activeOtpCode or default '882194' / '123456' is accepted
      if (enteredCode !== activeOtpCode && enteredCode !== '882194' && enteredCode !== '123456') {
        setError('Kode OTP tidak valid atau telah kedaluwarsa. Silakan periksa kembali.');
        setLoading(false);
        return;
      }

      await loginWithOtp(email, enteredCode, true);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Verifikasi gagal. Silakan coba kembali.');
    } finally {
      setLoading(false);
    }
  };

  // Instant demo auto-fill
  const handleAutoFillDemoOtp = () => {
    const code = activeOtpCode;
    const digits = code.split('');
    setOtp(digits);
    verifyAndLogin(code);
  };

  // Fallback direct password login
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password, true);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Email atau kata sandi tidak cocok.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-space-md relative overflow-hidden font-body-md antialiased text-on-surface">
      {/* Dynamic Background Ambient Accents */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-fixed/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary-fixed/20 rounded-full blur-3xl pointer-events-none"></div>

      {/* Floating Simulated WhatsApp / Email Notification Toast */}
      {notificationToast && (
        <div className="fixed top-5 z-50 animate-bounce duration-500 max-w-md w-[90%] bg-surface-container-lowest rounded-2xl p-space-md border border-outline-variant/60 shadow-2xl flex items-start gap-space-sm">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              notificationToast.channel === 'wa' ? 'bg-[#25D366] text-white' : 'bg-primary text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">
              {notificationToast.channel === 'wa' ? 'chat' : 'mail'}
            </span>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="font-badge-label text-badge-label font-bold text-on-surface">
                {notificationToast.title}
              </span>
              <span className="font-label-caps text-label-caps text-on-surface-variant">Baru Saja</span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
              {notificationToast.body}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setNotificationToast(null)}
            className="text-on-surface-variant hover:text-on-surface p-1"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}

      {/* Brand Header */}
      <div className="flex items-center gap-space-sm mb-space-lg relative z-10">
        <div className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center font-bold text-xl shadow-sm">
          N
        </div>
        <span className="font-headline-md text-headline-md font-bold text-on-surface tracking-tight">
          NexaFinance
        </span>
      </div>

      {/* Main Auth Card */}
      <div className="w-full max-w-md bg-surface-container-lowest rounded-2xl p-space-xl md:p-space-2xl border border-outline-variant/60 shadow-lg relative z-10 flex flex-col gap-space-lg">
        {/* ======================================================== */}
        {/* STEP 1: INPUT EMAIL & CHANNEL PREFERENCE                 */}
        {/* ======================================================== */}
        {step === 'email' && (
          <>
            {/* Top Header inside Card */}
            <div className="flex flex-col items-center text-center gap-space-xs">
              <div className="w-12 h-12 rounded-xl bg-primary text-on-primary flex items-center justify-center shadow-sm mb-1">
                <span className="material-symbols-outlined text-[26px]">mark_email_read</span>
              </div>
              <span className="font-label-caps text-label-caps text-primary uppercase font-bold tracking-wider">
                Passwordless Authentication
              </span>
              <h1 className="font-headline-md text-headline-md font-bold text-on-surface">
                Masuk dengan Kode OTP
              </h1>
              <p className="font-body-sm text-body-sm text-on-surface-variant max-w-xs">
                Verifikasi instan via Email dan notifikasi WhatsApp tanpa perlu mengingat kata sandi.
              </p>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="p-space-sm rounded-lg bg-error-container text-on-error-container text-body-sm font-medium flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">error</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSendOtp} className="flex flex-col gap-space-md">
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

              {/* WhatsApp Notification Sync Toggle Card */}
              <div
                onClick={() => setSendToWhatsApp(!sendToWhatsApp)}
                className={`p-space-sm rounded-xl border cursor-pointer transition-all flex items-start gap-space-sm ${
                  sendToWhatsApp
                    ? 'bg-[#25D366]/5 border-[#25D366]/40 shadow-xs'
                    : 'bg-surface-container-low/40 border-outline-variant/60'
                }`}
              >
                <div className="pt-0.5">
                  <input
                    type="checkbox"
                    checked={sendToWhatsApp}
                    onChange={(e) => setSendToWhatsApp(e.target.checked)}
                    className="w-4 h-4 rounded text-[#25D366] focus:ring-[#25D366] cursor-pointer"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 font-badge-label text-badge-label font-bold text-on-surface">
                    <span className="material-symbols-outlined text-[18px] text-[#25D366]">chat</span>
                    <span>Kirim Notifikasi OTP via WhatsApp</span>
                  </div>
                  <p className="font-label-caps text-label-caps text-on-surface-variant mt-0.5">
                    Kode verifikasi juga akan disinkronkan ke WhatsApp Bot ({whatsappNumber}).
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-space-sm px-space-md rounded-xl bg-primary hover:bg-primary-container text-on-primary font-body-md font-semibold flex items-center justify-center gap-space-xs shadow-sm transition-colors disabled:opacity-50 mt-1"
              >
                <span>{loading ? 'Mengirim Kode...' : 'Kirim Kode Verifikasi'}</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </form>

            {/* Quick Demo Fill Pill */}
            <div className="p-space-sm rounded-xl bg-surface-container-low flex items-center justify-between text-body-sm">
              <span className="text-on-surface-variant text-[12.5px]">Akun Demo Cepat:</span>
              <button
                type="button"
                onClick={() => {
                  setEmail('iman@gmail.com');
                  setSendToWhatsApp(true);
                }}
                className="font-badge-label text-badge-label font-semibold text-primary hover:underline bg-white px-2.5 py-1 rounded-lg border border-outline-variant/60"
              >
                Isi iman@gmail.com
              </button>
            </div>

            {/* Alternative: Password login */}
            <div className="text-center pt-1 border-t border-surface-container-high/60">
              <button
                type="button"
                onClick={() => setStep('password')}
                className="font-label-caps text-label-caps uppercase text-outline hover:text-primary font-semibold transition-colors"
              >
                Atau Masuk Menggunakan Kata Sandi →
              </button>
            </div>
          </>
        )}

        {/* ======================================================== */}
        {/* STEP 2: INPUT 6-DIGIT OTP CODE                           */}
        {/* ======================================================== */}
        {step === 'otp' && (
          <>
            {/* Header with Back Button */}
            <div className="flex flex-col items-center text-center gap-space-xs relative">
              <button
                type="button"
                onClick={() => {
                  setStep('email');
                  setError(null);
                }}
                className="absolute left-0 top-0 text-on-surface-variant hover:text-on-surface flex items-center gap-1 font-body-sm"
              >
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                <span className="hidden sm:inline">Ubah</span>
              </button>

              <div className="w-12 h-12 rounded-xl bg-primary text-on-primary flex items-center justify-center shadow-sm mb-1">
                <span className="material-symbols-outlined text-[26px]">key</span>
              </div>
              <span className="font-label-caps text-label-caps text-primary uppercase font-bold tracking-wider">
                Verifikasi 6-Digit
              </span>
              <h1 className="font-headline-md text-headline-md font-bold text-on-surface">
                Masukkan Kode OTP
              </h1>
              <div className="font-body-sm text-body-sm text-on-surface-variant max-w-xs mt-0.5">
                Kode verifikasi telah dikirim ke: <br />
                <strong className="text-on-surface font-semibold">{email}</strong>
              </div>

              {sendToWhatsApp && (
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#25D366]/10 text-[#00873c] font-label-caps text-label-caps mt-1">
                  <span className="material-symbols-outlined text-[14px]">chat</span>
                  <span>Notifikasi WhatsApp Aktif ({whatsappNumber})</span>
                </div>
              )}
            </div>

            {/* Error Alert */}
            {error && (
              <div className="p-space-sm rounded-lg bg-error-container text-on-error-container text-body-sm font-medium flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">error</span>
                <span>{error}</span>
              </div>
            )}

            {/* Segmented 6-Digit OTP Inputs */}
            <div className="flex flex-col items-center gap-space-md">
              <div className="flex items-center justify-center gap-2 sm:gap-2.5 w-full">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      otpInputRefs.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    onPaste={handleOtpPaste}
                    className="w-11 sm:w-12 h-14 text-center font-numeric-table text-numeric-table sm:text-2xl font-bold font-mono rounded-xl bg-surface-container-low border border-outline-variant focus:border-primary focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 transition-all text-on-surface"
                  />
                ))}
              </div>

              {/* Demo Helper Banner with Instant 1-Click Fill */}
              <div className="w-full p-space-sm rounded-xl bg-primary/5 border border-primary/20 flex items-center justify-between text-body-sm">
                <div className="flex items-center gap-1.5 text-primary font-badge-label text-badge-label">
                  <span className="material-symbols-outlined text-[16px]">verified</span>
                  <span>Kode OTP: <strong>{activeOtpCode}</strong></span>
                </div>
                <button
                  type="button"
                  onClick={handleAutoFillDemoOtp}
                  className="px-2.5 py-1 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-badge-label text-badge-label font-semibold shadow-xs transition-colors"
                >
                  Isi Otomatis
                </button>
              </div>

              {/* Submit Verification Button */}
              <button
                type="button"
                onClick={() => verifyAndLogin()}
                disabled={loading || otp.join('').length < 6}
                className="w-full py-space-sm px-space-md rounded-xl bg-primary hover:bg-primary-container text-on-primary font-body-md font-semibold flex items-center justify-center gap-space-xs shadow-sm transition-colors disabled:opacity-50"
              >
                <span>{loading ? 'Memverifikasi...' : 'Verifikasi & Masuk'}</span>
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
              </button>

              {/* Resend Countdown */}
              <div className="text-center font-body-sm text-body-sm text-on-surface-variant">
                {!canResend ? (
                  <span>
                    Kirim ulang kode dalam <strong className="text-on-surface">{countdown} detik</strong>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSendOtp()}
                    className="text-primary font-bold hover:underline inline-flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[16px]">refresh</span>
                    <span>Kirim Ulang Kode Sekarang</span>
                  </button>
                )}
              </div>
            </div>
          </>
        )}

        {/* ======================================================== */}
        {/* STEP 3: FALLBACK PASSWORD LOGIN                          */}
        {/* ======================================================== */}
        {step === 'password' && (
          <>
            <div className="flex flex-col items-center text-center gap-space-xs relative">
              <button
                type="button"
                onClick={() => {
                  setStep('email');
                  setError(null);
                }}
                className="absolute left-0 top-0 text-on-surface-variant hover:text-on-surface flex items-center gap-1 font-body-sm"
              >
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                <span>OTP</span>
              </button>

              <div className="w-12 h-12 rounded-xl bg-primary text-on-primary flex items-center justify-center shadow-sm mb-1">
                <span className="material-symbols-outlined text-[26px]">lock</span>
              </div>
              <h1 className="font-headline-md text-headline-md font-bold text-on-surface">
                Masuk dengan Sandi
              </h1>
              <p className="font-body-sm text-body-sm text-on-surface-variant max-w-xs">
                Opsi login konvensional menggunakan kata sandi workspace Anda.
              </p>
            </div>

            {error && (
              <div className="p-space-sm rounded-lg bg-error-container text-on-error-container text-body-sm font-medium flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">error</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handlePasswordLogin} className="flex flex-col gap-space-md">
              <div className="flex flex-col gap-1">
                <label className="font-label-caps text-label-caps uppercase text-outline font-semibold">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-space-md py-space-sm bg-surface-container-low/70 border border-outline-variant rounded-xl font-body-md text-on-surface"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-label-caps text-label-caps uppercase text-outline font-semibold">
                  Kata Sandi
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-space-md pr-10 py-space-sm bg-surface-container-low/70 border border-outline-variant rounded-xl font-body-md text-on-surface"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-outline"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-space-sm px-space-md rounded-xl bg-primary hover:bg-primary-container text-on-primary font-body-md font-semibold flex items-center justify-center gap-space-xs shadow-sm transition-colors"
              >
                <span>{loading ? 'Memverifikasi...' : 'Masuk'}</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </form>
          </>
        )}

        {/* Security Footnote */}
        <div className="p-space-sm bg-surface-container-low rounded-xl flex items-center justify-center gap-2 text-[11.5px] text-on-surface-variant text-center">
          <span className="material-symbols-outlined text-[16px] text-primary">verified_user</span>
          <span>256-bit Bank Grade • ISO 27001 Certified • Data Terisolasi Per-Workspace</span>
        </div>
      </div>

      {/* Bottom Legal Footer */}
      <footer className="mt-space-lg text-center text-[12px] text-outline">
        <p>&copy; 2026 NexaFinance — Next-Gen SME Treasury Platform. Dikembangkan oleh <strong>Nexa Digital Agency</strong>.</p>
      </footer>
    </div>
  );
};

export default LoginPage;
