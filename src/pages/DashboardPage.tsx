import React from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import { Card, Badge, GoogleIcon } from '../components/ui';

export const DashboardPage: React.FC = () => {
  const { totalBalance, accounts, transactions, activeWorkspace } = useWorkspace();

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
      {/* Top Welcome & Liquidity Hero (BCA Style Clean White Card with #005caa accents) */}
      <div
        className="card"
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          padding: '36px',
          border: '1px solid #e5e5e5',
          boxShadow: 'rgba(112, 144, 176, 0.1) 0px 0px 40px 8px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '24px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <Badge variant="primary" googleIcon="verified_user">
              PORTAL KEUANGAN INSTITUSIONAL
            </Badge>
            <span style={{ fontSize: '13px', color: '#666666' }}>• Real-time Production</span>
          </div>
          <h1
            style={{
              fontSize: '26px',
              fontWeight: 700,
              color: '#000000',
              margin: '0 0 6px',
              fontFamily: "'Open Sans', sans-serif",
            }}
          >
            Portofolio Kas {activeWorkspace?.name || 'Iman Azizi'}
          </h1>
          <p style={{ margin: 0, color: '#666666', fontSize: '14px', lineHeight: 1.5 }}>
            Terintegrasi langsung ke WhatsApp Assistant & Neon Serverless PostgreSQL.
          </p>
        </div>

        <div
          style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #e5e5e5',
            borderRadius: '20px',
            padding: '20px 28px',
            textAlign: 'right',
            minWidth: '240px',
          }}
        >
          <div
            style={{
              fontSize: '12px',
              color: '#666666',
              marginBottom: '4px',
              textTransform: 'uppercase',
              letterSpacing: '0.6px',
              fontWeight: 600,
            }}
          >
            Total Likuiditas Bersih
          </div>
          <div
            style={{
              fontSize: '30px',
              fontWeight: 800,
              color: '#005caa',
              letterSpacing: '-0.5px',
              fontFamily: "'Open Sans', sans-serif",
            }}
          >
            {formatRupiah(totalBalance)}
          </div>
        </div>
      </div>

      {/* 4 Financial KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
        {/* KPI 1: Total Saldo */}
        <Card padding="24px">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
            <div>
              <div style={{ fontSize: '12.5px', color: '#666666', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                Total Saldo Kas
              </div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#005caa', marginTop: '6px', fontFamily: "'Open Sans', sans-serif" }}>
                {formatRupiah(totalBalance)}
              </div>
            </div>
            <div
              style={{
                width: '44px',
                height: '44px',
                backgroundColor: '#e8f2fa',
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <GoogleIcon name="account_balance_wallet" size={22} color="#005caa" />
            </div>
          </div>
          <div style={{ fontSize: '12.5px', color: '#137333', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 600 }}>
            <GoogleIcon name="shield" size={15} color="#137333" />
            <span>Tersebar di {accounts.length} rekening aktif</span>
          </div>
        </Card>

        {/* KPI 2: Pemasukan */}
        <Card padding="24px">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
            <div>
              <div style={{ fontSize: '12.5px', color: '#666666', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                Total Pemasukan
              </div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#137333', marginTop: '6px', fontFamily: "'Open Sans', sans-serif" }}>
                {formatRupiah(totalIncome)}
              </div>
            </div>
            <div
              style={{
                width: '44px',
                height: '44px',
                backgroundColor: '#e6f4ea',
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <GoogleIcon name="trending_up" size={22} color="#137333" />
            </div>
          </div>
          <div style={{ fontSize: '12.5px', color: '#666666' }}>
            Arus kas masuk bulan berjalan
          </div>
        </Card>

        {/* KPI 3: Pengeluaran */}
        <Card padding="24px">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
            <div>
              <div style={{ fontSize: '12.5px', color: '#666666', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                Total Pengeluaran
              </div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#c5221f', marginTop: '6px', fontFamily: "'Open Sans', sans-serif" }}>
                {formatRupiah(totalExpense)}
              </div>
            </div>
            <div
              style={{
                width: '44px',
                height: '44px',
                backgroundColor: '#fce8e6',
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <GoogleIcon name="trending_down" size={22} color="#c5221f" />
            </div>
          </div>
          <div style={{ fontSize: '12.5px', color: '#666666' }}>
            Tercatat dari web & chat WhatsApp
          </div>
        </Card>

        {/* KPI 4: Net Savings */}
        <Card padding="24px">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
            <div>
              <div style={{ fontSize: '12.5px', color: '#666666', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                Net Arus Kas
              </div>
              <div
                style={{
                  fontSize: '24px',
                  fontWeight: 700,
                  color: netSavings >= 0 ? '#137333' : '#c5221f',
                  marginTop: '6px',
                  fontFamily: "'Open Sans', sans-serif",
                }}
              >
                {formatRupiah(netSavings)}
              </div>
            </div>
            <div
              style={{
                width: '44px',
                height: '44px',
                backgroundColor: '#e8f2fa',
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <GoogleIcon name="account_balance" size={22} color="#005caa" />
            </div>
          </div>
          <div style={{ fontSize: '12.5px', color: '#666666' }}>
            Surplus / defisit berjalan
          </div>
        </Card>
      </div>

      {/* Main Grid: Accounts List & WhatsApp Bot Integration */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
        {/* Accounts Breakdown */}
        <Card
          title="Rekening & Saldo Kas"
          subtitle={`${accounts.length} Akun Terdaftar`}
          googleIcon="account_balance_wallet"
          padding="28px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {accounts.map((acc) => (
              <div
                key={acc.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '14px 18px',
                  borderRadius: '16px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e5e5e5',
                  transition: 'background-color 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: acc.color || '#005caa',
                    }}
                  />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '14px', color: '#000000' }}>{acc.name}</div>
                    <div style={{ fontSize: '12px', color: '#666666', textTransform: 'capitalize' }}>
                      {acc.type.toLowerCase()}
                    </div>
                  </div>
                </div>
                <div style={{ fontWeight: 700, fontSize: '15px', color: '#005caa', fontFamily: "'Open Sans', sans-serif" }}>
                  {formatRupiah(acc.balance)}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* WhatsApp Assistant Card */}
        <Card
          title="WhatsApp Assistant Bot"
          subtitle="Saluran Interaktif Otomatisasi Transaksi (Privat)"
          googleIcon="smartphone"
          padding="28px"
        >
          <p style={{ fontSize: '13.5px', color: '#666666', lineHeight: 1.5, margin: '0 0 16px' }}>
            Kirim pesan langsung di WhatsApp Anda untuk mencatat transaksi tanpa perlu login ke web:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div
              style={{
                backgroundColor: '#f8fafc',
                padding: '12px 16px',
                borderRadius: '16px',
                border: '1px solid #e5e5e5',
                fontSize: '13px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span style={{ color: '#000000', fontWeight: 600 }}>Cek Saldo:</span>
              <code style={{ backgroundColor: '#ffffff', border: '1px solid #e5e5e5', padding: '3px 10px', borderRadius: '48px', color: '#005caa', fontWeight: 600 }}>
                saldo
              </code>
            </div>

            <div
              style={{
                backgroundColor: '#f8fafc',
                padding: '12px 16px',
                borderRadius: '16px',
                border: '1px solid #e5e5e5',
                fontSize: '13px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span style={{ color: '#000000', fontWeight: 600 }}>Catat Pengeluaran:</span>
              <code style={{ backgroundColor: '#ffffff', border: '1px solid #e5e5e5', padding: '3px 10px', borderRadius: '48px', color: '#005caa', fontWeight: 600 }}>
                beli bensin 50rb dari bca
              </code>
            </div>

            <div
              style={{
                backgroundColor: '#f8fafc',
                padding: '12px 16px',
                borderRadius: '16px',
                border: '1px solid #e5e5e5',
                fontSize: '13px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span style={{ color: '#000000', fontWeight: 600 }}>Catat Pemasukan:</span>
              <code style={{ backgroundColor: '#ffffff', border: '1px solid #e5e5e5', padding: '3px 10px', borderRadius: '48px', color: '#005caa', fontWeight: 600 }}>
                dapat dividen 1jt ke mandiri
              </code>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
