import { useMemo, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useFinance } from '@/contexts/FinanceContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCurrency, exportToCSV } from '@/lib/utils';
import { startOfMonth, endOfMonth, isWithinInterval, parseISO, format, subMonths, addMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from '@/hooks/use-toast';

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  'hsl(var(--chart-6))',
];

export default function Reports() {
  const { transactions, getCategoryById, getCostCenterById } = useFinance();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => 
      t.status === 'paid' &&
      isWithinInterval(parseISO(t.paidAt || t.date), { start: monthStart, end: monthEnd })
    );
  }, [transactions, monthStart, monthEnd]);

  // By Category
  const categoryData = useMemo(() => {
    const map = new Map<string, { income: number; expense: number }>();
    
    filteredTransactions.forEach(t => {
      const current = map.get(t.categoryId) || { income: 0, expense: 0 };
      if (t.type === 'income') {
        current.income += t.amount;
      } else {
        current.expense += t.amount;
      }
      map.set(t.categoryId, current);
    });

    return Array.from(map.entries()).map(([id, values]) => {
      const category = getCategoryById(id);
      return {
        id,
        name: category?.name || 'Outros',
        ...values,
        total: values.income + values.expense,
      };
    }).sort((a, b) => b.total - a.total);
  }, [filteredTransactions, getCategoryById]);

  // By Cost Center
  const costCenterData = useMemo(() => {
    const map = new Map<string, { income: number; expense: number }>();
    
    filteredTransactions.forEach(t => {
      const current = map.get(t.costCenterId) || { income: 0, expense: 0 };
      if (t.type === 'income') {
        current.income += t.amount;
      } else {
        current.expense += t.amount;
      }
      map.set(t.costCenterId, current);
    });

    return Array.from(map.entries()).map(([id, values]) => {
      const cc = getCostCenterById(id);
      return {
        id,
        name: cc?.name || 'Outros',
        ...values,
        total: values.income + values.expense,
      };
    }).sort((a, b) => b.total - a.total);
  }, [filteredTransactions, getCostCenterById]);

  // Top 10 Expenses
  const topExpenses = useMemo(() => {
    return filteredTransactions
      .filter(t => t.type === 'expense')
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10);
  }, [filteredTransactions]);

  const goToPreviousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const handleExportCategory = () => {
    const data = categoryData.map(d => ({
      categoria: d.name,
      receitas: d.income,
      despesas: d.expense,
      total: d.total,
    }));
    exportToCSV(data, 'relatorio-categorias');
    toast({ title: 'Exportação concluída' });
  };

  const handleExportCostCenter = () => {
    const data = costCenterData.map(d => ({
      centro_custo: d.name,
      receitas: d.income,
      despesas: d.expense,
      total: d.total,
    }));
    exportToCSV(data, 'relatorio-centros-custo');
    toast({ title: 'Exportação concluída' });
  };

  const expensePieData = categoryData
    .filter(d => d.expense > 0)
    .map(d => ({ name: d.name, value: d.expense }))
    .slice(0, 6);

  return (
    <AppLayout title="Relatórios">
      <div className="space-y-6">
        {/* Period Selector */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={goToPreviousMonth} title="Mês anterior">
            &lt;
          </Button>
          <span className="text-lg font-semibold min-w-[150px] text-center">
            {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
          </span>
          <Button variant="outline" size="icon" onClick={goToNextMonth} title="Próximo mês">
            &gt;
          </Button>
        </div>

        <Tabs defaultValue="category">
          <TabsList>
            <TabsTrigger value="category">Por Categoria</TabsTrigger>
            <TabsTrigger value="costcenter">Por Centro de Custo</TabsTrigger>
            <TabsTrigger value="top10">Top 10 Despesas</TabsTrigger>
          </TabsList>

          <TabsContent value="category" className="mt-6 space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base">Despesas por Categoria</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={expensePieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={90}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {expensePieData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base">Tabela de Categorias</CardTitle>
                  <Button variant="outline" size="sm" onClick={handleExportCategory}>
                    CSV
                  </Button>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Categoria</TableHead>
                        <TableHead className="text-right">Receitas</TableHead>
                        <TableHead className="text-right">Despesas</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {categoryData.slice(0, 8).map((row) => (
                        <TableRow key={row.id}>
                          <TableCell>{row.name}</TableCell>
                          <TableCell className="text-right text-income">
                            {formatCurrency(row.income)}
                          </TableCell>
                          <TableCell className="text-right text-expense">
                            {formatCurrency(row.expense)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="costcenter" className="mt-6 space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Por Centro de Custo</CardTitle>
                <Button variant="outline" size="sm" onClick={handleExportCostCenter}>
                  CSV
                </Button>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={costCenterData} layout="vertical" margin={{ left: 80 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis type="number" tickFormatter={(v) => formatCurrency(v).replace('R$', '')} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} />
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      <Bar dataKey="income" fill="hsl(var(--income))" name="Receitas" />
                      <Bar dataKey="expense" fill="hsl(var(--expense))" name="Despesas" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="top10" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Top 10 Maiores Despesas</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topExpenses.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                          Nenhuma despesa neste período
                        </TableCell>
                      </TableRow>
                    ) : (
                      topExpenses.map((tx, index) => {
                        const category = getCategoryById(tx.categoryId);
                        return (
                          <TableRow key={tx.id}>
                            <TableCell className="font-medium">{index + 1}</TableCell>
                            <TableCell>{tx.description}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{category?.name}</Badge>
                            </TableCell>
                            <TableCell className="text-right font-semibold text-expense">
                              {formatCurrency(tx.amount)}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
