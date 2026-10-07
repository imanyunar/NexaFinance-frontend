import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, AlertCircle, ArrowRight, Lock, Mail, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Email atau kata sandi tidak sesuai.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      await login('iman@nexafinance.com', 'password123');
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Gagal login akun Iman Azizi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f8fafd',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '420px',
          padding: '36px 32px',
          boxShadow: '0 12px 36px rgba(0, 34, 68, 0.08)',
          background: '#ffffff',
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              background: 'linear-gradient(135deg, #187aba, #003061)',
              borderRadius: '12px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '24px',
              color: '#ffffff',
              boxShadow: '0 4px 14px rgba(24, 122, 186, 0.3)',
              marginBottom: '12px',
            }}
          >
            N
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, margin: 0, color: '#002244' }}>
            Nexa<span style={{ color: '#187aba' }}>Finance</span>
          </h1>
          <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
            Masuk ke Portal Manajemen Keuangan Institusional
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: 'rgba(198, 34, 52, 0.08)',
              border: '1px solid rgba(198, 34, 52, 0.2)',
              borderRadius: '8px',
              padding: '10px 14px',
              color: '#c62234',
              fontSize: '13px',
              marginBottom: '20px',
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={16}
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
              />
              <input
                type="email"
                className="form-input"
                placeholder="nama@nexafinance.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '36px' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Kata Sandi</label>
            <div style={{ position: 'relative' }}>
              <Lock
                size={16}
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
              />
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '36px' }}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', marginTop: '8px', padding: '11px', fontSize: '14px' }}
          >
            {loading ? 'Memverifikasi...' : 'Masuk ke Portal'}
            {!loading && <ArrowRight size={15} />}
          </button>
        </form>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', margin: '22px 0', gap: '12px' }}>
          <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
          <span style={{ fontSize: '11.5px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            atau akses cepat
          </span>
          <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
        </div>

        {/* 1-Click Quick Login Button for Iman Azizi */}
        <button
          type="button"
          onClick={handleQuickLogin}
          disabled={loading}
          style={{
            width: '100%',
            padding: '10px 14px',
            borderRadius: '10px',
            border: '1px solid #bae6fd',
            background: '#f0f9ff',
            color: '#0369a1',
            fontWeight: 600,
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <Sparkles size={15} style={{ color: '#0284c7' }} />
          <span>Login Cepat: <strong>Iman Azizi</strong></span>
        </button>

        <div style={{ textAlign: 'center', marginTop: '22px', fontSize: '11.5px', color: '#94a3b8' }}>
          Terkoneksi langsung ke Vercel Cloud & Neon Database
        </div>
      </div>
    </div>
  );
};
