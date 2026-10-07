import React, { useState, useEffect } from 'react';
import { PiggyBank, Plus, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { apiFetch } from '../lib/api';

interface Budget {
  id: string;
  name: string;
  amount: number;
  spent: number;
  category?: { name: string };
}

export const BudgetsPage: React.FC = () => {
  const { activeWorkspace, transactions } = useWorkspace();
  const [budgets, setBudgets] = useState<Budget[]>([
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
          <h1 style={{ fontSize: '24px', fontWeight: 800, margin: 0 }}>Batas Anggaran Bulanan</h1>
          <p style={{ color: '#64748b', fontSize: '14px', margin: '4px 0 0' }}>
            Pantau dan kendalikan pengeluaran agar tidak overbudget
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '18px' }}>
        {budgets.map((b) => {
          const percent = Math.min(Math.round((b.spent / b.amount) * 100), 100);
          const isWarning = percent >= 85;
          const isDanger = percent >= 95;

          return (
            <div key={b.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>{b.name}</h3>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                    Alokasi: {formatRupiah(b.amount)}
                  </div>
                </div>
                <span
                  style={{
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 700,
                    background: isDanger
                      ? 'rgba(198, 34, 52, 0.1)'
                      : isWarning
                      ? 'rgba(179, 116, 0, 0.1)'
                      : 'rgba(16, 135, 78, 0.1)',
                    color: isDanger ? '#c62234' : isWarning ? '#b37400' : '#10874e',
                  }}
                >
                  {percent}% Terpakai
                </span>
              </div>

              {/* Progress Bar */}
              <div style={{ width: '100%', height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden', marginBottom: '12px' }}>
                <div
                  style={{
                    width: `${percent}%`,
                    height: '100%',
                    background: isDanger ? '#c62234' : isWarning ? '#b37400' : '#10874e',
                    borderRadius: '4px',
                    transition: 'width 0.4s ease',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', color: '#64748b' }}>
                <span>Terpakai: <strong style={{ color: '#0f172a' }}>{formatRupiah(b.spent)}</strong></span>
                <span>Sisa: <strong style={{ color: '#10874e' }}>{formatRupiah(b.amount - b.spent)}</strong></span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
