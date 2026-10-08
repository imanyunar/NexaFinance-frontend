import React, { useState, useEffect } from 'react';
import { useWorkspace, Budget } from '../context/WorkspaceContext';
import { Card, Badge, GoogleIcon, Button, Modal, Input, Skeleton, StatCardSkeleton } from '../components/ui';

export const BudgetsPage: React.FC = () => {
  const {
    activeWorkspace,
    budgets,
    budgetSummary,
    selectedPeriod,
    setSelectedPeriod,
    categories,
    createOrUpdateBudget,
    deleteBudget,
    createCategory,
    loading,
  } = useWorkspace();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form states for Add / Edit Budget
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [period, setPeriod] = useState(selectedPeriod);

  // Form states for Inline Category Creation
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#005caa');

  useEffect(() => {
    setPeriod(selectedPeriod);
  }, [selectedPeriod]);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handlePeriodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const p = e.target.value;
    setSelectedPeriod(p);
  };

  // Generate last 6 months for period selector
  const getPeriodOptions = () => {
    const options = [];
    const now = new Date();
    for (let i = -2; i <= 3; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
      options.push({ val, label });
    }
    return options;
  };

  const expenseCategories = categories.filter((c) => c.type === 'EXPENSE');

  const openAddModal = () => {
    setEditingBudget(null);
    setSelectedCategoryId(expenseCategories[0]?.id || '');
    setAmount('');
    setPeriod(selectedPeriod);
    setShowAddModal(true);
  };

  const openEditModal = (b: Budget) => {
    setEditingBudget(b);
    setSelectedCategoryId(b.categoryId);
    setAmount(String(b.amount));
    setPeriod(b.period);
    setShowAddModal(true);
  };

  const handleSubmitBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategoryId) {
      alert('Silakan pilih kategori pengeluaran');
      return;
    }
    if (!amount || Number(amount) <= 0) {
      alert('Alokasi anggaran harus lebih dari 0');
      return;
    }

    try {
      setSubmitting(true);
      await createOrUpdateBudget({
        categoryId: selectedCategoryId,
        amount: Number(amount),
        period: period || selectedPeriod,
      });
      setShowAddModal(false);
      setEditingBudget(null);
      setAmount('');
    } catch (err: any) {
      alert('Gagal menyimpan anggaran: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBudget = async (b: Budget) => {
    if (confirm(`Apakah Anda yakin ingin menghapus anggaran untuk "${b.categoryName}"?`)) {
      try {
        await deleteBudget(b.id);
      } catch (err: any) {
        alert('Gagal menghapus anggaran: ' + err.message);
      }
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    try {
      setSubmitting(true);
      const cat = await createCategory({
        name: newCategoryName.trim(),
        type: 'EXPENSE',
        color: newCategoryColor,
        icon: 'tag',
      });
      setSelectedCategoryId(cat.id);
      setShowCategoryModal(false);
      setNewCategoryName('');
    } catch (err: any) {
      alert('Gagal membuat kategori: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, margin: 0, color: '#000000', fontFamily: "'Open Sans', sans-serif" }}>
            Batas Anggaran Bulanan
          </h1>
          <p style={{ color: '#666666', fontSize: '14px', margin: '4px 0 0' }}>
            Pantau dan kendalikan pengeluaran agar tidak overbudget di {activeWorkspace?.name || 'Workspace'}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* Period Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#ffffff', border: '1px solid #e5e5e5', borderRadius: '48px', padding: '6px 16px' }}>
            <GoogleIcon name="calendar_month" size={18} color="#005caa" />
            <select
              value={selectedPeriod}
              onChange={handlePeriodChange}
              style={{
                border: 'none',
                backgroundColor: 'transparent',
                fontWeight: 600,
                fontSize: '13.5px',
                color: '#000000',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              {getPeriodOptions().map((opt) => (
                <option key={opt.val} value={opt.val}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <Button
            variant="primary"
            googleIcon="add"
            onClick={openAddModal}
            style={{ borderRadius: '48px', fontWeight: 700 }}
          >
            Tambah Batas Anggaran
          </Button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      {budgetSummary && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          <Card padding="20px">
            <div style={{ fontSize: '12.5px', color: '#666666', fontWeight: 600 }}>Total Alokasi Anggaran</div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#005caa', marginTop: '4px' }}>
              {formatRupiah(budgetSummary.totalBudget)}
            </div>
          </Card>
          <Card padding="20px">
            <div style={{ fontSize: '12.5px', color: '#666666', fontWeight: 600 }}>Total Terpakai Riil</div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#000000', marginTop: '4px' }}>
              {formatRupiah(budgetSummary.totalSpent)}
            </div>
          </Card>
          <Card padding="20px">
            <div style={{ fontSize: '12.5px', color: '#666666', fontWeight: 600 }}>Sisa Anggaran</div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#137333', marginTop: '4px' }}>
              {formatRupiah(budgetSummary.totalRemaining)}
            </div>
          </Card>
          <Card padding="20px">
            <div style={{ fontSize: '12.5px', color: '#666666', fontWeight: 600 }}>Persentase Terpakai</div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: budgetSummary.overallPercentage >= 100 ? '#c5221f' : '#005caa', marginTop: '4px' }}>
              {budgetSummary.overallPercentage}%
            </div>
          </Card>
        </div>
      )}

      {/* Budgets Grid */}
      {loading && budgets.length === 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          <div className="skeleton-card" style={{ height: '200px' }} />
          <div className="skeleton-card" style={{ height: '200px' }} />
          <div className="skeleton-card" style={{ height: '200px' }} />
        </div>
      ) : budgets.length === 0 ? (
        <Card padding="48px 24px">
          <div style={{ textAlign: 'center', color: '#666666' }}>
            <GoogleIcon name="savings" size={44} color="#005caa" />
            <h3 style={{ fontSize: '17px', fontWeight: 700, margin: '12px 0 6px', color: '#000000' }}>
              Belum Ada Batas Anggaran untuk Periode Ini
            </h3>
            <p style={{ fontSize: '13.5px', margin: '0 0 20px', maxWidth: '480px', marginLeft: 'auto', marginRight: 'auto' }}>
              Tentukan batas belanja bulanan per kategori untuk mengaktifkan peringatan otomatis dari Nexa AI Agent dan bot WhatsApp.
            </p>
            <Button variant="primary" googleIcon="add" onClick={openAddModal}>
              Tambah Batas Anggaran Sekarang
            </Button>
          </div>
        </Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {budgets.map((b) => {
            const percent = Math.min(b.percentage, 100);
            const isDanger = b.percentage >= 100 || b.status === 'EXCEEDED';
            const isWarning = b.percentage >= 80 || b.status === 'WARNING';

            const badgeVariant = isDanger ? 'danger' : isWarning ? 'warning' : 'success';
            const progressColor = isDanger ? '#c5221f' : isWarning ? '#b06000' : '#137333';

            return (
              <Card key={b.id} padding="24px">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '12px',
                        backgroundColor: b.categoryColor ? `${b.categoryColor}15` : '#e8f2fa',
                        color: b.categoryColor || '#005caa',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <GoogleIcon name="savings" size={20} color={b.categoryColor || '#005caa'} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: '#000000', fontFamily: "'Open Sans', sans-serif" }}>
                        {b.categoryName}
                      </h3>
                      <div style={{ fontSize: '12.5px', color: '#666666', marginTop: '2px' }}>
                        Alokasi: {formatRupiah(b.amount)}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Badge variant={badgeVariant}>
                      {b.percentage}% Terpakai
                    </Badge>
                    <button
                      onClick={() => openEditModal(b)}
                      title="Edit Batas Anggaran"
                      style={{
                        border: 'none',
                        backgroundColor: 'transparent',
                        cursor: 'pointer',
                        padding: '4px',
                        borderRadius: '6px',
                        color: '#005caa',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <GoogleIcon name="edit" size={17} color="#005caa" />
                    </button>
                    <button
                      onClick={() => handleDeleteBudget(b)}
                      title="Hapus Batas Anggaran"
                      style={{
                        border: 'none',
                        backgroundColor: 'transparent',
                        cursor: 'pointer',
                        padding: '4px',
                        borderRadius: '6px',
                        color: '#c5221f',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <GoogleIcon name="delete" size={17} color="#c5221f" />
                    </button>
                  </div>
                </div>

                {/* Progress Bar (Rounded pill) */}
                <div
                  style={{
                    width: '100%',
                    height: '8px',
                    backgroundColor: '#f1f3f4',
                    borderRadius: '48px',
                    overflow: 'hidden',
                    marginBottom: '14px',
                  }}
                >
                  <div
                    style={{
                      width: `${percent}%`,
                      height: '100%',
                      backgroundColor: progressColor,
                      borderRadius: '48px',
                      transition: 'width 0.4s ease',
                    }}
                  />
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '13px',
                    color: '#666666',
                    paddingTop: '8px',
                    borderTop: '1px solid #f0f0f0',
                  }}
                >
                  <span>Terpakai: <strong style={{ color: '#000000' }}>{formatRupiah(b.spent)}</strong></span>
                  <span>Sisa: <strong style={{ color: b.remaining > 0 ? '#137333' : '#c5221f' }}>{formatRupiah(b.remaining)}</strong></span>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal: Tambah / Edit Batas Anggaran */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={editingBudget ? 'Edit Batas Anggaran' : 'Tambah Batas Anggaran'}
        subtitle={`Kendalikan pengeluaran bulanan untuk periode ${period}`}
        googleIcon="savings"
      >
        <form onSubmit={handleSubmitBudget}>
          {/* Category Select with + Kategori Baru button */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#000000' }}>
                Kategori Pengeluaran
              </label>
              <button
                type="button"
                onClick={() => setShowCategoryModal(true)}
                style={{
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: '#005caa',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <GoogleIcon name="add" size={14} color="#005caa" />
                + Buat Kategori Baru
              </button>
            </div>

            <select
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              disabled={!!editingBudget}
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '12px',
                border: '1px solid #e5e5e5',
                fontSize: '14px',
                outline: 'none',
                backgroundColor: editingBudget ? '#f8fafc' : '#ffffff',
              }}
              required
            >
              {expenseCategories.length === 0 ? (
                <option value="">(Belum ada kategori pengeluaran - Buat kategori baru)</option>
              ) : (
                expenseCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))
              )}
            </select>
          </div>

          <Input
            label="Alokasi Batas Anggaran (Rp)"
            placeholder="Contoh: 2500000"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            googleIcon="payments"
            required
          />

          <Input
            label="Periode Bulan (Format: YYYY-MM)"
            type="text"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            googleIcon="calendar_today"
            placeholder="2026-10"
            required
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '12px', borderTop: '1px solid #f0f0f0' }}>
            <Button variant="outline" type="button" onClick={() => setShowAddModal(false)}>
              Batal
            </Button>
            <Button variant="primary" type="submit" loading={submitting}>
              {editingBudget ? 'Simpan Perubahan' : 'Tetapkan Anggaran'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Inline Buat Kategori Baru */}
      <Modal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        title="Buat Kategori Pengeluaran Baru"
        subtitle="Tambahkan kategori baru ke workspace ini"
        googleIcon="category"
      >
        <form onSubmit={handleCreateCategory}>
          <Input
            label="Nama Kategori"
            placeholder="Contoh: Makan Siang, Bensin Kendaraan, Belanja Dapur"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            googleIcon="label"
            required
          />

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#000000', marginBottom: '8px' }}>
              Warna Kategori
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              {['#005caa', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'].map((hex) => (
                <button
                  type="button"
                  key={hex}
                  onClick={() => setNewCategoryColor(hex)}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: hex,
                    border: newCategoryColor === hex ? '3px solid #000000' : '1px solid transparent',
                    cursor: 'pointer',
                    outline: 'none',
                  }}
                />
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '12px', borderTop: '1px solid #f0f0f0' }}>
            <Button variant="outline" type="button" onClick={() => setShowCategoryModal(false)}>
              Batal
            </Button>
            <Button variant="primary" type="submit" loading={submitting}>
              Simpan Kategori
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
