export type TransactionType = 'income' | 'expense';
export type TransactionStatus = 'pending' | 'paid' | 'overdue';
export type PaymentMethod = 'pix' | 'boleto' | 'card' | 'transfer';

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  color: string;
  icon: string;
  active: boolean;
}

export interface CostCenter {
  id: string;
  name: string;
  description: string;
  active: boolean;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  categoryId: string;
  costCenterId: string;
  date: string;
  dueDate: string;
  paymentMethod: PaymentMethod;
  description: string;
  status: TransactionStatus;
  isRecurring: boolean;
  paidAt?: string;
  attachments: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Settings {
  currency: string;
  weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  theme: 'light' | 'dark' | 'system';
  companyName: string;
  cnpj: string;
  email: string;
}

export interface DashboardKPIs {
  currentBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlyResult: number;
}

export interface CashFlowData {
  date: string;
  income: number;
  expense: number;
  balance: number;
}
