import React, { useState } from 'react';
import { NavLink, Link, Outlet, useLocation } from 'react-router-dom';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useAuth } from '../../context/AuthContext';
import { ProfileModal } from '../profile/ProfileModal';
import { GoogleIcon, Button, Modal, Input } from '../ui';

export const AppShell: React.FC = () => {
  const { activeWorkspace, refreshData, createTransaction, accounts, categories, loading } = useWorkspace();
  const { user, logout } = useAuth();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  // Close mobile drawer on route change
  React.useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

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

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
        return 'Dashboard';
      case '/transactions':
        return 'Buku Transaksi';
      case '/budgets':
        return 'Pagu Anggaran';
      case '/accounts':
        return 'Kas & Dompet Bisnis';
      case '/ai':
      case '/agent':
        return 'AI & Struk OCR';
      default:
        return 'Treasury';
    }
  };

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { to: '/transactions', label: 'Buku Transaksi', icon: 'receipt_long' },
    { to: '/budgets', label: 'Pagu Anggaran', icon: 'shield' },
    { to: '/accounts', label: 'Kas & Dompet Bisnis', icon: 'account_balance_wallet' },
    { to: '/ai', label: 'AI & Struk OCR', icon: 'auto_awesome', badge: 'PRO' },
  ];

  return (
    <div className="min-h-screen bg-background text-on-surface font-body-md antialiased flex flex-col">
      {/* -------------------------------------------------------------
          LEFT SIDEBAR (Fixed 288px on Desktop, Drawer on Mobile)
      -------------------------------------------------------------- */}
      <aside
        className={`fixed top-0 bottom-0 left-0 w-72 bg-surface-container-low border-r border-surface-container-high flex flex-col justify-between z-50 transition-transform duration-250 ease-out lg:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col flex-1 min-h-0">
          {/* Logo Brand Header */}
          <div className="h-16 px-space-lg flex items-center justify-between border-b border-surface-container-high/60">
            <NavLink to="/dashboard" className="flex items-center gap-space-sm text-decoration-none">
              <div className="w-8 h-8 rounded-lg bg-primary text-on-primary flex items-center justify-center font-bold text-lg shadow-sm">
                N
              </div>
              <span className="font-headline-sm text-headline-sm text-primary font-bold tracking-tight">
                NexaFinance
              </span>
            </NavLink>
            <div className="flex items-center gap-1">
              <span className="font-label-caps text-label-caps uppercase bg-surface-container-high px-space-xs py-space-2xs rounded text-on-surface-variant font-semibold">
                IDN
              </span>
              <button
                type="button"
                className="lg:hidden p-1 rounded-md text-on-surface-variant hover:bg-surface-container-high"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Tutup Menu"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
          </div>

          {/* Workspace Switcher Card */}
          <div className="px-space-md py-space-sm">
            <button
              type="button"
              className="w-full flex items-center justify-between p-space-sm rounded-xl bg-surface-container-lowest border border-outline-variant/60 shadow-sm hover:bg-surface-container transition-colors text-left"
            >
              <div className="flex items-center gap-space-sm min-w-0">
                <div className="w-8 h-8 rounded-lg bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-sm shrink-0">
                  N
                </div>
                <div className="min-w-0">
                  <p className="font-body-md text-body-md text-on-surface truncate font-semibold leading-tight">
                    {activeWorkspace?.name || 'Workspace Keuangan'}
                  </p>
                  <p className="font-label-caps text-label-caps text-on-surface-variant flex items-center gap-space-xs mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0"></span>
                    <span>{activeWorkspace?.role || 'Business Owner'}</span>
                  </p>
                </div>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant text-[18px] shrink-0">
                unfold_more
              </span>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-space-md py-space-xs space-y-space-2xs overflow-y-auto">
            <div className="px-space-sm pb-1">
              <span className="font-label-caps text-label-caps uppercase text-outline font-semibold tracking-wider">
                Menu Utama
              </span>
            </div>
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/dashboard'}
                className={({ isActive }) =>
                  `flex items-center gap-space-md px-space-md py-space-sm rounded-xl transition-all group ${
                    isActive
                      ? 'bg-primary text-on-primary font-semibold shadow-sm'
                      : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={`material-symbols-outlined text-[20px] transition-colors ${
                        isActive ? 'text-on-primary' : 'text-on-surface-variant group-hover:text-on-surface'
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span className="font-body-md text-body-md flex-1">{item.label}</span>
                    {item.badge && (
                      <span
                        className={`font-badge-label text-badge-label px-space-xs py-space-2xs rounded-full font-bold ${
                          isActive
                            ? 'bg-on-primary/20 text-on-primary'
                            : 'bg-secondary-fixed text-on-secondary-fixed'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer Cards */}
        <div className="p-space-md space-y-space-sm shrink-0 border-t border-surface-container-high/60">
          {/* Webhook Sync Pill */}
          <div className="bg-surface-container-lowest p-space-sm rounded-xl border border-outline-variant/50 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${user?.whatsappNumber ? 'bg-tertiary live-dot' : 'bg-outline'}`}></span>
                <span className="font-label-caps text-label-caps uppercase text-on-surface-variant tracking-wider font-semibold">
                  Webhook Sync
                </span>
              </div>
              <span className={`font-badge-label text-badge-label font-bold px-1.5 py-0.5 rounded ${
                user?.whatsappNumber ? 'text-tertiary bg-tertiary-fixed/30' : 'text-outline bg-surface-container-high'
              }`}>
                {user?.whatsappNumber ? '2-Arah' : 'Off'}
              </span>
            </div>
            <p className="font-numeric-table text-numeric-table font-semibold text-on-surface truncate">
              {user?.whatsappNumber || 'Belum Terhubung'}
            </p>
            <p className="font-body-sm text-body-sm text-on-surface-variant truncate text-[11px] mt-0.5">
              {user?.whatsappNumber ? 'Sinkronisasi WhatsApp Aktif' : 'Nomor WhatsApp Belum Diatur'}
            </p>
          </div>

          {/* Database Sync Status */}
          <div className="flex items-center justify-between px-space-sm py-1 text-[11.5px] text-on-surface-variant">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
              <span>Neon PG Cloud</span>
            </span>
            <span className="font-mono text-[10px] text-outline">ap-southeast-1</span>
          </div>

          {/* User Account Tile */}
          <div
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center justify-between p-space-sm rounded-xl bg-surface-container hover:bg-surface-container-high transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-space-sm min-w-0">
              <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container font-bold text-xs flex items-center justify-center shrink-0">
                {user?.name ? user.name.slice(0, 2).toUpperCase() : 'U'}
              </div>
              <div className="min-w-0">
                <p className="font-body-md text-body-md text-on-surface truncate font-semibold leading-tight">
                  {user?.name || 'Pengguna'}
                </p>
                <p className="font-label-caps text-label-caps text-on-surface-variant truncate text-[11px]">
                  {activeWorkspace?.role || 'Owner'} · #{activeWorkspace?.id ? activeWorkspace.id.slice(0, 6).toUpperCase() : 'WS-01'}
                </p>
              </div>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant text-[18px] shrink-0">
              more_vert
            </span>
          </div>

          {/* Developer Attribution */}
          <div className="pt-0.5 text-center">
            <p className="font-label-caps text-label-caps text-outline text-[11px] flex items-center justify-center gap-1">
              <span className="material-symbols-outlined text-[13px] text-primary">security</span>
              <span>NexaFinance Enterprise Treasury</span>
            </p>
          </div>
        </div>
      </aside>

      {/* Backdrop for Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* -------------------------------------------------------------
          TOPBAR HEADER (Sticky, Aligned to Desktop Layout)
      -------------------------------------------------------------- */}
      <header className="fixed top-0 left-0 lg:left-72 right-0 h-16 bg-surface/90 backdrop-blur-md border-b border-surface-container-high z-30 flex items-center justify-between px-margin-md lg:px-gutter-lg">
        {/* Left: Mobile Toggle & Breadcrumb */}
        <div className="flex items-center gap-space-md min-w-0">
          <button
            type="button"
            className="lg:hidden p-space-xs rounded-lg hover:bg-surface-container-high text-on-surface-variant"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Buka Menu Navigasi"
          >
            <span className="material-symbols-outlined text-[24px]">menu</span>
          </button>

          <div className="flex items-center gap-space-xs text-body-sm font-body-sm truncate">
            <span className="text-on-surface-variant font-medium">Treasury</span>
            <span className="material-symbols-outlined text-[14px] text-outline">chevron_right</span>
            <span className="text-on-surface font-semibold truncate">{getPageTitle()}</span>
          </div>
        </div>

        {/* Right: Quick Actions & Profile */}
        <div className="flex items-center gap-space-sm">
          {/* WhatsApp Sync Badge Pill */}
          <div className="hidden sm:inline-flex items-center gap-1.5 px-space-md py-1 bg-surface-container-lowest border border-tertiary-fixed rounded-full text-tertiary font-badge-label text-badge-label shadow-xs">
            <span className="w-2 h-2 rounded-full bg-tertiary live-dot"></span>
            <span className="font-semibold">WhatsApp Sync: Active (2-way)</span>
          </div>

          {/* Transfer Shortcut */}
          <button
            type="button"
            onClick={() => {
              setTxType('TRANSFER');
              if (accounts.length > 0) setSourceAccountId(accounts[0].id);
              if (accounts.length > 1) setDestinationAccountId(accounts[1].id);
              setShowAddModal(true);
            }}
            className="hidden md:inline-flex items-center gap-space-xs px-space-md py-space-xs bg-surface-container-lowest hover:bg-surface-container text-on-surface text-body-sm font-body-sm font-medium rounded-lg border border-outline-variant shadow-xs transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">sync_alt</span>
            <span>Transfer Antar Kas</span>
          </button>

          {/* Sync DB Refresh */}
          <button
            type="button"
            onClick={() => refreshData()}
            disabled={loading}
            title="Muat ulang data live"
            className="p-space-xs rounded-lg hover:bg-surface-container text-on-surface-variant transition-colors"
          >
            <span className={`material-symbols-outlined text-[18px] ${loading ? 'animate-spin' : ''}`}>
              refresh
            </span>
          </button>

          {/* Primary Action Button */}
          <button
            type="button"
            onClick={() => {
              setTxType('EXPENSE');
              if (accounts.length > 0) setSourceAccountId(accounts[0].id);
              const exp = categories.filter((c) => c.type === 'EXPENSE');
              if (exp.length > 0) setCategoryId(exp[0].id);
              setShowAddModal(true);
            }}
            className="inline-flex items-center gap-space-xs px-space-md py-space-xs bg-primary hover:bg-primary-container text-on-primary text-body-sm font-body-sm font-semibold rounded-lg shadow-sm transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>Catat Transaksi</span>
          </button>

          {/* User Profile Pill */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-space-xs p-1 sm:px-space-sm sm:py-1 rounded-full border border-outline-variant hover:bg-surface-container-high transition-colors text-left"
            >
              <div className="w-7 h-7 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-xs shrink-0">
                {user?.name ? user.name.slice(0, 2).toUpperCase() : 'U'}
              </div>
              <span className="hidden md:inline font-body-sm text-body-sm font-semibold text-on-surface max-w-[100px] truncate">
                {user?.name || 'Pengguna'}
              </span>
              <span className="material-symbols-outlined text-[16px] text-outline">expand_more</span>
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div
                className="absolute right-0 top-11 w-52 bg-surface-container-lowest rounded-xl shadow-lg border border-outline-variant p-space-2xs z-50 animate-fadeIn"
                onClick={() => setShowDropdown(false)}
              >
                <button
                  type="button"
                  onClick={() => setShowProfileModal(true)}
                  className="w-full flex items-center gap-space-sm px-space-md py-space-xs rounded-lg hover:bg-surface-container text-on-surface text-body-sm font-medium text-left"
                >
                  <span className="material-symbols-outlined text-[18px] text-primary">person</span>
                  <span>Profil Pengguna</span>
                </button>
                <Link
                  to="/landing"
                  className="w-full flex items-center gap-space-sm px-space-md py-space-xs rounded-lg hover:bg-surface-container text-on-surface text-body-sm font-medium text-left"
                >
                  <span className="material-symbols-outlined text-[18px] text-secondary">public</span>
                  <span>Lihat Landing Page</span>
                </Link>
                <div className="my-1 border-t border-surface-container-high"></div>
                <button
                  type="button"
                  onClick={logout}
                  className="w-full flex items-center gap-space-sm px-space-md py-space-xs rounded-lg hover:bg-error-container/40 text-error text-body-sm font-semibold text-left"
                >
                  <span className="material-symbols-outlined text-[18px] text-error">logout</span>
                  <span>Keluar / Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* -------------------------------------------------------------
          MAIN APPLICATION VIEW
      -------------------------------------------------------------- */}
      <div className="lg:pl-72 flex-1 flex flex-col pt-16">
        <main className="flex-1 w-full max-w-[1440px] mx-auto p-margin-md lg:p-gutter-lg pb-space-3xl">
          <Outlet />
        </main>
      </div>

      {/* Profile Modal */}
      <ProfileModal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} />

      {/* Quick Add Transaction Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Catat Transaksi Instan"
        subtitle="Otomatis memperbarui saldo rekening dengan pencatatan ganda presisi"
        googleIcon="add_circle"
        maxWidth={500}
      >
        <form onSubmit={handleCreateTransaction} className="flex flex-col gap-space-md">
          {/* Segmented Type Toggle */}
          <div className="grid grid-cols-3 gap-space-xs p-1 bg-surface-container-low rounded-xl">
            <button
              type="button"
              onClick={() => setTxType('EXPENSE')}
              className={`flex items-center justify-center gap-1.5 py-space-xs rounded-lg text-body-sm font-semibold transition-all ${
                txType === 'EXPENSE'
                  ? 'bg-surface-container-lowest text-error shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">arrow_upward</span>
              <span>Pengeluaran</span>
            </button>
            <button
              type="button"
              onClick={() => setTxType('INCOME')}
              className={`flex items-center justify-center gap-1.5 py-space-xs rounded-lg text-body-sm font-semibold transition-all ${
                txType === 'INCOME'
                  ? 'bg-surface-container-lowest text-tertiary shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">arrow_downward</span>
              <span>Pemasukan</span>
            </button>
            <button
              type="button"
              onClick={() => setTxType('TRANSFER')}
              className={`flex items-center justify-center gap-1.5 py-space-xs rounded-lg text-body-sm font-semibold transition-all ${
                txType === 'TRANSFER'
                  ? 'bg-surface-container-lowest text-secondary shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">sync_alt</span>
              <span>Transfer</span>
            </button>
          </div>

          {/* Nominal Input */}
          <div className="flex flex-col gap-1">
            <label className="font-label-caps text-label-caps uppercase text-outline font-semibold">
              Nominal (IDR)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-on-surface-variant">
                Rp
              </span>
              <input
                type="number"
                placeholder="0"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-11 pr-space-md py-space-sm bg-surface-container-lowest border border-outline-variant rounded-lg font-title-balance text-title-balance font-bold text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 tabular-nums transition-all"
              />
            </div>
          </div>

          {/* Deskripsi */}
          <div className="flex flex-col gap-1">
            <label className="font-label-caps text-label-caps uppercase text-outline font-semibold">
              Deskripsi Transaksi
            </label>
            <input
              type="text"
              placeholder="Contoh: Langganan bulanan software / Restock kasir"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-space-md py-space-sm bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          {/* Rekening Asal */}
          <div className="flex flex-col gap-1">
            <label className="font-label-caps text-label-caps uppercase text-outline font-semibold">
              {txType === 'TRANSFER' ? 'Dari Rekening Asal' : 'Rekening / Pos Kas'}
            </label>
            <select
              value={sourceAccountId}
              onChange={(e) => setSourceAccountId(e.target.value)}
              required
              className="w-full px-space-md py-space-sm bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({formatRupiah(acc.balance)})
                </option>
              ))}
            </select>
          </div>

          {/* Rekening Tujuan (Khusus Transfer) */}
          {txType === 'TRANSFER' && (
            <div className="flex flex-col gap-1">
              <label className="font-label-caps text-label-caps uppercase text-outline font-semibold">
                Ke Rekening Tujuan
              </label>
              <select
                value={destinationAccountId}
                onChange={(e) => setDestinationAccountId(e.target.value)}
                required
                className="w-full px-space-md py-space-sm bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} ({formatRupiah(acc.balance)})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Kategori (Jika Bukan Transfer) */}
          {txType !== 'TRANSFER' && (
            <div className="flex flex-col gap-1">
              <label className="font-label-caps text-label-caps uppercase text-outline font-semibold">
                Kategori {txType === 'EXPENSE' ? 'Pengeluaran' : 'Pemasukan'}
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-space-md py-space-sm bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
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

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-space-sm pt-space-xs border-t border-surface-container-high">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="px-space-md py-space-xs bg-surface-container-lowest border border-outline-variant hover:bg-surface-container rounded-lg font-body-md font-medium text-on-surface-variant transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-space-xs px-space-lg py-space-xs bg-primary hover:bg-primary-container text-on-primary font-body-md font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">check</span>
              <span>{submitting ? 'Menyimpan...' : 'Simpan Transaksi'}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
