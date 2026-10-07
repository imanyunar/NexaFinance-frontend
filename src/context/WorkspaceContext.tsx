import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../lib/api';

export interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
  openingBalance?: number;
  color: string;
  isArchived?: boolean;
}

export interface Transaction {
  id: string;
  workspaceId: string;
  sourceAccountId: string;
  destinationAccountId?: string | null;
  categoryId?: string | null;
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER';
  amount: number;
  date: string;
  description: string;
  sourceAccount?: { name: string };
  destinationAccount?: { name: string };
  category?: { name: string; color?: string };
}

export interface Workspace {
  id: string;
  name: string;
  type: string;
  currency: string;
  role: string;
  accountsCount: number;
  totalBalance: number;
  accounts: Account[];
  transactionsCount: number;
}

interface WorkspaceContextType {
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  accounts: Account[];
  transactions: Transaction[];
  totalBalance: number;
  loading: boolean;
  error: string | null;
  setActiveWorkspaceId: (id: string) => void;
  refreshData: () => Promise<void>;
  createTransaction: (data: any) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType | null>(null);

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>('');
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalBalance, setTotalBalance] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId) || workspaces[0] || null;

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const wsData = await apiFetch<{ workspaces: Workspace[] }>('/workspaces');
      
      if (wsData?.workspaces && wsData.workspaces.length > 0) {
        setWorkspaces(wsData.workspaces);
        const currentWs = activeWorkspaceId 
          ? wsData.workspaces.find((w) => w.id === activeWorkspaceId) || wsData.workspaces[0]
          : wsData.workspaces[0];
          
        setActiveWorkspaceId(currentWs.id);

        // Fetch accounts and transactions for active workspace
        const [accData, txData] = await Promise.all([
          apiFetch<{ accounts: Account[]; totalBalance: number }>(`/workspaces/${currentWs.id}/accounts`),
          apiFetch<{ transactions: Transaction[] }>(`/workspaces/${currentWs.id}/transactions`),
        ]);

        setAccounts(accData.accounts || []);
        setTotalBalance(accData.totalBalance || currentWs.totalBalance || 0);
        setTransactions(txData.transactions || []);
      }
    } catch (err: any) {
      console.warn('Backend fetch error:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [activeWorkspaceId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const createTransaction = async (data: any) => {
    if (!activeWorkspace) return;
    await apiFetch(`/workspaces/${activeWorkspace.id}/transactions`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    await fetchData();
  };

  const deleteTransaction = async (id: string) => {
    if (!activeWorkspace) return;
    await apiFetch(`/workspaces/${activeWorkspace.id}/transactions/${id}`, {
      method: 'DELETE',
    });
    await fetchData();
  };

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        activeWorkspace,
        accounts,
        transactions,
        totalBalance,
        loading,
        error,
        setActiveWorkspaceId,
        refreshData: fetchData,
        createTransaction,
        deleteTransaction,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};
