import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useFinance } from '@/contexts/FinanceContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Category, CostCenter } from '@/lib/types';
import { toast } from '@/hooks/use-toast';

export default function Categories() {
  const { 
    categories, 
    costCenters, 
    addCategory, 
    updateCategory, 
    deleteCategory,
    addCostCenter,
    updateCostCenter,
    deleteCostCenter,
  } = useFinance();

  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [costCenterDialogOpen, setCostCenterDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingCostCenter, setEditingCostCenter] = useState<CostCenter | null>(null);

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    type: 'expense' as 'income' | 'expense',
    color: '#3b82f6',
    icon: 'tag',
    active: true,
  });

  const [costCenterForm, setCostCenterForm] = useState({
    name: '',
    description: '',
    active: true,
  });

  const handleOpenCategoryDialog = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setCategoryForm({
        name: category.name,
        type: category.type,
        color: category.color,
        icon: category.icon,
        active: category.active,
      });
    } else {
      setEditingCategory(null);
      setCategoryForm({
        name: '',
        type: 'expense',
        color: '#3b82f6',
        icon: 'tag',
        active: true,
      });
    }
    setCategoryDialogOpen(true);
  };

  const handleSaveCategory = () => {
    if (!categoryForm.name.trim()) {
      toast({ title: 'Erro', description: 'Nome é obrigatório', variant: 'destructive' });
      return;
    }

    if (editingCategory) {
      updateCategory(editingCategory.id, categoryForm);
      toast({ title: 'Categoria atualizada' });
    } else {
      addCategory(categoryForm);
      toast({ title: 'Categoria criada' });
    }
    setCategoryDialogOpen(false);
  };

  const handleDeleteCategory = (id: string) => {
    deleteCategory(id);
    toast({ title: 'Categoria excluída' });
  };

  const handleOpenCostCenterDialog = (cc?: CostCenter) => {
    if (cc) {
      setEditingCostCenter(cc);
      setCostCenterForm({
        name: cc.name,
        description: cc.description,
        active: cc.active,
      });
    } else {
      setEditingCostCenter(null);
      setCostCenterForm({
        name: '',
        description: '',
        active: true,
      });
    }
    setCostCenterDialogOpen(true);
  };

  const handleSaveCostCenter = () => {
    if (!costCenterForm.name.trim()) {
      toast({ title: 'Erro', description: 'Nome é obrigatório', variant: 'destructive' });
      return;
    }

    if (editingCostCenter) {
      updateCostCenter(editingCostCenter.id, costCenterForm);
      toast({ title: 'Centro de custo atualizado' });
    } else {
      addCostCenter(costCenterForm);
      toast({ title: 'Centro de custo criado' });
    }
    setCostCenterDialogOpen(false);
  };

  const handleDeleteCostCenter = (id: string) => {
    deleteCostCenter(id);
    toast({ title: 'Centro de custo excluído' });
  };

  const incomeCategories = categories.filter(c => c.type === 'income');
  const expenseCategories = categories.filter(c => c.type === 'expense');

  return (
    <AppLayout title="Categorias & Centros de Custo">
      <Tabs defaultValue="categories">
        <TabsList>
          <TabsTrigger value="categories">
            Categorias
          </TabsTrigger>
          <TabsTrigger value="costcenters">
            Centros de Custo
          </TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="mt-6 space-y-6">
          <div className="flex justify-end">
            <Button onClick={() => handleOpenCategoryDialog()}>
              Nova Categoria
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base text-income">Categorias de Receita</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {incomeCategories.map((cat) => (
                  <div key={cat.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className={!cat.active ? 'text-muted-foreground line-through' : ''}>
                        {cat.name}
                      </span>
                      {!cat.active && <Badge variant="secondary">Inativa</Badge>}
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => handleOpenCategoryDialog(cat)}>
                        Editar
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteCategory(cat.id)} className="text-destructive">
                        Excluir
                      </Button>
                    </div>
                  </div>
                ))}
                {incomeCategories.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhuma categoria de receita
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base text-expense">Categorias de Despesa</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {expenseCategories.map((cat) => (
                  <div key={cat.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className={!cat.active ? 'text-muted-foreground line-through' : ''}>
                        {cat.name}
                      </span>
                      {!cat.active && <Badge variant="secondary">Inativa</Badge>}
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => handleOpenCategoryDialog(cat)}>
                        Editar
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteCategory(cat.id)} className="text-destructive">
                        Excluir
                      </Button>
                    </div>
                  </div>
                ))}
                {expenseCategories.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhuma categoria de despesa
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="costcenters" className="mt-6 space-y-6">
          <div className="flex justify-end">
            <Button onClick={() => handleOpenCostCenterDialog()}>
              Novo Centro de Custo
            </Button>
          </div>

          <Card>
            <CardContent className="pt-6 space-y-2">
              {costCenters.map((cc) => (
                <div key={cc.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div>
                    <p className={`font-medium ${!cc.active ? 'text-muted-foreground line-through' : ''}`}>
                      {cc.name}
                    </p>
                    <p className="text-sm text-muted-foreground">{cc.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {!cc.active && <Badge variant="secondary">Inativo</Badge>}
                    <Button variant="ghost" size="sm" onClick={() => handleOpenCostCenterDialog(cc)}>
                      Editar
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteCostCenter(cc.id)} className="text-destructive">
                      Excluir
                    </Button>
                  </div>
                </div>
              ))}
              {costCenters.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Nenhum centro de custo cadastrado
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Category Dialog */}
      <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select
                value={categoryForm.type}
                onValueChange={(v) => setCategoryForm({ ...categoryForm, type: v as 'income' | 'expense' })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Receita</SelectItem>
                  <SelectItem value="expense">Despesa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Cor</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={categoryForm.color}
                  onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })}
                  className="w-16 h-10 p-1"
                />
                <Input
                  value={categoryForm.color}
                  onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })}
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label>Ativa</Label>
              <Switch
                checked={categoryForm.active}
                onCheckedChange={(v) => setCategoryForm({ ...categoryForm, active: v })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCategoryDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveCategory}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cost Center Dialog */}
      <Dialog open={costCenterDialogOpen} onOpenChange={setCostCenterDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCostCenter ? 'Editar Centro de Custo' : 'Novo Centro de Custo'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input
                value={costCenterForm.name}
                onChange={(e) => setCostCenterForm({ ...costCenterForm, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Input
                value={costCenterForm.description}
                onChange={(e) => setCostCenterForm({ ...costCenterForm, description: e.target.value })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Ativo</Label>
              <Switch
                checked={costCenterForm.active}
                onCheckedChange={(v) => setCostCenterForm({ ...costCenterForm, active: v })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCostCenterDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveCostCenter}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
