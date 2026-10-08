import React, { useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { useWorkspace } from '../context/WorkspaceContext';
import { useAuth } from '../context/AuthContext';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { totalBalance, accounts, transactions, activeWorkspace, loading, deleteTransaction } = useWorkspace();

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const totalExpense = transactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalIncome = transactions
    .filter((t) => t.type === 'INCOME')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const netCashFlow = totalIncome - totalExpense;

  const recentTransactions = transactions.slice(0, 5);

  const getSourceBadge = (tx: any) => {
    const desc = (tx?.description || '').toLowerCase();
    const notes = (tx?.notes || '').toLowerCase();
    if (desc.includes('bot') || desc.includes('wa') || notes.includes('wa') || notes.includes('whatsapp')) {
      return (
        <span className="inline-flex items-center gap-1 px-space-xs py-0.5 rounded-full bg-tertiary-fixed/30 font-badge-label text-badge-label text-on-tertiary-fixed-variant">
          <span className="material-symbols-outlined text-[13px]">mark_chat_read</span>
          <span>WhatsApp Bot</span>
        </span>
      );
    }
    if (desc.includes('ocr') || desc.includes('nota') || desc.includes('struk') || notes.includes('ocr')) {
      return (
        <span className="inline-flex items-center gap-1 px-space-xs py-0.5 rounded-full bg-secondary-fixed/50 font-badge-label text-badge-label text-on-secondary-fixed-variant">
          <span className="material-symbols-outlined text-[13px]">document_scanner</span>
          <span>OCR Invoice</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-space-xs py-0.5 rounded-full bg-surface-container-high font-badge-label text-badge-label text-on-surface-variant">
        <span className="material-symbols-outlined text-[13px]">laptop_mac</span>
        <span>Web App</span>
      </span>
    );
  };

  const weeklyCashflow = useMemo(() => {
    const weeks = [
      { label: 'Minggu 1', inAmt: 0, outAmt: 0 },
      { label: 'Minggu 2', inAmt: 0, outAmt: 0 },
      { label: 'Minggu 3', inAmt: 0, outAmt: 0 },
      { label: 'Minggu 4', inAmt: 0, outAmt: 0 },
    ];

    transactions.forEach((tx) => {
      const d = new Date(tx.date || '');
      const day = isNaN(d.getDate()) ? 1 : d.getDate();
      const weekIdx = Math.min(3, Math.floor((day - 1) / 7));
      const amt = Number(tx.amount) || 0;
      if (tx.type === 'INCOME') {
        weeks[weekIdx].inAmt += amt;
      } else if (tx.type === 'EXPENSE') {
        weeks[weekIdx].outAmt += amt;
      }
    });

    const maxVal = Math.max(...weeks.map((w) => Math.max(w.inAmt, w.outAmt)), 1);

    return weeks.map((w) => ({
      label: w.label,
      in: Math.min(100, Math.round((w.inAmt / maxVal) * 100)),
      out: Math.min(100, Math.round((w.outAmt / maxVal) * 100)),
      inVal: formatRupiah(w.inAmt),
      outVal: formatRupiah(w.outAmt),
    }));
  }, [transactions]);

  return (
    <div className="flex flex-col gap-space-2xl">
      {/* -------------------------------------------------------------
          HERO OVERVIEW BANNER
      -------------------------------------------------------------- */}
      <div className="bg-surface-container-lowest p-space-xl rounded-xl border border-outline-variant/60 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-space-lg relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 w-44 h-44 rounded-full bg-primary-fixed/20 blur-3xl pointer-events-none"></div>

        <div className="flex flex-col gap-space-2xs relative z-10">
          <div className="flex items-center gap-space-xs">
            <span className="font-label-caps text-label-caps text-primary uppercase font-bold tracking-wider">
              Treasury Precision
            </span>
            <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">
              Live Production
            </span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight font-bold">
            Executive Treasury Overview
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">
            Konsolidasi likuiditas kas multi-rekening, rekonsiliasi WhatsApp Bot 2-arah, dan pengawasan batas pagu anggaran real-time.
          </p>
        </div>

        <div className="flex items-center gap-space-sm relative z-10 shrink-0">
          <NavLink
            to="/transactions"
            className="inline-flex items-center gap-space-xs bg-surface-container-lowest text-on-surface hover:bg-surface-container-high px-space-md py-space-sm rounded-lg font-body-md text-body-md font-medium border border-outline-variant shadow-xs transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">receipt_long</span>
            <span>Buku Transaksi</span>
          </NavLink>
          <NavLink
            to="/ai"
            className="inline-flex items-center gap-space-xs bg-primary text-on-primary hover:bg-primary-container px-space-lg py-space-sm rounded-lg font-body-md text-body-md font-semibold shadow-xs transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">smart_toy</span>
            <span>Tanya AI Agent</span>
          </NavLink>
        </div>
      </div>

      {/* -------------------------------------------------------------
          4 MACRO KPI CARDS
      -------------------------------------------------------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
        {/* Total Likuiditas */}
        <div className="bg-surface-container-lowest p-space-lg rounded-xl border border-outline-variant/60 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="font-label-caps text-label-caps text-outline uppercase font-semibold">
              Total Saldo Likuiditas
            </span>
            <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[18px]">account_balance_wallet</span>
            </div>
          </div>
          <div className="my-space-md">
            <span className="font-title-balance text-title-balance text-on-surface font-bold tabular-nums">
              {formatRupiah(totalBalance)}
            </span>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
              {accounts.length} Pos Kas Terdaftar
            </p>
          </div>
          <div className="pt-space-xs flex items-center gap-1 text-[12px] text-tertiary font-semibold">
            <span className="material-symbols-outlined text-[16px]">verified</span>
            <span>{totalBalance > 0 ? 'Likuiditas Siap Cair' : 'Saldo Kas Nol'}</span>
          </div>
        </div>

        {/* Total Pemasukan */}
        <div className="bg-surface-container-lowest p-space-lg rounded-xl border border-outline-variant/60 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="font-label-caps text-label-caps text-outline uppercase font-semibold">
              Total Pemasukan Bulan Ini
            </span>
            <div className="w-8 h-8 rounded-lg bg-tertiary-fixed/30 flex items-center justify-center text-tertiary">
              <span className="material-symbols-outlined text-[18px]">arrow_downward</span>
            </div>
          </div>
          <div className="my-space-md">
            <span className="font-title-balance text-title-balance text-on-surface font-bold tabular-nums">
              {formatRupiah(totalIncome)}
            </span>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
              {transactions.filter((t) => t.type === 'INCOME').length} mutasi masuk
            </p>
          </div>
          <div className="pt-space-xs flex items-center gap-1 text-[12px] text-tertiary font-semibold">
            <span className="material-symbols-outlined text-[16px]">trending_up</span>
            <span>{totalIncome > 0 ? 'Pemasukan Aktif' : 'Belum Ada Pemasukan'}</span>
          </div>
        </div>

        {/* Total Pengeluaran */}
        <div className="bg-surface-container-lowest p-space-lg rounded-xl border border-outline-variant/60 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="font-label-caps text-label-caps text-outline uppercase font-semibold">
              Total Pengeluaran Bulan Ini
            </span>
            <div className="w-8 h-8 rounded-lg bg-error-container/40 flex items-center justify-center text-error">
              <span className="material-symbols-outlined text-[18px]">arrow_upward</span>
            </div>
          </div>
          <div className="my-space-md">
            <span className="font-title-balance text-title-balance text-on-surface font-bold tabular-nums">
              {formatRupiah(totalExpense)}
            </span>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
              {transactions.filter((t) => t.type === 'EXPENSE').length} transaksi terverifikasi
            </p>
          </div>
          <div className="pt-space-xs flex items-center gap-1 text-[12px] text-on-surface-variant">
            <span>Rasio belanja: {totalIncome > 0 ? ((totalExpense / totalIncome) * 100).toFixed(1) + '%' : '0%'}</span>
          </div>
        </div>

        {/* Net Cash Flow */}
        <div className="bg-surface-container-lowest p-space-lg rounded-xl border border-outline-variant/60 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="font-label-caps text-label-caps text-outline uppercase font-semibold">
              Net Cash Flow
            </span>
            <div className="w-8 h-8 rounded-lg bg-primary-fixed/40 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[18px]">account_balance</span>
            </div>
          </div>
          <div className="my-space-md">
            <span className={`font-title-balance text-title-balance font-bold tabular-nums ${netCashFlow >= 0 ? 'text-tertiary' : 'text-error'}`}>
              {netCashFlow >= 0 ? `+${formatRupiah(netCashFlow)}` : formatRupiah(netCashFlow)}
            </span>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
              {netCashFlow > 0 ? 'Surplus Operasional Bersih' : netCashFlow < 0 ? 'Defisit Arus Kas' : 'Arus Kas Seimbang'}
            </p>
          </div>
          <div className={`pt-space-xs flex items-center gap-1 text-[12px] font-semibold ${netCashFlow >= 0 ? 'text-tertiary' : 'text-error'}`}>
            <span className="material-symbols-outlined text-[16px]">
              {netCashFlow >= 0 ? 'check_circle' : 'warning'}
            </span>
            <span>{netCashFlow > 0 ? 'Likuiditas Sehat' : netCashFlow < 0 ? 'Pengawasan Pagu Aktif' : 'Belum Ada Mutasi'}</span>
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------
          2-COLUMN DETAILED WORKSPACE
      -------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
        {/* LEFT COLUMN: MUTASI TERAKHIR & CASHFLOW TREND (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-space-lg">
          {/* Weekly Cashflow Trend Visual */}
          <div className="bg-surface-container-lowest p-space-lg rounded-xl border border-outline-variant/60 shadow-xs flex flex-col gap-space-md">
            <div className="flex items-center justify-between border-b border-surface-container-high/80 pb-space-xs">
              <div>
                <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                  Tren Arus Kas Mingguan
                </h3>
                <p className="font-body-sm text-outline text-[13px]">
                  Perbandingan pemasukan vs pengeluaran bulan Oktober 2026
                </p>
              </div>
              <div className="flex items-center gap-space-sm text-[12px] font-semibold">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm bg-primary"></span>
                  <span>Masuk</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm bg-error"></span>
                  <span>Keluar</span>
                </span>
              </div>
            </div>

            {/* Visual Bar Chart Comparison */}
            <div className="grid grid-cols-4 gap-space-md pt-space-sm items-end h-44 text-center">
              {weeklyCashflow.map((w, idx) => (
                <div key={idx} className="flex flex-col items-center gap-1 h-full justify-end">
                  <div className="flex items-end gap-1.5 h-32 w-full justify-center">
                    <div
                      className="w-5 bg-primary rounded-t-md hover:bg-primary-container transition-all"
                      style={{ height: `${w.in}%` }}
                      title={`Pemasukan: ${w.inVal}`}
                    ></div>
                    <div
                      className="w-5 bg-error/80 rounded-t-md hover:bg-error transition-all"
                      style={{ height: `${w.out}%` }}
                      title={`Pengeluaran: ${w.outVal}`}
                    ></div>
                  </div>
                  <span className="font-body-sm text-outline text-[12px]">{w.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Mutasi Terakhir Real-Time */}
          <div className="bg-surface-container-lowest p-space-lg rounded-xl border border-outline-variant/60 shadow-xs flex flex-col gap-space-md">
            <div className="flex items-center justify-between border-b border-surface-container-high/80 pb-space-xs">
              <div className="flex items-center gap-space-xs">
                <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                  Mutasi Terakhir Real-Time
                </h3>
                <span className="font-badge-label text-badge-label bg-surface-container-high px-1.5 py-0.5 rounded text-on-surface-variant">
                  5 Terkini
                </span>
              </div>
              <NavLink
                to="/transactions"
                className="font-body-sm text-primary font-semibold hover:underline flex items-center gap-1 text-[13px]"
              >
                <span>Lihat Semua Mutasi</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </NavLink>
            </div>

            {/* List */}
            <div className="divide-y divide-surface-container-high/70">
              {recentTransactions.length === 0 ? (
                <div className="py-space-lg text-center text-outline">
                  Belum ada mutasi keuangan tercatat.
                </div>
              ) : (
                recentTransactions.map((tx, idx) => {
                  const isIncome = tx.type === 'INCOME';
                  const isExpense = tx.type === 'EXPENSE';

                  return (
                    <div key={tx.id} className="py-space-sm flex items-center justify-between gap-space-sm">
                      <div className="flex items-center gap-space-sm min-w-0">
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                            isIncome
                              ? 'bg-tertiary-fixed/30 text-tertiary'
                              : isExpense
                              ? 'bg-error-container/40 text-error'
                              : 'bg-secondary-fixed/40 text-secondary'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            {isIncome ? 'arrow_downward' : isExpense ? 'arrow_upward' : 'sync_alt'}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-body-md font-semibold text-on-surface truncate">
                            {tx.description}
                          </p>
                          <p className="font-body-sm text-outline text-[12px] truncate">
                            {tx.sourceAccount?.name || '-'} • {new Date(tx.date || '').toLocaleDateString('id-ID')}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-space-md shrink-0">
                        <div className="text-right">
                          <span
                            className={`font-numeric-table font-bold tabular-nums block ${
                              isIncome ? 'text-tertiary' : 'text-on-surface'
                            }`}
                          >
                            {isIncome ? `+ ${formatRupiah(Number(tx.amount))}` : `- ${formatRupiah(Number(tx.amount))}`}
                          </span>
                          {getSourceBadge(tx)}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Hapus mutasi "${tx.description}"? Saldo rekening dikembalikan otomatis.`)) {
                              deleteTransaction(tx.id);
                            }
                          }}
                          className="p-1 rounded hover:bg-error-container/40 text-outline hover:text-error transition-colors"
                          title="Hapus / Rollback Transaksi"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: POS KAS & WHATSAPP BOT STATUS (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-space-lg">
          {/* Ringkasan Pos Kas Aktif */}
          <div className="bg-surface-container-lowest p-space-lg rounded-xl border border-outline-variant/60 shadow-xs flex flex-col gap-space-md">
            <div className="flex items-center justify-between border-b border-surface-container-high/80 pb-space-xs">
              <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                Pos Kas &amp; Dompet Bisnis
              </h3>
              <NavLink
                to="/accounts"
                className="font-body-sm text-primary font-semibold hover:underline flex items-center gap-1 text-[13px]"
              >
                <span>Kelola</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </NavLink>
            </div>

            <div className="space-y-space-xs">
              {accounts.length === 0 ? (
                <div className="p-space-md text-center text-outline text-body-sm bg-surface-container-low/40 rounded-lg">
                  Belum ada pos kas terdaftar.
                </div>
              ) : (
                accounts.map((acc, i) => (
                  <div
                    key={acc.id}
                    className="p-space-sm rounded-lg bg-surface-container-low/60 border border-outline-variant/40 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-space-sm">
                      <div className="w-8 h-8 rounded-lg bg-surface-container-highest flex items-center justify-center font-bold text-xs text-primary">
                        {acc.type === 'BANK' ? 'BK' : acc.type === 'EWALLET' ? 'EW' : 'CS'}
                      </div>
                      <div>
                        <h4 className="font-body-md font-semibold text-on-surface">
                          {acc.name}
                        </h4>
                        <p className="font-label-caps text-label-caps text-outline uppercase">
                          {acc.type === 'BANK' ? 'Bank Komersil' : acc.type === 'EWALLET' ? 'E-Wallet / QRIS' : 'Petty Cash'}
                        </p>
                      </div>
                    </div>

                    <span className="font-title-balance text-[15px] font-bold text-on-surface tabular-nums">
                      {formatRupiah(Number(acc.balance))}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* WhatsApp Bot Gateway Feed */}
          <div className="bg-surface-container-lowest p-space-lg rounded-xl border border-outline-variant/60 shadow-xs flex flex-col gap-space-md">
            <div className="flex items-center justify-between border-b border-surface-container-high/80 pb-space-xs">
              <div className="flex items-center gap-space-xs">
                <div className="w-8 h-8 rounded-lg bg-tertiary-fixed/30 text-tertiary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">chat</span>
                </div>
                <div>
                  <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                    WhatsApp Bot Gateway
                  </h3>
                  <p className="font-label-caps text-label-caps text-outline uppercase">
                    Sinkronisasi Mutasi 2-Arah
                  </p>
                </div>
              </div>

              <span className="inline-flex items-center gap-1 font-badge-label text-badge-label text-tertiary bg-tertiary-fixed/30 px-2 py-0.5 rounded-full font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-tertiary live-dot"></span>
                Online
              </span>
            </div>

            <div className="p-space-sm bg-surface-container-low rounded-lg text-body-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-on-surface-variant">WhatsApp Terhubung:</span>
                <span className="font-numeric-table font-semibold text-on-surface">{user?.whatsappNumber || 'Belum Terhubung'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-on-surface-variant">Model Pemroses:</span>
                <span className="font-semibold text-primary">Groq Llama 3.3 70B</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-on-surface-variant">Webhook Cloud API:</span>
                <span className="text-tertiary font-semibold">Tersambung (SSL TLS 1.3)</span>
              </div>
            </div>

            <div className="p-space-sm bg-surface-container-lowest border border-outline-variant rounded-lg">
              <p className="text-[12px] text-outline font-semibold uppercase mb-1">
                Contoh Perintah WhatsApp:
              </p>
              <p className="font-mono text-[12px] text-on-surface bg-surface-container-low p-2 rounded">
                {`"Beli token listrik 200rb pakai ${accounts[0]?.name || 'Kas'}"`}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
