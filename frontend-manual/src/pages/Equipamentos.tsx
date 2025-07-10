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
    <div style={{ maxWidth: 700, margin: "40px auto" }}>
      <h2>Equipamentos</h2>
      <div style={{ marginBottom: 16 }}>
        <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar (tipo, marca, modelo, tombo, status, observações)" style={{ width: 300, marginRight: 8 }} />
        <label>Status: </label>
        <select value={filtroStatus} onChange={e => setFiltroStatus(e.target.value)} style={{ marginRight: 8 }}>
          <option value="">Todos</option>
          <option value="disponível">Disponível</option>
          <option value="emprestado">Emprestado</option>
          <option value="manutenção">Manutenção</option>
        </select>
        <label>Tipo: </label>
        <input value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)} placeholder="Tipo" style={{ width: 100, marginRight: 8 }} />
        <label>Marca: </label>
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
            <th>Tipo</th>
            <th>Marca</th>
            <th>Modelo</th>
            <th>Tombo</th>
            <th>Status</th>
            <th>Observações</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {equipamentosFiltrados.map(eq => (
            <tr key={eq.id}>
              <td>{eq.id}</td>
              <td>{eq.tipo}</td>
              <td>{eq.marca}</td>
              <td>{eq.modelo}</td>
              <td>{eq.tombo}</td>
              <td>{eq.status}</td>
              <td>{eq.observacoes}</td>
              <td>
                <button onClick={() => setDetalheId(eq.id)}>Ver histórico</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Equipamentos; 