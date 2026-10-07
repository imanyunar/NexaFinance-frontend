import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ReceiptText, 
  PiggyBank, 
  CreditCard, 
  Bot, 
  Plus, 
  Smartphone, 
  ChevronDown,
  RefreshCw,
  Building2,
  Sparkles,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowLeftRight
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';

export const AppShell: React.FC = () => {
  const { workspaces, activeWorkspace, totalBalance, loading, refreshData, createTransaction, accounts } = useWorkspace();
  const [showAddModal, setShowAddModal] = useState(false);
  const [txType, setTxType] = useState<'EXPENSE' | 'INCOME' | 'TRANSFER'>('EXPENSE');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [sourceAccountId, setSourceAccountId] = useState('');
  const [destinationAccountId, setDestinationAccountId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleCreateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description || !sourceAccountId) return;
    try {
      setSubmitting(true);
      await createTransaction({
        type: txType,
        amount: Number(amount),
        description,
        sourceAccountId,
        destinationAccountId: txType === 'TRANSFER' ? destinationAccountId : null,
        date: new Date().toISOString(),
      });
      setShowAddModal(false);
      setAmount('');
      setDescription('');
    } catch (err: any) {
      alert('Gagal menambah transaksi: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Corporate Institutional Navbar */}
      <header
        style={{
          background: '#002244',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          color: '#ffffff',
          position: 'sticky',
          top: 0,
          zIndex: 40,
        }}
      >
        <div
          style={{
            maxWidth: '1360px',
            margin: '0 auto',
            padding: '12px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
          }}
        >
          {/* Logo & Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  background: 'linear-gradient(135deg, #187aba, #003061)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '18px',
                  color: '#ffffff',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.25)',
                }}
              >
                N
              </div>
              <div>
                <div style={{ fontSize: '17px', fontWeight: 700, letterSpacing: '-0.3px', lineHeight: 1.1 }}>
                  Nexa<span style={{ color: '#38bdf8' }}>Finance</span>
                </div>
                <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 600 }}>
                  Institutional Treasury
                </div>
              </div>
            </div>

            {/* Workspace Selector */}
            {activeWorkspace && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(255, 255, 255, 0.07)',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  fontSize: '13px',
                }}
              >
                <Building2 size={14} style={{ color: '#38bdf8' }} />
                <span style={{ fontWeight: 600 }}>{activeWorkspace.name}</span>
                <span style={{ fontSize: '11px', color: '#64748b', background: 'rgba(255,255,255,0.1)', padding: '1px 6px', borderRadius: '4px' }}>
                  {activeWorkspace.role}
                </span>
              </div>
            )}
          </div>

          {/* Right Header Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {/* WhatsApp Integration Status Indicator */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: '#34d399',
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 600,
              }}
              title="Fonnte Inbound Bot Online on 085172247452"
            >
              <Smartphone size={13} />
              <span>WA Bot Aktif (085172247452)</span>
              <span
                style={{
                  width: '7px',
                  height: '7px',
                  background: '#10b981',
                  borderRadius: '50%',
                  boxShadow: '0 0 8px #10b981',
                }}
              />
            </div>

            {/* Refresh Button */}
            <button
              onClick={() => refreshData()}
              disabled={loading}
              style={{
                background: 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#e2e8f0',
                padding: '7px 10px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12px',
              }}
              title="Muat ulang data dari production"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
              <span>Sync</span>
            </button>

            {/* Quick Add Button */}
            <button
              onClick={() => {
                if (accounts.length > 0) {
                  setSourceAccountId(accounts[0].id);
                  if (accounts.length > 1) setDestinationAccountId(accounts[1].id);
                }
                setShowAddModal(true);
              }}
              style={{
                background: '#187aba',
                color: '#ffffff',
                border: 'none',
                padding: '7px 14px',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(24, 122, 186, 0.4)',
              }}
            >
              <Plus size={15} />
              <span>Catat Transaksi</span>
            </button>
          </div>
        </div>

        {/* Secondary Navigation Bar */}
        <div style={{ background: '#001a33', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <div
            style={{
              maxWidth: '1360px',
              margin: '0 auto',
              padding: '0 24px',
              display: 'flex',
              gap: '24px',
              overflowX: 'auto',
            }}
          >
            {[
              { to: '/', label: 'Ringkasan Treasury', icon: LayoutDashboard },
              { to: '/transactions', label: 'Buku Transaksi', icon: ReceiptText },
              { to: '/budgets', label: 'Batas Anggaran', icon: PiggyBank },
              { to: '/accounts', label: 'Rekening & Kas', icon: CreditCard },
              { to: '/ai', label: 'AI Advisor & RAG', icon: Bot, badge: 'Groq LLM' },
            ].map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 2px',
                  fontSize: '13.5px',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? '#38bdf8' : '#94a3b8',
                  borderBottom: isActive ? '2px solid #38bdf8' : '2px solid transparent',
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap',
                })}
              >
                <item.icon size={15} />
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    style={{
                      fontSize: '10px',
                      background: 'rgba(56, 189, 248, 0.15)',
                      color: '#38bdf8',
                      padding: '1px 6px',
                      borderRadius: '10px',
                      fontWeight: 700,
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ flex: 1, maxWidth: '1360px', width: '100%', margin: '0 auto', padding: '28px 24px' }}>
        <Outlet />
      </main>

      {/* Quick Add Transaction Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Catat Transaksi Baru</h3>
              <button
                onClick={() => setShowAddModal(false)}
                style={{ background: 'transparent', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#94a3b8' }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateTransaction}>
              {/* Type selector */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '18px' }}>
                <button
                  type="button"
                  onClick={() => setTxType('EXPENSE')}
                  style={{
                    padding: '8px',
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: txType === 'EXPENSE' ? '#c62234' : '#e2e8f0',
                    background: txType === 'EXPENSE' ? 'rgba(198, 34, 52, 0.08)' : '#fff',
                    color: txType === 'EXPENSE' ? '#c62234' : '#64748b',
                    fontWeight: 600,
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                  }}
                >
                  <ArrowUpRight size={14} /> Pengeluaran
                </button>
                <button
                  type="button"
                  onClick={() => setTxType('INCOME')}
                  style={{
                    padding: '8px',
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: txType === 'INCOME' ? '#10874e' : '#e2e8f0',
                    background: txType === 'INCOME' ? 'rgba(16, 135, 78, 0.08)' : '#fff',
                    color: txType === 'INCOME' ? '#10874e' : '#64748b',
                    fontWeight: 600,
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                  }}
                >
                  <ArrowDownLeft size={14} /> Pemasukan
                </button>
                <button
                  type="button"
                  onClick={() => setTxType('TRANSFER')}
                  style={{
                    padding: '8px',
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: txType === 'TRANSFER' ? '#187aba' : '#e2e8f0',
                    background: txType === 'TRANSFER' ? 'rgba(24, 122, 186, 0.08)' : '#fff',
                    color: txType === 'TRANSFER' ? '#187aba' : '#64748b',
                    fontWeight: 600,
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                  }}
                >
                  <ArrowLeftRight size={14} /> Transfer
                </button>
              </div>

              {/* Amount */}
              <div className="form-group">
                <label className="form-label">Nominal (IDR)</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="Contoh: 50000"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  style={{ fontSize: '18px', fontWeight: 600 }}
                />
              </div>

              {/* Description */}
              <div className="form-group">
                <label className="form-label">Deskripsi / Keperluan</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Contoh: Makan siang nasi kapau"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {/* Source Account */}
              <div className="form-group">
                <label className="form-label">{txType === 'TRANSFER' ? 'Dari Rekening' : 'Rekening / Sumber Dana'}</label>
                <select
                  className="form-select"
                  value={sourceAccountId}
                  onChange={(e) => setSourceAccountId(e.target.value)}
                  required
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} — {formatRupiah(acc.balance)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Destination Account for Transfer */}
              {txType === 'TRANSFER' && (
                <div className="form-group">
                  <label className="form-label">Ke Rekening Tujuan</label>
                  <select
                    className="form-select"
                    value={destinationAccountId}
                    onChange={(e) => setDestinationAccountId(e.target.value)}
                    required
                  >
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} — {formatRupiah(acc.balance)}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Menyimpan...' : 'Simpan Transaksi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Institutional Footer */}
      <footer
        style={{
          borderTop: '1px solid #e2e8f0',
          padding: '16px 24px',
          background: '#ffffff',
          color: '#64748b',
          fontSize: '12.5px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <strong>NexaFinance Institutional Suite</strong> &copy; 2026. Connected to Neon Cloud PostgreSQL.
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <span>API Production: <code>nexafinance-alpha.vercel.app</code></span>
          <span>WhatsApp Bot: <code>085172247452</code></span>
        </div>
      </footer>
    </div>
  );
};
