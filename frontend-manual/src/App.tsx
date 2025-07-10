import React, { useState } from "react";
import Login from "./pages/Login";
import Equipamentos from "./pages/Equipamentos";
import Agendamentos from "./pages/Agendamentos";
import Manutencoes from "./pages/Manutencoes";
import Usuarios from "./pages/Usuarios";
import Dashboard from "./pages/Dashboard";
import Emprestimos from "./pages/Emprestimos";
import EquipamentoLeitorQR from "./pages/EquipamentoLeitorQR";
import { useAuth } from "./AuthContext";

const App: React.FC = () => {
  const [page, setPage] = useState<'dashboard' | 'equipamentos' | 'agendamentos' | 'manutencoes' | 'usuarios' | 'emprestimos' | 'leitorqr'>('dashboard');
  const { usuario, logout } = useAuth();

  // Permissões
  const isAdmin = usuario && ["administrador", "proati", "vice diretor"].includes(usuario.tipo);
  const podeAgendar = usuario && ["professor", "coordenador pedagógico", "proati", "vice diretor", "administrador"].includes(usuario.tipo);
  const podeEmprestar = usuario && ["proati", "vice diretor", "administrador", "professor", "coordenador pedagógico"].includes(usuario.tipo);

  // Se não estiver logado, mostra só o Login
  if (!usuario) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f2027 0%, #2c5364 100%)',
        backgroundImage: `url('https://www.transparenttextures.com/patterns/circuit-board.png'), linear-gradient(135deg, #0f2027 0%, #2c5364 100%)`,
        backgroundRepeat: 'repeat',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Login />
      </div>
    );
  }

  // Se logado, mostra menu e páginas
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f2027 0%, #2c5364 100%)',
      backgroundImage: `url('https://www.transparenttextures.com/patterns/circuit-board.png'), linear-gradient(135deg, #0f2027 0%, #2c5364 100%)`,
      backgroundRepeat: 'repeat',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
      justifyContent: 'flex-start'
    }}>
      <nav style={{ display: 'flex', gap: 16, margin: 16 }}>
        <button onClick={() => setPage('dashboard')}>Dashboard</button>
        <button onClick={logout}>Sair ({usuario.nome})</button>
        <button onClick={() => setPage('equipamentos')}>Equipamentos</button>
        {podeAgendar && <button onClick={() => setPage('agendamentos')}>Agendamentos</button>}
        {podeEmprestar && <button onClick={() => setPage('emprestimos')}>Empréstimos</button>}
        <button onClick={() => setPage('manutencoes')}>Manutenções</button>
        {isAdmin && <button onClick={() => setPage('usuarios')}>Usuários</button>}
        <button onClick={() => setPage('leitorqr')}>Leitor QR</button>
      </nav>
      {page === 'dashboard' && <Dashboard />}
      {page === 'equipamentos' && <Equipamentos />}
      {page === 'agendamentos' && podeAgendar && <Agendamentos />}
      {page === 'manutencoes' && <Manutencoes />}
      {page === 'emprestimos' && podeEmprestar && <Emprestimos />}
      {page === 'usuarios' && isAdmin && <Usuarios />}
      {page === 'leitorqr' && <EquipamentoLeitorQR onEncontrar={id => setPage('equipamentos')} />}
    </div>
  );
};

export default App; 