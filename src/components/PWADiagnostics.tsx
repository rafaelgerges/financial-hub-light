import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function PWADiagnostics() {
  const [diagnostics, setDiagnostics] = useState<Record<string, any>>({});

  useEffect(() => {
    const checkDiagnostics = async () => {
      const results: Record<string, any> = {};

      // 1. Verificar Service Worker
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.getRegistration();
          results.serviceWorker = {
            supported: true,
            registered: !!registration,
            state: registration?.active?.state || 'não registrado',
            scope: registration?.scope || 'N/A'
          };
        } catch (error) {
          results.serviceWorker = {
            supported: true,
            registered: false,
            error: String(error)
          };
        }
      } else {
        results.serviceWorker = { supported: false };
      }

      // 2. Verificar Manifest
      try {
        const manifestResponse = await fetch('/manifest.webmanifest');
        if (manifestResponse.ok) {
          const manifest = await manifestResponse.json();
          results.manifest = {
            found: true,
            name: manifest.name,
            icons: manifest.icons?.length || 0
          };
        } else {
          results.manifest = { found: false, status: manifestResponse.status };
        }
      } catch (error) {
        results.manifest = { found: false, error: String(error) };
      }

      // 3. Verificar HTTPS/localhost
      const isSecure = window.location.protocol === 'https:' || 
                      window.location.hostname === 'localhost' ||
                      window.location.hostname === '127.0.0.1';
      results.https = {
        secure: isSecure,
        protocol: window.location.protocol,
        hostname: window.location.hostname
      };

      // 4. Verificar se já está instalado
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                          (window.navigator as any).standalone === true;
      results.installed = {
        isInstalled: isStandalone,
        displayMode: window.matchMedia('(display-mode: standalone)').matches ? 'standalone' : 'browser'
      };

      // 5. Verificar ícones
      const icon192 = await checkImage('/icon-192.png');
      const icon512 = await checkImage('/icon-512.png');
      results.icons = {
        icon192: icon192,
        icon512: icon512
      };

      setDiagnostics(results);
    };

    checkDiagnostics();
  }, []);

  const checkImage = (src: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = src;
    });
  };

  const getStatusBadge = (condition: boolean) => {
    return condition ? (
      <Badge className="bg-success text-success-foreground">✓ OK</Badge>
    ) : (
      <Badge variant="destructive">✗ Falha</Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Diagnóstico PWA</CardTitle>
        <CardDescription>
          Verifique os requisitos para instalação do PWA
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* HTTPS/Localhost */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">HTTPS ou Localhost</p>
            <p className="text-sm text-muted-foreground">
              {diagnostics.https?.protocol}://{diagnostics.https?.hostname}
            </p>
          </div>
          {getStatusBadge(diagnostics.https?.secure)}
        </div>

        {/* Service Worker */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Service Worker</p>
            <p className="text-sm text-muted-foreground">
              {diagnostics.serviceWorker?.registered 
                ? `Registrado - ${diagnostics.serviceWorker.state}`
                : 'Não registrado'}
            </p>
          </div>
          {getStatusBadge(diagnostics.serviceWorker?.registered)}
        </div>

        {/* Manifest */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Manifest</p>
            <p className="text-sm text-muted-foreground">
              {diagnostics.manifest?.found 
                ? `${diagnostics.manifest.name} (${diagnostics.manifest.icons} ícones)`
                : 'Não encontrado'}
            </p>
          </div>
          {getStatusBadge(diagnostics.manifest?.found)}
        </div>

        {/* Ícones */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Ícones PWA</p>
            <p className="text-sm text-muted-foreground">
              {diagnostics.icons?.icon192 && diagnostics.icons?.icon512
                ? '192px e 512px disponíveis'
                : 'Ícones faltando'}
            </p>
          </div>
          {getStatusBadge(diagnostics.icons?.icon192 && diagnostics.icons?.icon512)}
        </div>

        {/* Instalado */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Status de Instalação</p>
            <p className="text-sm text-muted-foreground">
              {diagnostics.installed?.isInstalled 
                ? `Modo: ${diagnostics.installed.displayMode}`
                : 'Não instalado'}
            </p>
          </div>
          {diagnostics.installed?.isInstalled ? (
            <Badge className="bg-success text-success-foreground">Instalado</Badge>
          ) : (
            <Badge variant="outline">Não instalado</Badge>
          )}
        </div>

        {/* Instruções */}
        {!diagnostics.installed?.isInstalled && (
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <p className="text-sm font-medium mb-2">Como instalar:</p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li><strong>Chrome/Edge:</strong> Clique no ícone de instalação na barra de endereços ou use o botão em Configurações</li>
              <li><strong>Firefox:</strong> Menu → Instalar Site como App</li>
              <li><strong>Safari (iOS):</strong> Compartilhar → Adicionar à Tela Inicial</li>
              <li><strong>Chrome (Android):</strong> Menu → Instalar app</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

