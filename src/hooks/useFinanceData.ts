import { useState, useEffect, useCallback } from 'react';
import { Category, CostCenter, Transaction, Settings } from '@/lib/types';
import { 
  defaultCategories, 
  defaultCostCenters, 
  defaultSettings, 
  generateMockTransactions 
} from '@/lib/mock-data';

const STORAGE_KEYS = {
  transactions: 'finance-hub-transactions',
  categories: 'finance-hub-categories',
  costCenters: 'finance-hub-cost-centers',
  settings: 'finance-hub-settings',
  initialized: 'finance-hub-initialized',
};

export function useFinanceData() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize data from localStorage or generate mock data
  useEffect(() => {
    const initialized = localStorage.getItem(STORAGE_KEYS.initialized);
    
    if (initialized) {
      // Load from localStorage
      const storedTransactions = localStorage.getItem(STORAGE_KEYS.transactions);
      const storedCategories = localStorage.getItem(STORAGE_KEYS.categories);
      const storedCostCenters = localStorage.getItem(STORAGE_KEYS.costCenters);
      const storedSettings = localStorage.getItem(STORAGE_KEYS.settings);
      
      setTransactions(storedTransactions ? JSON.parse(storedTransactions) : []);
      setCategories(storedCategories ? JSON.parse(storedCategories) : defaultCategories);
      setCostCenters(storedCostCenters ? JSON.parse(storedCostCenters) : defaultCostCenters);
      setSettings(storedSettings ? JSON.parse(storedSettings) : defaultSettings);
    } else {
      // Initialize with mock data
      const mockTransactions = generateMockTransactions();
      setTransactions(mockTransactions);
      setCategories(defaultCategories);
      setCostCenters(defaultCostCenters);
      setSettings(defaultSettings);
      
      // Save to localStorage
      localStorage.setItem(STORAGE_KEYS.transactions, JSON.stringify(mockTransactions));
      localStorage.setItem(STORAGE_KEYS.categories, JSON.stringify(defaultCategories));
      localStorage.setItem(STORAGE_KEYS.costCenters, JSON.stringify(defaultCostCenters));
      localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(defaultSettings));
      localStorage.setItem(STORAGE_KEYS.initialized, 'true');
    }
    
    setIsLoading(false);
  }, []);

  // Persist changes to localStorage
  const persistTransactions = useCallback((data: Transaction[]) => {
    localStorage.setItem(STORAGE_KEYS.transactions, JSON.stringify(data));
    setTransactions(data);
  }, []);

  const persistCategories = useCallback((data: Category[]) => {
    localStorage.setItem(STORAGE_KEYS.categories, JSON.stringify(data));
    setCategories(data);
  }, []);

  const persistCostCenters = useCallback((data: CostCenter[]) => {
    localStorage.setItem(STORAGE_KEYS.costCenters, JSON.stringify(data));
    setCostCenters(data);
  }, []);

  const persistSettings = useCallback((data: Settings) => {
    localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(data));
    setSettings(data);
  }, []);

  // Transaction CRUD
  const addTransaction = useCallback((transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString().split('T')[0];
    const newTransaction: Transaction = {
      ...transaction,
      id: Math.random().toString(36).substring(2, 15),
      createdAt: now,
      updatedAt: now,
    };
    const updated = [newTransaction, ...transactions];
    persistTransactions(updated);
    return newTransaction;
  }, [transactions, persistTransactions]);

  const updateTransaction = useCallback((id: string, updates: Partial<Transaction>) => {
    const updated = transactions.map(t => 
      t.id === id 
        ? { ...t, ...updates, updatedAt: new Date().toISOString().split('T')[0] } 
        : t
    );
    persistTransactions(updated);
  }, [transactions, persistTransactions]);

  const deleteTransaction = useCallback((id: string) => {
    const updated = transactions.filter(t => t.id !== id);
    persistTransactions(updated);
  }, [transactions, persistTransactions]);

  const deleteTransactions = useCallback((ids: string[]) => {
    const updated = transactions.filter(t => !ids.includes(t.id));
    persistTransactions(updated);
  }, [transactions, persistTransactions]);

  const markAsPaid = useCallback((id: string) => {
    const now = new Date().toISOString().split('T')[0];
    updateTransaction(id, { status: 'paid', paidAt: now });
  }, [updateTransaction]);

  // Category CRUD
  const addCategory = useCallback((category: Omit<Category, 'id'>) => {
    const newCategory: Category = {
      ...category,
      id: Math.random().toString(36).substring(2, 15),
    };
    const updated = [...categories, newCategory];
    persistCategories(updated);
    return newCategory;
  }, [categories, persistCategories]);

  const updateCategory = useCallback((id: string, updates: Partial<Category>) => {
    const updated = categories.map(c => c.id === id ? { ...c, ...updates } : c);
    persistCategories(updated);
  }, [categories, persistCategories]);

  const deleteCategory = useCallback((id: string) => {
    const updated = categories.filter(c => c.id !== id);
    persistCategories(updated);
  }, [categories, persistCategories]);

  // Cost Center CRUD
  const addCostCenter = useCallback((costCenter: Omit<CostCenter, 'id'>) => {
    const newCostCenter: CostCenter = {
      ...costCenter,
      id: Math.random().toString(36).substring(2, 15),
    };
    const updated = [...costCenters, newCostCenter];
    persistCostCenters(updated);
    return newCostCenter;
  }, [costCenters, persistCostCenters]);

  const updateCostCenter = useCallback((id: string, updates: Partial<CostCenter>) => {
    const updated = costCenters.map(c => c.id === id ? { ...c, ...updates } : c);
    persistCostCenters(updated);
  }, [costCenters, persistCostCenters]);

  const deleteCostCenter = useCallback((id: string) => {
    const updated = costCenters.filter(c => c.id !== id);
    persistCostCenters(updated);
  }, [costCenters, persistCostCenters]);

  // Settings
  const updateSettings = useCallback((updates: Partial<Settings>) => {
    const updated = { ...settings, ...updates };
    persistSettings(updated);
  }, [settings, persistSettings]);

  // Reset data
  const resetData = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.transactions);
    localStorage.removeItem(STORAGE_KEYS.categories);
    localStorage.removeItem(STORAGE_KEYS.costCenters);
    localStorage.removeItem(STORAGE_KEYS.settings);
    localStorage.removeItem(STORAGE_KEYS.initialized);
    
    setTransactions([]);
    setCategories(defaultCategories);
    setCostCenters(defaultCostCenters);
    setSettings(defaultSettings);
  }, []);

  const reloadDemoData = useCallback(() => {
    const mockTransactions = generateMockTransactions();
    setTransactions(mockTransactions);
    setCategories(defaultCategories);
    setCostCenters(defaultCostCenters);
    setSettings(defaultSettings);
    
    localStorage.setItem(STORAGE_KEYS.transactions, JSON.stringify(mockTransactions));
    localStorage.setItem(STORAGE_KEYS.categories, JSON.stringify(defaultCategories));
    localStorage.setItem(STORAGE_KEYS.costCenters, JSON.stringify(defaultCostCenters));
    localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(defaultSettings));
    localStorage.setItem(STORAGE_KEYS.initialized, 'true');
  }, []);

  return {
    transactions,
    categories,
    costCenters,
    settings,
    isLoading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    deleteTransactions,
    markAsPaid,
    addCategory,
    updateCategory,
    deleteCategory,
    addCostCenter,
    updateCostCenter,
    deleteCostCenter,
    updateSettings,
    resetData,
    reloadDemoData,
  };
}
