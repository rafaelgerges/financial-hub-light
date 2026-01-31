import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useFinance } from '@/contexts/FinanceContext';
import { Transaction, TransactionType, PaymentMethod, TransactionStatus } from '@/lib/types';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

const transactionSchema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z.number().min(0.01, 'Valor deve ser maior que zero'),
  description: z.string().min(1, 'Descrição é obrigatória'),
  categoryId: z.string().min(1, 'Categoria é obrigatória'),
  costCenterId: z.string().min(1, 'Centro de custo é obrigatório'),
  paymentMethod: z.enum(['pix', 'boleto', 'card', 'transfer']),
  date: z.string(),
  dueDate: z.string(),
  status: z.enum(['pending', 'paid', 'overdue']),
  isRecurring: z.boolean(),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

interface TransactionDrawerProps {
  open: boolean;
  onClose: () => void;
  transaction?: Transaction | null;
}

export function TransactionDrawer({ open, onClose, transaction }: TransactionDrawerProps) {
  const { categories, costCenters, addTransaction, updateTransaction } = useFinance();
  const [date, setDate] = useState<Date>(transaction ? new Date(transaction.date + 'T00:00:00') : new Date());
  const [dueDate, setDueDate] = useState<Date>(transaction ? new Date(transaction.dueDate + 'T00:00:00') : new Date());
  const [type, setType] = useState<TransactionType>(transaction?.type || 'expense');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: transaction
      ? {
          type: transaction.type,
          amount: transaction.amount,
          description: transaction.description,
          categoryId: transaction.categoryId,
          costCenterId: transaction.costCenterId,
          paymentMethod: transaction.paymentMethod,
          date: transaction.date,
          dueDate: transaction.dueDate,
          status: transaction.status,
          isRecurring: transaction.isRecurring,
        }
      : {
          type: 'expense',
          amount: 0,
          description: '',
          categoryId: '',
          costCenterId: '',
          paymentMethod: 'pix',
          date: format(new Date(), 'yyyy-MM-dd'),
          dueDate: format(new Date(), 'yyyy-MM-dd'),
          status: 'pending',
          isRecurring: false,
        },
  });

  const watchType = watch('type');
  const filteredCategories = categories.filter(c => c.type === watchType && c.active);

  const onSubmit = (data: TransactionFormData) => {
    if (transaction) {
      updateTransaction(transaction.id, data);
      toast({
        title: 'Lançamento atualizado',
        description: 'As alterações foram salvas com sucesso.',
      });
    } else {
      addTransaction({
        type: data.type,
        amount: data.amount,
        description: data.description,
        categoryId: data.categoryId,
        costCenterId: data.costCenterId,
        paymentMethod: data.paymentMethod,
        date: data.date,
        dueDate: data.dueDate,
        status: data.status,
        isRecurring: data.isRecurring,
        attachments: [],
      });
      toast({
        title: 'Lançamento criado',
        description: 'O novo lançamento foi adicionado.',
      });
    }
    reset();
    onClose();
  };

  const handleTypeChange = (value: TransactionType) => {
    setType(value);
    setValue('type', value);
    setValue('categoryId', '');
  };

  return (
    <Drawer open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DrawerContent className="max-h-[90vh]">
        <div className="overflow-y-auto">
          <DrawerHeader>
            <DrawerTitle>
              {transaction ? 'Editar Lançamento' : 'Novo Lançamento'}
            </DrawerTitle>
            <DrawerDescription>
              Preencha os dados do lançamento abaixo
            </DrawerDescription>
          </DrawerHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="px-4 space-y-4">
            {/* Type Toggle */}
            <div className="flex gap-2">
              <Button
                type="button"
                variant={watchType === 'expense' ? 'expense' : 'outline'}
                className="flex-1"
                onClick={() => handleTypeChange('expense')}
              >
                Despesa
              </Button>
              <Button
                type="button"
                variant={watchType === 'income' ? 'income' : 'outline'}
                className="flex-1"
                onClick={() => handleTypeChange('income')}
              >
                Receita
              </Button>
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">Valor</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0,00"
                {...register('amount', { valueAsNumber: true })}
              />
              {errors.amount && (
                <p className="text-sm text-destructive">{errors.amount.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                placeholder="Descrição do lançamento"
                {...register('description')}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description.message}</p>
              )}
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select
                value={watch('categoryId')}
                onValueChange={(value) => setValue('categoryId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {filteredCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.categoryId && (
                <p className="text-sm text-destructive">{errors.categoryId.message}</p>
              )}
            </div>

            {/* Cost Center */}
            <div className="space-y-2">
              <Label>Centro de Custo</Label>
              <Select
                value={watch('costCenterId')}
                onValueChange={(value) => setValue('costCenterId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um centro de custo" />
                </SelectTrigger>
                <SelectContent>
                  {costCenters.filter(c => c.active).map((cc) => (
                    <SelectItem key={cc.id} value={cc.id}>
                      {cc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.costCenterId && (
                <p className="text-sm text-destructive">{errors.costCenterId.message}</p>
              )}
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      {date ? format(date, 'dd/MM/yyyy') : 'Selecione'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={(d) => {
                        if (d) {
                          setDate(d);
                          setValue('date', format(d, 'yyyy-MM-dd'));
                        }
                      }}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Vencimento</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dueDate && "text-muted-foreground"
                      )}
                    >
                      {dueDate ? format(dueDate, 'dd/MM/yyyy') : 'Selecione'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dueDate}
                      onSelect={(d) => {
                        if (d) {
                          setDueDate(d);
                          setValue('dueDate', format(d, 'yyyy-MM-dd'));
                        }
                      }}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-2">
              <Label>Forma de Pagamento</Label>
              <Select
                value={watch('paymentMethod')}
                onValueChange={(value) => setValue('paymentMethod', value as PaymentMethod)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pix">PIX</SelectItem>
                  <SelectItem value="boleto">Boleto</SelectItem>
                  <SelectItem value="card">Cartão</SelectItem>
                  <SelectItem value="transfer">Transferência</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={watch('status')}
                onValueChange={(value) => setValue('status', value as TransactionStatus)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="paid">Pago</SelectItem>
                  <SelectItem value="overdue">Vencido</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Recurring */}
            <div className="flex items-center justify-between">
              <Label htmlFor="recurring">Lançamento recorrente</Label>
              <Switch
                id="recurring"
                checked={watch('isRecurring')}
                onCheckedChange={(checked) => setValue('isRecurring', checked)}
              />
            </div>
          </form>

          <DrawerFooter>
            <Button type="submit" onClick={handleSubmit(onSubmit)}>
              {transaction ? 'Salvar Alterações' : 'Criar Lançamento'}
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
