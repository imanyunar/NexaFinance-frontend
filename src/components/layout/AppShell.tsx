import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useAuth } from '../../context/AuthContext';
import { ProfileModal } from '../profile/ProfileModal';
import { GoogleIcon, Button, Modal, Input } from '../ui';

export const AppShell: React.FC = () => {
  const { activeWorkspace, refreshData, createTransaction, accounts, categories, loading } = useWorkspace();
  const { user, logout } = useAuth();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const [txType, setTxType] = useState<'EXPENSE' | 'INCOME' | 'TRANSFER'>('EXPENSE');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [sourceAccountId, setSourceAccountId] = useState('');
  const [destinationAccountId, setDestinationAccountId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  React.useEffect(() => {
    if (!sourceAccountId && accounts.length > 0) {
      setSourceAccountId(accounts[0].id);
    }
  }, [accounts, sourceAccountId]);

  const handleCreateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    const effectiveSourceId = sourceAccountId || accounts[0]?.id;
    if (!amount || !effectiveSourceId) {
      alert('Lengkapi nominal dan pilih rekening terlebih dahulu');
      return;
    }
    const cleanDesc = description.trim() || 'Transaksi';
    try {
      setSubmitting(true);
      await createTransaction({
        type: txType,
        amount: Number(amount),
        description: cleanDesc,
        accountId: effectiveSourceId,
        sourceAccountId: effectiveSourceId,
        toAccountId: txType === 'TRANSFER' ? destinationAccountId : null,
        destinationAccountId: txType === 'TRANSFER' ? destinationAccountId : null,
        categoryId: txType !== 'TRANSFER' && categoryId ? categoryId : null,
        date: new Date().toISOString(),
        transactedAt: new Date().toISOString(),
      });
      setShowAddModal(false);
      setAmount('');
      setDescription('');
      setCategoryId('');
    } catch (err: any) {
      alert('Gagal menambah transaksi: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'IA';

  const navItems = [
    { to: '/', label: 'Ringkasan Treasury', icon: 'dashboard' },
    { to: '/transactions', label: 'Buku Transaksi', icon: 'receipt_long' },
    { to: '/budgets', label: 'Batas Anggaran', icon: 'savings' },
    { to: '/accounts', label: 'Rekening & Kas', icon: 'account_balance_wallet' },
    { to: '/ai', label: 'Nexa AI Agent', icon: 'smart_toy', badge: 'Active' },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f8fafc' }}>
      {/* Top Navbar (Light/White Canvas Inspired by BCA) */}
      <header
        style={{
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e5e5e5',
          position: 'sticky',
          top: 0,
          zIndex: 40,
          boxShadow: 'rgba(112, 144, 176, 0.08) 0px 2px 12px 0px',
        }}
      >
        <div
          style={{
            maxWidth: '1360px',
            margin: '0 auto',
            padding: '14px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
          }}
        >
          {/* Logo & Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <NavLink to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  backgroundColor: '#005caa',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '20px',
                  color: '#ffffff',
                  boxShadow: '0 4px 12px rgba(0, 92, 170, 0.25)',
                }}
              >
                N
              </div>
              <div>
                <div style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '-0.3px', lineHeight: 1.1, color: '#000000', fontFamily: "'Open Sans', sans-serif" }}>
                  Nexa<span style={{ color: '#005caa' }}>Finance</span>
                </div>
                <div style={{ fontSize: '11px', color: '#666666', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 600 }}>
                  Corporate Treasury
                </div>
              </div>
            </NavLink>

            {/* Workspace Selector Badge */}
            {activeWorkspace && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: '#f8fafc',
                  padding: '6px 14px',
                  borderRadius: '48px',
                  border: '1px solid #e5e5e5',
                  fontSize: '13px',
                  color: '#000000',
                }}
              >
                <GoogleIcon name="apartment" size={16} color="#005caa" />
                <span style={{ fontWeight: 600 }}>{activeWorkspace.name}</span>
                <span
                  style={{
                    fontSize: '11px',
                    color: '#005caa',
                    backgroundColor: '#e8f2fa',
                    padding: '2px 8px',
                    borderRadius: '48px',
                    fontWeight: 600,
                  }}
                >
                  {activeWorkspace.role}
                </span>
              </div>
            )}
          </div>

          {/* Right Header Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* WhatsApp Integration Status */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#e6f4ea',
                border: '1px solid #ceead6',
                color: '#137333',
                padding: '6px 14px',
                borderRadius: '48px',
                fontSize: '12px',
                fontWeight: 600,
              }}
              title="WhatsApp Bot Assistant Aktif (Private Channel)"
            >
              <GoogleIcon name="smartphone" size={15} color="#137333" />
              <span>WA Bot Aktif</span>
            </div>

            {/* Refresh Sync Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => refreshData()}
              disabled={loading}
              googleIcon="sync"
              title="Muat ulang data dari production"
            >
              Sync
            </Button>

            {/* Quick Add Button */}
            <Button
              variant="primary"
              size="sm"
              googleIcon="add"
              onClick={() => {
                if (accounts.length > 0) {
                  setSourceAccountId(accounts[0].id);
                  if (accounts.length > 1) setDestinationAccountId(accounts[1].id);
                }
                const expenseCats = categories.filter((c) => c.type === 'EXPENSE');
                if (expenseCats.length > 0) {
                  setCategoryId(expenseCats[0].id);
                }
                setShowAddModal(true);
              }}
            >
              Catat Transaksi
            </Button>

            {/* User Profile Pill & Dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setShowDropdown(!showDropdown)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e5e5',
                  padding: '5px 12px 5px 6px',
                  borderRadius: '48px',
                  cursor: 'pointer',
                  color: '#000000',
                  boxShadow: 'rgba(112, 144, 176, 0.08) 0px 2px 8px 0px',
                  transition: 'all 0.15s ease',
                }}
              >
                <div
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    backgroundColor: '#005caa',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#ffffff',
                  }}
                >
                  {initials}
                </div>
                <span style={{ fontSize: '13px', fontWeight: 600 }}>{user?.name || 'Iman Azizi'}</span>
                <GoogleIcon name="expand_more" size={16} color="#666666" />
              </button>

              {/* Dropdown Menu */}
              {showDropdown && (
                <div
                  style={{
                    position: 'absolute',
                    top: '120%',
                    right: 0,
                    width: '210px',
                    backgroundColor: '#ffffff',
                    borderRadius: '20px',
                    boxShadow: 'rgba(112, 144, 176, 0.2) 0px 8px 30px 0px',
                    border: '1px solid #e5e5e5',
                    padding: '8px',
                    zIndex: 50,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                  }}
                  onClick={() => setShowDropdown(false)}
                >
                  <button
                    onClick={() => setShowProfileModal(true)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 14px',
                      background: 'transparent',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '13px',
                      color: '#000000',
                      fontWeight: 500,
                      cursor: 'pointer',
                      textAlign: 'left',
                      width: '100%',
                      transition: 'background 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#f0f6fa')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <GoogleIcon name="person" size={18} color="#005caa" />
                    <span>Profil Pengguna</span>
                  </button>

                  <div style={{ height: '1px', backgroundColor: '#f0f0f0', margin: '4px 0' }} />

                  <button
                    onClick={logout}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 14px',
                      background: 'transparent',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '13px',
                      color: '#c5221f',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textAlign: 'left',
                      width: '100%',
                      transition: 'background 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#fce8e6')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <GoogleIcon name="logout" size={18} color="#c5221f" />
                    <span>Keluar / Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Secondary Navigation Bar (Clean Pills with 48px border-radius) */}
        <div style={{ backgroundColor: '#ffffff', borderTop: '1px solid #f0f0f0' }}>
          <div
            style={{
              maxWidth: '1360px',
              margin: '0 auto',
              padding: '6px 24px',
              display: 'flex',
              gap: '12px',
              overflowX: 'auto',
            }}
          >
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  borderRadius: '48px',
                  fontSize: '13.5px',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? '#005caa' : '#666666',
                  backgroundColor: isActive ? '#e8f2fa' : 'transparent',
                  border: isActive ? '1px solid #c3ddf2' : '1px solid transparent',
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap',
                  textDecoration: 'none',
                  fontFamily: "'Open Sans', sans-serif",
                })}
              >
                <GoogleIcon name={item.icon} size={18} color="inherit" />
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    style={{
                      fontSize: '10px',
                      backgroundColor: '#005caa',
                      color: '#ffffff',
                      padding: '2px 8px',
                      borderRadius: '48px',
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

      {/* Profile Modal */}
      <ProfileModal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} />

      {/* Quick Add Transaction Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Catat Transaksi Baru"
        subtitle="Masukkan pengeluaran, pemasukan, atau transfer antar rekening"
        googleIcon="add_card"
        maxWidth={480}
      >
        <form onSubmit={handleCreateTransaction}>
          {/* Type Selector (Pills) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '20px' }}>
            <button
              type="button"
              onClick={() => setTxType('EXPENSE')}
              style={{
                padding: '10px 8px',
                borderRadius: '48px',
                border: '1px solid',
                borderColor: txType === 'EXPENSE' ? '#c5221f' : '#e5e5e5',
                backgroundColor: txType === 'EXPENSE' ? '#fce8e6' : '#ffffff',
                color: txType === 'EXPENSE' ? '#c5221f' : '#666666',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                transition: 'all 0.15s ease',
              }}
            >
              <GoogleIcon name="arrow_outward" size={16} color={txType === 'EXPENSE' ? '#c5221f' : '#666666'} />
              <span>Pengeluaran</span>
            </button>
            <button
              type="button"
              onClick={() => setTxType('INCOME')}
              style={{
                padding: '10px 8px',
                borderRadius: '48px',
                border: '1px solid',
                borderColor: txType === 'INCOME' ? '#137333' : '#e5e5e5',
                backgroundColor: txType === 'INCOME' ? '#e6f4ea' : '#ffffff',
                color: txType === 'INCOME' ? '#137333' : '#666666',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                transition: 'all 0.15s ease',
              }}
            >
              <GoogleIcon name="south_west" size={16} color={txType === 'INCOME' ? '#137333' : '#666666'} />
              <span>Pemasukan</span>
            </button>
            <button
              type="button"
              onClick={() => setTxType('TRANSFER')}
              style={{
                padding: '10px 8px',
                borderRadius: '48px',
                border: '1px solid',
                borderColor: txType === 'TRANSFER' ? '#005caa' : '#e5e5e5',
                backgroundColor: txType === 'TRANSFER' ? '#e8f2fa' : '#ffffff',
                color: txType === 'TRANSFER' ? '#005caa' : '#666666',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                transition: 'all 0.15s ease',
              }}
            >
              <GoogleIcon name="swap_horiz" size={16} color={txType === 'TRANSFER' ? '#005caa' : '#666666'} />
              <span>Transfer</span>
            </button>
          </div>

          {/* Amount */}
          <Input
            label="Nominal (IDR)"
            type="number"
            placeholder="Contoh: 50000"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            googleIcon="payments"
            style={{ fontSize: '18px', fontWeight: 700 }}
          />

          {/* Description */}
          <Input
            label="Deskripsi / Keperluan"
            type="text"
            placeholder="Contoh: Makan siang nasi kapau"
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            googleIcon="description"
          />

          {/* Source Account */}
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label" style={{ fontSize: '13px', fontWeight: 600, color: '#000000', fontFamily: "'Open Sans', sans-serif" }}>
              {txType === 'TRANSFER' ? 'Dari Rekening Asal' : 'Rekening / Sumber Dana'}
            </label>
            <select
              className="form-select"
              value={sourceAccountId}
              onChange={(e) => setSourceAccountId(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '11px 16px',
                borderRadius: '16px',
                border: '1px solid #e5e5e5',
                fontSize: '14px',
                backgroundColor: '#ffffff',
              }}
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} — {formatRupiah(acc.balance)}
                </option>
              ))}
            </select>
          </div>

          {/* Category Selector */}
          {txType !== 'TRANSFER' && (
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label" style={{ fontSize: '13px', fontWeight: 600, color: '#000000', fontFamily: "'Open Sans', sans-serif" }}>
                Kategori {txType === 'EXPENSE' ? 'Pengeluaran' : 'Pemasukan'}
              </label>
              <select
                className="form-select"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '11px 16px',
                  borderRadius: '16px',
                  border: '1px solid #e5e5e5',
                  fontSize: '14px',
                  backgroundColor: '#ffffff',
                }}
              >
                <option value="">-- Tanpa Kategori Khusus --</option>
                {categories
                  .filter((c) => c.type === txType)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </select>
            </div>
          )}

          {/* Destination Account for Transfer */}
          {txType === 'TRANSFER' && (
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label" style={{ fontSize: '13px', fontWeight: 600, color: '#000000', fontFamily: "'Open Sans', sans-serif" }}>
                Ke Rekening Tujuan
              </label>
              <select
                className="form-select"
                value={destinationAccountId}
                onChange={(e) => setDestinationAccountId(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '11px 16px',
                  borderRadius: '16px',
                  border: '1px solid #e5e5e5',
                  fontSize: '14px',
                  backgroundColor: '#ffffff',
                }}
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} — {formatRupiah(acc.balance)}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setShowAddModal(false)}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={submitting}
              googleIcon="check"
            >
              {submitting ? 'Menyimpan...' : 'Simpan Transaksi'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Friendly Light Footer */}
      <footer
        style={{
          borderTop: '1px solid #e5e5e5',
          padding: '18px 24px',
          backgroundColor: '#ffffff',
          color: '#666666',
          fontSize: '13px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <GoogleIcon name="verified_user" size={16} color="#005caa" />
          <span><strong>NexaFinance</strong> &copy; 2026. Terhubung ke Neon Cloud Serverless PostgreSQL.</span>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <span>API: <code>nexafinance-alpha.vercel.app</code></span>
          <span>Channel: <code style={{ color: '#137333' }}>Private Encrypted</code></span>
        </div>
      </footer>
    </div>
  );
};
