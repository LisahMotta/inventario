import React from "react";
import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";
import Login from "./pages/Login";
import Equipamentos from "./pages/Equipamentos";
import Agendamentos from "./pages/Agendamentos";
import Manutencoes from "./pages/Manutencoes";
import Usuarios from "./pages/Usuarios";
import Dashboard from "./pages/Dashboard";
import Emprestimos from "./pages/Emprestimos";
import EquipamentoLeitorQR from "./pages/EquipamentoLeitorQR";
import EquipamentoDetalhe from "./pages/EquipamentoDetalhe";
import { useAuth } from "./AuthContext";
import { SyncProvider } from "./contexts/SyncContext";
import SyncStatus from "./components/SyncStatus";

const App: React.FC = () => {
  const { usuario, logout } = useAuth();
  const isAdmin = usuario && ["administrador", "proati", "vice diretor"].includes(usuario.tipo);
  const podeAgendar = usuario && ["professor", "coordenador pedagógico", "proati", "vice diretor", "administrador"].includes(usuario.tipo);
  const podeEmprestar = usuario && ["proati", "vice diretor", "administrador", "professor", "coordenador pedagógico"].includes(usuario.tipo);

  if (!usuario) {
    return (
      <div style={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, #0f2027cc 0%, #2c5364cc 100%), url('https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1500&q=80')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Login />
      </div>
    );
  }
  const navLinkStyle: React.CSSProperties = {
    color: '#ffffff',
    textDecoration: 'none',
    fontWeight: 600,
    padding: '6px 12px',
    borderRadius: '6px',
    transition: 'background-color 0.3s',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  };
  
  const navLinkHoverStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  };
  
  return (
    <SyncProvider>
      <BrowserRouter>
        <div style={{
          minHeight: '100vh',
          background: `linear-gradient(135deg, #0f2027cc 0%, #2c5364cc 100%), url('https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1500&q=80')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          justifyContent: 'flex-start'
        }}>
        <nav style={{
  display: 'flex',
  gap: 12,
  padding: '12px 24px',
  margin: '16px',
  background: 'rgba(0, 0, 0, 0.4)',
  borderRadius: '12px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
  backdropFilter: 'blur(8px)',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
}}>

  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
    <Link to="/dashboard" style={navLinkStyle}>Dashboard</Link>
    <Link to="/equipamentos" style={navLinkStyle}>Equipamentos</Link>
    {podeAgendar && <Link to="/agendamentos" style={navLinkStyle}>Agendamentos</Link>}
    {podeEmprestar && <Link to="/emprestimos" style={navLinkStyle}>Empréstimos</Link>}
    <Link to="/manutencoes" style={navLinkStyle}>Manutenções</Link>
    {isAdmin && <Link to="/usuarios" style={navLinkStyle}>Usuários</Link>}
    <Link to="/leitorqr" style={navLinkStyle}>Leitor QR</Link>
  </div>

  <button
    onClick={logout}
    style={{
      backgroundColor: '#ef4444',
      color: 'white',
      border: 'none',
      padding: '6px 12px',
      borderRadius: '8px',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'background 0.3s',
    }}
    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#b91c1c'}
    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}
  >
    Sair ({usuario.nome})
  </button>
</nav>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/equipamentos" element={<Equipamentos />} />
          <Route path="/equipamento/:id" element={<EquipamentoDetalhe />} />
          {podeAgendar && <Route path="/agendamentos" element={<Agendamentos />} />}
          <Route path="/manutencoes" element={<Manutencoes />} />
          {podeEmprestar && <Route path="/emprestimos" element={<Emprestimos />} />}
          {isAdmin && <Route path="/usuarios" element={<Usuarios />} />}
          <Route path="/leitorqr" element={<EquipamentoLeitorQR />} />
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
        <SyncStatus />
      </div>
      </BrowserRouter>
    </SyncProvider>
  );
};

export default App; 