import React from 'react';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ArrowLeftRight, 
  Building2, 
  ShieldCheck, 
  Smartphone, 
  MessageSquare,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';

export const DashboardPage: React.FC = () => {
  const { totalBalance, accounts, transactions, loading, activeWorkspace } = useWorkspace();

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

  const netSavings = totalIncome - totalExpense;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Top Banner / Welcome Bar */}
      <div
        style={{
          background: 'linear-gradient(135deg, #002244 0%, #003366 100%)',
          borderRadius: '16px',
          padding: '24px 28px',
          color: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 8px 24px rgba(0, 34, 68, 0.12)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span
              style={{
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                fontWeight: 700,
                color: '#38bdf8',
                background: 'rgba(56, 189, 248, 0.15)',
                padding: '3px 8px',
                borderRadius: '6px',
              }}
            >
              Institutional Overview
            </span>
            <span style={{ fontSize: '13px', color: '#cbd5e1' }}>• Real-time Production</span>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#ffffff', margin: 0, letterSpacing: '-0.4px' }}>
            Portofolio Kas {activeWorkspace?.name || 'Iman Azizi'}
          </h1>
          <p style={{ margin: '6px 0 0', color: '#94a3b8', fontSize: '14px' }}>
            Terintegrasi langsung ke WhatsApp Bot (085172247452) & Neon Serverless PostgreSQL.
          </p>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Total Likuiditas Bersih
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.5px' }}>
            {formatRupiah(totalBalance)}
          </div>
        </div>
      </div>

      {/* 4 Financial KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '18px' }}>
        {/* KPI 1 */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <div>
              <div style={{ fontSize: '12.5px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                Total Saldo Kas
              </div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#002244', marginTop: '6px' }}>
                {formatRupiah(totalBalance)}
              </div>
            </div>
            <div style={{ width: '40px', height: '40px', background: 'rgba(24, 122, 186, 0.1)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#187aba' }}>
              <Wallet size={20} />
            </div>
          </div>
          <div style={{ fontSize: '12px', color: '#10874e', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
            <ShieldCheck size={14} /> Tersebar di {accounts.length} rekening & dompet
          </div>
        </div>

        {/* KPI 2 */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <div>
              <div style={{ fontSize: '12.5px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                Total Pemasukan
              </div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#10874e', marginTop: '6px' }}>
                {formatRupiah(totalIncome)}
              </div>
            </div>
            <div style={{ width: '40px', height: '40px', background: 'rgba(16, 135, 78, 0.1)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10874e' }}>
              <TrendingUp size={20} />
            </div>
          </div>
          <div style={{ fontSize: '12px', color: '#64748b' }}>
            Arus kas masuk bulan berjalan
          </div>
        </div>

        {/* KPI 3 */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <div>
              <div style={{ fontSize: '12.5px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                Total Pengeluaran
              </div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#c62234', marginTop: '6px' }}>
                {formatRupiah(totalExpense)}
              </div>
            </div>
            <div style={{ width: '40px', height: '40px', background: 'rgba(198, 34, 52, 0.1)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c62234' }}>
              <TrendingDown size={20} />
            </div>
          </div>
          <div style={{ fontSize: '12px', color: '#64748b' }}>
            Tercatat dari web & chat WhatsApp
          </div>
        </div>

        {/* KPI 4 */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <div>
              <div style={{ fontSize: '12.5px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                Net Arus Kas
              </div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: netSavings >= 0 ? '#10874e' : '#c62234', marginTop: '6px' }}>
                {formatRupiah(netSavings)}
              </div>
            </div>
            <div style={{ width: '40px', height: '40px', background: 'rgba(0, 34, 68, 0.08)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#002244' }}>
              <Building2 size={20} />
            </div>
          </div>
          <div style={{ fontSize: '12px', color: '#64748b' }}>
            Selisih surplus / defisit berjalan
          </div>
        </div>
      </div>

      {/* Main Grid: Accounts List & WhatsApp Bot Integration */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
        {/* Accounts Breakdown */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <h2 style={{ fontSize: '17px', fontWeight: 700, margin: 0 }}>Rekening & Saldo Kas</h2>
            <span style={{ fontSize: '12px', color: '#64748b' }}>{accounts.length} Akun Terdaftar</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {accounts.map((acc) => (
              <div
                key={acc.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  background: '#f8fafd',
                  border: '1px solid #edf2f7',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: acc.color || '#187aba',
                    }}
                  />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '14px', color: '#0f172a' }}>{acc.name}</div>
                    <div style={{ fontSize: '11.5px', color: '#64748b', textTransform: 'capitalize' }}>
                      {acc.type.toLowerCase()}
                    </div>
                  </div>
                </div>
                <div style={{ fontWeight: 700, fontSize: '15px', color: '#002244' }}>
                  {formatRupiah(acc.balance)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* WhatsApp Assistant Card */}
        <div
          className="card"
          style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)',
            borderColor: 'rgba(16, 185, 129, 0.25)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <div style={{ width: '36px', height: '36px', background: '#10b981', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <Smartphone size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '17px', fontWeight: 700, margin: 0, color: '#065f46' }}>
                WhatsApp Assistant Bot
              </h2>
              <div style={{ fontSize: '12px', color: '#047857' }}>
                Bot: <strong>085172247452</strong> • User: <strong>087873861108</strong>
              </div>
            </div>
          </div>

          <p style={{ fontSize: '13px', color: '#334155', lineHeight: 1.5, marginBottom: '14px' }}>
            Ketik pesan di WhatsApp Anda untuk mencatat transaksi tanpa perlu membuka web:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ background: '#ffffff', padding: '9px 12px', borderRadius: '8px', border: '1px solid #d1fae5', fontSize: '13px' }}>
              <span style={{ color: '#047857', fontWeight: 700 }}>💬 Cek Saldo: </span>
              <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>saldo</code>
            </div>
            <div style={{ background: '#ffffff', padding: '9px 12px', borderRadius: '8px', border: '1px solid #d1fae5', fontSize: '13px' }}>
              <span style={{ color: '#047857', fontWeight: 700 }}>💬 Catat Pengeluaran: </span>
              <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>Makan soto 35rb bayar bca</code>
            </div>
            <div style={{ background: '#ffffff', padding: '9px 12px', borderRadius: '8px', border: '1px solid #d1fae5', fontSize: '13px' }}>
              <span style={{ color: '#047857', fontWeight: 700 }}>💬 Catat Pemasukan: </span>
              <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>Terima bonus freelance 500rb ke bca</code>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '16px', fontSize: '12px', color: '#059669', fontWeight: 600 }}>
            <CheckCircle2 size={15} /> Otomatis sinkron langsung ke dashboard ini
          </div>
        </div>
      </div>

      {/* Recent Transactions List */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div>
            <h2 style={{ fontSize: '17px', fontWeight: 700, margin: 0 }}>Histori Transaksi Terakhir</h2>
            <div style={{ fontSize: '12px', color: '#64748b' }}>Data mutasi akun terkini</div>
          </div>
        </div>

        {transactions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
            Belum ada transaksi tercatat.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {transactions.slice(0, 10).map((tx) => {
              const isExpense = tx.type === 'EXPENSE';
              const isIncome = tx.type === 'INCOME';
              return (
                <div
                  key={tx.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    background: '#ffffff',
                    border: '1px solid #f1f5f9',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '9px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: isExpense
                          ? 'rgba(198, 34, 52, 0.08)'
                          : isIncome
                          ? 'rgba(16, 135, 78, 0.08)'
                          : 'rgba(24, 122, 186, 0.08)',
                        color: isExpense ? '#c62234' : isIncome ? '#10874e' : '#187aba',
                      }}
                    >
                      {isExpense && <ArrowUpRight size={18} />}
                      {isIncome && <ArrowDownLeft size={18} />}
                      {!isExpense && !isIncome && <ArrowLeftRight size={18} />}
                    </div>

                    <div>
                      <div style={{ fontWeight: 600, fontSize: '14.5px', color: '#0f172a' }}>{tx.description}</div>
                      <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', gap: '8px' }}>
                        <span>{new Date(tx.date).toLocaleDateString('id-ID', { dateStyle: 'medium' })}</span>
                        <span>•</span>
                        <span>{tx.sourceAccount?.name || 'Rekening'}</span>
                        {tx.category && (
                          <>
                            <span>•</span>
                            <span style={{ color: '#187aba' }}>{tx.category.name}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: '15px',
                      color: isExpense ? '#c62234' : isIncome ? '#10874e' : '#187aba',
                    }}
                  >
                    {isExpense ? '-' : isIncome ? '+' : ''} {formatRupiah(tx.amount)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
