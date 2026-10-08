import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GoogleIcon, Button, Input } from '../components/ui';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
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

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        fontFamily: 'ui-sans-serif, system-ui, sans-serif',
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '460px',
          padding: '48px 36px',
          borderRadius: '24px',
          backgroundColor: '#ffffff',
          border: '1px solid #e5e5e5',
          boxShadow: 'rgba(112, 144, 176, 0.1) 0px 0px 40px 8px',
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              backgroundColor: '#005caa',
              borderRadius: '16px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '26px',
              color: '#ffffff',
              boxShadow: '0 4px 14px rgba(0, 92, 170, 0.25)',
              marginBottom: '16px',
            }}
          >
            N
          </div>
          <h1
            style={{
              fontSize: '24px',
              fontWeight: 700,
              margin: '0 0 6px',
              color: '#000000',
              fontFamily: "'Open Sans', sans-serif",
            }}
          >
            Masuk ke Akun
          </h1>
          <p
            style={{
              fontSize: '14px',
              color: '#666666',
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            Lengkapi email dan kata sandi untuk masuk ke akun Anda
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: '#fce8e6',
              border: '1px solid #fad2cf',
              borderRadius: '12px',
              padding: '12px 16px',
              color: '#c5221f',
              fontSize: '13px',
              marginBottom: '24px',
            }}
          >
            <GoogleIcon name="error" size={18} color="#c5221f" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <Input
            label="Email"
            type="email"
            placeholder="nama@nexafinance.com"
            required
            googleIcon="mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input
            label="Kata Sandi"
            type="password"
            placeholder="••••••••"
            required
            googleIcon="lock"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              margin: '12px 0 16px',
              fontSize: '13px',
              color: '#555555',
            }}
          >
            <label
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                userSelect: 'none',
              }}
            >
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{
                  width: '16px',
                  height: '16px',
                  accentColor: '#005caa',
                  cursor: 'pointer',
                }}
              />
              <span>Ingat saya di perangkat ini</span>
            </label>
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
              marginTop: '12px',
              borderRadius: '48px',
              padding: '12px 32px',
              fontSize: '15px',
            }}
          >
            {loading ? 'Memverifikasi...' : 'Masuk ke Portal'}
          </Button>
        </form>

        <div
          style={{
            textAlign: 'center',
            marginTop: '28px',
            paddingTop: '20px',
            borderTop: '1px solid #e5e5e5',
            fontSize: '12px',
            color: '#666666',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          <GoogleIcon name="verified_user" size={15} color="#005caa" />
          <span>Terkoneksi aman ke Nexa Institutional Cloud & Neon Database</span>
        </div>
      </div>
    </div>
  );
};
