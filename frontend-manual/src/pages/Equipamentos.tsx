import React, { useEffect, useState } from "react";
import EquipamentoDetalhe from "./EquipamentoDetalhe";

interface Equipamento {
  id: number;
  tipo: string;
  marca: string;
  modelo: string;
  tombo: string;
  status: string;
  observacoes?: string;
}

const Equipamentos: React.FC = () => {
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
  const [form, setForm] = useState<Omit<Equipamento, "id">>({
    tipo: "",
    marca: "",
    modelo: "",
    tombo: "",
    status: "disponível",
    observacoes: "",
  });
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [loading, setLoading] = useState(false);
  const [detalheId, setDetalheId] = useState<number | null>(null);
  // Filtros
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroMarca, setFiltroMarca] = useState("");

  const fetchEquipamentos = async () => {
    const resp = await fetch("http://localhost:3000/equipamentos");
    const data = await resp.json();
    setEquipamentos(data);
  };

  useEffect(() => {
    fetchEquipamentos();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");
    setSucesso("");
    setLoading(true);
    try {
      const resp = await fetch("http://localhost:3000/equipamentos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (resp.ok) {
        setSucesso("Equipamento cadastrado!");
        setForm({ tipo: "", marca: "", modelo: "", tombo: "", status: "disponível", observacoes: "" });
        fetchEquipamentos();
      } else {
        const data = await resp.json();
        setErro(data.erro || "Erro ao cadastrar equipamento");
      }
    } catch (err) {
      setErro("Erro ao conectar com o servidor");
    } finally {
      setLoading(false);
    }
  };

  if (detalheId !== null) {
    return <EquipamentoDetalhe equipamentoId={detalheId} onVoltar={() => setDetalheId(null)} />;
  }

  // Filtro avançado
  const equipamentosFiltrados = equipamentos.filter(eq => {
    const buscaOk = !busca || [eq.tipo, eq.marca, eq.modelo, eq.tombo, eq.status, eq.observacoes].some(v => v && v.toLowerCase().includes(busca.toLowerCase()));
    const statusOk = !filtroStatus || eq.status === filtroStatus;
    const tipoOk = !filtroTipo || eq.tipo.toLowerCase().includes(filtroTipo.toLowerCase());
    const marcaOk = !filtroMarca || eq.marca.toLowerCase().includes(filtroMarca.toLowerCase());
    return buscaOk && statusOk && tipoOk && marcaOk;
  });

  return (
    <div style={{ maxWidth: 900, margin: "40px auto" }}>
      <h1 style={{ textAlign: 'center', color: '#fff', marginBottom: 24, textShadow: '0 2px 8px #000c', fontSize: 32, fontWeight: 800, letterSpacing: 1 }}>Equipamentos</h1>
      <div style={{ marginBottom: 16 }}>
        <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar (tipo, marca, modelo, tombo, status, observações)" style={{ width: 300, marginRight: 8 }} />
        <label style={{ color: '#fff', fontWeight: 'bold' }}>Status: </label>
        <select value={filtroStatus} onChange={e => setFiltroStatus(e.target.value)} style={{ marginRight: 8 }}>
          <option value="">Todos</option>
          <option value="disponível">Disponível</option>
          <option value="emprestado">Emprestado</option>
          <option value="manutenção">Manutenção</option>
        </select>
        <label style={{ color: '#fff', fontWeight: 'bold' }}>Tipo: </label>
        <input value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)} placeholder="Tipo" style={{ width: 100, marginRight: 8 }} />
        <label style={{ color: '#fff', fontWeight: 'bold' }}>Marca: </label>
        <input value={filtroMarca} onChange={e => setFiltroMarca(e.target.value)} placeholder="Marca" style={{ width: 100 }} />
      </div>
      <form onSubmit={handleSubmit} style={{ marginBottom: 24, border: "1px solid #ccc", padding: 16, borderRadius: 8 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input name="tipo" placeholder="Tipo" value={form.tipo} onChange={handleChange} required style={{ flex: 1 }} />
          <input name="marca" placeholder="Marca" value={form.marca} onChange={handleChange} required style={{ flex: 1 }} />
          <input name="modelo" placeholder="Modelo" value={form.modelo} onChange={handleChange} required style={{ flex: 1 }} />
          <input name="tombo" placeholder="Tombo" value={form.tombo} onChange={handleChange} required style={{ flex: 1 }} />
          <select name="status" value={form.status} onChange={handleChange} style={{ flex: 1 }}>
            <option value="disponível">Disponível</option>
            <option value="emprestado">Emprestado</option>
            <option value="manutenção">Manutenção</option>
          </select>
        </div>
        <textarea name="observacoes" placeholder="Observações" value={form.observacoes} onChange={handleChange} style={{ width: "100%", marginTop: 8 }} />
        <button type="submit" disabled={loading} style={{ marginTop: 8, backgroundColor: '#007bff', color: '#fff', padding: '8px 15px', borderRadius: 5, border: 'none', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
          {loading ? "Salvando..." : "Cadastrar"}
        </button>
        {erro && <div style={{ color: "red", marginTop: 10, fontWeight: 'bold', textShadow: '0 1px 2px #000' }}>{erro}</div>}
        {sucesso && <div style={{ color: "green", marginTop: 10, fontWeight: 'bold', textShadow: '0 1px 2px #000' }}>{sucesso}</div>}
      </form>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ color: '#fff', fontWeight: 'bold' }}>ID</th>
            <th style={{ color: '#fff', fontWeight: 'bold' }}>Tipo</th>
            <th style={{ color: '#fff', fontWeight: 'bold' }}>Marca</th>
            <th style={{ color: '#fff', fontWeight: 'bold' }}>Modelo</th>
            <th style={{ color: '#fff', fontWeight: 'bold' }}>Tombo</th>
            <th style={{ color: '#fff', fontWeight: 'bold' }}>Status</th>
            <th style={{ color: '#fff', fontWeight: 'bold' }}>Observações</th>
            <th style={{ color: '#fff', fontWeight: 'bold' }}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {equipamentosFiltrados.map(eq => (
            <tr key={eq.id}>
              <td style={{ color: '#fff' }}>{eq.id}</td>
              <td style={{ color: '#fff' }}>{eq.tipo}</td>
              <td style={{ color: '#fff' }}>{eq.marca}</td>
              <td style={{ color: '#fff' }}>{eq.modelo}</td>
              <td style={{ color: '#fff' }}>{eq.tombo}</td>
              <td style={{ color: '#fff' }}>{eq.status}</td>
              <td style={{ color: '#fff' }}>{eq.observacoes}</td>
              <td>
                <button onClick={() => setDetalheId(eq.id)} style={{ backgroundColor: '#6c757d', color: '#fff', padding: '8px 15px', borderRadius: 5, border: 'none', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(0,0,0,0.2)', transition: 'background-color 0.3s ease, box-shadow 0.3s ease' }}>
                  Ver histórico
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Equipamentos; 