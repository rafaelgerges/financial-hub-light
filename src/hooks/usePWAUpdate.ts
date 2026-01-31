import { useEffect, useState } from 'react';

interface UpdateServiceWorkerFunction {
  (): void;
}

export function usePWAUpdate() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [updateServiceWorker, setUpdateServiceWorker] = useState<UpdateServiceWorkerFunction | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      return;
    }

    let registration: ServiceWorkerRegistration | null = null;

    const checkForUpdates = async () => {
      try {
        registration = await navigator.serviceWorker.getRegistration();
        
        if (!registration) {
          return;
        }

        // Escutar mudanças no service worker
        registration.addEventListener('updatefound', () => {
          const newWorker = registration!.installing;
          
          if (!newWorker) {
            return;
          }

          newWorker.addEventListener('statechange', () => {
            // Se o novo worker está instalado e há um worker ativo, há atualização disponível
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setUpdateAvailable(true);
              setUpdateServiceWorker(() => () => {
                setIsUpdating(true);
                // Enviar mensagem para o novo worker pular a espera
                newWorker.postMessage({ type: 'SKIP_WAITING' });
              });
            }
          });
        });

        // Verificar atualizações periodicamente
        setInterval(() => {
          registration?.update();
        }, 60 * 60 * 1000); // A cada hora
      } catch (error) {
        console.error('Erro ao verificar atualizações do Service Worker:', error);
      }
    };

    // Escutar quando o controller muda (nova versão ativada)
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (isUpdating) {
        // Recarregar a página quando a nova versão for ativada
        window.location.reload();
      }
    });

    checkForUpdates();

    return () => {
      // Cleanup se necessário
    };
  }, [isUpdating]);

  const handleUpdate = () => {
    if (updateServiceWorker) {
      updateServiceWorker();
    }
  };

  return {
    updateAvailable,
    handleUpdate,
    isUpdating
  };
}

