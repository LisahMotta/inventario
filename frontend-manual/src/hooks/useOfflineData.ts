import { useState, useEffect } from 'react';
import { useSync } from '../contexts/SyncContext';

interface OfflineDataHook<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  addItem: (item: T) => Promise<void>;
  updateItem: (id: number, item: Partial<T>) => Promise<void>;
  deleteItem: (id: number) => Promise<void>;
  refreshData: () => Promise<void>;
}

export const useOfflineData = <T extends { id: number }>(
  storeName: string,
  endpoint: string
): OfflineDataHook<T> => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isOnline, syncData } = useSync();

  // Carregar dados iniciais
  useEffect(() => {
    loadData();
  }, [storeName]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Tentar carregar do servidor se online
      if (isOnline) {
        await loadFromServer();
      } else {
        // Carregar do IndexedDB se offline
        await loadFromIndexedDB();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
      // Fallback para IndexedDB
      await loadFromIndexedDB();
    } finally {
      setLoading(false);
    }
  };

  const loadFromServer = async () => {
    // @ts-ignore
    const API_URL = import.meta.env.VITE_API_URL || "";
    const response = await fetch(`${API_URL}${endpoint}`);
    
    if (!response.ok) {
      throw new Error(`Erro ao carregar dados: ${response.statusText}`);
    }
    
    const serverData = await response.json();
    setData(serverData);
    
    // Salvar no IndexedDB
    await saveToIndexedDB(serverData);
  };

  const loadFromIndexedDB = async () => {
    const dbData = await getFromIndexedDB();
    setData(dbData);
  };

  const addItem = async (item: T) => {
    try {
      if (isOnline) {
        // Adicionar diretamente no servidor
        await addToServer(item);
      } else {
        // Salvar localmente e marcar para sincronização
        await addToIndexedDB(item);
        await addToPendingSync('POST', endpoint, item);
      }
      
      // Atualizar estado local
      setData(prev => [...prev, item]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao adicionar item');
      throw err;
    }
  };

  const updateItem = async (id: number, updates: Partial<T>) => {
    try {
      if (isOnline) {
        // Atualizar diretamente no servidor
        await updateOnServer(id, updates);
      } else {
        // Atualizar localmente e marcar para sincronização
        await updateInIndexedDB(id, updates);
        await addToPendingSync('PUT', `${endpoint}/${id}`, updates);
      }
      
      // Atualizar estado local
      setData(prev => prev.map(item => 
        item.id === id ? { ...item, ...updates } : item
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar item');
      throw err;
    }
  };

  const deleteItem = async (id: number) => {
    try {
      if (isOnline) {
        // Deletar diretamente no servidor
        await deleteFromServer(id);
      } else {
        // Deletar localmente e marcar para sincronização
        await deleteFromIndexedDB(id);
        await addToPendingSync('DELETE', `${endpoint}/${id}`, { id });
      }
      
      // Atualizar estado local
      setData(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar item');
      throw err;
    }
  };

  const refreshData = async () => {
    await loadData();
  };

  // Funções auxiliares para IndexedDB
  const getFromIndexedDB = async (): Promise<T[]> => {
    return new Promise((resolve) => {
      const request = indexedDB.open('InventarioDB', 1);
      
      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const getAllRequest = store.getAll();
        
        getAllRequest.onsuccess = () => {
          resolve(getAllRequest.result || []);
        };
      };
      
      request.onerror = () => resolve([]);
    });
  };

  const saveToIndexedDB = async (data: T[]): Promise<void> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('InventarioDB', 1);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName, { keyPath: 'id' });
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

  const addToIndexedDB = async (item: T): Promise<void> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('InventarioDB', 1);
      
      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const addRequest = store.add(item);
        
        addRequest.onsuccess = () => resolve();
        addRequest.onerror = () => reject(addRequest.error);
      };
      
      request.onerror = () => reject(request.error);
    });
  };

  const updateInIndexedDB = async (id: number, updates: Partial<T>): Promise<void> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('InventarioDB', 1);
      
      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const getRequest = store.get(id);
        
        getRequest.onsuccess = () => {
          const item = getRequest.result;
          if (item) {
            const updatedItem = { ...item, ...updates };
            const putRequest = store.put(updatedItem);
            putRequest.onsuccess = () => resolve();
            putRequest.onerror = () => reject(putRequest.error);
          } else {
            reject(new Error('Item não encontrado'));
          }
        };
      };
      
      request.onerror = () => reject(request.error);
    });
  };

  const deleteFromIndexedDB = async (id: number): Promise<void> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('InventarioDB', 1);
      
      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const deleteRequest = store.delete(id);
        
        deleteRequest.onsuccess = () => resolve();
        deleteRequest.onerror = () => reject(deleteRequest.error);
      };
      
      request.onerror = () => reject(request.error);
    });
  };

  const addToPendingSync = async (method: string, endpoint: string, data: any): Promise<void> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('InventarioDB', 1);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('pendingSync')) {
          db.createObjectStore('pendingSync', { keyPath: 'id' });
        }
      };
      
      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = db.transaction(['pendingSync'], 'readwrite');
        const store = transaction.objectStore('pendingSync');
        
        const pendingItem = {
          id: `${method}-${endpoint}-${Date.now()}`,
          method,
          endpoint,
          data,
          timestamp: new Date().toISOString()
        };
        
        const addRequest = store.add(pendingItem);
        addRequest.onsuccess = () => resolve();
        addRequest.onerror = () => reject(addRequest.error);
      };
      
      request.onerror = () => reject(request.error);
    });
  };

  // Funções para operações no servidor
  const addToServer = async (item: T): Promise<void> => {
    // @ts-ignore
    const API_URL = import.meta.env.VITE_API_URL || "";
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });
    
    if (!response.ok) {
      throw new Error(`Erro ao adicionar no servidor: ${response.statusText}`);
    }
  };

  const updateOnServer = async (id: number, updates: Partial<T>): Promise<void> => {
    // @ts-ignore
    const API_URL = import.meta.env.VITE_API_URL || "";
    const response = await fetch(`${API_URL}${endpoint}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    
    if (!response.ok) {
      throw new Error(`Erro ao atualizar no servidor: ${response.statusText}`);
    }
  };

  const deleteFromServer = async (id: number): Promise<void> => {
    // @ts-ignore
    const API_URL = import.meta.env.VITE_API_URL || "";
    const response = await fetch(`${API_URL}${endpoint}/${id}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      throw new Error(`Erro ao deletar no servidor: ${response.statusText}`);
    }
  };

  return {
    data,
    loading,
    error,
    addItem,
    updateItem,
    deleteItem,
    refreshData
  };
}; 