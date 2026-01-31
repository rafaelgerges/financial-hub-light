import { useMemo } from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip,
  Legend 
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useFinance } from '@/contexts/FinanceContext';
import { formatCurrency } from '@/lib/utils';
import { startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';

const COLORS = [
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  'hsl(var(--chart-6))',
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
];

export function ExpensesByCategoryChart() {
  const { transactions, getCategoryById } = useFinance();

  const chartData = useMemo(() => {
    const today = new Date();
    const monthStart = startOfMonth(today);
    const monthEnd = endOfMonth(today);

    const expensesByCategory = new Map<string, number>();

    transactions
      .filter(t => 
        t.type === 'expense' && 
        t.status === 'paid' &&
        isWithinInterval(parseISO(t.paidAt || t.date), { start: monthStart, end: monthEnd })
      )
      .forEach(t => {
        const current = expensesByCategory.get(t.categoryId) || 0;
        expensesByCategory.set(t.categoryId, current + t.amount);
      });

    return Array.from(expensesByCategory.entries())
      .map(([categoryId, value]) => {
        const category = getCategoryById(categoryId);
        return {
          name: category?.name || 'Outros',
          value: Math.round(value * 100) / 100,
          color: category?.color || '#64748b',
        };
      })
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [transactions, getCategoryById]);

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Despesas por Categoria (Mês)</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="h-[280px] w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]} 
                    />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), 'Valor']}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    boxShadow: 'var(--shadow-md)',
                  }}
                />
                <Legend 
                  formatter={(value, entry) => {
                    const item = chartData.find(d => d.name === value);
                    const percentage = item ? ((item.value / total) * 100).toFixed(0) : 0;
                    return `${value} (${percentage}%)`;
                  }}
                  wrapperStyle={{ fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Sem despesas neste mês
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
