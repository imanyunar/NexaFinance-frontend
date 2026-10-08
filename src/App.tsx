import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WorkspaceProvider } from './context/WorkspaceContext';
import { AppShell } from './components/layout/AppShell';
import { Skeleton } from './components/ui/Skeleton';

// Route-based code splitting for maximum Lighthouse Performance
const DashboardPage = lazy(() => import('./pages/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const TransactionsPage = lazy(() => import('./pages/TransactionsPage').then((m) => ({ default: m.TransactionsPage })));
const BudgetsPage = lazy(() => import('./pages/BudgetsPage').then((m) => ({ default: m.BudgetsPage })));
const AccountsPage = lazy(() => import('./pages/AccountsPage').then((m) => ({ default: m.AccountsPage })));
const AiAgentPage = lazy(() => import('./pages/AiAgentPage').then((m) => ({ default: m.AiAgentPage })));
const LoginPage = lazy(() => import('./pages/LoginPage').then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('./pages/RegisterPage').then((m) => ({ default: m.RegisterPage })));

const PageFallback: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '12px 0' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Skeleton width={220} height={28} borderRadius={6} />
      <Skeleton width={120} height={36} borderRadius={48} />
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
      <div className="skeleton-card" style={{ height: '180px' }} />
      <div className="skeleton-card" style={{ height: '180px' }} />
      <div className="skeleton-card" style={{ height: '180px' }} />
    </div>
  </div>
);

const ProtectedLayout: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f8fafd',
          gap: '12px',
        }}
      >
        <div
          style={{
            width: '36px',
            height: '36px',
            background: 'linear-gradient(135deg, #187aba, #003061)',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '18px',
            color: '#ffffff',
          }}
        >
          N
        </div>
        <div style={{ color: '#002244', fontWeight: 600, fontSize: '14px' }}>
          Memuat sesi NexaFinance...
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <WorkspaceProvider>
      <AppShell />
    </WorkspaceProvider>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route element={<ProtectedLayout />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/transactions" element={<TransactionsPage />} />
              <Route path="/budgets" element={<BudgetsPage />} />
              <Route path="/accounts" element={<AccountsPage />} />
              <Route path="/ai" element={<AiAgentPage />} />
              <Route path="/agent" element={<AiAgentPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
