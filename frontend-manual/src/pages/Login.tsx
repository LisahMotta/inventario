import React, { useState } from "react";
import { useAuth } from "../AuthContext";

const tiposUsuario = [
  { value: "professor", label: "Professor" },
  { value: "coordenador pedagógico", label: "Coordenador Pedagógico" },
  { value: "proati", label: "Proati" },
  { value: "vice diretor", label: "Vice Diretor" },
  { value: "administrador", label: "Administrador" },
];

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  // Cadastro
  const [cadastro, setCadastro] = useState(false);
  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState("");
  const [usuario, setUsuario] = useState(""); // Novo estado para nome ou email

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");
    setSucesso("");
    setLoading(true);
    try {
      // Envia como email se tiver @, senão como nome
      const payload = usuario.includes("@")
        ? { email: usuario, senha }
        : { nome: usuario, senha };
      const resp = await fetch("http://localhost:3000/usuarios/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await resp.json();
      if (resp.ok && data.token) {
        setSucesso("Login realizado com sucesso!");
        const payload = JSON.parse(atob(data.token.split(".")[1]));
        login({ id: payload.id, nome: payload.nome, tipo: payload.tipo || payload.permissao || "", token: data.token });
        localStorage.setItem("token", data.token);
      } else {
        setErro(data.erro || "Usuário ou senha inválidos");
      }
    } catch (err) {
      setErro("Erro ao conectar com o servidor");
    } finally {
      setLoading(false);
    }
  };

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");
    setSucesso("");
    setLoading(true);
    try {
      const resp = await fetch("http://localhost:3000/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, senha, tipo }),
      });
      const data = await resp.json();
      if (resp.ok) {
        setSucesso("Usuário cadastrado com sucesso! Faça login.");
        setCadastro(false);
        setNome("");
        setEmail("");
        setSenha("");
        setTipo("");
      } else {
        setErro(data.erro || "Erro ao cadastrar usuário");
      }
    } catch (err) {
      setErro("Erro ao conectar com o servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f2027 0%, #2c5364 100%)',
      backgroundImage: `url('https://www.transparenttextures.com/patterns/circuit-board.png'), linear-gradient(135deg, #0f2027 0%, #2c5364 100%)`,
      backgroundRepeat: 'repeat',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{ maxWidth: 400, width: '100%', margin: "40px auto", padding: 24, border: "1px solid #ccc", borderRadius: 8, background: 'rgba(255,255,255,0.95)', boxShadow: '0 8px 32px 0 rgba(31,38,135,0.37)' }}>
        {!cadastro ? (
          <>
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 12 }}>
                <label>Nome ou Email:</label>
                <input
                  type="text"
                  value={usuario}
                  onChange={e => setUsuario(e.target.value)}
                  required
                  placeholder="Digite seu nome ou email"
                  style={{ width: "100%", padding: 8 }}
                />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label>Senha:</label>
                <input
                  type="password"
                  value={senha}
                  onChange={e => setSenha(e.target.value)}
                  required
                  style={{ width: "100%", padding: 8 }}
                />
              </div>
              <button type="submit" disabled={loading} style={{ width: "100%", padding: 10 }}>
                {loading ? "Entrando..." : "Entrar"}
              </button>
              {erro && <div style={{ color: "red", marginTop: 10 }}>{erro}</div>}
              {sucesso && <div style={{ color: "green", marginTop: 10 }}>{sucesso}</div>}
            </form>
            <button style={{ width: "100%", marginTop: 16 }} onClick={() => { setCadastro(true); setErro(""); setSucesso(""); }}>
              Cadastrar Usuário
            </button>
          </>
        ) : (
          <>
            <h2>Cadastro de Usuário</h2>
            <form onSubmit={handleCadastro}>
              <div style={{ marginBottom: 12 }}>
                <label>Nome:</label>
                <input
                  type="text"
                  value={nome}
                  onChange={e => setNome(e.target.value)}
                  required
                  style={{ width: "100%", padding: 8 }}
                />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label>Senha:</label>
                <input
                  type="password"
                  value={senha}
                  onChange={e => setSenha(e.target.value)}
                  required
                  style={{ width: "100%", padding: 8 }}
                />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label>Tipo:</label>
                <select
                  value={tipo}
                  onChange={e => setTipo(e.target.value)}
                  required
                  style={{ width: "100%", padding: 8 }}
                >
                  <option value="">Selecione...</option>
                  {tiposUsuario.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <button type="submit" disabled={loading} style={{ width: "100%", padding: 10 }}>
                {loading ? "Cadastrando..." : "Cadastrar"}
              </button>
              {erro && <div style={{ color: "red", marginTop: 10 }}>{erro}</div>}
              {sucesso && <div style={{ color: "green", marginTop: 10 }}>{sucesso}</div>}
            </form>
            <button style={{ width: "100%", marginTop: 16 }} onClick={() => { setCadastro(false); setErro(""); setSucesso(""); }}>
              Voltar para Login
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Login; 