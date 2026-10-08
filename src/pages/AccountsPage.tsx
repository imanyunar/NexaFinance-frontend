import React, { useState } from 'react';
import { useWorkspace, Account } from '../context/WorkspaceContext';
import { Card, Badge, GoogleIcon, Button, Modal, Input } from '../components/ui';

export const AccountsPage: React.FC = () => {
  const { accounts, totalBalance, createAccount, updateAccount, deleteAccount } = useWorkspace();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [filterArchived, setFilterArchived] = useState<'ALL' | 'ACTIVE' | 'ARCHIVED'>('ACTIVE');

  // Form states for Add Account
  const [name, setName] = useState('');
  const [type, setType] = useState<'BANK' | 'CASH' | 'EWALLET'>('BANK');
  const [openingBalance, setOpeningBalance] = useState('');
  const [color, setColor] = useState('#005caa');

  // Form states for Edit Account
  const [editName, setEditName] = useState('');
  const [editType, setEditType] = useState<string>('BANK');
  const [editColor, setEditColor] = useState('#005caa');
  const [editIsArchived, setEditIsArchived] = useState(false);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const getAccountIcon = (accType: string) => {
    switch (accType) {
      case 'BANK':
        return 'account_balance';
      case 'CASH':
        return 'payments';
      case 'EWALLET':
        return 'wallet';
      default:
        return 'credit_card';
    }
  };

  const colorPalette = [
    { label: 'BCA Blue', hex: '#005caa' },
    { label: 'Navy Deep', hex: '#0a2540' },
    { label: 'Emerald Green', hex: '#10b981' },
    { label: 'Purple Gem', hex: '#8b5cf6' },
    { label: 'Amber Orange', hex: '#f59e0b' },
    { label: 'Crimson Red', hex: '#ef4444' },
  ];

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Nama rekening wajib diisi');
      return;
    }
    try {
      setSubmitting(true);
      await createAccount({
        name: name.trim(),
        type,
        openingBalance: Number(openingBalance) || 0,
        color,
      });
      setShowAddModal(false);
      setName('');
      setOpeningBalance('');
      setColor('#005caa');
      setType('BANK');
    } catch (err: any) {
      alert('Gagal menambah rekening: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (acc: Account) => {
    setEditingAccount(acc);
    setEditName(acc.name);
    setEditType(acc.type);
    setEditColor(acc.color || '#005caa');
    setEditIsArchived(!!acc.isArchived);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAccount || !editName.trim()) return;
    try {
      setSubmitting(true);
      await updateAccount(editingAccount.id, {
        name: editName.trim(),
        type: editType,
        color: editColor,
        isArchived: editIsArchived,
      });
      setEditingAccount(null);
    } catch (err: any) {
      alert('Gagal memperbarui rekening: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (acc: Account) => {
    if (confirm(`Apakah Anda yakin ingin menghapus rekening "${acc.name}"?`)) {
      try {
        await deleteAccount(acc.id);
      } catch (err: any) {
        if (confirm(`${err.message}\n\nApakah Anda ingin mengarsipkan rekening ini agar tidak muncul di pilihan aktif?`)) {
          await updateAccount(acc.id, { isArchived: true });
        }
      }
    }
  };

  const filteredAccounts = accounts.filter((acc) => {
    if (filterArchived === 'ACTIVE') return !acc.isArchived;
    if (filterArchived === 'ARCHIVED') return !!acc.isArchived;
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, margin: 0, color: '#000000', fontFamily: "'Open Sans', sans-serif" }}>
            Rekening & Dompet Kas
          </h1>
          <p style={{ color: '#666666', fontSize: '14px', margin: '4px 0 0' }}>
            Kelola penuh seluruh rekening bank, e-wallet, kas tunai, dan pos tabungan Anda
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e5e5',
              borderRadius: '48px',
              padding: '8px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <GoogleIcon name="account_balance_wallet" size={18} color="#005caa" />
            <span style={{ fontSize: '13px', color: '#666666' }}>Total Saldo:</span>
            <strong style={{ fontSize: '15px', color: '#005caa', fontFamily: "'Open Sans', sans-serif" }}>
              {formatRupiah(totalBalance)}
            </strong>
          </div>

          <Button
            variant="primary"
            googleIcon="add"
            onClick={() => setShowAddModal(true)}
            style={{ borderRadius: '48px', fontWeight: 700 }}
          >
            Tambah Rekening
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px' }}>
        {[
          { id: 'ACTIVE', label: `Rekening Aktif (${accounts.filter((a) => !a.isArchived).length})` },
          { id: 'ARCHIVED', label: `Diarsipkan (${accounts.filter((a) => a.isArchived).length})` },
          { id: 'ALL', label: `Semua (${accounts.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterArchived(tab.id as any)}
            style={{
              padding: '8px 18px',
              borderRadius: '48px',
              border: '1px solid',
              borderColor: filterArchived === tab.id ? '#005caa' : '#e5e5e5',
              backgroundColor: filterArchived === tab.id ? '#005caa' : '#ffffff',
              color: filterArchived === tab.id ? '#ffffff' : '#666666',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              fontFamily: "'Open Sans', sans-serif",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Accounts Grid */}
      {filteredAccounts.length === 0 ? (
        <Card padding="48px 24px">
          <div style={{ textAlign: 'center', color: '#666666' }}>
            <GoogleIcon name="account_balance" size={40} color="#005caa" />
            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '12px 0 6px', color: '#000000' }}>
              Belum Ada Rekening
            </h3>
            <p style={{ fontSize: '13.5px', margin: '0 0 16px' }}>
              Tambahkan rekening bank, dompet kas, atau e-wallet untuk mulai mencatat transaksi.
            </p>
            <Button variant="primary" googleIcon="add" onClick={() => setShowAddModal(true)}>
              Tambah Rekening Baru
            </Button>
          </div>
        </Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          {filteredAccounts.map((acc) => (
            <Card key={acc.id} padding="24px" style={{ position: 'relative', opacity: acc.isArchived ? 0.75 : 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '14px',
                      backgroundColor: acc.color ? `${acc.color}15` : '#e8f2fa',
                      color: acc.color || '#005caa',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <GoogleIcon name={getAccountIcon(acc.type)} size={22} color={acc.color || '#005caa'} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '17px', fontWeight: 700, margin: 0, color: '#000000', fontFamily: "'Open Sans', sans-serif" }}>
                      {acc.name}
                    </h3>
                    <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                      <Badge variant="neutral">{acc.type}</Badge>
                      {acc.isArchived && <Badge variant="warning">Diarsipkan</Badge>}
                    </div>
                  </div>
                </div>

                {/* Edit & Delete Action Buttons */}
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button
                    onClick={() => openEditModal(acc)}
                    title="Edit Rekening"
                    style={{
                      border: 'none',
                      backgroundColor: 'transparent',
                      cursor: 'pointer',
                      padding: '6px',
                      borderRadius: '8px',
                      color: '#666666',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <GoogleIcon name="edit" size={18} color="#005caa" />
                  </button>
                  <button
                    onClick={() => handleDelete(acc)}
                    title="Hapus / Arsipkan Rekening"
                    style={{
                      border: 'none',
                      backgroundColor: 'transparent',
                      cursor: 'pointer',
                      padding: '6px',
                      borderRadius: '8px',
                      color: '#c5221f',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <GoogleIcon name="delete" size={18} color="#c5221f" />
                  </button>
                </div>
              </div>

              {/* Balance */}
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#005caa', marginTop: '8px', fontFamily: "'Open Sans', sans-serif" }}>
                {formatRupiah(acc.balance)}
              </div>

              {/* Bottom Details */}
              <div
                style={{
                  marginTop: '16px',
                  paddingTop: '12px',
                  borderTop: '1px solid #f0f0f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '12.5px',
                  color: '#666666',
                }}
              >
                <span>Saldo Awal: <strong>{formatRupiah(acc.openingBalance || 0)}</strong></span>
                <span
                  style={{
                    display: 'inline-block',
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: acc.color || '#005caa',
                  }}
                  title={`Tema: ${acc.color}`}
                />
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal: Tambah Rekening Baru */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Tambah Rekening Baru"
        subtitle="Daftarkan rekening bank, dompet kas, atau pos simpanan Anda"
        googleIcon="account_balance_wallet"
      >
        <form onSubmit={handleCreate}>
          <Input
            label="Nama Rekening / Dompet"
            placeholder="Contoh: BCA Prioritas, Mandiri Utama, GoPay, Kas Kecil"
            value={name}
            onChange={(e) => setName(e.target.value)}
            googleIcon="account_balance"
            required
          />

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#000000', marginBottom: '6px' }}>
              Tipe Rekening
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
              {[
                { id: 'BANK', label: 'Bank', icon: 'account_balance' },
                { id: 'CASH', label: 'Kas Tunai', icon: 'payments' },
                { id: 'EWALLET', label: 'E-Wallet', icon: 'wallet' },
              ].map((t) => (
                <button
                  type="button"
                  key={t.id}
                  onClick={() => setType(t.id as any)}
                  style={{
                    padding: '10px',
                    borderRadius: '12px',
                    border: '1px solid',
                    borderColor: type === t.id ? '#005caa' : '#e5e5e5',
                    backgroundColor: type === t.id ? '#e8f2fa' : '#ffffff',
                    color: type === t.id ? '#005caa' : '#333333',
                    fontWeight: 600,
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  <GoogleIcon name={t.icon} size={16} color={type === t.id ? '#005caa' : '#666666'} />
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <Input
            label="Saldo Awal (Rp)"
            placeholder="Contoh: 5000000"
            type="number"
            value={openingBalance}
            onChange={(e) => setOpeningBalance(e.target.value)}
            googleIcon="payments"
          />

          {/* Color Chooser */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#000000', marginBottom: '8px' }}>
              Warna Tema Rekening
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              {colorPalette.map((c) => (
                <button
                  type="button"
                  key={c.hex}
                  onClick={() => setColor(c.hex)}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: c.hex,
                    border: color === c.hex ? '3px solid #000000' : '1px solid transparent',
                    cursor: 'pointer',
                    outline: 'none',
                  }}
                  title={c.label}
                />
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '12px', borderTop: '1px solid #f0f0f0' }}>
            <Button variant="outline" type="button" onClick={() => setShowAddModal(false)}>
              Batal
            </Button>
            <Button variant="primary" type="submit" loading={submitting}>
              Simpan Rekening
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Edit Rekening */}
      <Modal
        isOpen={!!editingAccount}
        onClose={() => setEditingAccount(null)}
        title="Edit Rekening"
        subtitle={`Ubah informasi untuk rekening "${editingAccount?.name}"`}
        googleIcon="edit"
      >
        <form onSubmit={handleUpdate}>
          <Input
            label="Nama Rekening"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            googleIcon="account_balance"
            required
          />

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#000000', marginBottom: '6px' }}>
              Tipe Rekening
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
              {[
                { id: 'BANK', label: 'Bank', icon: 'account_balance' },
                { id: 'CASH', label: 'Kas Tunai', icon: 'payments' },
                { id: 'EWALLET', label: 'E-Wallet', icon: 'wallet' },
              ].map((t) => (
                <button
                  type="button"
                  key={t.id}
                  onClick={() => setEditType(t.id)}
                  style={{
                    padding: '10px',
                    borderRadius: '12px',
                    border: '1px solid',
                    borderColor: editType === t.id ? '#005caa' : '#e5e5e5',
                    backgroundColor: editType === t.id ? '#e8f2fa' : '#ffffff',
                    color: editType === t.id ? '#005caa' : '#333333',
                    fontWeight: 600,
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  <GoogleIcon name={t.icon} size={16} color={editType === t.id ? '#005caa' : '#666666'} />
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Color Chooser */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#000000', marginBottom: '8px' }}>
              Warna Tema Rekening
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              {colorPalette.map((c) => (
                <button
                  type="button"
                  key={c.hex}
                  onClick={() => setEditColor(c.hex)}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: c.hex,
                    border: editColor === c.hex ? '3px solid #000000' : '1px solid transparent',
                    cursor: 'pointer',
                    outline: 'none',
                  }}
                  title={c.label}
                />
              ))}
            </div>
          </div>

          {/* Archive Status Toggle */}
          <div
            style={{
              marginBottom: '24px',
              padding: '14px 18px',
              borderRadius: '14px',
              backgroundColor: '#f8fafc',
              border: '1px solid #e5e5e5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontWeight: 600, fontSize: '13.5px', color: '#000000' }}>
                Arsipkan Rekening
              </div>
              <div style={{ fontSize: '12px', color: '#666666', marginTop: '2px' }}>
                Rekening yang diarsipkan disembunyikan dari pilihan transaksi harian.
              </div>
            </div>
            <input
              type="checkbox"
              checked={editIsArchived}
              onChange={(e) => setEditIsArchived(e.target.checked)}
              style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#005caa' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '12px', borderTop: '1px solid #f0f0f0' }}>
            <Button variant="outline" type="button" onClick={() => setEditingAccount(null)}>
              Batal
            </Button>
            <Button variant="primary" type="submit" loading={submitting}>
              Perbarui Rekening
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
