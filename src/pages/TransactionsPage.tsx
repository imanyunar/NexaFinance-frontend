import React, { useState } from 'react';
import { 
  Search, 
  Trash2, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ArrowLeftRight,
  Filter,
  Download
} from 'lucide-react';
import { useWorkspace, Transaction } from '../context/WorkspaceContext';

export const TransactionsPage: React.FC = () => {
  const { transactions, deleteTransaction, loading } = useWorkspace();
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const filtered = transactions.filter((tx) => {
    const matchesType = filterType === 'ALL' || tx.type === filterType;
    const matchesSearch =
      tx.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.sourceAccount?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.category?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const handleDelete = async (id: string, desc: string) => {
    if (confirm(`Hapus transaksi "${desc}"?`)) {
      await deleteTransaction(id);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, margin: 0 }}>Buku Transaksi</h1>
          <p style={{ color: '#64748b', fontSize: '14px', margin: '4px 0 0' }}>
            Seluruh mutasi keuangan dari WhatsApp dan web portal
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: '6px' }}>
            {[
              { id: 'ALL', label: 'Semua' },
              { id: 'EXPENSE', label: 'Pengeluaran' },
              { id: 'INCOME', label: 'Pemasukan' },
              { id: 'TRANSFER', label: 'Transfer' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id)}
                style={{
                  padding: '7px 14px',
                  borderRadius: '8px',
                  border: '1px solid',
                  borderColor: filterType === tab.id ? '#187aba' : '#e2e8f0',
                  background: filterType === tab.id ? '#187aba' : '#ffffff',
                  color: filterType === tab.id ? '#ffffff' : '#475569',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div style={{ position: 'relative', width: '280px' }}>
            <Search
              size={15}
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
            />
            <input
              type="text"
              placeholder="Cari transaksi / rekening..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '34px', fontSize: '13.5px' }}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Tipe</th>
                <th>Tanggal</th>
                <th>Deskripsi</th>
                <th>Rekening</th>
                <th>Kategori</th>
                <th style={{ textAlign: 'right' }}>Nominal</th>
                <th style={{ width: '60px', textAlign: 'center' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                    Tidak ada transaksi yang cocok.
                  </td>
                </tr>
              ) : (
                filtered.map((tx) => {
                  const isExpense = tx.type === 'EXPENSE';
                  const isIncome = tx.type === 'INCOME';
                  return (
                    <tr key={tx.id}>
                      <td>
                        <span
                          className={`badge ${
                            isExpense ? 'badge-red' : isIncome ? 'badge-green' : 'badge-blue'
                          }`}
                        >
                          {isExpense ? 'Pengeluaran' : isIncome ? 'Pemasukan' : 'Transfer'}
                        </span>
                      </td>
                      <td style={{ color: '#64748b', fontSize: '13px', whiteSpace: 'nowrap' }}>
                        {new Date(tx.date).toLocaleDateString('id-ID', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td style={{ fontWeight: 600, color: '#0f172a' }}>{tx.description}</td>
                      <td style={{ color: '#475569', fontSize: '13.5px' }}>
                        {tx.sourceAccount?.name || 'Rekening'}
                      </td>
                      <td>
                        <span style={{ fontSize: '12.5px', color: '#64748b' }}>
                          {tx.category?.name || 'Umum'}
                        </span>
                      </td>
                      <td
                        style={{
                          textAlign: 'right',
                          fontWeight: 700,
                          fontSize: '14.5px',
                          color: isExpense ? '#c62234' : isIncome ? '#10874e' : '#187aba',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {isExpense ? '-' : isIncome ? '+' : ''} {formatRupiah(tx.amount)}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          onClick={() => handleDelete(tx.id, tx.description)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#94a3b8',
                            cursor: 'pointer',
                            padding: '4px',
                            borderRadius: '4px',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = '#c62234')}
                          onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
                          title="Hapus Transaksi"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
