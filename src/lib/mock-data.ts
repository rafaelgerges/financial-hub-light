import { Category, CostCenter, Transaction, Settings } from './types';
import { format, subDays, addDays } from 'date-fns';

const generateId = () => Math.random().toString(36).substring(2, 15);

export const defaultCategories: Category[] = [
  { id: 'cat-1', name: 'Vendas', type: 'income', color: '#22c55e', icon: 'shopping-cart', active: true },
  { id: 'cat-2', name: 'Serviços', type: 'income', color: '#3b82f6', icon: 'briefcase', active: true },
  { id: 'cat-3', name: 'Juros', type: 'income', color: '#8b5cf6', icon: 'trending-up', active: true },
  { id: 'cat-4', name: 'Outras Receitas', type: 'income', color: '#06b6d4', icon: 'plus-circle', active: true },
  { id: 'cat-5', name: 'Fornecedores', type: 'expense', color: '#ef4444', icon: 'truck', active: true },
  { id: 'cat-6', name: 'Folha de Pagamento', type: 'expense', color: '#f97316', icon: 'users', active: true },
  { id: 'cat-7', name: 'Ferramentas SaaS', type: 'expense', color: '#ec4899', icon: 'cloud', active: true },
  { id: 'cat-8', name: 'Impostos', type: 'expense', color: '#dc2626', icon: 'file-text', active: true },
  { id: 'cat-9', name: 'Aluguel', type: 'expense', color: '#9333ea', icon: 'home', active: true },
  { id: 'cat-10', name: 'Marketing', type: 'expense', color: '#14b8a6', icon: 'megaphone', active: true },
  { id: 'cat-11', name: 'Outras Despesas', type: 'expense', color: '#64748b', icon: 'minus-circle', active: true },
];

export const defaultCostCenters: CostCenter[] = [
  { id: 'cc-1', name: 'Operações', description: 'Custos operacionais da empresa', active: true },
  { id: 'cc-2', name: 'Administrativo', description: 'Despesas administrativas', active: true },
  { id: 'cc-3', name: 'Comercial', description: 'Vendas e marketing', active: true },
  { id: 'cc-4', name: 'TI', description: 'Tecnologia e sistemas', active: true },
  { id: 'cc-5', name: 'RH', description: 'Recursos humanos', active: true },
];

export const defaultSettings: Settings = {
  currency: 'BRL',
  weekStartsOn: 1,
  theme: 'light',
  companyName: 'Empresa Demo LTDA',
  cnpj: '12.345.678/0001-90',
  email: 'contato@empresademo.com.br',
};

const paymentMethods: ('pix' | 'boleto' | 'card' | 'transfer')[] = ['pix', 'boleto', 'card', 'transfer'];
const incomeDescriptions = [
  'Venda de produtos',
  'Prestação de serviços',
  'Consultoria',
  'Projeto especial',
  'Rendimento de aplicação',
  'Venda online',
  'Contrato mensal',
];
const expenseDescriptions = [
  'Pagamento fornecedor',
  'Salários',
  'Benefícios',
  'Assinatura mensal',
  'Imposto ICMS',
  'Imposto ISS',
  'Aluguel escritório',
  'Google Workspace',
  'AWS Services',
  'Material de escritório',
  'Campanhas Google Ads',
  'Facebook Ads',
];

export function generateMockTransactions(): Transaction[] {
  const transactions: Transaction[] = [];
  const today = new Date();
  
  // Generate transactions for the last 60 days
  for (let i = 0; i < 60; i++) {
    const date = subDays(today, i);
    const dateStr = format(date, 'yyyy-MM-dd');
    
    // Generate 0-3 transactions per day
    const numTransactions = Math.floor(Math.random() * 4);
    
    for (let j = 0; j < numTransactions; j++) {
      const isIncome = Math.random() > 0.4; // 60% income, 40% expense
      const type = isIncome ? 'income' : 'expense';
      
      const incomeCategories = defaultCategories.filter(c => c.type === 'income');
      const expenseCategories = defaultCategories.filter(c => c.type === 'expense');
      const categories = isIncome ? incomeCategories : expenseCategories;
      const category = categories[Math.floor(Math.random() * categories.length)];
      
      const costCenter = defaultCostCenters[Math.floor(Math.random() * defaultCostCenters.length)];
      const descriptions = isIncome ? incomeDescriptions : expenseDescriptions;
      const description = descriptions[Math.floor(Math.random() * descriptions.length)];
      
      const baseAmount = isIncome ? 
        Math.random() * 15000 + 500 : 
        Math.random() * 8000 + 100;
      const amount = Math.round(baseAmount * 100) / 100;
      
      const daysUntilDue = Math.floor(Math.random() * 30) - 10;
      const dueDate = format(addDays(date, daysUntilDue), 'yyyy-MM-dd');
      
      let status: 'pending' | 'paid' | 'overdue';
      let paidAt: string | undefined;
      
      if (i > 5) {
        // Older transactions are mostly paid
        if (Math.random() > 0.15) {
          status = 'paid';
          paidAt = format(addDays(date, Math.floor(Math.random() * 5)), 'yyyy-MM-dd');
        } else {
          status = new Date(dueDate) < today ? 'overdue' : 'pending';
        }
      } else {
        // Recent transactions
        if (Math.random() > 0.6) {
          status = 'paid';
          paidAt = dateStr;
        } else {
          status = new Date(dueDate) < today ? 'overdue' : 'pending';
        }
      }
      
      transactions.push({
        id: generateId(),
        type,
        amount,
        categoryId: category.id,
        costCenterId: costCenter.id,
        date: dateStr,
        dueDate,
        paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
        description,
        status,
        isRecurring: Math.random() > 0.8,
        paidAt,
        attachments: [],
        createdAt: dateStr,
        updatedAt: dateStr,
      });
    }
  }
  
  // Add some future pending transactions
  for (let i = 1; i <= 15; i++) {
    const date = addDays(today, i);
    const dateStr = format(date, 'yyyy-MM-dd');
    
    if (Math.random() > 0.5) {
      const isIncome = Math.random() > 0.5;
      const type = isIncome ? 'income' : 'expense';
      
      const incomeCategories = defaultCategories.filter(c => c.type === 'income');
      const expenseCategories = defaultCategories.filter(c => c.type === 'expense');
      const categories = isIncome ? incomeCategories : expenseCategories;
      const category = categories[Math.floor(Math.random() * categories.length)];
      
      const costCenter = defaultCostCenters[Math.floor(Math.random() * defaultCostCenters.length)];
      const descriptions = isIncome ? incomeDescriptions : expenseDescriptions;
      const description = descriptions[Math.floor(Math.random() * descriptions.length)];
      
      const baseAmount = isIncome ? 
        Math.random() * 15000 + 500 : 
        Math.random() * 8000 + 100;
      const amount = Math.round(baseAmount * 100) / 100;
      
      transactions.push({
        id: generateId(),
        type,
        amount,
        categoryId: category.id,
        costCenterId: costCenter.id,
        date: format(today, 'yyyy-MM-dd'),
        dueDate: dateStr,
        paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
        description,
        status: 'pending',
        isRecurring: Math.random() > 0.7,
        attachments: [],
        createdAt: format(today, 'yyyy-MM-dd'),
        updatedAt: format(today, 'yyyy-MM-dd'),
      });
    }
  }
  
  return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
