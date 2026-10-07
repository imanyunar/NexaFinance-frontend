import React from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import { Card, Badge, GoogleIcon } from '../components/ui';

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
        return 'account_balance';
      case 'CASH':
        return 'payments';
      default:
        return 'credit_card';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, margin: 0, color: '#000000', fontFamily: "'Open Sans', sans-serif" }}>
            Rekening & Dompet Kas
          </h1>
          <p style={{ color: '#666666', fontSize: '14px', margin: '4px 0 0' }}>
            Daftar rekening bank, e-wallet, kas tunai, dan pos tabungan Anda
          </p>
        </div>
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e5e5e5', borderRadius: '48px', padding: '8px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <GoogleIcon name="account_balance_wallet" size={18} color="#005caa" />
          <span style={{ fontSize: '13px', color: '#666666' }}>Total Saldo:</span>
          <strong style={{ fontSize: '15px', color: '#005caa', fontFamily: "'Open Sans', sans-serif" }}>
            {formatRupiah(totalBalance)}
          </strong>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        {accounts.map((acc) => (
          <Card key={acc.id} padding="24px">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '14px',
                  backgroundColor: '#e8f2fa',
                  color: '#005caa',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <GoogleIcon name={getAccountIcon(acc.type)} size={22} color="#005caa" />
              </div>
              <Badge variant="neutral">
                {acc.type}
              </Badge>
            </div>

            <h3 style={{ fontSize: '17px', fontWeight: 700, margin: 0, color: '#000000', fontFamily: "'Open Sans', sans-serif" }}>
              {acc.name}
            </h3>

            <div style={{ fontSize: '22px', fontWeight: 800, color: '#005caa', marginTop: '10px', fontFamily: "'Open Sans', sans-serif" }}>
              {formatRupiah(acc.balance)}
            </div>

            <div
              style={{
                marginTop: '16px',
                paddingTop: '12px',
                borderTop: '1px solid #f0f0f0',
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '12.5px',
                color: '#666666',
              }}
            >
              <span>Saldo Awal:</span>
              <span style={{ fontWeight: 600 }}>{formatRupiah(acc.openingBalance || 0)}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
