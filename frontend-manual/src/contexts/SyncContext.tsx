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
    // Verificar se está em modo standalone (app instalado)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      console.log('App já está instalado');
      setIsInstalled(true);
    } else {
      console.log('App não está instalado');
      setIsInstalled(false);
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

    // Adicionar listener para o evento
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Verificar se já temos um prompt pendente (para casos de refresh)
    const checkExistingPrompt = () => {
      // @ts-ignore
      if (window.deferredPrompt) {
        console.log('Prompt de instalação já disponível no window');
        // @ts-ignore
        setDeferredPrompt(window.deferredPrompt);
        setShowInstallPrompt(true);
      }
    };

    // Verificar após um pequeno delay
    setTimeout(checkExistingPrompt, 1000);

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
          
          // Verificar atualizações
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // Nova versão disponível
                  if (confirm('Nova versão disponível! Deseja atualizar?')) {
                    newWorker.postMessage({ type: 'SKIP_WAITING' });
                    window.location.reload();
                  }
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('Erro ao registrar Service Worker:', error);
        });
    }
  }, []);

  // Sincronizar dados
  const syncData = async () => {
    if (!isOnline) {
      console.log('Offline - dados serão sincronizados quando online');
      return;
    }

    try {
      setPendingSync(prev => prev + 1);
      
      // Buscar dados pendentes do IndexedDB
      const pendingData = await getPendingData();
      
      if (pendingData.length > 0) {
        console.log(`Sincronizando ${pendingData.length} itens...`);
        
        for (const item of pendingData) {
          try {
            await syncItem(item);
            await removePendingData(item.id);
          } catch (error) {
            console.error('Erro ao sincronizar item:', error);
          }
        }
      }
      
      // Sincronizar dados do servidor
      await syncFromServer();
      
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
      
      // Tentar instalação manual
      if ('serviceWorker' in navigator && 'BeforeInstallPromptEvent' in window) {
        try {
          // Verificar se o app pode ser instalado
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
        }
      } else {
        console.log('Service Worker ou BeforeInstallPromptEvent não suportado');
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

// Funções auxiliares para IndexedDB
const getPendingData = async (): Promise<any[]> => {
  return new Promise((resolve) => {
    const request = indexedDB.open('InventarioDB', 1);
    
    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const transaction = db.transaction(['pendingSync'], 'readonly');
      const store = transaction.objectStore('pendingSync');
      const getAllRequest = store.getAll();
      
      getAllRequest.onsuccess = () => {
        resolve(getAllRequest.result || []);
      };
    };
    
    request.onerror = () => resolve([]);
  });
};

const removePendingData = async (id: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('InventarioDB', 1);
    
    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const transaction = db.transaction(['pendingSync'], 'readwrite');
      const store = transaction.objectStore('pendingSync');
      const deleteRequest = store.delete(id);
      
      deleteRequest.onsuccess = () => resolve();
      deleteRequest.onerror = () => reject(deleteRequest.error);
    };
    
    request.onerror = () => reject(request.error);
  });
};

const syncItem = async (item: any): Promise<void> => {
  // @ts-ignore
  const API_URL = import.meta.env.VITE_API_URL || "";
  
  const response = await fetch(`${API_URL}${item.endpoint}`, {
    method: item.method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(item.data),
  });
  
  if (!response.ok) {
    throw new Error(`Erro na sincronização: ${response.statusText}`);
  }
};

const syncFromServer = async (): Promise<void> => {
  // @ts-ignore
  const API_URL = import.meta.env.VITE_API_URL || "";
  
  // Sincronizar equipamentos
  const equipamentosResponse = await fetch(`${API_URL}/equipamentos`);
  if (equipamentosResponse.ok) {
    const equipamentos = await equipamentosResponse.json();
    await saveToIndexedDB('equipamentos', equipamentos);
  }
  
  // Sincronizar agendamentos
  const agendamentosResponse = await fetch(`${API_URL}/agendamentos`);
  if (agendamentosResponse.ok) {
    const agendamentos = await agendamentosResponse.json();
    await saveToIndexedDB('agendamentos', agendamentos);
  }
  
  // Sincronizar usuários
  const usuariosResponse = await fetch(`${API_URL}/usuarios`);
  if (usuariosResponse.ok) {
    const usuarios = await usuariosResponse.json();
    await saveToIndexedDB('usuarios', usuarios);
  }
};

const saveToIndexedDB = async (storeName: string, data: any[]): Promise<void> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('InventarioDB', 1);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Criar stores se não existirem
      if (!db.objectStoreNames.contains('equipamentos')) {
        db.createObjectStore('equipamentos', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('agendamentos')) {
        db.createObjectStore('agendamentos', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('usuarios')) {
        db.createObjectStore('usuarios', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('pendingSync')) {
        db.createObjectStore('pendingSync', { keyPath: 'id' });
      }
    };
    
    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      
      // Limpar dados existentes
      store.clear();
      
      // Adicionar novos dados
      data.forEach((item) => {
        store.add(item);
      });
      
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    };
    
    request.onerror = () => reject(request.error);
  });
}; 