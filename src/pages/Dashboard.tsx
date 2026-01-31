import { useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { KPICard } from '@/components/dashboard/KPICard';
import { BalanceChart } from '@/components/dashboard/BalanceChart';
import { ExpensesByCategoryChart } from '@/components/dashboard/ExpensesByCategoryChart';
import { UpcomingDueDates } from '@/components/dashboard/UpcomingDueDates';
import { useFinance } from '@/contexts/FinanceContext';
import { startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

export default function Dashboard() {
  const { transactions, isLoading } = useFinance();

  const kpis = useMemo(() => {
    const today = new Date();
    const monthStart = startOfMonth(today);
    const monthEnd = endOfMonth(today);

    let currentBalance = 0;
    let monthlyIncome = 0;
    let monthlyExpenses = 0;

    transactions.forEach((t) => {
      if (t.status === 'paid') {
        const amount = t.type === 'income' ? t.amount : -t.amount;
        currentBalance += amount;

        const txDate = parseISO(t.paidAt || t.date);
        if (isWithinInterval(txDate, { start: monthStart, end: monthEnd })) {
          if (t.type === 'income') {
            monthlyIncome += t.amount;
          } else {
            monthlyExpenses += t.amount;
          }
        }
      }
    });

    return {
      currentBalance,
      monthlyIncome,
      monthlyExpenses,
      monthlyResult: monthlyIncome - monthlyExpenses,
    };
  }, [transactions]);

  if (isLoading) {
    return (
      <AppLayout title="Dashboard">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Dashboard">
      <div className="space-y-6">
        {/* KPIs */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KPICard
            title="Saldo Atual"
            value={kpis.currentBalance}
            type="balance"
            delay={0}
          />
          <KPICard
            title="Receitas do Mês"
            value={kpis.monthlyIncome}
            type="income"
            delay={1}
          />
          <KPICard
            title="Despesas do Mês"
            value={kpis.monthlyExpenses}
            type="expense"
            delay={2}
          />
          <KPICard
            title="Resultado do Mês"
            value={kpis.monthlyResult}
            type="result"
            delay={3}
          />
        </div>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-3">
          <BalanceChart />
          <ExpensesByCategoryChart />
        </div>

        {/* Upcoming Due Dates */}
        <UpcomingDueDates />
      </div>
    </AppLayout>
  );
}
