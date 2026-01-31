import { AppLayout } from '@/components/layout/AppLayout';
import { useFinance } from '@/contexts/FinanceContext';
import { useTheme } from '@/hooks/useTheme';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { PWADiagnostics } from '@/components/PWADiagnostics';

export default function Settings() {
  const { settings, updateSettings, resetData, reloadDemoData } = useFinance();
  const { theme, setTheme } = useTheme();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Verifica se já está instalado
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    if ((window.navigator as any).standalone === true) {
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallPWA = async () => {
    if (!deferredPrompt) {
      toast({
        title: 'Instalação não disponível',
        description: 'A instalação já foi concluída ou não está disponível no seu navegador.',
      });
      return;
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        toast({
          title: 'Instalação iniciada',
          description: 'O Finance Hub está sendo instalado no seu dispositivo.',
        });
        setIsInstalled(true);
      }
      
      setDeferredPrompt(null);
    } catch (error) {
      console.error('Erro ao instalar PWA:', error);
      toast({
        title: 'Erro na instalação',
        description: 'Não foi possível instalar a aplicação.',
        variant: 'destructive',
      });
    }
  };

  const handleResetData = () => {
    resetData();
    toast({
      title: 'Dados resetados',
      description: 'Todos os dados foram removidos.',
    });
  };

  const handleReloadDemo = () => {
    reloadDemoData();
    toast({
      title: 'Dados demo recarregados',
      description: 'Os dados de demonstração foram restaurados.',
    });
  };

  return (
    <AppLayout title="Configurações">
      <div className="max-w-2xl space-y-6">
        {/* Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>
              Preferências
            </CardTitle>
            <CardDescription>
              Configure as preferências da aplicação
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Tema</Label>
              <div className="flex gap-2">
                <Button
                  variant={theme === 'light' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTheme('light')}
                  className="flex-1"
                >
                  Claro
                </Button>
                <Button
                  variant={theme === 'dark' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTheme('dark')}
                  className="flex-1"
                >
                  Escuro
                </Button>
                <Button
                  variant={theme === 'system' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTheme('system')}
                  className="flex-1"
                >
                  Sistema
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Moeda</Label>
              <Select
                value={settings.currency}
                onValueChange={(v) => updateSettings({ currency: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BRL">Real (BRL)</SelectItem>
                  <SelectItem value="USD">Dólar (USD)</SelectItem>
                  <SelectItem value="EUR">Euro (EUR)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Início da semana</Label>
              <Select
                value={settings.weekStartsOn.toString()}
                onValueChange={(v) => updateSettings({ weekStartsOn: parseInt(v) as 0 | 1 })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Domingo</SelectItem>
                  <SelectItem value="1">Segunda-feira</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Company Profile */}
        <Card>
          <CardHeader>
            <CardTitle>Perfil da Empresa (Demo)</CardTitle>
            <CardDescription>
              Informações da empresa para relatórios
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Nome da Empresa</Label>
              <Input
                value={settings.companyName}
                onChange={(e) => updateSettings({ companyName: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>CNPJ</Label>
              <Input
                value={settings.cnpj}
                onChange={(e) => updateSettings({ cnpj: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>E-mail</Label>
              <Input
                type="email"
                value={settings.email}
                onChange={(e) => updateSettings({ email: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle>Gerenciamento de Dados</CardTitle>
            <CardDescription>
              Gerencie os dados de demonstração
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  Recarregar dados demo
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Recarregar dados demo?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Isso substituirá todos os dados atuais pelos dados de demonstração originais.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleReloadDemo}>
                    Recarregar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full">
                  Resetar todos os dados
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação não pode ser desfeita. Todos os lançamentos, categorias e configurações serão removidos.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleResetData} className="bg-destructive text-destructive-foreground">
                    Resetar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>

        {/* PWA Diagnostics */}
        <PWADiagnostics />

        {/* PWA Installation */}
        {!isInstalled && (
          <Card>
            <CardHeader>
              <CardTitle>Instalar Aplicativo</CardTitle>
              <CardDescription>
                Instale o Finance Hub no seu dispositivo para acesso rápido e uso offline
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={handleInstallPWA} 
                className="w-full"
                disabled={!deferredPrompt}
              >
                {deferredPrompt ? 'Instalar Finance Hub' : 'Instalação não disponível'}
              </Button>
              
              {!deferredPrompt && (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground text-center">
                    O botão de instalação automática não está disponível.
                  </p>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-xs font-medium mb-2">Instalação Manual:</p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li><strong>Chrome/Edge:</strong> Procure o ícone de instalação (⊕) na barra de endereços</li>
                      <li><strong>Firefox:</strong> Menu (☰) → "Instalar Site como App"</li>
                      <li><strong>Mobile:</strong> Menu do navegador → "Adicionar à Tela Inicial"</li>
                    </ul>
                  </div>
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    Certifique-se de estar em <strong>HTTPS</strong> ou <strong>localhost</strong>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* About */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-sm text-muted-foreground">
              <p className="font-medium">Finance Hub - Demo</p>
              <p>Versão 1.0.0</p>
              <p className="mt-2">Aplicação de demonstração para controle financeiro</p>
              {isInstalled && (
                <p className="mt-2 text-success text-xs">✓ Aplicativo instalado</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
