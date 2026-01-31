import React, { createContext, useContext, ReactNode } from 'react';
import { useFinanceData } from '@/hooks/useFinanceData';
import { Category, CostCenter, Transaction, Settings } from '@/lib/types';

interface FinanceContextType {
  transactions: Transaction[];
  categories: Category[];
  costCenters: CostCenter[];
  settings: Settings;
  isLoading: boolean;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => Transaction;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  deleteTransactions: (ids: string[]) => void;
  markAsPaid: (id: string) => void;
  addCategory: (category: Omit<Category, 'id'>) => Category;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  addCostCenter: (costCenter: Omit<CostCenter, 'id'>) => CostCenter;
  updateCostCenter: (id: string, updates: Partial<CostCenter>) => void;
  deleteCostCenter: (id: string) => void;
  updateSettings: (updates: Partial<Settings>) => void;
  resetData: () => void;
  reloadDemoData: () => void;
  getCategoryById: (id: string) => Category | undefined;
  getCostCenterById: (id: string) => CostCenter | undefined;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const financeData = useFinanceData();

  const getCategoryById = (id: string) => financeData.categories.find(c => c.id === id);
  const getCostCenterById = (id: string) => financeData.costCenters.find(c => c.id === id);

  return (
    <FinanceContext.Provider value={{ ...financeData, getCategoryById, getCostCenterById }}>
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const context = useContext(FinanceContext);
  if (context === undefined) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
}
