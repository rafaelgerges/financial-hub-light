import { useMemo } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useFinance } from '@/contexts/FinanceContext';
import { formatCurrency } from '@/lib/utils';
import { format, subDays, startOfDay, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function BalanceChart() {
  const { transactions } = useFinance();

  const chartData = useMemo(() => {
    const today = startOfDay(new Date());
    const data = [];
    let runningBalance = 0;

    // Calculate initial balance from transactions before 30 days ago
    const thirtyDaysAgo = subDays(today, 30);
    transactions
      .filter(t => t.status === 'paid' && parseISO(t.paidAt || t.date) < thirtyDaysAgo)
      .forEach(t => {
        runningBalance += t.type === 'income' ? t.amount : -t.amount;
      });

    // Generate data for last 30 days
    for (let i = 29; i >= 0; i--) {
      const date = subDays(today, i);
      const dateStr = format(date, 'yyyy-MM-dd');
      
      // Add transactions for this day
      transactions
        .filter(t => t.status === 'paid' && (t.paidAt || t.date) === dateStr)
        .forEach(t => {
          runningBalance += t.type === 'income' ? t.amount : -t.amount;
        });

      data.push({
        date: format(date, 'dd/MM', { locale: ptBR }),
        fullDate: dateStr,
        balance: runningBalance,
      });
    }

    return data;
  }, [transactions]);

  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Saldo Diário - Últimos 30 Dias</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                className="text-muted-foreground"
              />
              <YAxis 
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => formatCurrency(value).replace('R$', '')}
                className="text-muted-foreground"
              />
              <Tooltip 
                formatter={(value: number) => [formatCurrency(value), 'Saldo']}
                labelFormatter={(label) => `Data: ${label}`}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  boxShadow: 'var(--shadow-md)',
                }}
              />
              <Line
                type="monotone"
                dataKey="balance"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: 'hsl(var(--primary))' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
