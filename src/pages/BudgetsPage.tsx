import React, { useState, useEffect, useMemo } from 'react';
import { useWorkspace, Budget } from '../context/WorkspaceContext';
import { useAuth } from '../context/AuthContext';
import { Modal } from '../components/ui';

export const BudgetsPage: React.FC = () => {
  const { user } = useAuth();
  const {
    activeWorkspace,
    budgets,
    budgetSummary,
    selectedPeriod,
    setSelectedPeriod,
    categories,
    transactions,
    createOrUpdateBudget,
    deleteBudget,
    createCategory,
    loading,
  } = useWorkspace();

  const [showAlertBanner, setShowAlertBanner] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [period, setPeriod] = useState(selectedPeriod);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#006948');

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

  // Pre-calculated or dynamic metrics
  const totalAllocated = budgetSummary?.totalBudget ?? 0;
  const totalSpent = budgetSummary?.totalSpent ?? 0;
  const remainingBudget = budgetSummary?.totalRemaining ?? Math.max(0, totalAllocated - totalSpent);
  const overallBurnRate = totalAllocated > 0 ? Math.round((totalSpent / totalAllocated) * 1000) / 10 : 0;

  // Month navigation
  const handlePrevMonth = () => {
    const [y, m] = selectedPeriod.split('-').map(Number);
    const prev = new Date(y, m - 2, 1);
    setSelectedPeriod(`${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, '0')}`);
  };

  const handleNextMonth = () => {
    const [y, m] = selectedPeriod.split('-').map(Number);
    const next = new Date(y, m, 1);
    setSelectedPeriod(`${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}`);
  };

  const currentPeriodName = useMemo(() => {
    const [y, m] = selectedPeriod.split('-').map(Number);
    const d = new Date(y, m - 1, 1);
    return d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  }, [selectedPeriod]);

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
    if (confirm(`Hapus pagu anggaran untuk "${b.categoryName}"?`)) {
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

  // Real budgets from database (no mock data)
  const displayBudgets = useMemo(() => {
    return budgets;
  }, [budgets]);

  const criticalBudget = useMemo(() => {
    return displayBudgets.find((b: any) => {
      const cap = Number(b.amount) || 1;
      const spent = Number(b.spent) || 0;
      return (spent / cap) >= 0.9;
    });
  }, [displayBudgets]);

  return (
    <div className="flex flex-col gap-space-2xl">
      {/* -------------------------------------------------------------
          HEADER & TOP CONTROLS
      -------------------------------------------------------------- */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-lg">
        <div className="flex flex-col gap-space-2xs">
          <div className="flex items-center gap-space-xs">
            <span className="inline-flex items-center gap-1.5 px-space-sm py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-caps text-label-caps uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-primary live-dot"></span>
              <span>Treasury Radar Active</span>
            </span>
            <span className="text-outline font-label-caps text-label-caps">•</span>
            <span className="text-on-surface-variant font-label-caps text-label-caps">Fiscal Q4 2026</span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight font-bold">
            Pagu Anggaran &amp; Kontrol Belanja
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">
            Sistem radar pembatas pengeluaran bulanan agar keuangan bisnis tidak overbudget dengan sinkronisasi otomatis via bot dan OCR receipt.
          </p>
        </div>

        {/* Controls: Month Navigator & CTAs */}
        <div className="flex flex-wrap items-center gap-space-sm">
          {/* Month Navigator */}
          <div className="flex items-center bg-surface-container-lowest p-space-2xs rounded-xl border border-outline-variant/60 shadow-xs">
            <button
              type="button"
              onClick={handlePrevMonth}
              aria-label="Bulan sebelumnya"
              className="p-space-xs rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all"
            >
              <span className="material-symbols-outlined text-[20px]">chevron_left</span>
            </button>
            <div className="flex items-center gap-space-xs px-space-md py-space-2xs">
              <span className="material-symbols-outlined text-[18px] text-primary">calendar_month</span>
              <span className="font-headline-sm text-headline-sm text-on-surface font-semibold tracking-tight capitalize">
                {currentPeriodName}
              </span>
            </div>
            <button
              type="button"
              onClick={handleNextMonth}
              aria-label="Bulan berikutnya"
              className="p-space-xs rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all"
            >
              <span className="material-symbols-outlined text-[20px]">chevron_right</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-space-xs">
            <button
              type="button"
              onClick={() => setShowCategoryModal(true)}
              className="inline-flex items-center gap-space-xs bg-surface-container-lowest text-on-surface hover:bg-surface-container-low px-space-md py-space-sm rounded-lg font-body-md text-body-md font-semibold border border-outline-variant shadow-xs transition-all"
            >
              <span className="material-symbols-outlined text-[18px] text-primary">create_new_folder</span>
              <span>Kategori Baru</span>
            </button>
            <button
              type="button"
              onClick={openAddModal}
              className="inline-flex items-center gap-space-xs bg-primary text-on-primary hover:bg-primary-container px-space-md py-space-sm rounded-lg font-body-md text-body-md font-semibold shadow-xs transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              <span>Buat Anggaran Baru</span>
            </button>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------
          GUARDRAIL PROACTIVE ALERT BANNER (BOT TRIGGERED)
      {/* -------------------------------------------------------------
          GUARDRAIL PROACTIVE ALERT BANNER (REAL DATA)
      -------------------------------------------------------------- */}
      {showAlertBanner && criticalBudget && (
        <section className="relative overflow-hidden bg-surface-container-lowest rounded-xl p-space-lg border border-error-container shadow-xs">
          <div className="absolute -right-16 -top-16 w-44 h-44 bg-error-container/20 rounded-full blur-2xl pointer-events-none"></div>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md relative z-10">
            <div className="flex items-start gap-space-md">
              <div className="w-10 h-10 rounded-xl bg-error-container flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-error text-[22px]">warning</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-space-xs">
                  <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                    Peringatan Dini Guardrail Aktif
                  </span>
                  <span className="px-space-xs py-space-2xs rounded-full bg-error text-white font-label-caps text-label-caps uppercase font-bold">
                    Limit Alert
                  </span>
                </div>
                <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
                  Kategori <strong className="text-on-surface font-semibold">{criticalBudget.categoryName}</strong> telah menyentuh <strong className="text-error font-semibold">{Math.round((Number(criticalBudget.spent) / (Number(criticalBudget.amount) || 1)) * 100)}%</strong> dari pagu bulan ini.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-space-sm self-end md:self-center shrink-0">
              <button
                type="button"
                onClick={() => setShowAlertBanner(false)}
                aria-label="Tutup Peringatan"
                className="p-space-xs text-outline hover:text-on-surface transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* -------------------------------------------------------------
          MACRO HEALTH METRICS (4 CARDS)
      -------------------------------------------------------------- */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
        {/* Card 1: Pagu Ditetapkan */}
        <div className="bg-surface-container-lowest p-space-lg rounded-xl border border-outline-variant/60 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="font-label-caps text-label-caps text-outline uppercase tracking-wider font-semibold">
              Pagu Ditetapkan
            </span>
            <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[18px]">account_balance</span>
            </div>
          </div>
          <div className="my-space-md">
            <div className="flex items-baseline gap-1">
              <span className="font-body-md text-body-md text-outline font-semibold">Rp</span>
              <span className="font-title-balance text-title-balance text-on-surface font-bold tabular-nums">
                {new Intl.NumberFormat('id-ID').format(totalAllocated)}
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
              Alokasi resmi {displayBudgets.length} pos divisi
            </p>
          </div>
          <div className="pt-space-xs flex items-center gap-space-xs text-outline text-[12px]">
            <span className="material-symbols-outlined text-[16px] text-primary">verified</span>
            <span>{user?.name ? `Disetujui ${user.name}` : 'Otorisasi Aktif'}</span>
          </div>
        </div>

        {/* Card 2: Realisasi Terpakai */}
        <div className="bg-surface-container-lowest p-space-lg rounded-xl border border-outline-variant/60 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="font-label-caps text-label-caps text-outline uppercase tracking-wider font-semibold">
              Realisasi Terpakai
            </span>
            <div className="w-8 h-8 rounded-lg bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed">
              <span className="material-symbols-outlined text-[18px]">payments</span>
            </div>
          </div>
          <div className="my-space-md">
            <div className="flex items-baseline gap-1">
              <span className="font-body-md text-body-md text-outline font-semibold">Rp</span>
              <span className="font-title-balance text-title-balance text-on-surface font-bold tabular-nums">
                {new Intl.NumberFormat('id-ID').format(totalSpent)}
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
              Beban belanja periode berjalan
            </p>
          </div>
          <div className="pt-space-xs flex items-center gap-space-xs text-on-surface-variant text-[12px]">
            <span className="material-symbols-outlined text-[16px]">sync</span>
            <span>{transactions.length} mutasi terverifikasi</span>
          </div>
        </div>

        {/* Card 3: Sisa Anggaran Aman */}
        <div className="bg-surface-container-lowest p-space-lg rounded-xl border border-outline-variant/60 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="font-label-caps text-label-caps text-outline uppercase tracking-wider font-semibold">
              Sisa Anggaran Aman
            </span>
            <div className="w-8 h-8 rounded-lg bg-tertiary-fixed/30 flex items-center justify-center text-tertiary">
              <span className="material-symbols-outlined text-[18px]">savings</span>
            </div>
          </div>
          <div className="my-space-md">
            <div className="flex items-baseline gap-1">
              <span className="font-body-md text-body-md text-outline font-semibold">Rp</span>
              <span className="font-title-balance text-title-balance text-tertiary font-bold tabular-nums">
                {new Intl.NumberFormat('id-ID').format(remainingBudget)}
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
              Sisa alokasi periode berjalan
            </p>
          </div>
          <div className="pt-space-xs flex items-center gap-space-xs text-tertiary text-[12px] font-semibold">
            <span className="material-symbols-outlined text-[16px]">check_circle</span>
            <span>{remainingBudget > 0 ? 'Pagu Aman Tersedia' : 'Pagu Terpenuhi'}</span>
          </div>
        </div>

        {/* Card 4: Total Burn Rate */}
        <div className="bg-surface-container-lowest p-space-lg rounded-xl border border-outline-variant/60 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="font-label-caps text-label-caps text-outline uppercase tracking-wider font-semibold">
              Total Burn Rate
            </span>
            <span className="font-badge-label text-badge-label bg-surface-container-high px-space-xs py-space-2xs rounded text-on-surface-variant font-semibold">
              Q4 Status
            </span>
          </div>
          <div className="my-space-md">
            <div className="flex items-baseline gap-space-xs">
              <span className="font-display-hero text-display-hero text-on-surface font-bold tabular-nums">
                {overallBurnRate}%
              </span>
              <span className="text-body-sm text-outline">Target Max: 85%</span>
            </div>
            {/* Miniature progress bar */}
            <div className="w-full h-1.5 rounded-full bg-surface-container-high mt-2 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  overallBurnRate > 90 ? 'bg-error' : overallBurnRate > 70 ? 'bg-secondary' : 'bg-primary'
                }`}
                style={{ width: `${Math.min(100, overallBurnRate)}%` }}
              ></div>
            </div>
          </div>
          <div className="pt-space-xs flex items-center justify-between text-[12px] text-on-surface-variant">
            <span>Kecepatan Ideal: 2.3%/hari</span>
            <span className="text-tertiary font-semibold">Aman</span>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------
          MAIN 12-COLUMN CONTENT: CATEGORIES & GUARDRAIL INSIGHTS
      -------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
        {/* Left Column: Category Budgets List (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-space-md">
          {/* List Header */}
          <div className="flex items-center justify-between bg-surface-container-lowest p-space-md rounded-xl border border-outline-variant/60 shadow-xs">
            <div className="flex items-center gap-space-sm">
              <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                Daftar Pagu Anggaran per Kategori
              </h2>
              <span className="px-space-xs py-0.5 rounded-full bg-surface-container-high text-on-surface font-numeric-table text-numeric-table font-semibold">
                {displayBudgets.length} Pos
              </span>
            </div>
            {/* Threshold Legend */}
            <div className="hidden sm:flex items-center gap-space-sm text-on-surface-variant font-label-caps text-label-caps">
              <span className="inline-flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-primary"></span>&lt;70% Aman
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-secondary"></span>70–80% Waspada
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-error"></span>&gt;90% Kritis
              </span>
            </div>
          </div>

          {/* Category Cards */}
          <div className="space-y-space-md">
            {displayBudgets.length === 0 ? (
              <div className="bg-surface-container-lowest rounded-xl p-space-2xl border border-dashed border-outline-variant text-center flex flex-col items-center justify-center gap-2">
                <span className="material-symbols-outlined text-[36px] text-outline">shield</span>
                <p className="font-body-md text-on-surface font-semibold">Belum Ada Pagu Anggaran</p>
                <p className="font-body-sm text-outline max-w-sm">
                  Tetapkan batas pengeluaran untuk setiap kategori operasional agar cash flow perusahaan tetap terkendali.
                </p>
                <button
                  type="button"
                  onClick={openAddModal}
                  className="mt-2 inline-flex items-center gap-1.5 px-space-md py-space-xs rounded-lg bg-primary text-on-primary font-body-sm font-semibold hover:bg-primary-container transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  <span>Tetapkan Anggaran Baru</span>
                </button>
              </div>
            ) : (
              displayBudgets.map((b: any) => {
              const cap = Number(b.amount) || 1;
              const spent = Number(b.spent) || 0;
              const pct = Math.round((spent / cap) * 1000) / 10;
              const leftAmt = Math.max(0, cap - spent);
              const isOver = pct >= 90;
              const isWarning = pct >= 70 && pct < 90;

              const progressColor = isOver ? 'bg-error' : isWarning ? 'bg-secondary' : 'bg-primary';
              const textColor = isOver ? 'text-error' : isWarning ? 'text-secondary' : 'text-primary';

              return (
                <div
                  key={b.id}
                  className="bg-surface-container-lowest rounded-xl p-space-lg border border-outline-variant/60 shadow-xs flex flex-col gap-space-md hover:shadow-md transition-all"
                >
                  {/* Top Bar: Title, Tags, Actions */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-space-sm">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          isOver
                            ? 'bg-error-container text-error'
                            : isWarning
                            ? 'bg-secondary-fixed text-secondary'
                            : 'bg-primary-fixed text-primary'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          {isOver ? 'coffee' : isWarning ? 'dns' : 'corporate_fare'}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-space-xs">
                          <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                            {b.categoryName || 'Kategori'}
                          </h3>
                          {b.tags && (
                            <span
                              className={`px-space-xs py-0.5 rounded text-[11px] font-semibold ${
                                isOver
                                  ? 'bg-error-container text-error'
                                  : 'bg-surface-container-high text-on-surface-variant'
                              }`}
                            >
                              {b.tags}
                            </span>
                          )}
                        </div>
                        <p className="font-label-caps text-label-caps text-outline mt-0.5">
                          Penanggung Jawab: {b.dept || 'Divisi Terkait'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openEditModal(b)}
                        className="inline-flex items-center gap-1 px-space-sm py-1 rounded-lg border border-outline-variant hover:bg-surface-container text-body-sm text-on-surface font-medium transition-colors"
                      >
                        <span className="material-symbols-outlined text-[16px]">edit</span>
                        <span>Ubah</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteBudget(b)}
                        className="p-1.5 rounded-lg hover:bg-error-container/40 text-outline hover:text-error transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </div>

                  {/* 3 Metric Columns */}
                  <div className="grid grid-cols-3 gap-space-sm p-space-md bg-surface-container-low/60 rounded-lg">
                    <div className="flex flex-col">
                      <span className="font-label-caps text-label-caps text-outline uppercase font-semibold">
                        Pagu Ditetapkan
                      </span>
                      <span className="font-title-balance text-title-balance text-on-surface font-bold tabular-nums">
                        {formatRupiah(cap)}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-label-caps text-label-caps text-outline uppercase font-semibold">
                        Realisasi Belanja
                      </span>
                      <span className={`font-title-balance text-title-balance font-bold tabular-nums ${textColor}`}>
                        {formatRupiah(spent)}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-label-caps text-label-caps text-outline uppercase font-semibold">
                        {isOver ? 'Sisa Kritis!' : 'Sisa Anggaran'}
                      </span>
                      <span className={`font-title-balance text-title-balance font-bold tabular-nums ${textColor}`}>
                        {formatRupiah(leftAmt)}
                      </span>
                    </div>
                  </div>

                  {/* Guardrail 3-Phase Progress Bar */}
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-body-sm font-body-sm">
                      <span className={`flex items-center gap-1 font-semibold ${textColor}`}>
                        <span className="material-symbols-outlined text-[16px]">
                          {isOver ? 'error' : isWarning ? 'warning' : 'verified'}
                        </span>
                        <span>
                          {isOver
                            ? `Peringatan Dini Kritis • ${pct}% Terpakai`
                            : isWarning
                            ? `Waspada Mendekati Batas • ${pct}% Terpakai`
                            : `Aman • ${pct}% Terpakai`}
                        </span>
                      </span>
                      <span className="text-outline font-numeric-table">
                        {isOver ? `Hanya Tersisa ${(100 - pct).toFixed(1)}%` : `Tersisa ${(100 - pct).toFixed(1)}%`}
                      </span>
                    </div>

                    <div className="w-full h-2.5 rounded-full bg-surface-container-high overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${progressColor}`}
                        style={{ width: `${Math.min(100, pct)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          </div>
        </div>

        {/* Right Column: Guardrail Policies & Donut Breakdown (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-space-lg">
          {/* Policy Card */}
          <div className="bg-surface-container-lowest p-space-lg rounded-xl border border-outline-variant/60 shadow-xs flex flex-col gap-space-md">
            <div className="flex items-center justify-between border-b border-surface-container-high/80 pb-space-xs">
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                Guardrail Policy
              </h3>
              <span className="material-symbols-outlined text-secondary text-[22px]">security</span>
            </div>

            <div className="space-y-space-md text-body-sm font-body-sm">
              <div className="flex items-start gap-space-sm">
                <span className="material-symbols-outlined text-tertiary text-[20px] shrink-0 mt-0.5">
                  chat
                </span>
                <div>
                  <h4 className="font-semibold text-on-surface">WA Bot Auto-Alert</h4>
                  <p className="text-on-surface-variant text-[13px]">
                    Notifikasi terkirim seketika saat kategori mencapai ambang batas 80%.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-space-sm">
                <span className="material-symbols-outlined text-secondary text-[20px] shrink-0 mt-0.5">
                  lock
                </span>
                <div>
                  <h4 className="font-semibold text-on-surface">OCR Nota Strict Lock</h4>
                  <p className="text-on-surface-variant text-[13px]">
                    Nota baru yang melebihi batas sisa pagu ditandai butuh approval owner.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-space-sm">
                <span className="material-symbols-outlined text-primary text-[20px] shrink-0 mt-0.5">
                  restart_alt
                </span>
                <div>
                  <h4 className="font-semibold text-on-surface">Rollover Bulanan</h4>
                  <p className="text-on-surface-variant text-[13px]">
                    Sisa pagu tidak otomatis terakumulasi ke bulan berikutnya (Zero-based).
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => alert('Kebijakan Guardrail disinkronkan dengan bot WhatsApp.')}
              className="w-full py-space-xs rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-body-sm font-semibold transition-colors mt-space-xs"
            >
              Konfigurasi Ambang Batas
            </button>
          </div>

          {/* Donut Chart: Komposisi Realisasi Belanja */}
          <div className="bg-surface-container-lowest p-space-lg rounded-xl border border-outline-variant/60 shadow-xs flex flex-col gap-space-md">
            <div className="flex items-center justify-between border-b border-surface-container-high/80 pb-space-xs">
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                Komposisi Realisasi
              </h3>
              <span className="font-label-caps text-label-caps text-outline uppercase font-semibold">
                Bulan Ini
              </span>
            </div>

            {/* Visual Donut Ring SVG */}
            <div className="relative flex items-center justify-center py-space-sm">
              <svg className="w-44 h-44 -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="38" stroke="#f1f5f9" strokeWidth="12" fill="none" />
                <circle cx="50" cy="50" r="38" stroke="#006948" strokeWidth="12" fill="none" strokeDasharray="238" strokeDashoffset="70" />
                <circle cx="50" cy="50" r="38" stroke="#4b41e1" strokeWidth="12" fill="none" strokeDasharray="238" strokeDashoffset="140" />
                <circle cx="50" cy="50" r="38" stroke="#ba1a1a" strokeWidth="12" fill="none" strokeDasharray="238" strokeDashoffset="210" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="font-label-caps text-label-caps text-outline uppercase font-semibold">
                  Total Belanja
                </span>
                <span className="font-headline-md text-headline-md font-bold text-on-surface tabular-nums">
                  42.1M
                </span>
                <span className="font-label-caps text-label-caps text-tertiary font-bold">
                  70.2% Target
                </span>
              </div>
            </div>

            {/* Breakdown List */}
            <div className="space-y-space-xs text-body-sm font-body-sm">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary"></span>
                  <span>Operasional</span>
                </span>
                <span className="font-numeric-table font-semibold">Rp 12.4M</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-secondary"></span>
                  <span>Marketing</span>
                </span>
                <span className="font-numeric-table font-semibold">Rp 11.2M</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary-fixed"></span>
                  <span>Server &amp; SaaS</span>
                </span>
                <span className="font-numeric-table font-semibold">Rp 7.8M</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-tertiary"></span>
                  <span>Logistik</span>
                </span>
                <span className="font-numeric-table font-semibold">Rp 6.0M</span>
              </div>
              <div className="flex items-center justify-between text-error font-semibold">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-error"></span>
                  <span>Konsumsi / Pantry</span>
                </span>
                <span className="font-numeric-table font-bold">Rp 4.75M</span>
              </div>
            </div>
          </div>

          {/* Tips CFO Nexa Insight Card */}
          <div className="bg-surface-container-low p-space-md rounded-xl border border-outline-variant/60 flex items-start gap-space-sm">
            <span className="material-symbols-outlined text-primary text-[22px] shrink-0 mt-0.5">
              lightbulb
            </span>
            <div className="flex flex-col">
              <h4 className="font-body-md font-bold text-on-surface">Tips CFO Nexa:</h4>
              <p className="text-body-sm text-on-surface-variant text-[13px] mt-0.5">
                Lakukan pengalihan dana sisa dari pos Logistik (+Rp 4 Juta) ke pos Konsumsi agar belanja akhir bulan tidak mengganggu kas operasional pokok.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------
          ADD / EDIT BUDGET MODAL
      -------------------------------------------------------------- */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={editingBudget ? 'Ubah Pagu Anggaran' : 'Buat Pagu Anggaran Baru'}
        subtitle="Tetapkan batas pengeluaran per kategori untuk periode aktif"
        googleIcon="savings"
        maxWidth={480}
      >
        <form onSubmit={handleSubmitBudget} className="flex flex-col gap-space-md">
          <div className="flex flex-col gap-1">
            <label className="font-label-caps text-label-caps uppercase text-outline font-semibold">
              Kategori Pengeluaran
            </label>
            <select
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              required
              className="w-full px-space-md py-space-sm bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            >
              {expenseCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-label-caps text-label-caps uppercase text-outline font-semibold">
              Plafon Anggaran (IDR)
            </label>
            <input
              type="number"
              required
              placeholder="Contoh: 15000000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-space-md py-space-sm bg-surface-container-lowest border border-outline-variant rounded-lg font-title-balance text-title-balance font-bold text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

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
              <span>{submitting ? 'Menyimpan...' : 'Simpan Pagu'}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* -------------------------------------------------------------
          CREATE CATEGORY MODAL
      -------------------------------------------------------------- */}
      <Modal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        title="Buat Kategori Pengeluaran Baru"
        subtitle="Tambahkan pos alokasi belanja untuk pelaporan pembukuan"
        googleIcon="create_new_folder"
        maxWidth={460}
      >
        <form onSubmit={handleCreateCategory} className="flex flex-col gap-space-md">
          <div className="flex flex-col gap-1">
            <label className="font-label-caps text-label-caps uppercase text-outline font-semibold">
              Nama Kategori
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Pemeliharaan Server Cloud"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="w-full px-space-md py-space-sm bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          <div className="flex items-center justify-end gap-space-sm pt-space-xs border-t border-surface-container-high">
            <button
              type="button"
              onClick={() => setShowCategoryModal(false)}
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
              <span>{submitting ? 'Menyimpan...' : 'Buat Kategori'}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
