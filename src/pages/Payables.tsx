import { useState, useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useFinance } from '@/contexts/FinanceContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatCurrency, formatDate, exportToCSV, getStatusLabel } from '@/lib/utils';
import { Transaction } from '@/lib/types';
import { toast } from '@/hooks/use-toast';

export default function Payables() {
  const { transactions, markAsPaid, getCategoryById } = useFinance();
  const [activeTab, setActiveTab] = useState('pending');

  const payables = useMemo(() => {
    return transactions.filter(t => t.type === 'expense');
  }, [transactions]);

  const pendingPayables = payables.filter(t => t.status === 'pending');
  const overduePayables = payables.filter(t => t.status === 'overdue');
  const paidPayables = payables.filter(t => t.status === 'paid');

  const currentList = useMemo(() => {
    switch (activeTab) {
      case 'pending':
        return pendingPayables;
      case 'overdue':
        return overduePayables;
      case 'paid':
        return paidPayables;
      default:
        return pendingPayables;
    }
  }, [activeTab, pendingPayables, overduePayables, paidPayables]);

  const handleMarkAsPaid = (id: string) => {
    markAsPaid(id);
    toast({
      title: 'Conta baixada',
      description: 'A conta foi marcada como paga.',
    });
  };

  const handleExport = () => {
    const data = currentList.map(t => {
      const category = getCategoryById(t.categoryId);
      return {
        vencimento: t.dueDate,
        descricao: t.description,
        categoria: category?.name || '',
        valor: t.amount,
        status: getStatusLabel(t.status),
      };
    });
    exportToCSV(data, 'contas-a-pagar');
    toast({
      title: 'Exportação concluída',
      description: 'O arquivo CSV foi baixado.',
    });
  };

  const renderTable = (list: Transaction[]) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Vencimento</TableHead>
          <TableHead>Descrição</TableHead>
          <TableHead>Categoria</TableHead>
          <TableHead className="text-right">Valor</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="w-24">Ação</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {list.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
              Nenhuma conta encontrada
            </TableCell>
          </TableRow>
        ) : (
          list.map((transaction) => {
            const category = getCategoryById(transaction.categoryId);
            return (
              <TableRow key={transaction.id} className={transaction.status === 'overdue' ? 'bg-expense-muted/30' : ''}>
                <TableCell className="font-medium">
                  {formatDate(transaction.dueDate)}
                </TableCell>
                <TableCell>{transaction.description}</TableCell>
                <TableCell>
                  {category && <Badge variant="outline">{category.name}</Badge>}
                </TableCell>
                <TableCell className="text-right font-semibold text-expense">
                  {formatCurrency(transaction.amount)}
                </TableCell>
                <TableCell>
                  <Badge variant={transaction.status as 'pending' | 'paid' | 'overdue'}>
                    {getStatusLabel(transaction.status)}
                  </Badge>
                </TableCell>
                <TableCell>
                  {transaction.status !== 'paid' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleMarkAsPaid(transaction.id)}
                    >
                      Baixar
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
  );

  return (
    <AppLayout title="Contas a Pagar">
      <div className="space-y-4">
        {overduePayables.length > 0 && (
          <div className="p-4 bg-expense-muted rounded-lg">
            <span className="text-sm font-medium text-expense">
              {overduePayables.length} conta{overduePayables.length > 1 ? 's' : ''} vencida{overduePayables.length > 1 ? 's' : ''} - Total: {formatCurrency(overduePayables.reduce((sum, t) => sum + t.amount, 0))}
            </span>
          </div>
        )}

        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={handleExport}>
            Exportar CSV
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="pending">
              Pendentes ({pendingPayables.length})
            </TabsTrigger>
            <TabsTrigger value="overdue">
              Vencidas ({overduePayables.length})
            </TabsTrigger>
            <TabsTrigger value="paid">
              Pagas ({paidPayables.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-4">
            <div className="rounded-lg border bg-card overflow-hidden">
              {renderTable(pendingPayables)}
            </div>
          </TabsContent>

          <TabsContent value="overdue" className="mt-4">
            <div className="rounded-lg border bg-card overflow-hidden">
              {renderTable(overduePayables)}
            </div>
          </TabsContent>

          <TabsContent value="paid" className="mt-4">
            <div className="rounded-lg border bg-card overflow-hidden">
              {renderTable(paidPayables)}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
