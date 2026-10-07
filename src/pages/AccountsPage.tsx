import React, { useState } from 'react';
import { CreditCard, Wallet, Landmark, Plus, ArrowUpRight } from 'lucide-react';
import { useWorkspace, Account } from '../context/WorkspaceContext';

export const AccountsPage: React.FC = () => {
  const { accounts, totalBalance } = useWorkspace();

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'BANK':
        return <Landmark size={20} />;
      case 'CASH':
        return <Wallet size={20} />;
      default:
        return <CreditCard size={20} />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, margin: 0 }}>Rekening & Dompet Kas</h1>
          <p style={{ color: '#64748b', fontSize: '14px', margin: '4px 0 0' }}>
            Daftar rekening bank, e-wallet, kas tunai, dan pos tabungan Anda
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
        {accounts.map((acc) => (
          <div key={acc.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  background: 'rgba(24, 122, 186, 0.1)',
                  color: acc.color || '#187aba',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {getAccountIcon(acc.type)}
              </div>
              <span
                style={{
                  padding: '3px 8px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 600,
                  background: '#f1f5f9',
                  color: '#475569',
                  textTransform: 'uppercase',
                }}
              >
                {acc.type}
              </span>
            </div>

            <h3 style={{ fontSize: '17px', fontWeight: 700, margin: 0, color: '#0f172a' }}>
              {acc.name}
            </h3>
            
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#002244', marginTop: '10px' }}>
              {formatRupiah(acc.balance)}
            </div>

            <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748b' }}>
              <span>Saldo Awal:</span>
              <span>{formatRupiah(acc.openingBalance || 0)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
