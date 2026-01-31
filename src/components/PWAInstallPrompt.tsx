import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Verifica se já está instalado
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Verifica se está em modo standalone (iOS)
    if ((window.navigator as any).standalone === true) {
      setIsInstalled(true);
      return;
    }

    // Escuta o evento beforeinstallprompt
    // NÃO fazemos preventDefault para permitir que o navegador mostre o ícone automático
    const handleBeforeInstallPrompt = (e: Event) => {
      // Armazena o evento para uso manual, mas não previne o comportamento padrão
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Não mostra o diálogo automaticamente - deixa o navegador mostrar o ícone
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Verifica se já foi instalado anteriormente
    const checkInstalled = () => {
      if (localStorage.getItem('pwa-installed') === 'true') {
        setIsInstalled(true);
      }
    };

    checkInstalled();

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        localStorage.setItem('pwa-installed', 'true');
        setIsInstalled(true);
      }
      
      setDeferredPrompt(null);
      setShowDialog(false);
    } catch (error) {
      console.error('Erro ao instalar PWA:', error);
    }
  };

  const handleDismiss = () => {
    setShowDialog(false);
    // Não mostrar novamente por 7 dias
    const dismissUntil = new Date();
    dismissUntil.setDate(dismissUntil.getDate() + 7);
    localStorage.setItem('pwa-dismissed-until', dismissUntil.toISOString());
  };

  // Não mostrar se já estiver instalado ou se foi dispensado recentemente
  if (isInstalled) return null;

  const dismissedUntil = localStorage.getItem('pwa-dismissed-until');
  if (dismissedUntil && new Date(dismissedUntil) > new Date()) {
    return null;
  }

  // Verificar se está em ambiente seguro (HTTPS ou localhost)
  const isSecure = window.location.protocol === 'https:' || 
                  window.location.hostname === 'localhost' ||
                  window.location.hostname === '127.0.0.1';

  if (!isSecure) {
    return null; // Não mostrar em HTTP não-localhost
  }

  // Não mostrar o diálogo automaticamente - o navegador mostrará o ícone na barra de endereços
  // Este componente apenas armazena o evento para uso manual se necessário
  return null;
}

