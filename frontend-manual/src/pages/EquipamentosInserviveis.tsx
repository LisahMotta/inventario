import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";

interface EquipamentoInservivel {
  id: number;
  equipamento_id: number;
  tipo: string;
  marca: string;
  modelo: string;
  tombo: string;
  motivo_inservivel: string;
  data_baixa: string;
  responsavel_baixa: string;
  observacoes?: string;
  criado_em: string;
}

const EquipamentosInserviveis: React.FC = () => {
  const [equipamentosInserviveis, setEquipamentosInserviveis] = useState<EquipamentoInservivel[]>([]);
  const [form, setForm] = useState({
    equipamento_id: 0,
    tipo: "",
    marca: "",
    modelo: "",
    tombo: "",
    motivo_inservivel: "",
    data_baixa: new Date().toISOString().split('T')[0],
    responsavel_baixa: "",
    observacoes: "",
  });
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [busca, setBusca] = useState("");
  const [mostrarLista, setMostrarLista] = useState(false);

  // @ts-ignore
  const API_URL = import.meta.env.VITE_API_URL || "";

  const fetchEquipamentosInserviveis = async () => {
    try {
      const resp = await fetch(`${API_URL}/equipamentos-inserviveis`);
      const data = await resp.json();
      setEquipamentosInserviveis(data);
    } catch (error) {
      console.error("Erro ao buscar equipamentos inservíveis:", error);
    }
  };

  useEffect(() => {
    fetchEquipamentosInserviveis();
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
      let resp;
      if (editId) {
        resp = await fetch(`${API_URL}/equipamentos-inserviveis/${editId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      } else {
        resp = await fetch(`${API_URL}/equipamentos-inserviveis`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      }
      if (resp.ok) {
        setSucesso(editId ? "Equipamento inservível atualizado!" : "Equipamento inservível cadastrado!");
        setForm({
          equipamento_id: 0,
          tipo: "",
          marca: "",
          modelo: "",
          tombo: "",
          motivo_inservivel: "",
          data_baixa: new Date().toISOString().split('T')[0],
          responsavel_baixa: "",
          observacoes: "",
        });
        setEditId(null);
        fetchEquipamentosInserviveis();
      } else {
        const errorData = await resp.json();
        setErro(errorData.erro || "Erro ao salvar equipamento inservível");
      }
    } catch (error) {
      setErro("Erro ao salvar equipamento inservível");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (eq: EquipamentoInservivel) => {
    setEditId(eq.id);
    setForm({
      equipamento_id: eq.equipamento_id,
      tipo: eq.tipo,
      marca: eq.marca,
      modelo: eq.modelo,
      tombo: eq.tombo,
      motivo_inservivel: eq.motivo_inservivel,
      data_baixa: eq.data_baixa.split('T')[0],
      responsavel_baixa: eq.responsavel_baixa,
      observacoes: eq.observacoes || "",
    });
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este equipamento inservível?")) return;
    setSucesso("");
    try {
      const resp = await fetch(`${API_URL}/equipamentos-inserviveis/${id}`, { method: "DELETE" });
      if (resp.ok) {
        setSucesso("Equipamento inservível excluído!");
        fetchEquipamentosInserviveis();
      } else {
        setErro("Erro ao excluir equipamento inservível");
      }
    } catch (error) {
      setErro("Erro ao excluir equipamento inservível");
    }
  };

  const exportarCSV = () => {
    const headers = ["ID", "Equipamento ID", "Tipo", "Marca", "Modelo", "Tombo", "Motivo", "Data Baixa", "Responsável", "Observações"];
    const csvContent = [
      headers.join(","),
      ...equipamentosInserviveis.map(eq => [
        eq.id,
        eq.equipamento_id,
        eq.tipo,
        eq.marca,
        eq.modelo,
        eq.tombo,
        eq.motivo_inservivel,
        new Date(eq.data_baixa).toLocaleDateString('pt-BR'),
        eq.responsavel_baixa,
        eq.observacoes || ""
      ].join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "equipamentos_inserviveis.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportarPDF = () => {
    const doc = new jsPDF();
    const headers = [["ID", "Tipo", "Marca", "Modelo", "Tombo", "Motivo", "Data Baixa", "Responsável"]];
    const data = equipamentosInserviveis.map(eq => [
      eq.id,
      eq.tipo,
      eq.marca,
      eq.modelo,
      eq.tombo,
      eq.motivo_inservivel,
      new Date(eq.data_baixa).toLocaleDateString('pt-BR'),
      eq.responsavel_baixa
    ]);
    
    (doc as any).autoTable({
      head: headers,
      body: data,
      startY: 20,
      theme: 'grid'
    });
    
    doc.save("equipamentos_inserviveis.pdf");
  };

  const equipamentosFiltrados = equipamentosInserviveis.filter(eq => {
    const buscaLower = busca.toLowerCase();
    return (
      eq.tipo.toLowerCase().includes(buscaLower) ||
      eq.marca.toLowerCase().includes(buscaLower) ||
      eq.modelo.toLowerCase().includes(buscaLower) ||
      eq.tombo.toLowerCase().includes(buscaLower) ||
      eq.motivo_inservivel.toLowerCase().includes(buscaLower) ||
      eq.responsavel_baixa.toLowerCase().includes(buscaLower)
    );
  });

  return (
    <div className="max-w-6xl mx-auto mt-10">
      <h1 className="text-3xl font-extrabold text-white text-center mb-8 drop-shadow">
        Equipamentos Inservíveis
      </h1>

      <div className="mb-4">
        <input
          value={busca}
          onChange={e => setBusca(e.target.value)}
          placeholder="Buscar equipamentos inservíveis..."
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
        <button 
          onClick={() => setMostrarLista(m => !m)} 
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition"
        >
          {mostrarLista ? 'Ocultar Lista' : 'Mostrar Lista'}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white shadow-md p-6 rounded-lg space-y-4 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <input
            name="equipamento_id"
            type="number"
            placeholder="ID do Equipamento (opcional)"
            value={form.equipamento_id}
            onChange={handleChange}
            className="border border-gray-300 rounded p-2"
          />
          <input
            name="tipo"
            placeholder="Tipo do Equipamento"
            value={form.tipo}
            onChange={handleChange}
            required
            className="border border-gray-300 rounded p-2"
          />
          <input
            name="marca"
            placeholder="Marca"
            value={form.marca}
            onChange={handleChange}
            required
            className="border border-gray-300 rounded p-2"
          />
          <input
            name="modelo"
            placeholder="Modelo"
            value={form.modelo}
            onChange={handleChange}
            required
            className="border border-gray-300 rounded p-2"
          />
          <input
            name="tombo"
            placeholder="Tombo"
            value={form.tombo}
            onChange={handleChange}
            required
            className="border border-gray-300 rounded p-2"
          />
          <input
            name="motivo_inservivel"
            placeholder="Motivo da Baixa"
            value={form.motivo_inservivel}
            onChange={handleChange}
            required
            className="border border-gray-300 rounded p-2"
          />
          <input
            name="data_baixa"
            type="date"
            value={form.data_baixa}
            onChange={handleChange}
            required
            className="border border-gray-300 rounded p-2"
          />
          <input
            name="responsavel_baixa"
            placeholder="Responsável pela Baixa"
            value={form.responsavel_baixa}
            onChange={handleChange}
            required
            className="border border-gray-300 rounded p-2"
          />
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
          className="bg-red-700 text-white px-6 py-2 rounded font-semibold hover:bg-red-800 transition"
        >
          {loading ? (editId ? "Salvando..." : "Cadastrando...") : (editId ? "Salvar edição" : "Cadastrar Baixa")}
        </button>
        {editId && (
          <button
            type="button"
            onClick={() => { setEditId(null); setForm({ ...form, equipamento_id: 0, tipo: "", marca: "", modelo: "", tombo: "", motivo_inservivel: "", responsavel_baixa: "", observacoes: "" }); }}
            className="ml-4 text-sm text-red-600 hover:underline"
          >
            Cancelar edição
          </button>
        )}
        {erro && <div className="bg-red-500 text-white p-2 rounded mt-2 text-center font-semibold">{erro}</div>}
        {sucesso && <div className="bg-green-500 text-white p-2 rounded mt-2 text-center font-semibold">{sucesso}</div>}
      </form>

      {mostrarLista && (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marca</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Modelo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tombo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Motivo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data Baixa</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Responsável</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {equipamentosFiltrados.map(equipamento => (
                  <tr key={equipamento.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{equipamento.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{equipamento.tipo}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{equipamento.marca}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{equipamento.modelo}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{equipamento.tombo}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{equipamento.motivo_inservivel}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(equipamento.data_baixa).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{equipamento.responsavel_baixa}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEdit(equipamento)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(equipamento.id)}
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
      )}

      {mostrarLista && equipamentosFiltrados.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500 text-lg">Nenhum equipamento inservível encontrado</p>
        </div>
      )}
    </div>
  );
};

export default EquipamentosInserviveis;
