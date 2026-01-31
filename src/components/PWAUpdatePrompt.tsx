import { usePWAUpdate } from '@/hooks/usePWAUpdate';
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
import { useState, useEffect } from 'react';

export function PWAUpdatePrompt() {
  const { updateAvailable, handleUpdate, isUpdating } = usePWAUpdate();
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    if (updateAvailable && !isUpdating) {
      setShowDialog(true);
    }
  }, [updateAvailable, isUpdating]);

  const handleConfirmUpdate = () => {
    handleUpdate();
    setShowDialog(false);
  };

  const handleDismiss = () => {
    setShowDialog(false);
    // Não mostrar novamente por 1 hora
    const dismissUntil = new Date();
    dismissUntil.setHours(dismissUntil.getHours() + 1);
    localStorage.setItem('pwa-update-dismissed-until', dismissUntil.toISOString());
  };

  // Verificar se foi dispensado recentemente
  const dismissedUntil = localStorage.getItem('pwa-update-dismissed-until');
  if (dismissedUntil && new Date(dismissedUntil) > new Date()) {
    return null;
  }

  if (!updateAvailable) {
    return null;
  }

  return (
    <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Atualização Disponível</AlertDialogTitle>
          <AlertDialogDescription>
            Uma nova versão do Finance Hub está disponível. Deseja atualizar agora?
            A aplicação será recarregada após a atualização.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleDismiss}>Depois</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirmUpdate}>
            {isUpdating ? 'Atualizando...' : 'Atualizar Agora'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

