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
  _count?: {
    outgoingTransactions: number;
    incomingTransactions: number;
  };
}

export interface Category {
  id: string;
  workspaceId: string;
  name: string;
  type: 'INCOME' | 'EXPENSE';
  icon: string;
  color: string;
  _count?: {
    transactions: number;
    budgets: number;
  };
}

export interface Budget {
  id: string;
  categoryId: string;
  categoryName: string;
  categoryColor?: string;
  categoryIcon?: string;
  amount: number;
  spent: number;
  remaining: number;
  percentage: number;
  period: string;
  status: 'NORMAL' | 'WARNING' | 'EXCEEDED';
}

export interface BudgetSummary {
  totalBudget: number;
  totalSpent: number;
  totalRemaining: number;
  overallPercentage: number;
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
  notes?: string | null;
  sourceAccount?: { id: string; name: string; type: string; color: string };
  destinationAccount?: { id: string; name: string; type: string; color: string };
  category?: { id: string; name: string; type: string; icon?: string; color?: string };
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
  categories: Category[];
  budgets: Budget[];
  budgetSummary: BudgetSummary | null;
  selectedPeriod: string;
  setSelectedPeriod: (period: string) => void;
  totalBalance: number;
  loading: boolean;
  error: string | null;
  setActiveWorkspaceId: (id: string) => void;
  refreshData: () => Promise<void>;
  
  // Transaction CRUD
  createTransaction: (data: any) => Promise<void>;
  updateTransaction: (id: string, data: any) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;

  // Account CRUD
  createAccount: (data: { name: string; type: string; openingBalance: number; color?: string }) => Promise<void>;
  updateAccount: (id: string, data: { name?: string; type?: string; color?: string; isArchived?: boolean }) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;

  // Category CRUD
  fetchCategories: () => Promise<void>;
  createCategory: (data: { name: string; type: 'INCOME' | 'EXPENSE'; icon?: string; color?: string }) => Promise<Category>;
  deleteCategory: (id: string) => Promise<void>;

  // Budget CRUD
  fetchBudgets: (period?: string) => Promise<void>;
  createOrUpdateBudget: (data: { categoryId: string; amount: number; period?: string }) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType | null>(null);

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>('');
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [budgetSummary, setBudgetSummary] = useState<BudgetSummary | null>(null);
  
  const now = new Date();
  const defaultPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const [selectedPeriod, setSelectedPeriod] = useState<string>(defaultPeriod);

  const [totalBalance, setTotalBalance] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId) || workspaces[0] || null;

  const fetchCategories = useCallback(async () => {
    if (!activeWorkspaceId) return;
    try {
      const res = await apiFetch<{ categories: Category[] }>(`/workspaces/${activeWorkspaceId}/categories`);
      setCategories(res.categories || []);
    } catch (err: any) {
      console.warn('Error fetching categories:', err.message);
    }
  }, [activeWorkspaceId]);

  const fetchBudgets = useCallback(async (periodToFetch?: string) => {
    if (!activeWorkspaceId) return;
    try {
      const p = periodToFetch || selectedPeriod;
      const res = await apiFetch<{
        budgets: Budget[];
        summary: BudgetSummary;
      }>(`/workspaces/${activeWorkspaceId}/budgets?period=${p}`);
      setBudgets(res.budgets || []);
      setBudgetSummary(res.summary || null);
    } catch (err: any) {
      console.warn('Error fetching budgets:', err.message);
    }
  }, [activeWorkspaceId, selectedPeriod]);

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

        // Fetch accounts, transactions, categories, and budgets in parallel
        const [accData, txData, catData, budData] = await Promise.all([
          apiFetch<{ accounts: Account[]; totalBalance: number }>(`/workspaces/${currentWs.id}/accounts`),
          apiFetch<{ transactions: any[] }>(`/workspaces/${currentWs.id}/transactions`),
          apiFetch<{ categories: Category[] }>(`/workspaces/${currentWs.id}/categories`).catch(() => ({ categories: [] })),
          apiFetch<{ budgets: Budget[]; summary: BudgetSummary }>(`/workspaces/${currentWs.id}/budgets?period=${selectedPeriod}`).catch(() => ({ budgets: [], summary: null })),
        ]);

        setAccounts(accData.accounts || []);
        setTotalBalance(accData.totalBalance || currentWs.totalBalance || 0);

        // Map backend transactions to frontend Transaction interface
        const mappedTx: Transaction[] = (txData.transactions || []).map((t: any) => ({
          id: t.id,
          workspaceId: t.workspaceId,
          sourceAccountId: t.accountId,
          destinationAccountId: t.toAccountId,
          categoryId: t.categoryId,
          type: t.type,
          amount: Number(t.amount),
          date: t.transactedAt,
          description: t.description,
          notes: t.notes,
          sourceAccount: t.account,
          destinationAccount: t.toAccount,
          category: t.category,
        }));
        setTransactions(mappedTx);
        setCategories(catData.categories || []);
        setBudgets(budData.budgets || []);
        setBudgetSummary(budData.summary || null);
      }
    } catch (err: any) {
      console.warn('Backend fetch error:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [activeWorkspaceId, selectedPeriod]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Transaction CRUD
  const createTransaction = async (data: any) => {
    if (!activeWorkspace) return;
    const targetAccountId = data.accountId || data.sourceAccountId || accounts[0]?.id;
    if (!targetAccountId) {
      throw new Error('Pilih rekening terlebih dahulu');
    }
    const payload = {
      type: data.type || 'EXPENSE',
      accountId: targetAccountId,
      toAccountId: data.toAccountId !== undefined ? data.toAccountId : data.destinationAccountId || null,
      categoryId: data.categoryId || null,
      amount: Number(data.amount) || 0,
      description: data.description || 'Transaksi',
      notes: data.notes || null,
      transactedAt: data.transactedAt || data.date || new Date().toISOString(),
    };

    await apiFetch(`/workspaces/${activeWorkspace.id}/transactions`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    await fetchData();
  };

  const updateTransaction = async (id: string, data: any) => {
    if (!activeWorkspace) return;
    const payload: any = { ...data };
    if (data.sourceAccountId) payload.accountId = data.sourceAccountId;
    if (data.destinationAccountId !== undefined) payload.toAccountId = data.destinationAccountId;
    if (data.date) payload.transactedAt = data.date;

    await apiFetch(`/workspaces/${activeWorkspace.id}/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
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

  // Account CRUD
  const createAccount = async (data: { name: string; type: string; openingBalance: number; color?: string }) => {
    if (!activeWorkspace) return;
    await apiFetch(`/workspaces/${activeWorkspace.id}/accounts`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    await fetchData();
  };

  const updateAccount = async (id: string, data: { name?: string; type?: string; color?: string; isArchived?: boolean }) => {
    if (!activeWorkspace) return;
    await apiFetch(`/workspaces/${activeWorkspace.id}/accounts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    await fetchData();
  };

  const deleteAccount = async (id: string) => {
    if (!activeWorkspace) return;
    await apiFetch(`/workspaces/${activeWorkspace.id}/accounts/${id}`, {
      method: 'DELETE',
    });
    await fetchData();
  };

  // Category CRUD
  const createCategory = async (data: { name: string; type: 'INCOME' | 'EXPENSE'; icon?: string; color?: string }) => {
    if (!activeWorkspace) throw new Error('No active workspace');
    const res = await apiFetch<{ category: Category }>(`/workspaces/${activeWorkspace.id}/categories`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    await fetchCategories();
    return res.category;
  };

  const deleteCategory = async (id: string) => {
    if (!activeWorkspace) return;
    await apiFetch(`/workspaces/${activeWorkspace.id}/categories/${id}`, {
      method: 'DELETE',
    });
    await fetchCategories();
  };

  // Budget CRUD
  const createOrUpdateBudget = async (data: { categoryId: string; amount: number; period?: string }) => {
    if (!activeWorkspace) return;
    await apiFetch(`/workspaces/${activeWorkspace.id}/budgets`, {
      method: 'POST',
      body: JSON.stringify({
        ...data,
        period: data.period || selectedPeriod,
      }),
    });
    await fetchBudgets();
  };

  const deleteBudget = async (id: string) => {
    if (!activeWorkspace) return;
    await apiFetch(`/workspaces/${activeWorkspace.id}/budgets/${id}`, {
      method: 'DELETE',
    });
    await fetchBudgets();
  };

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        activeWorkspace,
        accounts,
        transactions,
        categories,
        budgets,
        budgetSummary,
        selectedPeriod,
        setSelectedPeriod,
        totalBalance,
        loading,
        error,
        setActiveWorkspaceId,
        refreshData: fetchData,
        createTransaction,
        updateTransaction,
        deleteTransaction,
        createAccount,
        updateAccount,
        deleteAccount,
        fetchCategories,
        createCategory,
        deleteCategory,
        fetchBudgets,
        createOrUpdateBudget,
        deleteBudget,
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
