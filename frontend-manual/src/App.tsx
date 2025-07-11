import React from "react";
import { useAuth } from "./AuthContext";

const App: React.FC = () => {
  const { usuario } = useAuth();

  console.log('App carregando...', { usuario });

  if (!usuario) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f2027cc 0%, #2c5364cc 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '24px'
      }}>
        <div>
          <h1>Carregando...</h1>
          <p>Status: {usuario ? 'Logado' : 'Não logado'}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f2027cc 0%, #2c5364cc 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontSize: '24px'
    }}>
      <div>
        <h1>App Funcionando!</h1>
        <p>Usuário: {usuario.nome}</p>
        <p>Tipo: {usuario.tipo}</p>
      </div>
    </div>
  );
};

export default App; 