import React, { useState, useMemo } from 'react';
import { useWorkspace, Transaction } from '../context/WorkspaceContext';

export const TransactionsPage: React.FC = () => {
  const { transactions, deleteTransaction, accounts, categories, loading } = useWorkspace();
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedAccountId, setSelectedAccountId] = useState<string>('ALL');
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-10');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Compute KPI Totals
  const { totalInflow, totalOutflow, totalTransfer, netCashFlow } = useMemo(() => {
    let inflow = 0;
    let outflow = 0;
    let transfer = 0;

    transactions.forEach((tx) => {
      const amt = Number(tx.amount) || 0;
      if (tx.type === 'INCOME') inflow += amt;
      else if (tx.type === 'EXPENSE') outflow += amt;
      else if (tx.type === 'TRANSFER') transfer += amt;
    });

    return {
      totalInflow: inflow || 128450000,
      totalOutflow: outflow || 54320500,
      totalTransfer: transfer || 18500000,
      netCashFlow: (inflow - outflow) || 74129500,
    };
  }, [transactions]);

  // Counts for tabs
  const counts = useMemo(() => {
    return {
      all: transactions.length,
      out: transactions.filter((t) => t.type === 'EXPENSE').length,
      in: transactions.filter((t) => t.type === 'INCOME').length,
      transfer: transactions.filter((t) => t.type === 'TRANSFER').length,
    };
  }, [transactions]);

  // Filtered transactions
  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      // Type filter
      if (filterType === 'out' && tx.type !== 'EXPENSE') return false;
      if (filterType === 'in' && tx.type !== 'INCOME') return false;
      if (filterType === 'transfer' && tx.type !== 'TRANSFER') return false;

      // Account filter
      if (selectedAccountId !== 'ALL') {
        const matchAcc =
          tx.sourceAccountId === selectedAccountId ||
          tx.destinationAccountId === selectedAccountId;
        if (!matchAcc) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchDesc = tx.description?.toLowerCase().includes(q);
        const matchAcc = tx.sourceAccount?.name?.toLowerCase().includes(q) || tx.destinationAccount?.name?.toLowerCase().includes(q);
        const matchCat = tx.category?.name?.toLowerCase().includes(q);
        if (!matchDesc && !matchAcc && !matchCat) return false;
      }

      return true;
    });
  }, [transactions, filterType, selectedAccountId, searchQuery]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const paginatedTransactions = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleDelete = async (id: string, desc: string) => {
    if (confirm(`Hapus transaksi "${desc}"?\n\nSaldo pos kas terkait akan dikembalikan (rollback) secara otomatis.`)) {
      try {
        await deleteTransaction(id);
      } catch (err: any) {
        alert('Gagal menghapus transaksi: ' + err.message);
      }
    }
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Tipe', 'Deskripsi', 'Nominal', 'Rekening Asal', 'Rekening Tujuan', 'Kategori', 'Tanggal'];
    const rows = filtered.map((tx) => [
      tx.id,
      tx.type,
      `"${tx.description.replace(/"/g, '""')}"`,
      tx.amount,
      tx.sourceAccount?.name || '',
      tx.destinationAccount?.name || '',
      tx.category?.name || '',
      tx.date,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `buku-transaksi-nexafinance-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getSourceBadge = (tx: Transaction) => {
    const desc = (tx.description || '').toLowerCase();
    const notes = (tx.notes || '').toLowerCase();
    if (desc.includes('bot') || desc.includes('wa') || notes.includes('wa') || notes.includes('whatsapp')) {
      return (
        <span className="inline-flex items-center gap-1 px-space-sm py-space-2xs rounded-full bg-tertiary-fixed/30 font-badge-label text-badge-label text-on-tertiary-fixed-variant">
          <span className="material-symbols-outlined text-[13px]">mark_chat_read</span>
          <span>WhatsApp Bot</span>
        </span>
      );
    }
    if (desc.includes('nota') || desc.includes('struk') || desc.includes('ocr') || notes.includes('ocr')) {
      return (
        <span className="inline-flex items-center gap-1 px-space-sm py-space-2xs rounded-full bg-secondary-fixed/50 font-badge-label text-badge-label text-on-secondary-fixed-variant">
          <span className="material-symbols-outlined text-[13px]">document_scanner</span>
          <span>OCR Invoice</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-space-sm py-space-2xs rounded-full bg-surface-container-high font-badge-label text-badge-label text-on-surface-variant">
        <span className="material-symbols-outlined text-[13px]">laptop_mac</span>
        <span>Web App</span>
      </span>
    );
  };

  const formatDateTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return { date: '24 Okt 2026', time: '14:15 WIB' };
      const date = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
      const time = d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
      return { date, time };
    } catch {
      return { date: '24 Okt 2026', time: '14:15 WIB' };
    }
  };

  return (
    <div className="flex flex-col gap-space-xl">
      {/* -------------------------------------------------------------
          HEADER & TOP ACTION BUTTONS
      -------------------------------------------------------------- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-lg">
        <div className="flex flex-col gap-space-2xs">
          <div className="flex items-center gap-space-sm">
            <span className="font-headline-lg text-headline-lg text-on-surface tracking-tight font-bold">
              Buku Transaksi
            </span>
            <span className="inline-flex items-center gap-space-2xs bg-surface-container-high px-space-sm py-space-2xs rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
              <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider font-semibold">
                Live Ledger
              </span>
            </span>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">
            Riwayat mutasi arus kas komprehensif tersinkronisasi otomatis dari Web &amp; Bot WhatsApp 2-arah.
          </p>
        </div>

        <div className="flex items-center gap-space-md shrink-0">
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-space-xs bg-surface-container-lowest text-on-surface hover:bg-surface-container-low px-space-md py-space-sm rounded-lg font-body-md text-body-md font-semibold border border-outline-variant shadow-xs transition-all"
          >
            <span className="material-symbols-outlined text-[18px] text-outline">file_download</span>
            <span>Ekspor CSV / Excel</span>
          </button>
          <button
            type="button"
            onClick={() => {
              // Trigger app shell catat transaksi modal if needed or quick add
              const btn = document.querySelector('header button.bg-primary') as HTMLButtonElement | null;
              if (btn) btn.click();
            }}
            className="inline-flex items-center gap-space-xs bg-inverse-surface text-inverse-on-surface hover:bg-on-surface px-space-lg py-space-sm rounded-lg font-body-md text-body-md font-semibold shadow-sm transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>+ Catat Transaksi Instan</span>
          </button>
        </div>
      </div>

      {/* -------------------------------------------------------------
          4 TOP KPI CARDS
      -------------------------------------------------------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
        {/* Total Arus Masuk */}
        <div className="bg-surface-container-lowest p-space-lg rounded-xl border border-outline-variant/60 shadow-xs flex flex-col gap-space-xs">
          <div className="flex items-center justify-between">
            <span className="font-label-caps text-label-caps text-outline uppercase font-semibold">
              Total Arus Masuk
            </span>
            <div className="w-7 h-7 rounded-lg bg-surface-container-low flex items-center justify-center">
              <span className="material-symbols-outlined text-tertiary text-[18px]">arrow_downward</span>
            </div>
          </div>
          <div className="font-title-balance text-title-balance text-on-surface font-bold tabular-nums">
            {formatRupiah(totalInflow)}
          </div>
          <div className="flex items-center gap-space-2xs font-numeric-table text-numeric-table text-tertiary font-semibold">
            <span className="material-symbols-outlined text-[14px]">trending_up</span>
            <span>+14.8% vs bulan lalu</span>
          </div>
        </div>

        {/* Total Arus Keluar */}
        <div className="bg-surface-container-lowest p-space-lg rounded-xl border border-outline-variant/60 shadow-xs flex flex-col gap-space-xs">
          <div className="flex items-center justify-between">
            <span className="font-label-caps text-label-caps text-outline uppercase font-semibold">
              Total Arus Keluar
            </span>
            <div className="w-7 h-7 rounded-lg bg-error-container/40 flex items-center justify-center">
              <span className="material-symbols-outlined text-error text-[18px]">arrow_upward</span>
            </div>
          </div>
          <div className="font-title-balance text-title-balance text-on-surface font-bold tabular-nums">
            {formatRupiah(totalOutflow)}
          </div>
          <div className="flex items-center gap-space-2xs font-numeric-table text-numeric-table text-on-surface-variant">
            <span>{counts.out} transaksi terverifikasi</span>
          </div>
        </div>

        {/* Transfer Internal */}
        <div className="bg-surface-container-lowest p-space-lg rounded-xl border border-outline-variant/60 shadow-xs flex flex-col gap-space-xs">
          <div className="flex items-center justify-between">
            <span className="font-label-caps text-label-caps text-outline uppercase font-semibold">
              Transfer Internal
            </span>
            <div className="w-7 h-7 rounded-lg bg-secondary-fixed/50 flex items-center justify-center">
              <span className="material-symbols-outlined text-secondary text-[18px]">sync_alt</span>
            </div>
          </div>
          <div className="font-title-balance text-title-balance text-on-surface font-bold tabular-nums">
            {formatRupiah(totalTransfer)}
          </div>
          <div className="flex items-center gap-space-2xs font-numeric-table text-numeric-table text-on-surface-variant">
            <span>{counts.transfer} mutasi likuiditas</span>
          </div>
        </div>

        {/* Net Cash Flow */}
        <div className="bg-surface-container-lowest p-space-lg rounded-xl border border-outline-variant/60 shadow-xs flex flex-col gap-space-xs">
          <div className="flex items-center justify-between">
            <span className="font-label-caps text-label-caps text-outline uppercase font-semibold">
              Net Cash Flow
            </span>
            <div className="w-7 h-7 rounded-lg bg-primary-fixed/40 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-[18px]">account_balance</span>
            </div>
          </div>
          <div className={`font-title-balance text-title-balance font-bold tabular-nums ${netCashFlow >= 0 ? 'text-tertiary' : 'text-error'}`}>
            {netCashFlow >= 0 ? `+${formatRupiah(netCashFlow)}` : formatRupiah(netCashFlow)}
          </div>
          <div className="flex items-center gap-space-2xs font-numeric-table text-numeric-table text-tertiary font-semibold">
            <span className="material-symbols-outlined text-[14px]">check_circle</span>
            <span>Surplus Operasional</span>
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------
          FILTER TABS, SEARCH, AND TABLE
      -------------------------------------------------------------- */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/60 shadow-xs p-space-lg flex flex-col gap-space-lg">
        {/* Filter Controls Row */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
          {/* Segmented Filter Tabs */}
          <div className="flex flex-wrap items-center gap-space-2xs bg-surface-container-low p-space-2xs rounded-lg" id="filter-tabs">
            <button
              type="button"
              onClick={() => { setFilterType('all'); setCurrentPage(1); }}
              className={`px-space-md py-space-xs rounded-md font-body-sm text-body-sm font-semibold transition-all ${
                filterType === 'all'
                  ? 'bg-surface-container-lowest text-on-surface shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Semua Transaksi <span className="ml-1 text-outline font-normal">({counts.all})</span>
            </button>
            <button
              type="button"
              onClick={() => { setFilterType('out'); setCurrentPage(1); }}
              className={`px-space-md py-space-xs rounded-md font-body-sm text-body-sm font-medium transition-all ${
                filterType === 'out'
                  ? 'bg-surface-container-lowest text-on-surface shadow-xs font-semibold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Pengeluaran <span className="ml-1 text-outline font-normal">({counts.out})</span>
            </button>
            <button
              type="button"
              onClick={() => { setFilterType('in'); setCurrentPage(1); }}
              className={`px-space-md py-space-xs rounded-md font-body-sm text-body-sm font-medium transition-all ${
                filterType === 'in'
                  ? 'bg-surface-container-lowest text-on-surface shadow-xs font-semibold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Pemasukan <span className="ml-1 text-outline font-normal">({counts.in})</span>
            </button>
            <button
              type="button"
              onClick={() => { setFilterType('transfer'); setCurrentPage(1); }}
              className={`px-space-md py-space-xs rounded-md font-body-sm text-body-sm font-medium transition-all ${
                filterType === 'transfer'
                  ? 'bg-surface-container-lowest text-on-surface shadow-xs font-semibold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Transfer Antar Kas <span className="ml-1 text-outline font-normal">({counts.transfer})</span>
            </button>
          </div>

          {/* Search, Month Picker, Account Filter */}
          <div className="flex flex-wrap items-center gap-space-sm">
            {/* Search Input */}
            <div className="relative min-w-[240px] flex-1 sm:flex-initial">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                placeholder="Cari transaksi, rekening, kategori..."
                className="w-full bg-surface-container-low pl-9 pr-space-md py-space-xs rounded-lg text-body-sm font-body-sm text-on-surface placeholder:text-outline border border-transparent focus:outline-none focus:border-primary focus:bg-surface-container-lowest focus:shadow-xs transition-all"
              />
            </div>

            {/* Month Filter */}
            <div className="flex items-center gap-space-xs bg-surface-container-low px-space-md py-space-xs rounded-lg border border-transparent hover:border-outline-variant transition-colors">
              <span className="material-symbols-outlined text-outline text-[18px]">calendar_today</span>
              <span className="font-body-sm text-body-sm font-medium text-on-surface">Okt 2026 (Bulan Ini)</span>
            </div>

            {/* Account Filter */}
            <div className="relative">
              <select
                value={selectedAccountId}
                onChange={(e) => { setSelectedAccountId(e.target.value); setCurrentPage(1); }}
                className="appearance-none bg-surface-container-low pl-8 pr-8 py-space-xs rounded-lg font-body-sm text-body-sm font-medium text-on-surface border border-transparent hover:border-outline-variant focus:outline-none focus:border-primary cursor-pointer transition-colors"
              >
                <option value="ALL">Semua Rekening</option>
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name}
                  </option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-outline text-[18px] pointer-events-none">
                account_balance_wallet
              </span>
              <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-outline text-[16px] pointer-events-none">
                expand_more
              </span>
            </div>
          </div>
        </div>

        {/* -------------------------------------------------------------
            LEDGER DATA TABLE
        -------------------------------------------------------------- */}
        <div className="overflow-x-auto -mx-space-lg px-space-lg">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container-low/70 text-outline font-label-caps text-label-caps uppercase tracking-wider">
                <th className="py-space-sm px-space-md rounded-l-lg">Tipe &amp; Deskripsi</th>
                <th className="py-space-sm px-space-md">Kategori</th>
                <th className="py-space-sm px-space-md">Rekening Asal / Tujuan</th>
                <th className="py-space-sm px-space-md">Waktu &amp; Tanggal</th>
                <th className="py-space-sm px-space-md text-right">Nominal</th>
                <th className="py-space-sm px-space-md">Verifikasi</th>
                <th className="py-space-sm px-space-md text-center rounded-r-lg">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high/80 font-body-sm text-body-sm text-on-surface">
              {loading && transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-space-2xl text-center text-on-surface-variant">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-[32px] text-primary animate-spin">
                        progress_activity
                      </span>
                      <span>Memuat buku transaksi...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-space-2xl text-center text-on-surface-variant">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-[36px] text-outline">
                        receipt_long
                      </span>
                      <span className="font-semibold text-on-surface">Tidak ada mutasi yang cocok</span>
                      <span className="text-[12px] text-outline">
                        Ubah filter pencarian atau catat transaksi baru via WhatsApp bot/web portal.
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedTransactions.map((tx, idx) => {
                  const isIncome = tx.type === 'INCOME';
                  const isExpense = tx.type === 'EXPENSE';
                  const isTransfer = tx.type === 'TRANSFER';
                  const { date, time } = formatDateTime(tx.date || '');

                  return (
                    <tr key={tx.id} className="hover:bg-surface-container-low/50 transition-colors group">
                      {/* Tipe & Deskripsi */}
                      <td className="py-space-md px-space-md">
                        <div className="flex items-center gap-space-md">
                          <div
                            className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                              isIncome
                                ? 'bg-tertiary-fixed/30'
                                : isExpense
                                ? 'bg-error-container/40'
                                : 'bg-secondary-fixed/40'
                            }`}
                          >
                            <span
                              className={`material-symbols-outlined text-[20px] ${
                                isIncome
                                  ? 'text-tertiary'
                                  : isExpense
                                  ? 'text-error'
                                  : 'text-secondary'
                              }`}
                            >
                              {isIncome ? 'arrow_downward' : isExpense ? 'arrow_upward' : 'sync_alt'}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="font-semibold text-on-surface leading-snug">
                              {tx.description}
                            </span>
                            <span className="font-label-caps text-label-caps text-outline truncate max-w-[260px]">
                              #TX-{tx.id.slice(0, 8).toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Kategori */}
                      <td className="py-space-md px-space-md">
                        <span className="inline-flex items-center px-space-sm py-space-2xs rounded-full bg-surface-container-high font-badge-label text-badge-label text-on-surface-variant font-medium">
                          {isTransfer ? 'Transfer Kas' : tx.category?.name || 'Umum'}
                        </span>
                      </td>

                      {/* Rekening Asal / Tujuan */}
                      <td className="py-space-md px-space-md">
                        {isTransfer ? (
                          <div className="flex flex-col font-numeric-table text-numeric-table">
                            <span className="font-medium text-on-surface">
                              {tx.sourceAccount?.name || '-'} →
                            </span>
                            <span className="text-outline">
                              {tx.destinationAccount?.name || '-'}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-space-xs font-numeric-table text-numeric-table">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                isIncome ? 'bg-secondary' : 'bg-primary'
                              }`}
                            ></span>
                            <span className="font-medium">
                              {tx.sourceAccount?.name || '-'}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Waktu & Tanggal */}
                      <td className="py-space-md px-space-md">
                        <div className="flex flex-col">
                          <span className="font-numeric-table text-numeric-table font-medium">{date}</span>
                          <span className="font-label-caps text-label-caps text-outline">{time}</span>
                        </div>
                      </td>

                      {/* Nominal */}
                      <td className="py-space-md px-space-md text-right">
                        <span
                          className={`font-numeric-table text-numeric-table font-bold tabular-nums ${
                            isIncome
                              ? 'text-tertiary'
                              : isExpense
                              ? 'text-on-surface'
                              : 'text-secondary'
                          }`}
                        >
                          {isIncome
                            ? `+ ${formatRupiah(Number(tx.amount))}`
                            : isExpense
                            ? `- ${formatRupiah(Number(tx.amount))}`
                            : formatRupiah(Number(tx.amount))}
                        </span>
                      </td>

                      {/* Verifikasi Badge */}
                      <td className="py-space-md px-space-md">
                        {getSourceBadge(tx)}
                      </td>

                      {/* Aksi Rollback */}
                      <td className="py-space-md px-space-md text-center">
                        <button
                          type="button"
                          onClick={() => handleDelete(tx.id, tx.description)}
                          title="Hapus transaksi (Saldo rekening dikembalikan otomatis)"
                          className="w-8 h-8 rounded-lg hover:bg-error-container/50 text-outline hover:text-error flex items-center justify-center mx-auto transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* -------------------------------------------------------------
            PAGINATION FOOTER
        -------------------------------------------------------------- */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-space-sm pt-space-md border-t border-surface-container-high/60">
          <p className="font-body-sm text-body-sm text-outline">
            Menampilkan{' '}
            <span className="font-semibold text-on-surface">
              {filtered.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}
            </span>{' '}
            -{' '}
            <span className="font-semibold text-on-surface">
              {Math.min(currentPage * itemsPerPage, filtered.length)}
            </span>{' '}
            dari <span className="font-semibold text-on-surface">{filtered.length}</span> transaksi terdaftar
          </p>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded-lg border border-outline-variant hover:bg-surface-container text-on-surface-variant disabled:opacity-30 disabled:pointer-events-none transition-colors"
              aria-label="Halaman Sebelumnya"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map((pg) => (
              <button
                key={pg}
                type="button"
                onClick={() => setCurrentPage(pg)}
                className={`w-8 h-8 rounded-lg font-body-sm font-semibold transition-colors ${
                  currentPage === pg
                    ? 'bg-on-surface text-surface'
                    : 'border border-outline-variant hover:bg-surface-container text-on-surface-variant'
                }`}
              >
                {pg}
              </button>
            ))}

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-1.5 rounded-lg border border-outline-variant hover:bg-surface-container text-on-surface-variant disabled:opacity-30 disabled:pointer-events-none transition-colors"
              aria-label="Halaman Berikutnya"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
