import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../lib/api';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  whatsappNumber?: string;
  image?: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: (reason?: string | React.MouseEvent) => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Bank-Grade Security: Inactivity timeout 15 menit
const IDLE_TIMEOUT_MS = 15 * 60 * 1000;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Pure in-memory user state. No tokens are ever stored in localStorage!
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Clear any legacy localStorage tokens from previous sessions for safety
  useEffect(() => {
    try {
      localStorage.removeItem('nexa_auth_token');
      localStorage.removeItem('nexa_auth_user');
    } catch {
      // ignore
    }
  }, []);

  const logout = useCallback(async (reason?: string | React.MouseEvent) => {
    try {
      sessionStorage.removeItem('nexa_session_active');
      sessionStorage.removeItem('nexa_last_activity');
      await apiFetch('/auth/sign-out', { method: 'POST' });
    } catch {
      // ignore
    } finally {
      setUser(null);
      if (typeof reason === 'string' && reason.trim()) {
        alert(reason);
      }
      window.location.href = '/login';
    }
  }, []);

  const refreshSession = useCallback(async () => {
    try {
      setLoading(true);

      // Bank-Grade Check 1: Cek apakah ini sesi browser baru (misal laptop baru dinyalakan / browser baru dibuka)
      const isSessionActive = sessionStorage.getItem('nexa_session_active');
      const lastActivity = Number(sessionStorage.getItem('nexa_last_activity') || '0');

      if (!isSessionActive) {
        // Laptop baru menyala atau browser baru dibuka -> Otomatis logout demi keamanan bank
        try {
          await apiFetch('/auth/sign-out', { method: 'POST' });
        } catch {}
        setUser(null);
        return;
      }

      // Bank-Grade Check 2: Cek apakah melebihi idle timeout 15 menit
      if (lastActivity && Date.now() - lastActivity > IDLE_TIMEOUT_MS) {
        await logout('Sesi Anda telah kedaluwarsa demi keamanan perbankan (tidak ada aktivitas selama 15 menit). Silakan login kembali.');
        return;
      }

      // Validates session directly with the backend using the browser's HttpOnly cookie
      const res = await apiFetch('/auth/get-session');
      if (res?.user) {
        setUser(res.user);
        sessionStorage.setItem('nexa_last_activity', String(Date.now()));
      } else {
        setUser(null);
        sessionStorage.removeItem('nexa_session_active');
        sessionStorage.removeItem('nexa_last_activity');
      }
    } catch {
      setUser(null);
      sessionStorage.removeItem('nexa_session_active');
      sessionStorage.removeItem('nexa_last_activity');
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const data = await apiFetch('/auth/sign-in/email', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (data?.user) {
        sessionStorage.setItem('nexa_session_active', 'true');
        sessionStorage.setItem('nexa_last_activity', String(Date.now()));
        setUser(data.user);
      } else {
        sessionStorage.setItem('nexa_session_active', 'true');
        sessionStorage.setItem('nexa_last_activity', String(Date.now()));
        await refreshSession();
      }
    } finally {
      setLoading(false);
    }
  };

  // Inactivity / Idle Watcher (15 minutes)
  useEffect(() => {
    if (!user) return;

    let throttleTimer: any = null;
    const handleUserActivity = () => {
      if (!throttleTimer) {
        sessionStorage.setItem('nexa_last_activity', String(Date.now()));
        throttleTimer = setTimeout(() => {
          throttleTimer = null;
        }, 5000); // Throttle pembaruan waktu tiap 5 detik
      }
    };

    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
    events.forEach((evt) => window.addEventListener(evt, handleUserActivity, { passive: true }));

    // Cek timeout idle setiap 15 detik
    const interval = setInterval(() => {
      const lastActive = Number(sessionStorage.getItem('nexa_last_activity') || '0');
      if (lastActive && Date.now() - lastActive > IDLE_TIMEOUT_MS) {
        clearInterval(interval);
        logout('Sesi Anda telah berakhir secara otomatis demi keamanan perbankan (tidak ada aktivitas selama 15 menit). Silakan login kembali.');
      }
    }, 15000);

    return () => {
      events.forEach((evt) => window.removeEventListener(evt, handleUserActivity));
      clearInterval(interval);
      if (throttleTimer) clearTimeout(throttleTimer);
    };
  }, [user, logout]);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshSession }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
