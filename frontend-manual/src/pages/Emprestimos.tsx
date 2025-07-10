import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";

interface Emprestimo {
  id: number;
  equipamento_id: number;
  usuario_id: number;
  data_emprestimo: string;
  data_devolucao?: string;
  status: string;
  observacoes?: string;
}

const Emprestimos: React.FC = () => {
  const [emprestimos, setEmprestimos] = useState<Emprestimo[]>([]);
  const [form, setForm] = useState({
    equipamento_id: 1,
    usuario_id: 1,
    data_emprestimo: new Date().toISOString().slice(0, 16),
    observacoes: "",
  });
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [loading, setLoading] = useState(false);

  // Filtros avançados
  const [filtroStatus, setFiltroStatus] = useState("");
  const [filtroEquipamento, setFiltroEquipamento] = useState("");
  const [filtroUsuario, setFiltroUsuario] = useState("");
  const [filtroDataInicio, setFiltroDataInicio] = useState("");
  const [filtroDataFim, setFiltroDataFim] = useState("");

  const fetchEmprestimos = async () => {
    const resp = await fetch("http://localhost:3000/emprestimos");
    const data = await resp.json();
    setEmprestimos(data);
  };

  useEffect(() => {
    fetchEmprestimos();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");
    setSucesso("");
    setLoading(true);
    try {
      const resp = await fetch("http://localhost:3000/emprestimos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          data_emprestimo: new Date(form.data_emprestimo).toISOString(),
        }),
      });
      if (resp.ok) {
        setSucesso("Empréstimo registrado!");
        setForm({ equipamento_id: 1, usuario_id: 1, data_emprestimo: new Date().toISOString().slice(0, 16), observacoes: "" });
        fetchEmprestimos();
      } else {
        const data = await resp.json();
        setErro(data.erro || "Erro ao registrar empréstimo");
      }
    } catch (err) {
      setErro("Erro ao conectar com o servidor");
    } finally {
      setLoading(false);
    }
  };

  const handleDevolver = async (id: number) => {
    if (!window.confirm("Confirmar devolução?")) return;
    setLoading(true);
    setErro("");
    setSucesso("");
    try {
      const resp = await fetch(`http://localhost:3000/emprestimos/${id}/devolver`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data_devolucao: new Date().toISOString() }),
      });
      if (resp.ok) {
        setSucesso("Devolução registrada!");
        fetchEmprestimos();
      } else {
        setErro("Erro ao registrar devolução");
      }
    } catch {
      setErro("Erro ao conectar com o servidor");
    } finally {
      setLoading(false);
    }
  };

  // Função para exportar CSV
  const exportarCSV = () => {
    const header = [
      "ID", "Equipamento", "Usuário", "Data Empréstimo", "Data Devolução", "Status", "Observações"
    ];
    const rows = emprestimos.map(e => [
      e.id,
      e.equipamento_id,
      e.usuario_id,
      e.data_emprestimo,
      e.data_devolucao,
      e.status,
      e.observacoes
    ]);
    const csv = [header, ...rows].map(r => r.map(v => `"${v ?? ''}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `emprestimos.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Função para exportar PDF
  const exportarPDF = () => {
    const doc = new jsPDF();
    doc.text("Relatório de Empréstimos", 14, 14);
    (doc as any).autoTable({
      head: [["ID", "Equipamento", "Usuário", "Data Empréstimo", "Data Devolução", "Status", "Observações"]],
      body: emprestimosFiltrados.map(e => [
        e.id,
        e.equipamento_id,
        e.usuario_id,
        e.data_emprestimo,
        e.data_devolucao,
        e.status,
        e.observacoes
      ]),
      startY: 20
    });
    doc.save("emprestimos.pdf");
  };

  // Aplicar filtros
  const emprestimosFiltrados = emprestimos.filter(e => {
    const statusOk = !filtroStatus || e.status === filtroStatus;
    const equipOk = !filtroEquipamento || e.equipamento_id === Number(filtroEquipamento);
    const usuarioOk = !filtroUsuario || e.usuario_id === Number(filtroUsuario);
    const d = new Date(e.data_emprestimo);
    const dataOk = (!filtroDataInicio || d >= new Date(filtroDataInicio)) && (!filtroDataFim || d <= new Date(filtroDataFim));
    return statusOk && equipOk && usuarioOk && dataOk;
  });

  return (
    <div style={{ maxWidth: 800, margin: "40px auto" }}>
      <h2>Empréstimos de Equipamentos</h2>
      <button onClick={exportarCSV} style={{ marginBottom: 8, marginRight: 8 }}>Exportar CSV</button>
      <button onClick={exportarPDF} style={{ marginBottom: 8 }}>Exportar PDF</button>
      <div style={{ marginBottom: 16 }}>
        <label>Status: </label>
        <select value={filtroStatus} onChange={e => setFiltroStatus(e.target.value)} style={{ marginRight: 8 }}>
          <option value="">Todos</option>
          <option value="emprestado">Emprestado</option>
          <option value="devolvido">Devolvido</option>
        </select>
        <label>Equipamento: </label>
        <input type="number" value={filtroEquipamento} onChange={e => setFiltroEquipamento(e.target.value)} placeholder="ID do Equipamento" style={{ width: 120, marginRight: 8 }} />
        <label>Usuário: </label>
        <input type="number" value={filtroUsuario} onChange={e => setFiltroUsuario(e.target.value)} placeholder="ID do Usuário" style={{ width: 120, marginRight: 8 }} />
        <label>Data início: </label>
        <input type="date" value={filtroDataInicio} onChange={e => setFiltroDataInicio(e.target.value)} style={{ marginRight: 8 }} />
        <label>Data fim: </label>
        <input type="date" value={filtroDataFim} onChange={e => setFiltroDataFim(e.target.value)} style={{ marginRight: 8 }} />
      </div>
      <form onSubmit={handleSubmit} style={{ marginBottom: 24, border: "1px solid #ccc", padding: 16, borderRadius: 8 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input name="equipamento_id" type="number" placeholder="ID do Equipamento" value={form.equipamento_id} onChange={handleChange} required style={{ flex: 1 }} />
          <input name="usuario_id" type="number" placeholder="ID do Usuário" value={form.usuario_id} onChange={handleChange} required style={{ flex: 1 }} />
          <input name="data_emprestimo" type="datetime-local" value={form.data_emprestimo} onChange={handleChange} required style={{ flex: 1 }} />
        </div>
        <textarea name="observacoes" placeholder="Observações" value={form.observacoes} onChange={handleChange} style={{ width: "100%", marginTop: 8 }} />
        <button type="submit" disabled={loading} style={{ marginTop: 8 }}>
          {loading ? "Salvando..." : "Registrar Empréstimo"}
        </button>
        {erro && <div style={{ color: "red", marginTop: 10 }}>{erro}</div>}
        {sucesso && <div style={{ color: "green", marginTop: 10 }}>{sucesso}</div>}
      </form>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Equipamento</th>
            <th>Usuário</th>
            <th>Data Empréstimo</th>
            <th>Data Devolução</th>
            <th>Status</th>
            <th>Observações</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {emprestimosFiltrados.map(e => (
            <tr key={e.id}>
              <td>{e.id}</td>
              <td>{e.equipamento_id}</td>
              <td>{e.usuario_id}</td>
              <td>{e.data_emprestimo ? new Date(e.data_emprestimo).toLocaleString() : ""}</td>
              <td>{e.data_devolucao ? new Date(e.data_devolucao).toLocaleString() : ""}</td>
              <td>{e.status}</td>
              <td>{e.observacoes}</td>
              <td>
                {e.status === "emprestado" && (
                  <button onClick={() => handleDevolver(e.id)} style={{ color: "green" }}>Registrar Devolução</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Emprestimos; 