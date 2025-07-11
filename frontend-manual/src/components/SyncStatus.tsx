import React from 'react';
import { useSync } from '../contexts/SyncContext';

const SyncStatus: React.FC = () => {
  const { 
    isOnline, 
    isInstalled, 
    pendingSync, 
    syncData, 
    installApp, 
    showInstallPrompt, 
    setShowInstallPrompt 
  } = useSync();

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {/* Status de conexão */}
      <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg shadow-lg ${
        isOnline ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
      }`}>
        <div className={`w-2 h-2 rounded-full ${
          isOnline ? 'bg-white' : 'bg-white animate-pulse'
        }`} />
        <span className="text-sm font-medium">
          {isOnline ? 'Online' : 'Offline'}
        </span>
      </div>

      {/* Botão de instalação */}
      {showInstallPrompt && !isInstalled && (
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-4 rounded-lg shadow-xl max-w-sm border-2 border-white/20">
          <div className="text-center">
            <div className="text-2xl mb-2">📱</div>
            <h4 className="font-bold text-lg mb-1">Instalar App</h4>
            <p className="text-sm opacity-90 mb-4">Trabalhe offline com o app instalado no seu dispositivo</p>
            <div className="flex space-x-3 justify-center">
              <button
                onClick={installApp}
                className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition shadow-md"
              >
                Instalar Agora
              </button>
              <button
                onClick={() => setShowInstallPrompt(false)}
                className="text-white opacity-70 hover:opacity-100 text-sm px-3 py-2"
              >
                Depois
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status de sincronização */}
      {pendingSync > 0 && (
        <div className="bg-yellow-500 text-white px-4 py-3 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              <span className="text-sm font-medium">
                {pendingSync} item(s) pendente(s)
              </span>
            </div>
            <button
              onClick={syncData}
              className="bg-white text-yellow-500 px-2 py-1 rounded text-xs font-medium hover:bg-gray-100 transition"
            >
              Sincronizar
            </button>
          </div>
        </div>
      )}

      {/* Indicador de app instalado */}
      {isInstalled && (
        <div className="bg-purple-500 text-white px-3 py-2 rounded-lg shadow-lg">
          <div className="flex items-center space-x-2">
            <span className="text-sm">📱</span>
            <span className="text-sm font-medium">App Instalado</span>
          </div>
        </div>
      )}

      {/* Botão de sincronização manual */}
      {isOnline && (
        <button
          onClick={syncData}
          className="bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-gray-700 transition flex items-center space-x-2"
        >
          <span className="text-sm">🔄</span>
          <span className="text-sm font-medium">Sincronizar</span>
        </button>
      )}

      {/* Botão para forçar instalação (apenas para debug) */}
      {!isInstalled && !showInstallPrompt && (
        <button
          onClick={() => setShowInstallPrompt(true)}
          className="bg-orange-500 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-orange-600 transition flex items-center space-x-2"
        >
          <span className="text-sm">📱</span>
          <span className="text-sm font-medium">Instalar App</span>
        </button>
      )}
    </div>
  );
};

export default SyncStatus; 