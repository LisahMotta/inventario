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
function getWeekdaysOfWeek(offset = 0): Date[] {
  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - today.getDay() + 1 + offset * 7);
  const days: Date[] = [];
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

  // @ts-ignore
  const API_URL = import.meta.env.VITE_API_URL || "";

  const fetchAgendamentos = async () => {
    const resp = await fetch(`${API_URL}/agendamentos`);
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
        resp = await fetch(`${API_URL}/agendamentos/${editId}`, {
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
        resp = await fetch(`${API_URL}/agendamentos`, {
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
        setSucesso(editId ? "Agendamento atualizado!" : "Agendamento criado!");
        setForm({
          equipamento_id: 1,
          data: "",
          turno: "Manhã",
          turma: turmas[0],
          aula: "1ª Aula",
          status: "agendado",
          observacoes: "",
        });
        setEditId(null);
        fetchAgendamentos();
      } else {
        const errorData = await resp.json();
        setErro(errorData.erro || "Erro ao salvar agendamento");
      }
    } catch (error) {
      setErro("Erro ao salvar agendamento");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (ag: Agendamento) => {
    setEditId(ag.id);
    const data = new Date(ag.data_inicio);
    setForm({
      equipamento_id: ag.equipamento_id,
      data: String(data.getDate()).padStart(2, "0"),
      turno: ag.turno || "Manhã",
      turma: ag.turma || turmas[0],
      aula: ag.aula || "1ª Aula",
      status: ag.status,
      observacoes: ag.observacoes || "",
    });
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este agendamento?")) return;
    setSucesso("");
    try {
      const resp = await fetch(`${API_URL}/agendamentos/${id}`, { method: "DELETE" });
      if (resp.ok) {
        setSucesso("Agendamento excluído!");
        fetchAgendamentos();
      } else {
        setErro("Erro ao excluir agendamento");
      }
    } catch (error) {
      setErro("Erro ao excluir agendamento");
    }
  };

  const exportarCSV = () => {
    const headers = ["ID", "Equipamento", "Data", "Turma", "Turno", "Aula", "Status", "Observações"];
    const csvContent = [
      headers.join(","),
      ...agendamentos.map(ag => [
        ag.id,
        ag.equipamento_id,
        new Date(ag.data_inicio).toLocaleDateString('pt-BR'),
        ag.turma || "",
        ag.turno || "",
        ag.aula || "",
        ag.status,
        ag.observacoes || ""
      ].join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "agendamentos.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportarPDF = () => {
    const doc = new jsPDF();
    const headers = [["ID", "Equipamento", "Data", "Turma", "Turno", "Aula", "Status"]];
    const data = agendamentos.map(ag => [
      ag.id,
      ag.equipamento_id,
      new Date(ag.data_inicio).toLocaleDateString('pt-BR'),
      ag.turma || "",
      ag.turno || "",
      ag.aula || "",
      ag.status
    ]);
    
    (doc as any).autoTable({
      head: headers,
      body: data,
      startY: 20,
      theme: 'grid'
    });
    
    doc.save("agendamentos.pdf");
  };

  const agendamentosFiltrados = agendamentos.filter(ag => {
    const matchBusca = !busca || 
      (ag.turma && ag.turma.toLowerCase().includes(busca.toLowerCase())) ||
      (ag.turno && ag.turno.toLowerCase().includes(busca.toLowerCase())) ||
      (ag.aula && ag.aula.toLowerCase().includes(busca.toLowerCase()));
    
    const matchEquipamento = !filtroEquipamento || ag.equipamento_id.toString().includes(filtroEquipamento);
    const matchStatus = !filtroStatus || ag.status === filtroStatus;
    const matchTurma = !filtroTurma || ag.turma === filtroTurma;
    const matchTurno = !filtroTurno || ag.turno === filtroTurno;
    
    let matchData = true;
    if (filtroDataInicio || filtroDataFim) {
      const dataAgendamento = new Date(ag.data_inicio);
      if (filtroDataInicio) {
        const dataInicio = new Date(filtroDataInicio);
        matchData = matchData && dataAgendamento >= dataInicio;
      }
      if (filtroDataFim) {
        const dataFim = new Date(filtroDataFim);
        dataFim.setHours(23, 59, 59);
        matchData = matchData && dataAgendamento <= dataFim;
      }
    }
    
    return matchBusca && matchEquipamento && matchStatus && matchTurma && matchTurno && matchData;
  });

  return (
    <div className="max-w-6xl mx-auto mt-10">
      <h1 className="text-3xl font-extrabold text-white text-center mb-8 drop-shadow">
        Agendamentos
      </h1>

      <div className="mb-4">
        <input
          value={busca}
          onChange={e => setBusca(e.target.value)}
          placeholder="Buscar (turma, turno, aula...)"
          className="w-full md:w-96 p-2 border border-gray-300 rounded shadow-sm"
        />
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <button onClick={exportarCSV} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
          Exportar CSV
        </button>
        <button onClick={exportarPDF} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition">
          Exportar PDF
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md p-6 rounded-lg space-y-4 mb-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <input
            name="equipamento_id"
            type="number"
            placeholder="ID do Equipamento"
            value={form.equipamento_id}
            onChange={handleChange}
            required
            className="border border-gray-300 rounded p-2"
          />
          <select name="turma" value={form.turma} onChange={handleChange} className="border border-gray-300 rounded p-2">
            {turmas.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select name="turno" value={form.turno} onChange={handleChange} className="border border-gray-300 rounded p-2">
            {turnos.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select name="aula" value={form.aula} onChange={handleChange} className="border border-gray-300 rounded p-2">
            {getAulasTurno().filter(a => !a.intervalo).map(a => (
              <option key={a.label} value={a.label}>{a.label}</option>
            ))}
          </select>
          <select name="data" value={form.data} onChange={handleChange} className="border border-gray-300 rounded p-2">
            <option value="">Dia</option>
            {diasSemana.map(d => (
              <option key={d.getDate()} value={String(d.getDate()).padStart(2, "0")}>
                {d.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit' })}
              </option>
            ))}
          </select>
        </div>
        <textarea
          name="observacoes"
          placeholder="Observações"
          value={form.observacoes}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-sky-700 text-white px-6 py-2 rounded font-semibold hover:bg-sky-800 transition"
        >
          {loading ? (editId ? "Salvando..." : "Agendando...") : (editId ? "Salvar edição" : "Agendar")}
        </button>
        {editId && (
          <button
            type="button"
            onClick={() => { setEditId(null); setForm({ ...form, data: "" }); }}
            className="ml-4 text-sm text-red-600 hover:underline"
          >
            Cancelar edição
          </button>
        )}
        {erro && <div className="bg-red-500 text-white p-2 rounded mt-2 text-center font-semibold">{erro}</div>}
        {sucesso && <div className="bg-green-500 text-white p-2 rounded mt-2 text-center font-semibold">{sucesso}</div>}
      </form>

      {/* Filtros avançados */}
      <div className="bg-white shadow-md p-4 rounded-lg mb-6">
        <h3 className="text-lg font-semibold mb-3">Filtros Avançados</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Filtrar por equipamento"
            value={filtroEquipamento}
            onChange={e => setFiltroEquipamento(e.target.value)}
            className="border border-gray-300 rounded p-2"
          />
          <input
            type="date"
            placeholder="Data início"
            value={filtroDataInicio}
            onChange={e => setFiltroDataInicio(e.target.value)}
            className="border border-gray-300 rounded p-2"
          />
          <input
            type="date"
            placeholder="Data fim"
            value={filtroDataFim}
            onChange={e => setFiltroDataFim(e.target.value)}
            className="border border-gray-300 rounded p-2"
          />
          <select
            value={filtroStatus}
            onChange={e => setFiltroStatus(e.target.value)}
            className="border border-gray-300 rounded p-2"
          >
            <option value="">Todos os status</option>
            <option value="agendado">Agendado</option>
            <option value="cancelado">Cancelado</option>
            <option value="concluido">Concluído</option>
          </select>
          <select
            value={filtroTurma}
            onChange={e => setFiltroTurma(e.target.value)}
            className="border border-gray-300 rounded p-2"
          >
            <option value="">Todas as turmas</option>
            {turmas.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select
            value={filtroTurno}
            onChange={e => setFiltroTurno(e.target.value)}
            className="border border-gray-300 rounded p-2"
          >
            <option value="">Todos os turnos</option>
            {turnos.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      {/* Controles de semana */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => setSemanaOffset(semanaOffset - 1)}
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition"
        >
          Semana Anterior
        </button>
        <span className="text-white font-semibold">
          Semana de {diasSemana[0].toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} a {diasSemana[4].toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
        </span>
        <button
          onClick={() => setSemanaOffset(semanaOffset + 1)}
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition"
        >
          Próxima Semana
        </button>
      </div>

      {/* Tabela de agendamentos */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Equipamento</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Turma</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Turno</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aula</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {agendamentosFiltrados.map(agendamento => (
                <tr key={agendamento.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{agendamento.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{agendamento.equipamento_id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(agendamento.data_inicio).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{agendamento.turma || "-"}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{agendamento.turno || "-"}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{agendamento.aula || "-"}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      agendamento.status === 'agendado' ? 'bg-green-100 text-green-800' :
                      agendamento.status === 'cancelado' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {agendamento.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleEdit(agendamento)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(agendamento.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {agendamentosFiltrados.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500 text-lg">Nenhum agendamento encontrado</p>
        </div>
      )}
    </div>
  );
};

export default Agendamentos; 