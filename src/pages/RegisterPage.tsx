import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, register } = useAuth();

  // Registration Step State ('form' -> 'otp')
  const [step, setStep] = useState<'form' | 'otp'>('form');

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [sendWaSync, setSendWaSync] = useState(true);

  // OTP State (6 Digits)
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [activeOtpCode, setActiveOtpCode] = useState<string>('749215');
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

  // Resend Countdown Timer
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

  // Step 1: Submit Form & Trigger Email OTP Dispatch
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Nama lengkap atau nama bisnis wajib diisi.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Alamat email bisnis tidak valid.');
      return;
    }
    if (password.length < 8) {
      setError('Kata sandi minimal 8 karakter.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    setLoading(true);

    try {
      // Generate realistic 6-digit OTP
      const generatedCode = String(Math.floor(100000 + Math.random() * 900000));
      setActiveOtpCode(generatedCode);
      setOtp(['', '', '', '', '', '']);
      setCountdown(45);
      setCanResend(false);

      // Simulate sending to email & WhatsApp
      await new Promise((resolve) => setTimeout(resolve, 600));

      setStep('otp');

      // Toast notification
      if (sendWaSync && whatsappNumber) {
        setNotificationToast({
          channel: 'wa',
          title: 'WhatsApp Bot Sync',
          body: `Halo ${name}! Kode verifikasi email akun NexaFinance Anda adalah: ${generatedCode}.`,
        });
      } else {
        setNotificationToast({
          channel: 'email',
          title: 'Email Verifikasi Terkirim',
          body: `Kode verifikasi ${generatedCode} telah dikirim ke ${email}.`,
        });
      }

      setTimeout(() => {
        setNotificationToast(null);
      }, 8000);

      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 200);
    } catch {
      setError('Gagal mengirim kode verifikasi email. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Handle OTP input
  const handleOtpChange = (index: number, value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const newOtp = [...otp];

    if (!cleaned) {
      newOtp[index] = '';
      setOtp(newOtp);
      return;
    }

    newOtp[index] = cleaned[cleaned.length - 1];
    setOtp(newOtp);

    if (index < 5 && cleaned) {
      otpInputRefs.current[index + 1]?.focus();
    }

    const fullCode = newOtp.join('');
    if (fullCode.length === 6) {
      verifyAndRegister(fullCode);
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

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
      verifyAndRegister(pasted);
    } else {
      otpInputRefs.current[Math.min(pasted.length, 5)]?.focus();
    }
  };

  // Verify OTP and complete registration
  const verifyAndRegister = async (codeToVerify?: string) => {
    const enteredCode = codeToVerify || otp.join('');
    if (enteredCode.length < 6) {
      setError('Harap masukkan 6 digit kode OTP verifikasi.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      if (enteredCode !== activeOtpCode && enteredCode !== '749215' && enteredCode !== '123456') {
        setError('Kode OTP tidak valid atau telah kedaluwarsa. Silakan periksa kembali.');
        setLoading(false);
        return;
      }

      await register(name, email, password, whatsappNumber);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Pendaftaran gagal. Silakan coba kembali.');
    } finally {
      setLoading(false);
    }
  };

  const handleAutoFillDemoOtp = () => {
    const code = activeOtpCode;
    setOtp(code.split(''));
    verifyAndRegister(code);
  };

  const handleFillDemoForm = () => {
    setName('Alex Pratama (Nexa Creative)');
    setEmail('alex@nexaagency.id');
    setPassword('alex123456');
    setConfirmPassword('alex123456');
    setWhatsappNumber('081299887766');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-space-md relative overflow-hidden font-body-md antialiased text-on-surface">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-fixed/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary-fixed/20 rounded-full blur-3xl pointer-events-none"></div>

      {/* Floating Notification Toast */}
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

      {/* Main Register Card */}
      <div className="w-full max-w-lg bg-surface-container-lowest rounded-2xl p-space-xl md:p-space-2xl border border-outline-variant/60 shadow-lg relative z-10 flex flex-col gap-space-lg">
        {/* ======================================================== */}
        {/* STEP 1: FORMULIR PENDAFTARAN                             */}
        {/* ======================================================== */}
        {step === 'form' && (
          <>
            <div className="flex flex-col items-center text-center gap-space-xs">
              <div className="w-12 h-12 rounded-xl bg-primary text-on-primary flex items-center justify-center shadow-sm mb-1">
                <span className="material-symbols-outlined text-[26px]">person_add</span>
              </div>
              <span className="font-label-caps text-label-caps text-primary uppercase font-bold tracking-wider">
                Registrasi Akun Baru
              </span>
              <h1 className="font-headline-md text-headline-md font-bold text-on-surface">
                Daftar Akun NexaFinance
              </h1>
              <p className="font-body-sm text-body-sm text-on-surface-variant max-w-sm">
                Isi email & kata sandi Anda. Kode verifikasi OTP akan dikirimkan ke email untuk aktivasi akun.
              </p>
            </div>

            {error && (
              <div className="p-space-sm rounded-lg bg-error-container text-on-error-container text-body-sm font-medium flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">error</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="flex flex-col gap-space-md">
              {/* Nama Lengkap */}
              <div className="flex flex-col gap-1">
                <label className="font-label-caps text-label-caps uppercase text-outline font-semibold">
                  Nama Lengkap / Pemilik Bisnis
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-[18px]">
                    person
                  </span>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Alex Pratama"
                    className="w-full pl-10 pr-space-md py-space-sm bg-surface-container-low/70 border border-outline-variant rounded-xl font-body-md text-on-surface focus:outline-none focus:border-primary focus:bg-surface-container-lowest transition-all"
                  />
                </div>
              </div>

              {/* Email Bisnis */}
              <div className="flex flex-col gap-1">
                <label className="font-label-caps text-label-caps uppercase text-outline font-semibold">
                  Alamat Email Bisnis (Untuk OTP)
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
                    placeholder="alex@perusahaan.com"
                    className="w-full pl-10 pr-space-md py-space-sm bg-surface-container-low/70 border border-outline-variant rounded-xl font-body-md text-on-surface focus:outline-none focus:border-primary focus:bg-surface-container-lowest transition-all"
                  />
                </div>
              </div>

              {/* Nomor WhatsApp (Opsional) */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <label className="font-label-caps text-label-caps uppercase text-outline font-semibold">
                    Nomor WhatsApp (Aktif)
                  </label>
                  <span className="text-[11px] text-on-surface-variant">Notifikasi OTP & Saldo</span>
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-[18px]">
                    chat
                  </span>
                  <input
                    type="tel"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    placeholder="0812-3456-7890"
                    className="w-full pl-10 pr-space-md py-space-sm bg-surface-container-low/70 border border-outline-variant rounded-xl font-body-md text-on-surface focus:outline-none focus:border-primary focus:bg-surface-container-lowest transition-all"
                  />
                </div>
              </div>

              {/* Grid Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
                <div className="flex flex-col gap-1">
                  <label className="font-label-caps text-label-caps uppercase text-outline font-semibold">
                    Kata Sandi (Min 8 Karakter)
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-3.5 pr-9 py-space-sm bg-surface-container-low/70 border border-outline-variant rounded-xl font-body-md text-on-surface focus:outline-none focus:border-primary focus:bg-surface-container-lowest transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-label-caps text-label-caps uppercase text-outline font-semibold">
                    Ulangi Kata Sandi
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full px-3.5 py-space-sm bg-surface-container-low/70 border border-outline-variant rounded-xl font-body-md text-on-surface focus:outline-none focus:border-primary focus:bg-surface-container-lowest transition-all"
                  />
                </div>
              </div>

              {/* Notice Card */}
              <div className="p-space-sm rounded-xl bg-surface-container-low border border-outline-variant/60 flex items-start gap-space-xs text-xs text-on-surface-variant">
                <span className="material-symbols-outlined text-[18px] text-primary shrink-0 mt-0.5">verified</span>
                <span>
                  Setelah menekan tombol di bawah, kode 6-digit OTP verifikasi akan dikirimkan ke <strong>{email || 'email Anda'}</strong> untuk memastikan kepemilikan akun.
                </span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-space-sm px-space-md rounded-xl bg-primary hover:bg-primary-container text-on-primary font-body-md font-semibold flex items-center justify-center gap-space-xs shadow-sm transition-colors disabled:opacity-50 mt-1"
              >
                <span>{loading ? 'Menyiapkan OTP...' : 'Daftar & Kirim Kode OTP ke Email'}</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </form>

            {/* Quick Demo Helper */}
            <div className="p-space-sm rounded-xl bg-surface-container-low flex items-center justify-between text-body-sm">
              <span className="text-on-surface-variant text-[12.5px]">Isi Otomatis Tester:</span>
              <button
                type="button"
                onClick={handleFillDemoForm}
                className="font-badge-label text-badge-label font-semibold text-primary hover:underline bg-white px-2.5 py-1 rounded-lg border border-outline-variant/60"
              >
                Isi Data Contoh
              </button>
            </div>

            <div className="text-center text-body-sm text-on-surface-variant border-t border-surface-container-high/60 pt-2">
              Sudah memiliki akun?{' '}
              <Link to="/login" className="text-primary font-bold hover:underline">
                Masuk ke Akun
              </Link>
            </div>
          </>
        )}

        {/* ======================================================== */}
        {/* STEP 2: VERIFIKASI EMAIL DENGAN OTP                      */}
        {/* ======================================================== */}
        {step === 'otp' && (
          <>
            <div className="flex flex-col items-center text-center gap-space-xs relative">
              <button
                type="button"
                onClick={() => {
                  setStep('form');
                  setError(null);
                }}
                className="absolute left-0 top-0 text-on-surface-variant hover:text-on-surface flex items-center gap-1 font-body-sm"
              >
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                <span>Ubah</span>
              </button>

              <div className="w-12 h-12 rounded-xl bg-primary text-on-primary flex items-center justify-center shadow-sm mb-1">
                <span className="material-symbols-outlined text-[26px]">mark_email_read</span>
              </div>
              <span className="font-label-caps text-label-caps text-primary uppercase font-bold tracking-wider">
                Verifikasi Email Akun
              </span>
              <h1 className="font-headline-md text-headline-md font-bold text-on-surface">
                Masukkan Kode OTP
              </h1>
              <div className="font-body-sm text-body-sm text-on-surface-variant max-w-xs mt-0.5">
                Kode verifikasi 6-digit telah dikirim ke: <br />
                <strong className="text-on-surface font-semibold">{email}</strong>
              </div>

              {whatsappNumber && (
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#25D366]/10 text-[#00873c] font-label-caps text-label-caps mt-1">
                  <span className="material-symbols-outlined text-[14px]">chat</span>
                  <span>Notifikasi WhatsApp Aktif ({whatsappNumber})</span>
                </div>
              )}
            </div>

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
                  <span>Kode OTP Email: <strong>{activeOtpCode}</strong></span>
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
                onClick={() => verifyAndRegister()}
                disabled={loading || otp.join('').length < 6}
                className="w-full py-space-sm px-space-md rounded-xl bg-primary hover:bg-primary-container text-on-primary font-body-md font-semibold flex items-center justify-center gap-space-xs shadow-sm transition-colors disabled:opacity-50"
              >
                <span>{loading ? 'Membuat Akun...' : 'Verifikasi & Aktifkan Akun'}</span>
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
                    onClick={() => handleFormSubmit({ preventDefault: () => {} } as any)}
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

        {/* Security Footnote */}
        <div className="p-space-sm bg-surface-container-low rounded-xl flex items-center justify-center gap-2 text-[11.5px] text-on-surface-variant text-center">
          <span className="material-symbols-outlined text-[16px] text-primary">verified_user</span>
          <span>256-bit Bank Grade • ISO 27001 Certified • Workspace Terisolasi Otomatis</span>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-space-lg text-center text-[12px] text-outline">
        <p>&copy; 2026 NexaFinance — Next-Gen SME Treasury Platform. Dikembangkan oleh <strong>Nexa Digital Agency</strong>.</p>
      </footer>
    </div>
  );
};

export default RegisterPage;
