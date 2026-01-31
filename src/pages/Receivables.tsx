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

export default function Receivables() {
  const { transactions, markAsPaid, getCategoryById } = useFinance();
  const [activeTab, setActiveTab] = useState('pending');

  const receivables = useMemo(() => {
    return transactions.filter(t => t.type === 'income');
  }, [transactions]);

  const pendingReceivables = receivables.filter(t => t.status === 'pending');
  const overdueReceivables = receivables.filter(t => t.status === 'overdue');
  const receivedList = receivables.filter(t => t.status === 'paid');

  const currentList = useMemo(() => {
    switch (activeTab) {
      case 'pending':
        return pendingReceivables;
      case 'overdue':
        return overdueReceivables;
      case 'received':
        return receivedList;
      default:
        return pendingReceivables;
    }
  }, [activeTab, pendingReceivables, overdueReceivables, receivedList]);

  const handleMarkAsReceived = (id: string) => {
    markAsPaid(id);
    toast({
      title: 'Conta recebida',
      description: 'A conta foi marcada como recebida.',
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
    exportToCSV(data, 'contas-a-receber');
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
              <TableRow key={transaction.id} className={transaction.status === 'overdue' ? 'bg-warning-muted/30' : ''}>
                <TableCell className="font-medium">
                  {formatDate(transaction.dueDate)}
                </TableCell>
                <TableCell>{transaction.description}</TableCell>
                <TableCell>
                  {category && <Badge variant="outline">{category.name}</Badge>}
                </TableCell>
                <TableCell className="text-right font-semibold text-income">
                  {formatCurrency(transaction.amount)}
                </TableCell>
                <TableCell>
                  <Badge variant={transaction.status === 'paid' ? 'paid' : transaction.status === 'overdue' ? 'warning' : 'pending'}>
                    {transaction.status === 'paid' ? 'Recebido' : getStatusLabel(transaction.status)}
                  </Badge>
                </TableCell>
                <TableCell>
                  {transaction.status !== 'paid' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleMarkAsReceived(transaction.id)}
                    >
                      Receber
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

  const totalPending = pendingReceivables.reduce((sum, t) => sum + t.amount, 0);

  return (
    <AppLayout title="Contas a Receber">
      <div className="space-y-4">
        {pendingReceivables.length > 0 && (
          <div className="p-4 bg-income-muted rounded-lg">
            <span className="text-sm font-medium text-income">
              {pendingReceivables.length} conta{pendingReceivables.length > 1 ? 's' : ''} a receber - Total: {formatCurrency(totalPending)}
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
              Pendentes ({pendingReceivables.length})
            </TabsTrigger>
            <TabsTrigger value="overdue">
              Vencidas ({overdueReceivables.length})
            </TabsTrigger>
            <TabsTrigger value="received">
              Recebidas ({receivedList.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-4">
            <div className="rounded-lg border bg-card overflow-hidden">
              {renderTable(pendingReceivables)}
            </div>
          </TabsContent>

          <TabsContent value="overdue" className="mt-4">
            <div className="rounded-lg border bg-card overflow-hidden">
              {renderTable(overdueReceivables)}
            </div>
          </TabsContent>

          <TabsContent value="received" className="mt-4">
            <div className="rounded-lg border bg-card overflow-hidden">
              {renderTable(receivedList)}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
