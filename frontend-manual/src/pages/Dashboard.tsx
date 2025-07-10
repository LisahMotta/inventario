import React, { useEffect, useState } from "react";
import { Pie, Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title);

interface Equipamento {
  id: number;
  status: string;
}
interface Agendamento {
  id: number;
  equipamento_id: number;
  data_inicio: string;
  status: string;
  turma?: string;
  turno?: string;
  aula?: string;
}
interface Emprestimo {
  id: number;
  equipamento_id: number;
  usuario_id: number;
  data_emprestimo: string;
  data_devolucao?: string;
  status: string;
}
interface Manutencao {
  id: number;
  equipamento_id: number;
  data_manutencao: string;
  status: string;
  descricao: string;
}

const Dashboard: React.FC = () => {
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [emprestimos, setEmprestimos] = useState<Emprestimo[]>([]);
  const [manutencoes, setManutencoes] = useState<Manutencao[]>([]);
  const [loading, setLoading] = useState(true);

  // @ts-ignore
  const API_URL = import.meta.env.VITE_API_URL || "";

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      const [eq, ag, em, mn] = await Promise.all([
        fetch(`${API_URL}/equipamentos`).then(r => r.json()),
        fetch(`${API_URL}/agendamentos`).then(r => r.json()),
        fetch(`${API_URL}/emprestimos`).then(r => r.json()),
        fetch(`${API_URL}/manutencoes`).then(r => r.json()),
      ]);
      setEquipamentos(eq);
      setAgendamentos(ag);
      setEmprestimos(em);
      setManutencoes(mn);
      setLoading(false);
    };
    fetchAll();

    // Solicitar permissão de notificação
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    // Timer para alertas push de agendamento
    const interval = setInterval(() => {
      if ("Notification" in window && Notification.permission === "granted") {
        const agora = new Date();
        const dezMin = new Date(agora.getTime() + 10 * 60000);
        agendamentos.forEach(a => {
          const inicio = new Date(a.data_inicio);
          if (
            inicio > agora &&
            inicio <= dezMin &&
            !window.localStorage.getItem(`notificado_agendamento_${a.id}_${inicio.toISOString()}`)
          ) {
            new Notification("Agendamento próximo!", {
              body: `Equipamento ${a.equipamento_id} - ${a.turma || ""} ${a.turno || ""} ${a.aula || ""} às ${inicio.toLocaleTimeString()}`,
            });
            window.localStorage.setItem(`notificado_agendamento_${a.id}_${inicio.toISOString()}`, "1");
          }
        });
      }
    }, 60000); // checa a cada minuto
    return () => clearInterval(interval);
  }, []);

  const total = equipamentos.length;
  const disponiveis = equipamentos.filter(e => e.status === "disponível").length;
  const emprestados = equipamentos.filter(e => e.status === "emprestado").length;
  const manutencao = equipamentos.filter(e => e.status === "manutenção").length;

  // Alertas
  const hoje = new Date();
  const doisDias = new Date();
  doisDias.setDate(hoje.getDate() + 2);

  // Agendamentos próximos (hoje e próximos 2 dias)
  const agendamentosProximos = agendamentos.filter(a => {
    const d = new Date(a.data_inicio);
    return d >= hoje && d <= doisDias;
  });

  // Empréstimos pendentes (status emprestado e data_emprestimo + 7 dias < hoje ou sem data_devolucao)
  const emprestimosPendentes = emprestimos.filter(e => {
    if (e.status !== "emprestado") return false;
    if (!e.data_devolucao) {
      // Considera devolução prevista para 7 dias após empréstimo
      const prev = new Date(e.data_emprestimo);
      prev.setDate(prev.getDate() + 7);
      return prev < hoje;
    }
    return new Date(e.data_devolucao) < hoje;
  });

  // Manutenções pendentes ou em andamento
  const manutencoesPendentes = manutencoes.filter(m => ["pendente", "em andamento"].includes(m.status));

  // Gráfico de status dos equipamentos
  const statusData = {
    labels: ["Disponível", "Emprestado", "Manutenção"],
    datasets: [
      {
        data: [disponiveis, emprestados, manutencao],
        backgroundColor: ["#7be07b", "#ffb3b3", "#b3b3ff"],
      },
    ],
  };

  // Gráfico de agendamentos por dia do mês atual
  const agendamentosPorDia: Record<string, number> = {};
  agendamentos.forEach(a => {
    const d = new Date(a.data_inicio);
    const key = d.toLocaleDateString();
    agendamentosPorDia[key] = (agendamentosPorDia[key] || 0) + 1;
  });
  const dias = Object.keys(agendamentosPorDia).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  const agPorDiaData = {
    labels: dias,
    datasets: [
      {
        label: "Agendamentos",
        data: dias.map(d => agendamentosPorDia[d]),
        backgroundColor: "#7bb3ff",
        borderColor: "#007bff",
        fill: false,
      },
    ],
  };

  // Gráfico de uso por tipo de equipamento
  const usoPorTipo: Record<string, number> = {};
  agendamentos.forEach(a => {
    const eq = equipamentos.find(e => e.id === a.equipamento_id);
    if (eq) {
      usoPorTipo[eq.tipo] = (usoPorTipo[eq.tipo] || 0) + 1;
    }
  });
  const tipos = Object.keys(usoPorTipo);
  const usoPorTipoData = {
    labels: tipos,
    datasets: [
      {
        label: "Agendamentos por Tipo",
        data: tipos.map(t => usoPorTipo[t]),
        backgroundColor: "#ffe066",
      },
    ],
  };

  return (
    <div style={{ maxWidth: 600, margin: "40px auto" }}>
      <h1 style={{ textAlign: 'center', color: '#fff', marginBottom: 8, textShadow: '0 2px 8px #0008', fontSize: 32, fontWeight: 700 }}>Inventário e Controle de Equipamentos</h1>
      <p style={{ textAlign: 'center', color: '#fff', marginBottom: 24, textShadow: '0 2px 8px #0008', fontSize: 20, fontWeight: 500 }}>Bem-vindo ao sistema!</p>
      <h2 style={{ color: '#fff', textAlign: 'center', textShadow: '0 2px 8px #0008' }}>Dashboard</h2>
      {/* Alertas removidos */}
      {loading ? (
        <p>Carregando...</p>
      ) : (
        <>
          <div style={{ display: "flex", gap: 24, justifyContent: "center", marginTop: 32 }}>
            <div style={{ background: "#f5f5f5", padding: 24, borderRadius: 8, minWidth: 120, textAlign: "center" }}>
              <h3>Total</h3>
              <div style={{ fontSize: 32, fontWeight: "bold" }}>{total}</div>
            </div>
            <div style={{ background: "#e0ffe0", padding: 24, borderRadius: 8, minWidth: 120, textAlign: "center" }}>
              <h3>Disponíveis</h3>
              <div style={{ fontSize: 32, fontWeight: "bold" }}>{disponiveis}</div>
            </div>
            <div style={{ background: "#ffe0e0", padding: 24, borderRadius: 8, minWidth: 120, textAlign: "center" }}>
              <h3>Emprestados</h3>
              <div style={{ fontSize: 32, fontWeight: "bold" }}>{emprestados}</div>
            </div>
            <div style={{ background: "#e0e0ff", padding: 24, borderRadius: 8, minWidth: 120, textAlign: "center" }}>
              <h3>Em Manutenção</h3>
              <div style={{ fontSize: 32, fontWeight: "bold" }}>{manutencao}</div>
            </div>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 32, marginTop: 40, justifyContent: "center" }}>
            <div style={{ width: 320, background: "#fff", borderRadius: 8, boxShadow: "0 2px 8px #0001", padding: 16 }}>
              <h4 style={{ textAlign: "center" }}>Status dos Equipamentos</h4>
              <Pie data={statusData} />
            </div>
            <div style={{ width: 400, background: "#fff", borderRadius: 8, boxShadow: "0 2px 8px #0001", padding: 16 }}>
              <h4 style={{ textAlign: "center" }}>Agendamentos por Dia</h4>
              <Bar data={agPorDiaData} />
            </div>
            <div style={{ width: 400, background: "#fff", borderRadius: 8, boxShadow: "0 2px 8px #0001", padding: 16 }}>
              <h4 style={{ textAlign: "center" }}>Uso por Tipo de Equipamento</h4>
              <Bar data={usoPorTipoData} />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard; 