import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { cn } from '@/lib/utils';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';

const routeLabels: Record<string, string> = {
  '/': 'Dashboard',
  '/transactions': 'Lançamentos',
  '/payables': 'Contas a Pagar',
  '/receivables': 'Contas a Receber',
  '/cashflow': 'Fluxo de Caixa',
  '/reports': 'Relatórios',
  '/categories': 'Categorias',
  '/settings': 'Configurações',
};

export function AppHeader() {
  const isOnline = useOnlineStatus();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');

  const currentLabel = routeLabels[location.pathname] || 'Finance Hub';

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/transactions?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem className="hidden md:block">
            <BreadcrumbLink href="/">
              Finance Hub
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="hidden md:block" />
          <BreadcrumbItem>
            <BreadcrumbPage>{currentLabel}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex-1" />

      <div className="flex items-center gap-2 sm:gap-4">
        {/* Search */}
        <form onSubmit={handleSearch} className="hidden md:block">
          <div className="relative">
            <Input
              type="search"
              placeholder="Buscar..."
              className="pl-3 w-[200px] lg:w-[280px] h-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </form>

        {/* New Transaction Button */}
        <Button 
          size="sm" 
          className="hidden sm:flex"
          onClick={() => navigate('/transactions?new=true')}
        >
          <span className="hidden lg:inline">Novo Lançamento</span>
          <span className="lg:hidden">Novo</span>
        </Button>
        <Button 
          size="icon" 
          className="sm:hidden h-8 w-8"
          onClick={() => navigate('/transactions?new=true')}
        >
          +
        </Button>

        {/* Online Status */}
        <div className={cn(
          "flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium transition-colors",
          isOnline 
            ? "bg-success-muted text-success" 
            : "bg-expense-muted text-expense"
        )}>
          <span className="text-xs">{isOnline ? 'Online' : 'Offline'}</span>
        </div>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="text-muted-foreground hover:text-foreground h-8 w-8"
          title={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
        >
          <span className="text-xs font-medium">{theme === 'dark' ? 'CL' : 'ES'}</span>
        </Button>
      </div>
    </header>
  );
}
