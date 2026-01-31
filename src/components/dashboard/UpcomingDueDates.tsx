import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useFinance } from '@/contexts/FinanceContext';
import { formatCurrency, formatDate } from '@/lib/utils';
import { addDays, parseISO, isWithinInterval, startOfDay } from 'date-fns';
import { useNavigate } from 'react-router-dom';

export function UpcomingDueDates() {
  const { transactions, getCategoryById } = useFinance();
  const navigate = useNavigate();

  const upcoming = useMemo(() => {
    const today = startOfDay(new Date());
    const sevenDaysFromNow = addDays(today, 7);

    return transactions
      .filter(t => 
        t.status === 'pending' &&
        isWithinInterval(parseISO(t.dueDate), { start: today, end: sevenDaysFromNow })
      )
      .sort((a, b) => parseISO(a.dueDate).getTime() - parseISO(b.dueDate).getTime())
      .slice(0, 5);
  }, [transactions]);

  const overdueCount = useMemo(() => {
    return transactions.filter(t => t.status === 'overdue').length;
  }, [transactions]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold">Próximos Vencimentos</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        {overdueCount > 0 && (
          <div className="mb-4 p-3 bg-expense-muted rounded-lg">
            <span className="text-sm font-medium text-expense">
              {overdueCount} {overdueCount === 1 ? 'item vencido' : 'itens vencidos'}
            </span>
          </div>
        )}
        
        {upcoming.length > 0 ? (
          <div className="space-y-3">
            {upcoming.map((transaction) => {
              const category = getCategoryById(transaction.categoryId);
              return (
                <div 
                  key={transaction.id} 
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{transaction.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">
                        {formatDate(transaction.dueDate)}
                      </span>
                      {category && (
                        <Badge variant="outline" className="text-xs">
                          {category.name}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <p className={`text-sm font-semibold ml-4 ${
                    transaction.type === 'income' ? 'text-income' : 'text-expense'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}
                    {formatCurrency(transaction.amount)}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <p className="text-sm">Nenhum vencimento nos próximos 7 dias</p>
          </div>
        )}

        <Button 
          variant="ghost" 
          className="w-full mt-4 text-sm"
          onClick={() => navigate('/transactions')}
        >
          Ver todos
        </Button>
      </CardContent>
    </Card>
  );
}
