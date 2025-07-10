import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";

interface Manutencao {
  id: number;
  equipamento_id: number;
  marca: string;
  modelo: string;
  quantidade: number;
  defeito: string;
  status: string;
  observacoes?: string;
}

const Manutencoes: React.FC = () => {
  const [manutencoes, setManutencoes] = useState<Manutencao[]>([]);
  const [form, setForm] = useState({
    equipamento_id: 1,
    marca: "",
    modelo: "",
    quantidade: 1,
    defeito: "",
    status: "pendente",
    observacoes: "",
  });
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [loading, setLoading] = useState(false);
  const [busca, setBusca] = useState("");

  // Filtros avançados
  const [filtroStatus, setFiltroStatus] = useState("");
  const [filtroDefeito, setFiltroDefeito] = useState("");
  const [filtroEquipamento, setFiltroEquipamento] = useState("");

  // @ts-ignore
  const API_URL = import.meta.env.VITE_API_URL || "";

  const fetchManutencoes = async () => {
    const resp = await fetch(`${API_URL}/manutencoes`);
    const data = await resp.json();
    setManutencoes(data);
  };

  useEffect(() => {
    fetchManutencoes();
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
      const resp = await fetch(`${API_URL}/manutencoes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (resp.ok) {
        setSucesso("Manutenção cadastrada!");
        setForm({ equipamento_id: 1, marca: "", modelo: "", quantidade: 1, defeito: "", status: "pendente", observacoes: "" });
        fetchManutencoes();
      } else {
        const data = await resp.json();
        setErro(data.erro || "Erro ao cadastrar manutenção");
      }
    } catch (err) {
      setErro("Erro ao conectar com o servidor");
    } finally {
      setLoading(false);
    }
  };

  // Função para exportar CSV
  const exportarCSV = () => {
    const header = [
      "ID", "Equipamento", "Marca", "Modelo", "Quantidade", "Defeito", "Status", "Observações"
    ];
    const rows = manutencoes.map(m => [
      m.id,
      m.equipamento_id,
      m.marca,
      m.modelo,
      m.quantidade,
      m.defeito,
      m.status,
      m.observacoes
    ]);
    const csv = [header, ...rows].map(r => r.map(v => `"${v ?? ''}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `manutencoes.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Função para exportar PDF
  const exportarPDF = () => {
    const doc = new jsPDF();
    doc.text("Relatório de Manutenções", 14, 14);
    (doc as any).autoTable({
      head: [["ID", "Equipamento", "Marca", "Modelo", "Quantidade", "Defeito", "Status", "Observações"]],
      body: manutencoesFiltradas.map(m => [
        m.id,
        m.equipamento_id,
        m.marca,
        m.modelo,
        m.quantidade,
        m.defeito,
        m.status,
        m.observacoes
      ]),
      startY: 20
    });
    doc.save("manutencoes.pdf");
  };

  // Aplicar filtros
  const manutencoesFiltradas = manutencoes.filter(m => {
    const buscaOk = !busca || [m.marca, m.modelo, m.defeito, m.status, m.observacoes, m.equipamento_id].some(v => v && String(v).toLowerCase().includes(busca.toLowerCase()));
    const statusOk = !filtroStatus || m.status === filtroStatus;
    const defeitoOk = !filtroDefeito || (m.defeito && m.defeito.toLowerCase().includes(filtroDefeito.toLowerCase()));
    const equipOk = !filtroEquipamento || m.equipamento_id === Number(filtroEquipamento);
    return buscaOk && statusOk && defeitoOk && equipOk;
  });

  return (
    <div style={{ maxWidth: 900, margin: "40px auto" }}>
      <h1 style={{ textAlign: 'center', color: '#fff', marginBottom: 24, textShadow: '0 2px 8px #000c', fontSize: 32, fontWeight: 800, letterSpacing: 1 }}>Manutenções</h1>
      <button onClick={exportarCSV} style={{ marginBottom: 8, marginRight: 8 }}>Exportar CSV</button>
      <button onClick={exportarPDF} style={{ marginBottom: 8 }}>Exportar PDF</button>
      <div style={{ marginBottom: 16 }}>
        <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar (marca, modelo, defeito, status, observações, equipamento)" style={{ width: 300, marginRight: 8 }} />
        <label style={{ color: '#fff', fontWeight: 'bold' }}>Status: </label>
        <select value={filtroStatus} onChange={e => setFiltroStatus(e.target.value)} style={{ marginRight: 8 }}>
          <option value="">Todos</option>
          <option value="pendente">Pendente</option>
          <option value="em andamento">Em andamento</option>
          <option value="concluída">Concluída</option>
        </select>
        <label style={{ color: '#fff', fontWeight: 'bold' }}>Defeito: </label>
        <input value={filtroDefeito} onChange={e => setFiltroDefeito(e.target.value)} placeholder="Buscar defeito" style={{ marginRight: 8 }} />
        <label style={{ color: '#fff', fontWeight: 'bold' }}>Equipamento: </label>
        <input type="number" value={filtroEquipamento} onChange={e => setFiltroEquipamento(e.target.value)} placeholder="ID do Equipamento" style={{ width: 120, marginRight: 8 }} />
      </div>
      <form onSubmit={handleSubmit} style={{ marginBottom: 24, border: "1px solid #ccc", padding: 16, borderRadius: 8 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input name="equipamento_id" type="number" placeholder="ID do Equipamento" value={form.equipamento_id} onChange={handleChange} required style={{ flex: 1 }} />
          <input name="marca" placeholder="Marca" value={form.marca} onChange={handleChange} required style={{ flex: 1 }} />
          <input name="modelo" placeholder="Modelo" value={form.modelo} onChange={handleChange} required style={{ flex: 1 }} />
          <input name="quantidade" type="number" min={1} placeholder="Quantidade" value={form.quantidade} onChange={handleChange} required style={{ flex: 1 }} />
        </div>
        <input name="defeito" placeholder="Defeito" value={form.defeito} onChange={handleChange} required style={{ width: "100%", marginTop: 8 }} />
        <select name="status" value={form.status} onChange={handleChange} style={{ width: "100%", marginTop: 8 }}>
          <option value="pendente">Pendente</option>
          <option value="em andamento">Em andamento</option>
          <option value="concluída">Concluída</option>
        </select>
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
            <th style={{ color: '#fff', fontWeight: 'bold' }}>ID</th>
            <th style={{ color: '#fff', fontWeight: 'bold' }}>Equipamento</th>
            <th style={{ color: '#fff', fontWeight: 'bold' }}>Marca</th>
            <th style={{ color: '#fff', fontWeight: 'bold' }}>Modelo</th>
            <th style={{ color: '#fff', fontWeight: 'bold' }}>Quantidade</th>
            <th style={{ color: '#fff', fontWeight: 'bold' }}>Defeito</th>
            <th style={{ color: '#fff', fontWeight: 'bold' }}>Status</th>
            <th style={{ color: '#fff', fontWeight: 'bold' }}>Observações</th>
          </tr>
        </thead>
        <tbody>
          {manutencoesFiltradas.map(m => (
            <tr key={m.id}>
              <td>{m.id}</td>
              <td>{m.equipamento_id}</td>
              <td>{m.marca}</td>
              <td>{m.modelo}</td>
              <td>{m.quantidade}</td>
              <td>{m.defeito}</td>
              <td>{m.status}</td>
              <td>{m.observacoes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Manutencoes; 