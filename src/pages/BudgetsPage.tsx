import React, { useState } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import { Card, Badge, GoogleIcon } from '../components/ui';

interface Budget {
  id: string;
  name: string;
  amount: number;
  spent: number;
  category?: { name: string };
}

export const BudgetsPage: React.FC = () => {
  const { activeWorkspace } = useWorkspace();
  const [budgets] = useState<Budget[]>([
    { id: '1', name: 'Makan & Minum', amount: 2500000, spent: 1250000 },
    { id: '2', name: 'Transportasi & Bensin', amount: 1000000, spent: 450000 },
    { id: '3', name: 'Kebutuhan Rumah & Belanja', amount: 3000000, spent: 2100000 },
    { id: '4', name: 'Hiburan & Langganan', amount: 800000, spent: 750000 },
  ]);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, margin: 0, color: '#000000', fontFamily: "'Open Sans', sans-serif" }}>
            Batas Anggaran Bulanan
          </h1>
          <p style={{ color: '#666666', fontSize: '14px', margin: '4px 0 0' }}>
            Pantau dan kendalikan pengeluaran agar tidak overbudget di {activeWorkspace?.name || 'Perusahaan'}
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {budgets.map((b) => {
          const percent = Math.min(Math.round((b.spent / b.amount) * 100), 100);
          const isWarning = percent >= 85;
          const isDanger = percent >= 95;

          const badgeVariant = isDanger ? 'danger' : isWarning ? 'warning' : 'success';
          const progressColor = isDanger ? '#c5221f' : isWarning ? '#b06000' : '#137333';

          return (
            <Card key={b.id} padding="24px">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '12px',
                      backgroundColor: '#e8f2fa',
                      color: '#005caa',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <GoogleIcon name="savings" size={20} color="#005caa" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: '#000000', fontFamily: "'Open Sans', sans-serif" }}>
                      {b.name}
                    </h3>
                    <div style={{ fontSize: '12.5px', color: '#666666', marginTop: '2px' }}>
                      Alokasi: {formatRupiah(b.amount)}
                    </div>
                  </div>
                </div>
                <Badge variant={badgeVariant}>
                  {percent}% Terpakai
                </Badge>
              </div>

              {/* Progress Bar (Rounded pill) */}
              <div
                style={{
                  width: '100%',
                  height: '8px',
                  backgroundColor: '#f1f3f4',
                  borderRadius: '48px',
                  overflow: 'hidden',
                  marginBottom: '14px',
                }}
              >
                <div
                  style={{
                    width: `${percent}%`,
                    height: '100%',
                    backgroundColor: progressColor,
                    borderRadius: '48px',
                    transition: 'width 0.4s ease',
                  }}
                />
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '13px',
                  color: '#666666',
                  paddingTop: '8px',
                  borderTop: '1px solid #f0f0f0',
                }}
              >
                <span>Terpakai: <strong style={{ color: '#000000' }}>{formatRupiah(b.spent)}</strong></span>
                <span>Sisa: <strong style={{ color: '#137333' }}>{formatRupiah(b.amount - b.spent)}</strong></span>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
