import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface SyncContextType {
  isOnline: boolean;
  isInstalled: boolean;
  pendingSync: number;
  syncData: () => Promise<void>;
  installApp: () => Promise<void>;
  showInstallPrompt: boolean;
  setShowInstallPrompt: (show: boolean) => void;
  checkInstallation: () => void;
}

const SyncContext = createContext<SyncContextType | undefined>(undefined);

export const useSync = () => {
  const context = useContext(SyncContext);
  if (!context) {
    throw new Error('useSync deve ser usado dentro de um SyncProvider');
  }
  return context;
};

interface SyncProviderProps {
  children: ReactNode;
}

export const SyncProvider: React.FC<SyncProviderProps> = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isInstalled, setIsInstalled] = useState(false);
  const [pendingSync, setPendingSync] = useState(0);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // Verificar se o app está instalado
  const checkInstallation = () => {
    try {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        console.log('App já está instalado');
        setIsInstalled(true);
      } else {
        console.log('App não está instalado');
        setIsInstalled(false);
      }
    } catch (error) {
      console.error('Erro ao verificar instalação:', error);
    }
  };

  useEffect(() => {
    checkInstallation();
    
    const handleAppInstalled = () => {
      console.log('App foi instalado!');
      setIsInstalled(true);
    };
    
    window.addEventListener('appinstalled', handleAppInstalled);
    
    return () => {
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Monitorar status online/offline
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Capturar prompt de instalação
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('Prompt de instalação capturado!', e);
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Registrar service worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registrado:', registration);
        })
        .catch((error) => {
          console.error('Erro ao registrar Service Worker:', error);
        });
    }
  }, []);

  // Sincronizar dados (versão simplificada)
  const syncData = async () => {
    if (!isOnline) {
      console.log('Offline - dados serão sincronizados quando online');
      return;
    }

    try {
      setPendingSync(prev => prev + 1);
      console.log('Sincronização iniciada...');
      
      // Aqui você pode implementar a sincronização real
      // Por enquanto, apenas simular
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Sincronização concluída');
    } catch (error) {
      console.error('Erro na sincronização:', error);
    } finally {
      setPendingSync(0);
    }
  };

  // Instalar app
  const installApp = async () => {
    console.log('Tentando instalar app...');
    console.log('deferredPrompt:', deferredPrompt);
    
    if (deferredPrompt) {
      try {
        console.log('Usando deferredPrompt para instalação');
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
          console.log('App instalado com sucesso!');
          setIsInstalled(true);
        } else {
          console.log('Instalação cancelada pelo usuário');
        }
        
        setDeferredPrompt(null);
        setShowInstallPrompt(false);
      } catch (error) {
        console.error('Erro ao instalar app:', error);
      }
    } else {
      console.log('DeferredPrompt não disponível, tentando instalação manual...');
      
      try {
        const isInstallable = window.matchMedia('(display-mode: standalone)').matches === false;
        
        if (isInstallable) {
          console.log('App pode ser instalado, mostrando instruções...');
          alert('Para instalar o app:\n\n1. Clique no ícone de instalação na barra de endereços\n2. Ou use o menu do navegador (⋮) → "Instalar app"\n3. Ou pressione Ctrl+Shift+I e vá em Application → Manifest → Install');
        } else {
          console.log('App já está instalado ou não pode ser instalado');
          setIsInstalled(true);
        }
      } catch (error) {
        console.error('Erro na verificação de instalação:', error);
        alert('Seu navegador não suporta instalação de PWA. Tente usar Chrome, Edge ou Firefox.');
      }
    }
  };

  return (
    <SyncContext.Provider
      value={{
        isOnline,
        isInstalled,
        pendingSync,
        syncData,
        installApp,
        showInstallPrompt,
        setShowInstallPrompt,
        checkInstallation,
      }}
    >
      {children}
    </SyncContext.Provider>
  );
}; 