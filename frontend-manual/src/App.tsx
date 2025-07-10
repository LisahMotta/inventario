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

  return (
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
        <nav style={{ display: 'flex', gap: 16, margin: 16 }}>
          <Link to="/dashboard" style={{ color: '#fff', textDecoration: 'none', fontWeight: 600 }}>Dashboard</Link>
          <button onClick={logout}>Sair ({usuario.nome})</button>
          <Link to="/equipamentos" style={{ color: '#fff', textDecoration: 'none', fontWeight: 600 }}>Equipamentos</Link>
          {podeAgendar && <Link to="/agendamentos" style={{ color: '#fff', textDecoration: 'none', fontWeight: 600 }}>Agendamentos</Link>}
          {podeEmprestar && <Link to="/emprestimos" style={{ color: '#fff', textDecoration: 'none', fontWeight: 600 }}>Empréstimos</Link>}
          <Link to="/manutencoes" style={{ color: '#fff', textDecoration: 'none', fontWeight: 600 }}>Manutenções</Link>
          {isAdmin && <Link to="/usuarios" style={{ color: '#fff', textDecoration: 'none', fontWeight: 600 }}>Usuários</Link>}
          <Link to="/leitorqr" style={{ color: '#fff', textDecoration: 'none', fontWeight: 600 }}>Leitor QR</Link>
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
      </div>
    </BrowserRouter>
  );
};

export default App; 