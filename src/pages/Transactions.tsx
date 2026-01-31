import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { useFinance } from '@/contexts/FinanceContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TransactionDrawer } from '@/components/transactions/TransactionDrawer';
import { formatCurrency, formatDate, getPaymentMethodLabel, getStatusLabel, exportToCSV } from '@/lib/utils';
import { Transaction } from '@/lib/types';
import { toast } from '@/hooks/use-toast';

export default function Transactions() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { transactions, categories, deleteTransaction, deleteTransactions, addTransaction, getCategoryById } = useFinance();
  
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Open drawer if ?new=true
  useEffect(() => {
    if (searchParams.get('new') === 'true') {
      setDrawerOpen(true);
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchesSearch = 
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.amount.toString().includes(searchQuery);
      const matchesType = typeFilter === 'all' || t.type === typeFilter;
      const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || t.categoryId === categoryFilter;
      
      return matchesSearch && matchesType && matchesStatus && matchesCategory;
    });
  }, [transactions, searchQuery, typeFilter, statusFilter, categoryFilter]);

  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredTransactions.slice(start, start + itemsPerPage);
  }, [filteredTransactions, currentPage]);

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(paginatedTransactions.map(t => t.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter(i => i !== id));
    }
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setDrawerOpen(true);
  };

  const handleDuplicate = (transaction: Transaction) => {
    const { id, createdAt, updatedAt, ...rest } = transaction;
    addTransaction({
      ...rest,
      description: `${rest.description} (cópia)`,
    });
    toast({
      title: 'Lançamento duplicado',
      description: 'Uma cópia do lançamento foi criada.',
    });
  };

  const handleDelete = (id: string) => {
    deleteTransaction(id);
    setSelectedIds(selectedIds.filter(i => i !== id));
    toast({
      title: 'Lançamento excluído',
      description: 'O lançamento foi removido com sucesso.',
    });
  };

  const handleBulkDelete = () => {
    deleteTransactions(selectedIds);
    setSelectedIds([]);
    toast({
      title: 'Lançamentos excluídos',
      description: `${selectedIds.length} lançamentos foram removidos.`,
    });
  };

  const handleExport = () => {
    const data = filteredTransactions.map(t => {
      const category = getCategoryById(t.categoryId);
      return {
        data: t.date,
        vencimento: t.dueDate,
        descricao: t.description,
        tipo: t.type === 'income' ? 'Receita' : 'Despesa',
        categoria: category?.name || '',
        valor: t.amount,
        status: getStatusLabel(t.status),
        forma_pagamento: getPaymentMethodLabel(t.paymentMethod),
      };
    });
    exportToCSV(data, 'lancamentos');
    toast({
      title: 'Exportação concluída',
      description: 'O arquivo CSV foi baixado.',
    });
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setEditingTransaction(null);
  };

  return (
    <AppLayout title="Lançamentos">
      <div className="space-y-4">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-1 flex-wrap gap-2 w-full sm:w-auto">
            <div className="relative flex-1 min-w-[200px]">
              <Input
                placeholder="Buscar..."
                className="pl-3"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="income">Receitas</SelectItem>
                <SelectItem value="expense">Despesas</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="paid">Pago</SelectItem>
                <SelectItem value="overdue">Vencido</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {categories.filter(c => c.active).map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            {selectedIds.length > 0 && (
              <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
                Excluir ({selectedIds.length})
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={handleExport}>
              CSV
            </Button>
            <Button size="sm" onClick={() => setDrawerOpen(true)}>
              Novo
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-lg border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedIds.length === paginatedTransactions.length && paginatedTransactions.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Nenhum lançamento encontrado
                  </TableCell>
                </TableRow>
              ) : (
                paginatedTransactions.map((transaction) => {
                  const category = getCategoryById(transaction.categoryId);
                  return (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.includes(transaction.id)}
                          onCheckedChange={(checked) => handleSelectOne(transaction.id, !!checked)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatDate(transaction.date)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${transaction.type === 'income' ? 'bg-income' : 'bg-expense'}`} />
                          {transaction.description}
                        </div>
                      </TableCell>
                      <TableCell>
                        {category && (
                          <Badge variant="outline">{category.name}</Badge>
                        )}
                      </TableCell>
                      <TableCell className={`text-right font-semibold ${
                        transaction.type === 'income' ? 'text-income' : 'text-expense'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}
                        {formatCurrency(transaction.amount)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={transaction.status as 'pending' | 'paid' | 'overdue'}>
                          {getStatusLabel(transaction.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon-sm">
                              ⋯
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(transaction)}>
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDuplicate(transaction)}>
                              Duplicar
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDelete(transaction.id)}
                              className="text-destructive"
                            >
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Mostrando {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredTransactions.length)} de {filteredTransactions.length}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Próximo
              </Button>
            </div>
          </div>
        )}
      </div>

      <TransactionDrawer
        open={drawerOpen}
        onClose={handleCloseDrawer}
        transaction={editingTransaction}
      />
    </AppLayout>
  );
}
