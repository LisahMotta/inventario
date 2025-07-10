import React, { useEffect, useState } from "react";

interface Usuario {
  id: number;
  nome: string;
  tipo: string;
}

const tipos = [
  "professor",
  "coordenador pedagógico",
  "proati",
  "vice diretor",
  "administrador"
];

const Usuarios: React.FC = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [form, setForm] = useState({
    nome: "",
    senha: "",
    tipo: "professor",
  });
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchUsuarios = async () => {
    const resp = await fetch("http://localhost:3000/usuarios");
    if (resp.ok) {
      const data = await resp.json();
      setUsuarios(data);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");
    setSucesso("");
    setLoading(true);
    try {
      const resp = await fetch("http://localhost:3000/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (resp.ok) {
        setSucesso("Usuário cadastrado!");
        setForm({ nome: "", senha: "", tipo: "professor" });
        fetchUsuarios();
      } else {
        const data = await resp.json();
        setErro(data.erro || "Erro ao cadastrar usuário");
      }
    } catch (err) {
      setErro("Erro ao conectar com o servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "40px auto" }}>
      <h2>Usuários</h2>
      <form onSubmit={handleSubmit} style={{ marginBottom: 24, border: "1px solid #ccc", padding: 16, borderRadius: 8 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input name="nome" placeholder="Nome" value={form.nome} onChange={handleChange} required style={{ flex: 1 }} />
          <input name="senha" type="password" placeholder="Senha" value={form.senha} onChange={handleChange} required style={{ flex: 1 }} />
          <select name="tipo" value={form.tipo} onChange={handleChange} style={{ flex: 1 }}>
            {tipos.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <button type="submit" disabled={loading} style={{ marginTop: 8 }}>
          {loading ? "Salvando..." : "Cadastrar"}
        </button>
        {erro && <div style={{ color: "red", marginTop: 10 }}>{erro}</div>}
        {sucesso && <div style={{ color: "green", marginTop: 10 }}>{sucesso}</div>}
      </form>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>Tipo</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map(u => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>{u.nome}</td>
              <td>{["administrador", "proati", "vice diretor"].includes(u.tipo) ? (
                <b style={{ color: "green" }}>Administrador</b>
              ) : (
                u.tipo
              )}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Usuarios; 