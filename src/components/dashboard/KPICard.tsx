import { Card, CardContent } from '@/components/ui/card';
import { cn, formatCurrency } from '@/lib/utils';

interface KPICardProps {
  title: string;
  value: number;
  type: 'balance' | 'income' | 'expense' | 'result';
  trend?: {
    value: number;
    isPositive: boolean;
  };
  delay?: number;
}


const colorMap: Record<string, string> = {
  balance: 'text-primary',
  income: 'text-income',
  expense: 'text-expense',
  result: 'text-primary',
};

const bgMap: Record<string, string> = {
  balance: 'bg-primary/10',
  income: 'bg-income-muted',
  expense: 'bg-expense-muted',
  result: 'bg-primary/10',
};

export function KPICard({ title, value, type, trend, delay = 0 }: KPICardProps) {
  const colorClass = colorMap[type];
  const bgClass = bgMap[type];

  return (
    <Card className={cn(
      "opacity-0 animate-slide-up-fade overflow-hidden",
      delay === 0 && "delay-0",
      delay === 1 && "delay-75",
      delay === 2 && "delay-150",
      delay === 3 && "delay-225",
    )}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className={cn(
              "text-2xl font-bold tracking-tight animate-count-up",
              type === 'expense' && 'text-expense',
              type === 'income' && 'text-income',
              type === 'result' && value >= 0 ? 'text-income' : type === 'result' && 'text-expense',
            )}>
              {formatCurrency(value)}
            </p>
            {trend && (
              <div className={cn(
                "flex items-center gap-1 text-xs font-medium",
                trend.isPositive ? "text-income" : "text-expense"
              )}>
                <span>{trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}% vs mês anterior</span>
              </div>
            )}
          </div>
          <div className={cn("p-3 rounded-xl flex items-center justify-center min-w-[48px] min-h-[48px]", bgClass)}>
            <span className={cn("text-xs font-semibold uppercase tracking-wider", colorClass)}>
              {type === 'balance' ? 'SLD' : type === 'income' ? 'ENT' : type === 'expense' ? 'SAÍ' : 'RES'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
