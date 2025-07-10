import React, { useEffect, useState } from "react";

interface Equipamento {
  id: number;
  tipo: string;
  marca: string;
  modelo: string;
  tombo: string;
  status: string;
  observacoes?: string;
}
interface Agendamento {
  id: number;
  equipamento_id: number;
  data_inicio: string;
  data_fim: string;
  turma?: string;
  turno?: string;
  aula?: string;
  status: string;
  observacoes?: string;
}
interface Manutencao {
  id: number;
  equipamento_id: number;
  data_manutencao: string;
  descricao: string;
  responsavel?: string;
  status: string;
  observacoes?: string;
}
interface Emprestimo {
  id: number;
  equipamento_id: number;
  usuario_id: number;
  data_emprestimo: string;
  data_devolucao?: string;
  status: string;
  observacoes?: string;
}

const EquipamentoDetalhe: React.FC<{ equipamentoId: number; onVoltar: () => void }> = ({ equipamentoId, onVoltar }) => {
  const [equipamento, setEquipamento] = useState<Equipamento | null>(null);
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [manutencoes, setManutencoes] = useState<Manutencao[]>([]);
  const [emprestimos, setEmprestimos] = useState<Emprestimo[]>([]);
  const [loading, setLoading] = useState(true);
  const [qr, setQr] = useState<string | null>(null);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      const [eq, ag, mn, em] = await Promise.all([
        fetch(`http://localhost:3000/equipamentos/${equipamentoId}`).then(r => r.json()),
        fetch(`http://localhost:3000/agendamentos`).then(r => r.json()),
        fetch(`http://localhost:3000/manutencoes`).then(r => r.json()),
        fetch(`http://localhost:3000/emprestimos`).then(r => r.json()),
      ]);
      setEquipamento(eq);
      setAgendamentos(ag.filter((a: Agendamento) => a.equipamento_id === equipamentoId));
      setManutencoes(mn.filter((m: Manutencao) => m.equipamento_id === equipamentoId));
      setEmprestimos(em.filter((e: Emprestimo) => e.equipamento_id === equipamentoId));
      // Buscar QR Code
      const qrRes = await fetch(`http://localhost:3000/equipamentos/${equipamentoId}/qrcode`);
      const qrBlob = await qrRes.blob();
      setQr(URL.createObjectURL(qrBlob));
      setLoading(false);
    };
    fetchAll();
  }, [equipamentoId]);

  if (loading) return <div>Carregando...</div>;
  if (!equipamento) return <div>Equipamento não encontrado.</div>;

  return (
    <div style={{ maxWidth: 900, margin: "40px auto" }}>
      <button onClick={onVoltar} style={{ marginBottom: 16 }}>&larr; Voltar</button>
      <h2>Detalhes do Equipamento</h2>
      {qr && (
        <div style={{ marginBottom: 24, textAlign: "center" }}>
          <img src={qr} alt="QR Code do equipamento" style={{ width: 128, height: 128 }} />
          <br />
          <button onClick={() => window.print()} style={{ marginTop: 8 }}>Imprimir QR Code</button>
        </div>
      )}
      <div style={{ marginBottom: 24, border: "1px solid #ccc", borderRadius: 8, padding: 16 }}>
        <b>ID:</b> {equipamento.id} <br />
        <b>Tipo:</b> {equipamento.tipo} <br />
        <b>Marca:</b> {equipamento.marca} <br />
        <b>Modelo:</b> {equipamento.modelo} <br />
        <b>Tombo:</b> {equipamento.tombo} <br />
        <b>Status:</b> {equipamento.status} <br />
        <b>Observações:</b> {equipamento.observacoes}
      </div>
      <h3>Histórico de Agendamentos</h3>
      <table style={{ width: "100%", marginBottom: 24 }}>
        <thead>
          <tr>
            <th>Início</th>
            <th>Fim</th>
            <th>Turma</th>
            <th>Turno</th>
            <th>Aula</th>
            <th>Status</th>
            <th>Observações</th>
          </tr>
        </thead>
        <tbody>
          {agendamentos.map(a => (
            <tr key={a.id}>
              <td>{new Date(a.data_inicio).toLocaleString()}</td>
              <td>{new Date(a.data_fim).toLocaleString()}</td>
              <td>{a.turma}</td>
              <td>{a.turno}</td>
              <td>{a.aula}</td>
              <td>{a.status}</td>
              <td>{a.observacoes}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h3>Histórico de Manutenções</h3>
      <table style={{ width: "100%", marginBottom: 24 }}>
        <thead>
          <tr>
            <th>Data</th>
            <th>Descrição</th>
            <th>Responsável</th>
            <th>Status</th>
            <th>Observações</th>
          </tr>
        </thead>
        <tbody>
          {manutencoes.map(m => (
            <tr key={m.id}>
              <td>{new Date(m.data_manutencao).toLocaleString()}</td>
              <td>{m.descricao}</td>
              <td>{m.responsavel}</td>
              <td>{m.status}</td>
              <td>{m.observacoes}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h3>Histórico de Empréstimos</h3>
      <table style={{ width: "100%" }}>
        <thead>
          <tr>
            <th>Usuário</th>
            <th>Data Empréstimo</th>
            <th>Data Devolução</th>
            <th>Status</th>
            <th>Observações</th>
          </tr>
        </thead>
        <tbody>
          {emprestimos.map(e => (
            <tr key={e.id}>
              <td>{e.usuario_id}</td>
              <td>{new Date(e.data_emprestimo).toLocaleString()}</td>
              <td>{e.data_devolucao ? new Date(e.data_devolucao).toLocaleString() : "-"}</td>
              <td>{e.status}</td>
              <td>{e.observacoes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EquipamentoDetalhe; 