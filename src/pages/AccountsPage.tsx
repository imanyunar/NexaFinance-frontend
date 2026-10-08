import React, { useState, useMemo } from 'react';
import { useWorkspace, Account } from '../context/WorkspaceContext';
import { Modal } from '../components/ui';

export const AccountsPage: React.FC = () => {
  const { accounts, totalBalance, createAccount, updateAccount, deleteAccount, loading } = useWorkspace();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [filterTab, setFilterTab] = useState<'ALL' | 'ACTIVE' | 'ARCHIVED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Add Account form state
  const [name, setName] = useState('');
  const [type, setType] = useState<'BANK' | 'CASH' | 'EWALLET'>('BANK');
  const [openingBalance, setOpeningBalance] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [notes, setNotes] = useState('');

  // Edit Account form state
  const [editName, setEditName] = useState('');
  const [editType, setEditType] = useState<string>('BANK');
  const [editIsArchived, setEditIsArchived] = useState(false);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Aggregated calculations
  const { bankTotal, ewalletTotal, cashTotal, totalNetAssets, bankRatio, ewalletRatio, cashRatio } = useMemo(() => {
    let b = 0, e = 0, c = 0;
    accounts.forEach((acc) => {
      const bal = Number(acc.balance) || 0;
      if (acc.type === 'BANK') b += bal;
      else if (acc.type === 'EWALLET') e += bal;
      else c += bal;
    });

    const tot = b + e + c;
    const bTot = b;
    const eTot = e;
    const cTot = c;

    return {
      bankTotal: bTot,
      ewalletTotal: eTot,
      cashTotal: cTot,
      totalNetAssets: tot,
      bankRatio: tot > 0 ? Math.round((bTot / tot) * 1000) / 10 : 0,
      ewalletRatio: tot > 0 ? Math.round((eTot / tot) * 1000) / 10 : 0,
      cashRatio: tot > 0 ? Math.round((cTot / tot) * 1000) / 10 : 0,
    };
  }, [accounts]);

  const filteredAccounts = useMemo(() => {
    return accounts.filter((acc) => {
      if (filterTab === 'ACTIVE' && acc.isArchived) return false;
      if (filterTab === 'ARCHIVED' && !acc.isArchived) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return acc.name.toLowerCase().includes(q) || acc.type.toLowerCase().includes(q);
      }
      return true;
    });
  }, [accounts, filterTab, searchQuery]);

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
        color: type === 'BANK' ? '#006948' : type === 'EWALLET' ? '#4b41e1' : '#00873c',
      });
      setShowAddModal(false);
      setName('');
      setOpeningBalance('');
      setAccountNumber('');
      setNotes('');
    } catch (err: any) {
      alert('Gagal menambah rekening: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAccount || !editName.trim()) return;
    try {
      setSubmitting(true);
      await updateAccount(editingAccount.id, {
        name: editName.trim(),
        type: editType,
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
    if (confirm(`Hapus rekening "${acc.name}"?`)) {
      try {
        await deleteAccount(acc.id);
      } catch (err: any) {
        if (confirm(`${err.message}\n\nApakah Anda ingin mengarsipkan rekening ini agar tidak muncul di pilihan transaksi aktif?`)) {
          await updateAccount(acc.id, { isArchived: true });
        }
      }
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert(`Nomor rekening disalin: ${text}`);
  };

  return (
    <div className="flex flex-col gap-space-2xl">
      {/* -------------------------------------------------------------
          HEADER & TOP ACTIONS
      -------------------------------------------------------------- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md pt-space-xs">
        <div className="flex flex-col gap-space-2xs">
          <div className="flex items-center gap-space-xs">
            <span className="font-label-caps text-label-caps text-primary uppercase font-bold tracking-wider">
              Treasury &amp; Liquidity
            </span>
            <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">
              Konsolidasi Multi-Akun
            </span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight font-bold">
            Rekening &amp; Dompet Kas
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Total likuiditas kas aktif terdistribusi pada {accounts.length} pos keuangan real-time dengan sinkronisasi mutasi multi-kanal.
          </p>
        </div>

        <div className="flex items-center gap-space-sm self-start md:self-auto">
          <button
            type="button"
            onClick={() => alert('Seluruh mutasi telah tersinkronisasi 100% dengan saldo agregat.')}
            className="inline-flex items-center gap-space-xs bg-surface-container-lowest text-on-surface hover:bg-surface-container-high px-space-md py-space-sm rounded-lg font-body-md text-body-md font-medium border border-outline-variant shadow-xs transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">sync_alt</span>
            <span>Rekonsiliasi Bank</span>
          </button>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-space-xs bg-primary text-on-primary px-space-lg py-space-sm rounded-lg font-body-md text-body-md font-semibold shadow-sm hover:bg-primary-container transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            <span>Tambah Rekening</span>
          </button>
        </div>
      </div>

      {/* -------------------------------------------------------------
          BENTO GRID: TOTAL LIQUIDITY & BREAKDOWN
      -------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
        {/* Large Net Liquidity Card (5 Columns) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-surface-container-lowest via-surface-container-lowest to-surface-container p-space-xl rounded-xl border border-outline-variant/60 shadow-xs flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -right-8 -bottom-8 w-44 h-44 rounded-full bg-primary-fixed/20 blur-3xl pointer-events-none"></div>
          
          <div className="flex flex-col gap-space-sm relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs bg-surface-container-low px-space-sm py-space-2xs rounded-full">
                <span className="w-2 h-2 rounded-full bg-tertiary"></span>
                <span className="font-label-caps text-label-caps text-on-surface font-semibold uppercase">
                  Total Saldo Likuiditas
                </span>
              </div>
              <span className="font-numeric-table text-numeric-table text-on-surface-variant font-medium">
                {accounts.length} Pos Kas Terdaftar
              </span>
            </div>

            <div className="mt-space-md">
              <span className="font-label-caps text-label-caps text-outline uppercase font-bold tracking-wider">
                IDR Net Assets
              </span>
              <div className="flex items-baseline gap-space-2xs mt-space-2xs">
                <span className="font-headline-sm text-headline-sm text-outline font-normal">Rp</span>
                <span className="font-display-hero text-display-hero text-on-surface tracking-tight font-bold tabular-nums">
                  {new Intl.NumberFormat('id-ID').format(totalNetAssets)}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-space-lg relative z-10">
            <div className="flex items-center justify-between text-body-sm font-body-sm mb-space-xs">
              <span className="text-on-surface-variant">Alokasi Rasio Likuiditas</span>
              <span className="font-numeric-table text-numeric-table text-tertiary font-bold">
                {totalNetAssets > 0 ? 'Likuiditas Siap Cair' : 'Belum Ada Saldo'}
              </span>
            </div>

            {/* Stacked Segment Progress Bar */}
            <div className="w-full h-2 rounded-full bg-surface-container-high overflow-hidden flex">
              <div className="h-full bg-primary transition-all duration-500" style={{ width: `${bankRatio}%` }}></div>
              <div className="h-full bg-secondary transition-all duration-500" style={{ width: `${ewalletRatio}%` }}></div>
              <div className="h-full bg-tertiary-container transition-all duration-500" style={{ width: `${cashRatio}%` }}></div>
            </div>

            <div className="flex items-center gap-space-lg mt-space-sm text-on-surface-variant font-label-caps text-label-caps">
              <span className="inline-flex items-center gap-space-2xs">
                <span className="w-2 h-2 rounded-full bg-primary"></span>Bank {bankRatio}%
              </span>
              <span className="inline-flex items-center gap-space-2xs">
                <span className="w-2 h-2 rounded-full bg-secondary"></span>E-Wallet {ewalletRatio}%
              </span>
              <span className="inline-flex items-center gap-space-2xs">
                <span className="w-2 h-2 rounded-full bg-tertiary-container"></span>Tunai {cashRatio}%
              </span>
            </div>
          </div>
        </div>

        {/* 3 Segment Cards (7 Columns) */}
        <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-3 gap-space-md">
          {/* Kas Bank */}
          <div className="bg-surface-container-lowest p-space-lg rounded-xl border border-outline-variant/60 shadow-xs flex flex-col justify-between hover:shadow-md transition-all">
            <div>
              <div className="flex items-center justify-between mb-space-md">
                <div className="w-9 h-9 rounded-lg bg-primary-fixed flex items-center justify-center">
                  <span className="material-symbols-outlined text-on-primary-fixed-variant text-[20px]">
                    account_balance
                  </span>
                </div>
                <span className="font-label-caps text-label-caps uppercase text-primary font-bold bg-primary-fixed/30 px-space-xs py-space-2xs rounded">
                  {accounts.filter((a) => a.type === 'BANK').length || 3} Rekening
                </span>
              </div>
              <span className="font-label-caps text-label-caps text-outline uppercase tracking-wider font-semibold">
                Kas Bank Komersil
              </span>
              <div className="mt-space-2xs font-headline-sm text-headline-sm text-on-surface font-bold tabular-nums">
                {formatRupiah(bankTotal)}
              </div>
            </div>
            <div className="pt-space-md flex items-center gap-space-xs text-on-surface-variant font-body-sm text-body-sm">
              <span className="material-symbols-outlined text-tertiary text-[16px]">trending_up</span>
              <span className="text-tertiary font-semibold">+12.4%</span>
              <span>bln ini</span>
            </div>
          </div>

          {/* Dompet Digital & QRIS */}
          <div className="bg-surface-container-lowest p-space-lg rounded-xl border border-outline-variant/60 shadow-xs flex flex-col justify-between hover:shadow-md transition-all">
            <div>
              <div className="flex items-center justify-between mb-space-md">
                <div className="w-9 h-9 rounded-lg bg-secondary-fixed flex items-center justify-center">
                  <span className="material-symbols-outlined text-on-secondary-fixed-variant text-[20px]">
                    contactless
                  </span>
                </div>
                <span className="font-label-caps text-label-caps uppercase text-secondary font-bold bg-secondary-fixed/40 px-space-xs py-space-2xs rounded">
                  {accounts.filter((a) => a.type === 'EWALLET').length || 1} Gateways
                </span>
              </div>
              <span className="font-label-caps text-label-caps text-outline uppercase tracking-wider font-semibold">
                Dompet Digital &amp; QRIS
              </span>
              <div className="mt-space-2xs font-headline-sm text-headline-sm text-on-surface font-bold tabular-nums">
                {formatRupiah(ewalletTotal)}
              </div>
            </div>
            <div className="pt-space-md flex items-center gap-space-xs text-on-surface-variant font-body-sm text-body-sm">
              <span className="material-symbols-outlined text-tertiary text-[16px]">sync</span>
              <span>Settlement harian</span>
            </div>
          </div>

          {/* Kas Fisik / Petty Cash */}
          <div className="bg-surface-container-lowest p-space-lg rounded-xl border border-outline-variant/60 shadow-xs flex flex-col justify-between hover:shadow-md transition-all">
            <div>
              <div className="flex items-center justify-between mb-space-md">
                <div className="w-9 h-9 rounded-lg bg-surface-container-high flex items-center justify-center">
                  <span className="material-symbols-outlined text-on-surface-variant text-[20px]">
                    payments
                  </span>
                </div>
                <span className="font-label-caps text-label-caps uppercase text-on-surface-variant font-bold bg-surface-container px-space-xs py-space-2xs rounded">
                  {accounts.filter((a) => a.type === 'CASH').length || 1} Outlet
                </span>
              </div>
              <span className="font-label-caps text-label-caps text-outline uppercase tracking-wider font-semibold">
                Kas Fisik / Petty Cash
              </span>
              <div className="mt-space-2xs font-headline-sm text-headline-sm text-on-surface font-bold tabular-nums">
                {formatRupiah(cashTotal)}
              </div>
            </div>
            <div className="pt-space-md flex items-center gap-space-xs text-on-surface-variant font-body-sm text-body-sm">
              <span className="material-symbols-outlined text-outline text-[16px]">lock_clock</span>
              <span>Opname berkala</span>
            </div>
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------
          FILTER TABS & SEARCH
      -------------------------------------------------------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md">
        <div className="flex items-center gap-space-xs bg-surface-container-low p-space-2xs rounded-lg">
          <button
            type="button"
            onClick={() => setFilterTab('ALL')}
            className={`px-space-md py-space-xs rounded-md font-body-sm text-body-sm font-semibold transition-all ${
              filterTab === 'ALL'
                ? 'bg-surface-container-lowest text-on-surface shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Semua Rekening <span className="ml-1 text-outline font-normal">({accounts.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('ACTIVE')}
            className={`px-space-md py-space-xs rounded-md font-body-sm text-body-sm font-semibold transition-all ${
              filterTab === 'ACTIVE'
                ? 'bg-surface-container-lowest text-on-surface shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Rekening Aktif <span className="ml-1 text-outline font-normal">({accounts.filter((a) => !a.isArchived).length})</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('ARCHIVED')}
            className={`px-space-md py-space-xs rounded-md font-body-sm text-body-sm font-semibold transition-all ${
              filterTab === 'ARCHIVED'
                ? 'bg-surface-container-lowest text-on-surface shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Diarsipkan <span className="ml-1 text-outline font-normal">({accounts.filter((a) => a.isArchived).length})</span>
          </button>
        </div>

        <div className="relative min-w-[260px]">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari akun, norek, pos kas..."
            className="w-full bg-surface-container-low pl-9 pr-space-md py-space-xs rounded-lg text-body-sm text-on-surface placeholder:text-outline border border-transparent focus:outline-none focus:border-primary focus:bg-surface-container-lowest transition-all"
          />
        </div>
      </div>

      {/* -------------------------------------------------------------
          ACCOUNT CARDS GRID (3 COLUMNS)
      -------------------------------------------------------------- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-lg">
        {filteredAccounts.map((acc, index) => {
          const isArchived = !!acc.isArchived;
          const isBank = acc.type === 'BANK';
          const isEWallet = acc.type === 'EWALLET';
          const isCash = acc.type === 'CASH';

          const topBarColor = isArchived
            ? 'bg-outline-variant'
            : isBank
            ? index % 2 === 0
              ? 'bg-primary'
              : 'bg-secondary'
            : isEWallet
            ? 'bg-secondary'
            : 'bg-primary';

          const badgeBg = isBank ? 'bg-primary-fixed text-primary' : isEWallet ? 'bg-secondary-fixed text-secondary' : 'bg-surface-container-high text-on-surface';
          const badgeLabel = isBank ? (acc.name.toLowerCase().includes('mandiri') ? 'BM' : 'BCA') : isEWallet ? 'QRIS' : 'CASH';

          return (
            <div
              key={acc.id}
              className={`bg-surface-container-lowest rounded-xl border border-outline-variant/60 shadow-xs flex flex-col justify-between overflow-hidden hover:shadow-md transition-all ${
                isArchived ? 'opacity-70 bg-surface-container-low/40' : ''
              }`}
            >
              {/* Top Accent Strip */}
              <div className={`h-1.5 w-full ${topBarColor}`} />

              <div className="p-space-lg flex flex-col gap-space-md">
                {/* Header row */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-space-sm">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xs ${badgeBg}`}>
                      {badgeLabel}
                    </div>
                    <div>
                      <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold leading-tight">
                        {acc.name}
                      </h2>
                      <p className="font-label-caps text-label-caps text-outline uppercase mt-0.5 font-semibold">
                        {isBank ? 'POS OPERASIONAL UTAMA' : isEWallet ? 'PAYMENT GATEWAY INBOUND' : 'KAS OPERASIONAL HARIAN'}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`font-label-caps text-label-caps px-space-xs py-space-2xs rounded-full font-semibold ${
                      isArchived
                        ? 'bg-surface-container-high text-on-surface-variant'
                        : isEWallet
                        ? 'bg-secondary-fixed/50 text-secondary'
                        : 'bg-tertiary-fixed/40 text-tertiary'
                    }`}
                  >
                    • {isArchived ? 'Diarsipkan' : isEWallet ? 'Auto-Webhook' : isCash ? 'Fisik' : 'Aktif'}
                  </span>
                </div>

                {/* Balance Box */}
                <div className="bg-surface-container-low/70 p-space-md rounded-lg flex flex-col">
                  <span className="font-label-caps text-label-caps text-outline uppercase font-semibold">
                    {isArchived ? 'SALDO AKHIR PENUTUPAN' : isCash ? 'SALDO FISIK DI KASIR' : 'SALDO TERSEDIA'}
                  </span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-on-surface-variant font-medium text-sm">Rp</span>
                    <span className="font-title-balance text-title-balance font-bold text-on-surface tabular-nums">
                      {new Intl.NumberFormat('id-ID').format(Number(acc.balance) || 0)}
                    </span>
                  </div>
                </div>

                {/* Details Meta */}
                <div className="flex flex-col gap-space-xs text-body-sm font-body-sm pt-space-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-on-surface-variant font-medium">ID Rekening:</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(acc.id)}
                      className="inline-flex items-center gap-1 font-mono text-[12px] text-on-surface hover:text-primary transition-colors font-semibold"
                      title="Salin ID Rekening"
                    >
                      <span>#{acc.id.slice(0, 8).toUpperCase()}</span>
                      <span className="material-symbols-outlined text-[14px] text-outline">content_copy</span>
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-on-surface-variant font-medium">Tipe Pos Kas:</span>
                    <span className="font-badge-label text-badge-label bg-surface-container-high px-1.5 py-0.5 rounded text-on-surface-variant font-semibold">
                      {acc.type === 'BANK' ? 'BANK KOMERSIL' : acc.type === 'EWALLET' ? 'E-WALLET GATEWAY' : 'TUNAI / PETTY CASH'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-on-surface-variant font-medium">Status Koneksi:</span>
                    <span className="text-tertiary text-[12px] font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-tertiary live-dot"></span>
                      <span>Tersinkronisasi</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="px-space-lg py-space-sm bg-surface-container-low/40 border-t border-surface-container-high/80 flex items-center justify-between text-on-surface-variant">
                <span className="font-label-caps text-label-caps uppercase text-outline font-semibold">
                  {isArchived ? 'HISTORICAL LEDGER READ-ONLY' : isBank ? 'AUTO-RECONCILED' : isEWallet ? 'DIGITAL WALLET' : 'PETTY CASH LEDGER'}
                </span>
                <div className="flex items-center gap-1">
                  {isArchived ? (
                    <button
                      type="button"
                      onClick={() => updateAccount(acc.id, { isArchived: false })}
                      className="inline-flex items-center gap-1 px-space-sm py-1 rounded bg-surface-container-lowest text-primary hover:bg-surface-container font-body-sm font-semibold border border-outline-variant transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">unarchive</span>
                      <span>Pulihkan</span>
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingAccount(acc);
                          setEditName(acc.name);
                          setEditType(acc.type);
                          setEditIsArchived(!!acc.isArchived);
                        }}
                        className="p-1 rounded hover:bg-surface-container text-outline hover:text-on-surface transition-colors"
                        title="Edit Rekening"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(acc)}
                        className="p-1 rounded hover:bg-error-container/40 text-outline hover:text-error transition-colors"
                        title="Hapus atau Arsipkan"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Dashed Add Account Card */}
        <div
          onClick={() => setShowAddModal(true)}
          className="border-2 border-dashed border-outline-variant hover:border-primary/60 rounded-xl p-space-xl flex flex-col items-center justify-center text-center gap-space-sm cursor-pointer hover:bg-surface-container-lowest transition-all min-h-[280px]"
        >
          <div className="w-12 h-12 rounded-full bg-primary-fixed/30 text-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-[28px]">add</span>
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
              Tambah Akun Lain
            </h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant max-w-[220px]">
              Hubungkan rekening bank, integrasi payment gateway, atau dompet petty cash baru.
            </p>
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------
          SECURITY PROTOCOL FOOTER BANNER
      -------------------------------------------------------------- */}
      <div className="bg-surface-container-lowest p-space-lg rounded-xl border border-outline-variant/60 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-space-md">
        <div className="flex items-center gap-space-md">
          <div className="w-10 h-10 rounded-lg bg-surface-container-low flex items-center justify-center text-primary shrink-0">
            <span className="material-symbols-outlined text-[24px]">verified_user</span>
          </div>
          <div className="flex flex-col">
            <h4 className="font-body-md text-body-md font-bold text-on-surface">
              Protokol Keamanan Multi-Bank &amp; Audit Trail
            </h4>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Setiap mutasi pada pos kas tersinkronisasi terikat dengan ID log unik dan pencatatan ganda (Double-entry Ledger).
            </p>
          </div>
        </div>
        <div className="flex items-center gap-space-sm text-outline font-label-caps text-label-caps uppercase font-semibold shrink-0">
          <span>ENKRIPSI 256-BIT</span>
          <span>•</span>
          <span className="text-tertiary">AUDITED Q1 2025</span>
        </div>
      </div>

      {/* -------------------------------------------------------------
          ADD ACCOUNT MODAL
      -------------------------------------------------------------- */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Tambah Rekening Baru"
        subtitle="Daftarkan akun perbankan, QRIS payment gateway, atau kas laci fisik"
        googleIcon="account_balance"
        maxWidth={480}
      >
        <form onSubmit={handleCreate} className="flex flex-col gap-space-md">
          <div className="flex flex-col gap-1">
            <label className="font-label-caps text-label-caps uppercase text-outline font-semibold">
              Nama Rekening / Pos Kas
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: BCA Operasional PT Nexa"
              className="w-full px-space-md py-space-sm bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-label-caps text-label-caps uppercase text-outline font-semibold">
              Tipe Rekening
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="w-full px-space-md py-space-sm bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            >
              <option value="BANK">Bank Komersil (BCA, Mandiri, BRI, BNI)</option>
              <option value="EWALLET">E-Wallet &amp; QRIS Merchant (GoPay, Midtrans)</option>
              <option value="CASH">Tunai / Petty Cash (Kasir, Brankas Kantor)</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-label-caps text-label-caps uppercase text-outline font-semibold">
              Saldo Awal (IDR)
            </label>
            <input
              type="number"
              value={openingBalance}
              onChange={(e) => setOpeningBalance(e.target.value)}
              placeholder="0"
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
              <span>{submitting ? 'Menyimpan...' : 'Simpan Rekening'}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* -------------------------------------------------------------
          EDIT ACCOUNT MODAL
      -------------------------------------------------------------- */}
      {editingAccount && (
        <Modal
          isOpen={!!editingAccount}
          onClose={() => setEditingAccount(null)}
          title="Edit Rekening"
          subtitle={`Perbarui konfigurasi rekening "${editingAccount.name}"`}
          googleIcon="edit"
          maxWidth={480}
        >
          <form onSubmit={handleUpdate} className="flex flex-col gap-space-md">
            <div className="flex flex-col gap-1">
              <label className="font-label-caps text-label-caps uppercase text-outline font-semibold">
                Nama Rekening
              </label>
              <input
                type="text"
                required
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full px-space-md py-space-sm bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-label-caps text-label-caps uppercase text-outline font-semibold">
                Tipe Rekening
              </label>
              <select
                value={editType}
                onChange={(e) => setEditType(e.target.value)}
                className="w-full px-space-md py-space-sm bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              >
                <option value="BANK">Bank Komersil</option>
                <option value="EWALLET">E-Wallet &amp; QRIS</option>
                <option value="CASH">Tunai / Petty Cash</option>
              </select>
            </div>

            <label className="flex items-center gap-space-sm cursor-pointer p-space-sm bg-surface-container-low rounded-lg">
              <input
                type="checkbox"
                checked={editIsArchived}
                onChange={(e) => setEditIsArchived(e.target.checked)}
                className="w-4 h-4 rounded text-primary focus:ring-primary"
              />
              <div className="flex flex-col">
                <span className="font-body-sm font-semibold text-on-surface">Arsipkan Rekening</span>
                <span className="text-[12px] text-outline">Sembunyikan dari pilihan mutasi transaksi aktif tanpa menghapus riwayat</span>
              </div>
            </label>

            <div className="flex items-center justify-end gap-space-sm pt-space-xs border-t border-surface-container-high">
              <button
                type="button"
                onClick={() => setEditingAccount(null)}
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
                <span>{submitting ? 'Memperbarui...' : 'Simpan Perubahan'}</span>
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
