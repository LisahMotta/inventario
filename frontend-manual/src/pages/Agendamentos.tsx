import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";

interface Agendamento {
  id: number;
  equipamento_id: number;
  data_inicio: string;
  data_fim: string;
  status: string;
  observacoes?: string;
  turma?: string;
  turno?: string;
  aula?: string;
}

const turnos = ["Manhã", "Tarde", "Noite"];
// Definir turmas para cada período conforme solicitado
const turmasManha = [
  "6º Ano A", "6º Ano B",
  "7º Ano A", "7º Ano B",
  "8º Ano A", "8º Ano B", "8º Ano C",
  "9º Ano A", "9º Ano B", "9º Ano C",
  "1ª série A", "1ª série B"
];
const turmasTarde = [
  "1º Ano A", "1º Ano B", "1º Ano C",
  "2º Ano A", "2º Ano B", "2º Ano C",
  "3º Ano A", "3º Ano B",
  "4º Ano A", "4º Ano B",
  "5º Ano A", "5º Ano B"
];
const turmasNoite = [
  "1ª série C", "1ª série D",
  "2ª série", "3ª série"
];

// Atualizar lista de turmas para seleção
const turmas = [
  ...turmasManha,
  ...turmasTarde,
  ...turmasNoite
];

const horariosAulas: Record<string, { label: string; inicio: string; fim: string; intervalo?: boolean }[]> = {
  "Manhã": [
    { label: "1ª Aula", inicio: "07:00", fim: "07:50" },
    { label: "2ª Aula", inicio: "07:50", fim: "08:40" },
    { label: "3ª Aula", inicio: "08:40", fim: "09:30" },
    { label: "Intervalo", inicio: "09:30", fim: "09:50", intervalo: true },
    { label: "4ª Aula", inicio: "09:50", fim: "10:40" },
    { label: "5ª Aula", inicio: "10:40", fim: "11:30" },
    { label: "6ª Aula", inicio: "11:30", fim: "12:20" },
  ],
  "Tarde": [
    { label: "1ª Aula", inicio: "13:00", fim: "13:50" },
    { label: "2ª Aula", inicio: "13:50", fim: "14:40" },
    { label: "Intervalo 4º/5º", inicio: "14:40", fim: "15:00", intervalo: true },
    { label: "3ª Aula", inicio: "15:00", fim: "15:50" },
    { label: "Intervalo 1º/2º/3º", inicio: "15:30", fim: "15:50", intervalo: true },
    { label: "4ª Aula", inicio: "15:50", fim: "16:40" },
    { label: "5ª Aula", inicio: "16:40", fim: "17:30" },
    { label: "6ª Aula", inicio: "17:30", fim: "18:20" },
  ],
  "Noite": [
    { label: "1ª Aula", inicio: "18:50", fim: "19:35" },
    { label: "2ª Aula", inicio: "19:35", fim: "20:20" },
    { label: "Intervalo", inicio: "20:20", fim: "20:35", intervalo: true },
    { label: "3ª Aula", inicio: "20:35", fim: "21:20" },
    { label: "4ª Aula", inicio: "21:20", fim: "22:05" },
    { label: "5ª Aula", inicio: "22:05", fim: "22:50" },
  ],
};

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

// Adicionar função para obter dias úteis (segunda a sexta) da semana atual
function getWeekdaysOfWeek(offset = 0) {
  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - today.getDay() + 1 + offset * 7);
  const days = [];
  for (let i = 0; i < 5; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    days.push(d);
  }
  return days;
}

const Agendamentos: React.FC = () => {
  const today = new Date();
  const [ano, setAno] = useState(today.getFullYear());
  const [mes, setMes] = useState(today.getMonth());
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [form, setForm] = useState({
    equipamento_id: 1,
    data: "",
    turno: "Manhã",
    turma: turmas[0],
    aula: "1ª Aula",
    status: "agendado",
    observacoes: "",
  });
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [filtroEquipamento, setFiltroEquipamento] = useState<string>("");
  const [busca, setBusca] = useState("");

  // Filtros avançados
  const [filtroDataInicio, setFiltroDataInicio] = useState("");
  const [filtroDataFim, setFiltroDataFim] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");
  const [filtroTurma, setFiltroTurma] = useState("");
  const [filtroTurno, setFiltroTurno] = useState("");

  // Adicionar estado para controlar a semana exibida
  const [semanaOffset, setSemanaOffset] = useState(0);

  const diasSemana = getWeekdaysOfWeek(semanaOffset);

  const fetchAgendamentos = async () => {
    const resp = await fetch("http://localhost:3000/agendamentos");
    const data = await resp.json();
    setAgendamentos(data);
  };

  useEffect(() => {
    fetchAgendamentos();
  }, [ano, mes]);

  const getAulasTurno = () => {
    if (form.turno === "Tarde") {
      if (["4º Ano", "5º Ano"].includes(form.turma)) {
        return horariosAulas["Tarde"].filter(a => a.label !== "Intervalo 1º/2º/3º");
      } else if (["1º Ano", "2º Ano", "3º Ano"].includes(form.turma)) {
        return horariosAulas["Tarde"].filter(a => a.label !== "Intervalo 4º/5º");
      }
    }
    return horariosAulas[form.turno];
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    let novoForm = { ...form, [name]: value };
    // Se mudar a turma para uma das do Ensino Médio, ajusta o turno automaticamente
    if (name === "turma") {
      if ([
        "6º Ano A", "6º Ano B",
        "7º Ano A", "7º Ano B",
        "8º Ano A", "8º Ano B", "8º Ano C",
        "9º Ano A", "9º Ano B", "9º Ano C",
        "1ª série A", "1ª série B"
      ].includes(value)) {
        novoForm.turno = "Manhã";
      } else if ([
        "1º Ano A", "1º Ano B", "1º Ano C",
        "2º Ano A", "2º Ano B", "2º Ano C",
        "3º Ano A", "3º Ano B",
        "4º Ano A", "4º Ano B",
        "5º Ano A", "5º Ano B"
      ].includes(value)) {
        novoForm.turno = "Tarde";
      } else if ([
        "1ª série C", "1ª série D",
        "2ª série", "3ª série"
      ].includes(value)) {
        novoForm.turno = "Noite";
      }
    }
    setForm(novoForm);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");
    setSucesso("");
    setLoading(true);
    try {
      const aulas = getAulasTurno().filter(a => !a.intervalo);
      const aulaSelecionada = aulas.find(a => a.label === form.aula);
      if (!aulaSelecionada) throw new Error("Aula inválida");
      const dataBase = `${ano}-${String(mes + 1).padStart(2, "0")}-${form.data}`;
      const data_inicio = `${dataBase}T${aulaSelecionada.inicio}:00.000Z`;
      const data_fim = `${dataBase}T${aulaSelecionada.fim}:00.000Z`;
      let resp;
      if (editId) {
        resp = await fetch(`http://localhost:3000/agendamentos/${editId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            equipamento_id: form.equipamento_id,
            data_inicio,
            data_fim,
            status: form.status,
            observacoes: form.observacoes,
            turma: form.turma,
            turno: form.turno,
            aula: form.aula,
          }),
        });
      } else {
        resp = await fetch("http://localhost:3000/agendamentos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            equipamento_id: form.equipamento_id,
            data_inicio,
            data_fim,
            status: form.status,
            observacoes: form.observacoes,
            turma: form.turma,
            turno: form.turno,
            aula: form.aula,
          }),
        });
      }
      if (resp.ok) {
        setSucesso(editId ? "Agendamento atualizado!" : "Agendamento cadastrado!");
        setForm({ ...form, data: "" });
        setEditId(null);
        fetchAgendamentos();
      } else {
        const data = await resp.json();
        setErro(data.erro || "Erro ao salvar agendamento");
      }
    } catch (err) {
      setErro("Erro ao conectar com o servidor");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (ag: Agendamento) => {
    const d = new Date(ag.data_inicio);
    setForm({
      equipamento_id: ag.equipamento_id,
      data: String(d.getDate()).padStart(2, "0"),
      turno: ag.turno || "Manhã",
      turma: ag.turma || turmas[0],
      aula: ag.aula || "1ª Aula",
      status: ag.status,
      observacoes: ag.observacoes || "",
    });
    setEditId(ag.id);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Deseja realmente excluir este agendamento?")) return;
    setLoading(true);
    setErro("");
    setSucesso("");
    try {
      const resp = await fetch(`http://localhost:3000/agendamentos/${id}`, { method: "DELETE" });
      if (resp.ok) {
        setSucesso("Agendamento excluído!");
        fetchAgendamentos();
      } else {
        setErro("Erro ao excluir agendamento");
      }
    } catch {
      setErro("Erro ao conectar com o servidor");
    } finally {
      setLoading(false);
    }
  };

  // Filtrar agendamentos do mês/ano atual e por equipamento
  const agendamentosMes = agendamentos.filter(a => {
    const d = new Date(a.data_inicio);
    const filtroEquip = filtroEquipamento.trim() ? a.equipamento_id === Number(filtroEquipamento) : true;
    return d.getFullYear() === ano && d.getMonth() === mes && filtroEquip;
  });

  // Função para exportar CSV
  const exportarCSV = () => {
    const header = [
      "ID", "Equipamento", "Início", "Fim", "Turma", "Turno", "Aula", "Status", "Observações"
    ];
    const rows = agendamentos.map(a => [
      a.id,
      a.equipamento_id,
      a.data_inicio,
      a.data_fim,
      a.turma,
      a.turno,
      a.aula,
      a.status,
      a.observacoes
    ]);
    const csv = [header, ...rows].map(r => r.map(v => `"${v ?? ''}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `agendamentos.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Função para exportar PDF
  const exportarPDF = () => {
    const doc = new jsPDF();
    doc.text("Relatório de Agendamentos", 14, 14);
    (doc as any).autoTable({
      head: [["ID", "Equipamento", "Início", "Fim", "Turma", "Turno", "Aula", "Status", "Observações"]],
      body: agendamentosFiltrados.map(a => [
        a.id,
        a.equipamento_id,
        a.data_inicio,
        a.data_fim,
        a.turma,
        a.turno,
        a.aula,
        a.status,
        a.observacoes
      ]),
      startY: 20
    });
    doc.save("agendamentos.pdf");
  };

  // Aplicar filtros
  const agendamentosFiltrados = agendamentos.filter(a => {
    const d = new Date(a.data_inicio);
    const buscaOk = !busca || [a.turma, a.turno, a.aula, a.status, a.observacoes, a.equipamento_id].some(v => v && String(v).toLowerCase().includes(busca.toLowerCase()));
    const dataOk = (!filtroDataInicio || d >= new Date(filtroDataInicio)) && (!filtroDataFim || d <= new Date(filtroDataFim));
    const statusOk = !filtroStatus || a.status === filtroStatus;
    const turmaOk = !filtroTurma || a.turma === filtroTurma;
    // Mostrar apenas agendamentos do turno selecionado no formulário
    const turnoOk = !form.turno || a.turno === form.turno;
    const filtroEquip = filtroEquipamento.trim() ? a.equipamento_id === Number(filtroEquipamento) : true;
    return buscaOk && dataOk && statusOk && turmaOk && turnoOk && filtroEquip;
  });

  return (
    <div style={{ maxWidth: 900, margin: "40px auto" }}>
      <h1 style={{ textAlign: 'center', color: '#fff', marginBottom: 24, textShadow: '0 2px 8px #000c', fontSize: 32, fontWeight: 800, letterSpacing: 1 }}>Agendamentos</h1>
      <div style={{ marginBottom: 8 }}>
        <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar (turma, turno, aula, status, observações, equipamento)" style={{ width: 300, marginRight: 8 }} />
      </div>
      <button onClick={exportarCSV} style={{ marginBottom: 8, marginRight: 8 }}>Exportar CSV</button>
      <button onClick={exportarPDF} style={{ marginBottom: 8 }}>Exportar PDF</button>
      <div style={{ marginBottom: 16 }}>
        <label style={{ color: '#fff', fontWeight: 600, textShadow: '0 1px 4px #000a' }}>Filtrar por equipamento: </label>
        <input type="number" value={filtroEquipamento} onChange={e => setFiltroEquipamento(e.target.value)} placeholder="ID do Equipamento" style={{ width: 120, marginRight: 16 }} />
        <label>Data início: </label>
        <input type="date" value={filtroDataInicio} onChange={e => setFiltroDataInicio(e.target.value)} style={{ marginRight: 8 }} />
        <label>Data fim: </label>
        <input type="date" value={filtroDataFim} onChange={e => setFiltroDataFim(e.target.value)} style={{ marginRight: 8 }} />
        <label>Status: </label>
        <select value={filtroStatus} onChange={e => setFiltroStatus(e.target.value)} style={{ marginRight: 8 }}>
          <option value="">Todos</option>
          <option value="agendado">Agendado</option>
          <option value="concluido">Concluído</option>
          <option value="cancelado">Cancelado</option>
        </select>
        <label>Turma: </label>
        <select value={filtroTurma} onChange={e => setFiltroTurma(e.target.value)} style={{ marginRight: 8 }}>
          <option value="">Todas</option>
          {turmas.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <label>Turno: </label>
        <select value={filtroTurno} onChange={e => setFiltroTurno(e.target.value)} style={{ marginRight: 8 }}>
          <option value="">Todos</option>
          {turnos.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      <form onSubmit={handleSubmit} style={{ marginBottom: 24, border: "1px solid #ccc", padding: 16, borderRadius: 8 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input
            name="equipamento_id"
            type="number"
            placeholder="ID do Equipamento"
            value={form.equipamento_id}
            onChange={handleChange}
            required
            style={{ flex: 1 }}
          />
          <select name="turma" value={form.turma} onChange={handleChange} style={{ flex: 1 }}>
            {turmas.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select name="turno" value={form.turno} onChange={handleChange} style={{ flex: 1 }}>
            {turnos.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select name="aula" value={form.aula} onChange={handleChange} style={{ flex: 1 }}>
            {getAulasTurno().filter(a => !a.intervalo).map(a => (
              <option key={a.label} value={a.label}>{a.label} ({a.inicio} - {a.fim})</option>
            ))}
          </select>
          <select name="data" value={form.data} onChange={handleChange} style={{ flex: 1 }} required>
            <option value="">Dia</option>
            {diasSemana.map(d => (
              <option key={d.getDate()} value={String(d.getDate()).padStart(2, "0")}>{d.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit' })}</option>
            ))}
          </select>
        </div>
        <textarea name="observacoes" placeholder="Observações" value={form.observacoes} onChange={handleChange} style={{ width: "100%", marginTop: 8 }} />
        <button type="submit" disabled={loading} style={{ marginTop: 8, background: '#2c5364', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 20px', fontWeight: 600, boxShadow: '0 2px 8px #0002', cursor: 'pointer', transition: 'background 0.2s' }}
          onMouseOver={e => e.currentTarget.style.background = '#395b7a'}
          onMouseOut={e => e.currentTarget.style.background = '#2c5364'}>
          {loading ? (editId ? "Salvando..." : "Agendando...") : (editId ? "Salvar edição" : "Agendar")}
        </button>
        {editId && (
          <button type="button" onClick={() => { setEditId(null); setForm({ ...form, data: "" }); }} style={{ marginLeft: 8 }}>
            Cancelar edição
          </button>
        )}
        {erro && <div style={{ color: "#fff", background: "#ff4d4f", padding: 8, borderRadius: 6, marginTop: 10, textAlign: 'center', fontWeight: 600, textShadow: '0 1px 4px #000a' }}>{erro}</div>}
        {sucesso && <div style={{ color: "#fff", background: "#52c41a", padding: 8, borderRadius: 6, marginTop: 10, textAlign: 'center', fontWeight: 600, textShadow: '0 1px 4px #000a' }}>{sucesso}</div>}
      </form>
      <div style={{ marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "center", gap: 16 }}>
        <button
          onClick={() => setSemanaOffset(s => s - 1)}
          style={{
            background: "#f0f4ff",
            border: "none",
            borderRadius: 20,
            padding: "8px 18px",
            fontSize: 18,
            boxShadow: "0 2px 8px #0001",
            cursor: "pointer",
            transition: "background 0.2s",
            color: "#2c5364"
          }}
          onMouseOver={e => e.currentTarget.style.background = "#dbeafe"}
          onMouseOut={e => e.currentTarget.style.background = "#f0f4ff"}
          title="Semana anterior"
        >
          &#8592; Semana anterior
        </button>
        <span style={{
          margin: "0 16px",
          fontWeight: 700,
          fontSize: 22,
          color: "#fff",
          letterSpacing: 1,
          textShadow: '0 2px 8px #0008'
        }}>
          {diasSemana[0].toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} - {diasSemana[4].toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
        </span>
        <button
          onClick={() => setSemanaOffset(s => s + 1)}
          style={{
            background: "#f0f4ff",
            border: "none",
            borderRadius: 20,
            padding: "8px 18px",
            fontSize: 18,
            boxShadow: "0 2px 8px #0001",
            cursor: "pointer",
            transition: "background 0.2s",
            color: "#2c5364"
          }}
          onMouseOver={e => e.currentTarget.style.background = "#dbeafe"}
          onMouseOut={e => e.currentTarget.style.background = "#f0f4ff"}
          title="Próxima semana"
        >
          Próxima semana &#8594;
        </button>
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: 'rgba(44,83,100,0.7)' }}>
            <th style={{ color: '#fff', fontWeight: 700, textShadow: '0 1px 4px #000a' }}>ID</th>
            <th style={{ color: '#fff', fontWeight: 700, textShadow: '0 1px 4px #000a' }}>Equipamento</th>
            <th style={{ color: '#fff', fontWeight: 700, textShadow: '0 1px 4px #000a' }}>Usuário</th>
            <th style={{ color: '#fff', fontWeight: 700, textShadow: '0 1px 4px #000a' }}>Data Empréstimo</th>
            <th style={{ color: '#fff', fontWeight: 700, textShadow: '0 1px 4px #000a' }}>Data Devolução</th>
            <th style={{ color: '#fff', fontWeight: 700, textShadow: '0 1px 4px #000a' }}>Status</th>
            <th style={{ color: '#fff', fontWeight: 700, textShadow: '0 1px 4px #000a' }}>Observações</th>
            <th style={{ color: '#fff', fontWeight: 700, textShadow: '0 1px 4px #000a' }}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: diasSemana.length }, (_, i) => {
            const dia = diasSemana[i].getDate();
            return (
              <tr key={dia}>
                <td>{diasSemana[i].toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit' })}</td>
                {turnos.map(turno => {
                  const aulas = horariosAulas[turno].filter(a => !a.intervalo);
                  return (
                    <td key={turno} style={{ minWidth: 180, border: "1px solid #eee", verticalAlign: "top" }}>
                      {aulas.map(aula => {
                        const ags = agendamentosFiltrados.filter(ag => {
                          const d = new Date(ag.data_inicio);
                          return d.getDate() === dia && ag.turno === turno && ag.aula === aula.label;
                        });
                        return (
                          <div key={aula.label} style={{ marginBottom: 4 }}>
                            <b>{aula.label} ({aula.inicio}-{aula.fim})</b><br />
                            {ags.length === 0 ? <span style={{ color: '#aaa' }}>Livre</span> : ags.map(ag => (
                              <div key={ag.id} style={{ background: '#f5f5f5', margin: 2, padding: 2, borderRadius: 4 }}>
                                <b>{ag.turma}</b><br />Equip: {ag.equipamento_id}<br />{ag.observacoes}<br />
                                <button onClick={() => handleEdit(ag)} style={{ marginRight: 4 }}>Editar</button>
                                <button onClick={() => handleDelete(ag.id)} style={{ color: 'red' }}>Excluir</button>
                              </div>
                            ))}
                          </div>
                        );
                      })}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default Agendamentos; 