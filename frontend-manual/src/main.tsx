import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./AuthContext";
import "./index.css";

console.log('Main.tsx carregando...');

// Registrar service worker para funcionalidade offline
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('Service Worker registrado com sucesso:', registration);
      })
      .catch((error) => {
        console.log('Falha ao registrar Service Worker:', error);
      });
  });
}

try {
  const root = document.getElementById("root");
  console.log('Root element:', root);
  
  if (root) {
    ReactDOM.createRoot(root).render(
      <React.StrictMode>
        <AuthProvider>
          <App />
        </AuthProvider>
      </React.StrictMode>
    );
    console.log('App renderizado com sucesso');
  } else {
    console.error('Elemento root não encontrado');
  }
} catch (error) {
  console.error('Erro ao renderizar app:', error);
} 