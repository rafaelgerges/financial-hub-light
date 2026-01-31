import { useMemo, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useFinance } from '@/contexts/FinanceContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { formatCurrency, formatDate } from '@/lib/utils';
import { 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  addWeeks,
  isWithinInterval, 
  parseISO,
  format,
  subMonths,
  addMonths
} from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function CashFlow() {
  const { transactions, getCategoryById } = useFinance();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);

  const { totalIncome, totalExpense, balance, weeklyData, dailyTransactions } = useMemo(() => {
    let income = 0;
    let expense = 0;

    const filteredTransactions = transactions.filter(t => 
      t.status === 'paid' &&
      isWithinInterval(parseISO(t.paidAt || t.date), { start: monthStart, end: monthEnd })
    );

    filteredTransactions.forEach(t => {
      if (t.type === 'income') {
        income += t.amount;
      } else {
        expense += t.amount;
      }
    });

    // Weekly data for chart
    const weeks: { name: string; income: number; expense: number }[] = [];
    let weekStart = startOfWeek(monthStart, { locale: ptBR });
    let weekNum = 1;

    while (weekStart <= monthEnd) {
      const weekEnd = endOfWeek(weekStart, { locale: ptBR });
      let weekIncome = 0;
      let weekExpense = 0;

      filteredTransactions.forEach(t => {
        const txDate = parseISO(t.paidAt || t.date);
        if (isWithinInterval(txDate, { start: weekStart, end: weekEnd })) {
          if (t.type === 'income') {
            weekIncome += t.amount;
          } else {
            weekExpense += t.amount;
          }
        }
      });

      weeks.push({
        name: `Semana ${weekNum}`,
        income: weekIncome,
        expense: weekExpense,
      });

      weekStart = addWeeks(weekStart, 1);
      weekNum++;
    }

    // Daily transactions grouped
    const daily = new Map<string, typeof filteredTransactions>();
    filteredTransactions.forEach(t => {
      const dateKey = t.paidAt || t.date;
      if (!daily.has(dateKey)) {
        daily.set(dateKey, []);
      }
      daily.get(dateKey)!.push(t);
    });

    const sortedDaily = Array.from(daily.entries())
      .sort((a, b) => parseISO(b[0]).getTime() - parseISO(a[0]).getTime());

    return {
      totalIncome: income,
      totalExpense: expense,
      balance: income - expense,
      weeklyData: weeks,
      dailyTransactions: sortedDaily,
    };
  }, [transactions, monthStart, monthEnd]);

  const goToPreviousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  return (
    <AppLayout title="Fluxo de Caixa">
      <div className="space-y-6">
        {/* Period Selector */}
        <div className="flex items-center justify-between">
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
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-income-muted min-w-[48px] min-h-[48px] flex items-center justify-center">
                  <span className="text-xs font-semibold uppercase tracking-wider text-income">ENT</span>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Entradas</p>
                  <p className="text-2xl font-bold text-income">
                    {formatCurrency(totalIncome)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-expense-muted min-w-[48px] min-h-[48px] flex items-center justify-center">
                  <span className="text-xs font-semibold uppercase tracking-wider text-expense">SAÍ</span>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Saídas</p>
                  <p className="text-2xl font-bold text-expense">
                    {formatCurrency(totalExpense)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card variant={balance >= 0 ? 'income' : 'expense'}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl min-w-[48px] min-h-[48px] flex items-center justify-center ${balance >= 0 ? 'bg-income' : 'bg-expense'}`}>
                  <span className={`text-xs font-semibold uppercase tracking-wider ${balance >= 0 ? 'text-income-foreground' : 'text-expense-foreground'}`}>SLD</span>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Saldo do Período</p>
                  <p className={`text-2xl font-bold ${balance >= 0 ? 'text-income' : 'text-expense'}`}>
                    {formatCurrency(balance)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Weekly Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Entradas vs Saídas por Semana</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => formatCurrency(v).replace('R$', '')} />
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      formatCurrency(value), 
                      name === 'income' ? 'Entradas' : 'Saídas'
                    ]}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend 
                    formatter={(value) => value === 'income' ? 'Entradas' : 'Saídas'}
                  />
                  <Bar dataKey="income" fill="hsl(var(--income))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" fill="hsl(var(--expense))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Daily Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Detalhamento Diário</CardTitle>
          </CardHeader>
          <CardContent>
            {dailyTransactions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhum lançamento neste período
              </p>
            ) : (
              <Accordion type="single" collapsible className="space-y-2">
                {dailyTransactions.map(([date, txs]) => {
                  const dayIncome = txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
                  const dayExpense = txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
                  
                  return (
                    <AccordionItem key={date} value={date} className="border rounded-lg px-4">
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center justify-between w-full pr-4">
                          <span className="font-medium">{formatDate(date)}</span>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-income">+{formatCurrency(dayIncome)}</span>
                            <span className="text-expense">-{formatCurrency(dayExpense)}</span>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2 pt-2">
                          {txs.map(tx => {
                            const category = getCategoryById(tx.categoryId);
                            return (
                              <div key={tx.id} className="flex items-center justify-between py-2 border-b last:border-0">
                                <div className="flex items-center gap-2">
                                  <span className={`w-2 h-2 rounded-full ${tx.type === 'income' ? 'bg-income' : 'bg-expense'}`} />
                                  <span className="text-sm">{tx.description}</span>
                                  {category && (
                                    <span className="text-xs text-muted-foreground">({category.name})</span>
                                  )}
                                </div>
                                <span className={`text-sm font-medium ${tx.type === 'income' ? 'text-income' : 'text-expense'}`}>
                                  {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
