import React, { useState } from 'react';
import { useWorkspace, Transaction } from '../context/WorkspaceContext';
import { Card, Badge, GoogleIcon, Input, TableRowSkeleton } from '../components/ui';

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
          <h1 style={{ fontSize: '24px', fontWeight: 700, margin: 0, color: '#000000', fontFamily: "'Open Sans', sans-serif" }}>
            Buku Transaksi
          </h1>
          <p style={{ color: '#666666', fontSize: '14px', margin: '4px 0 0' }}>
            Seluruh mutasi keuangan tercatat dari WhatsApp bot dan web portal
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card padding="16px 24px">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          {/* Tabs (Pills with 48px radius) */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[
              { id: 'ALL', label: 'Semua Transaksi' },
              { id: 'EXPENSE', label: 'Pengeluaran' },
              { id: 'INCOME', label: 'Pemasukan' },
              { id: 'TRANSFER', label: 'Transfer' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id)}
                style={{
                  padding: '8px 18px',
                  borderRadius: '48px',
                  border: '1px solid',
                  borderColor: filterType === tab.id ? '#005caa' : '#e5e5e5',
                  backgroundColor: filterType === tab.id ? '#005caa' : '#ffffff',
                  color: filterType === tab.id ? '#ffffff' : '#666666',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease',
                  willChange: 'background-color, color',
                  fontFamily: "'Open Sans', sans-serif",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div style={{ width: '280px' }}>
            <Input
              type="text"
              placeholder="Cari transaksi / rekening..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              googleIcon="search"
              style={{ marginBottom: 0 }}
            />
          </div>
        </div>
      </Card>

      {/* Transactions List */}
      <Card padding="0">
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 24px', color: '#666666' }}>
            <GoogleIcon name="receipt_long" size={36} color="#005caa" />
            <p style={{ marginTop: '12px', fontSize: '14px' }}>Tidak ada transaksi yang cocok dengan filter.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e5e5e5', backgroundColor: '#f8fafc', color: '#666666' }}>
                  <th style={{ padding: '14px 20px', fontWeight: 600 }}>Tipe & Deskripsi</th>
                  <th style={{ padding: '14px 20px', fontWeight: 600 }}>Kategori</th>
                  <th style={{ padding: '14px 20px', fontWeight: 600 }}>Rekening</th>
                  <th style={{ padding: '14px 20px', fontWeight: 600 }}>Tanggal</th>
                  <th style={{ padding: '14px 20px', fontWeight: 600, textAlign: 'right' }}>Nominal</th>
                  <th style={{ padding: '14px 20px', fontWeight: 600, textAlign: 'center' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading && transactions.length === 0 ? (
                  <>
                    <TableRowSkeleton />
                    <TableRowSkeleton />
                    <TableRowSkeleton />
                    <TableRowSkeleton />
                    <TableRowSkeleton />
                  </>
                ) : (
                  filtered.map((tx) => {
                    const isExpense = tx.type === 'EXPENSE';
                    const isIncome = tx.type === 'INCOME';

                  return (
                    <tr
                      key={tx.id}
                      style={{
                        borderBottom: '1px solid #f0f0f0',
                        transition: 'background-color 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div
                            style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '50%',
                              backgroundColor: isExpense ? '#fce8e6' : isIncome ? '#e6f4ea' : '#e8f2fa',
                              color: isExpense ? '#c5221f' : isIncome ? '#137333' : '#005caa',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            <GoogleIcon
                              name={isExpense ? 'arrow_outward' : isIncome ? 'south_west' : 'swap_horiz'}
                              size={18}
                              color={isExpense ? '#c5221f' : isIncome ? '#137333' : '#005caa'}
                            />
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: '#000000' }}>{tx.description}</div>
                            {tx.destinationAccount && (
                              <div style={{ fontSize: '12px', color: '#666666' }}>
                                Ke: {tx.destinationAccount.name}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '14px 20px' }}>
                        <Badge variant="neutral">
                          {tx.category?.name || 'Umum'}
                        </Badge>
                      </td>

                      <td style={{ padding: '14px 20px', color: '#666666' }}>
                        {tx.sourceAccount?.name || '-'}
                      </td>

                      <td style={{ padding: '14px 20px', color: '#666666', fontSize: '13px' }}>
                        <div style={{ fontWeight: 500, color: '#333333' }}>
                          {new Date(tx.date).toLocaleDateString('id-ID', {
                            timeZone: 'Asia/Jakarta',
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </div>
                        <div style={{ fontSize: '11.5px', color: '#888888', marginTop: '2px' }}>
                          {new Date(tx.date).toLocaleTimeString('id-ID', {
                            timeZone: 'Asia/Jakarta',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false,
                          }).replace(/\./g, ':')} WIB
                        </div>
                      </td>

                      <td
                        style={{
                          padding: '14px 20px',
                          textAlign: 'right',
                          fontWeight: 700,
                          fontSize: '14.5px',
                          color: isExpense ? '#c5221f' : isIncome ? '#137333' : '#005caa',
                          fontFamily: "'Open Sans', sans-serif",
                        }}
                      >
                        {isExpense ? '-' : isIncome ? '+' : ''}
                        {formatRupiah(Number(tx.amount))}
                      </td>

                      <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                        <button
                          onClick={() => handleDelete(tx.id, tx.description)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#c5221f',
                            padding: '6px',
                            borderRadius: '50%',
                            transition: 'background-color 0.15s ease',
                          }}
                          title="Hapus transaksi"
                        >
                          <GoogleIcon name="delete" size={18} color="#c5221f" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
