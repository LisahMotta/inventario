import React, { useEffect, useState } from "react";
import EquipamentoDetalhe from "./EquipamentoDetalhe";
import { useNavigate } from "react-router-dom";

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
  
  // Log quando o estado muda
  useEffect(() => {
    console.log("Estado equipamentos mudou:", equipamentos);
  }, [equipamentos]);
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
  const [mostrarLista, setMostrarLista] = useState(true);

  const navigate = useNavigate();

  const API_URL = "https://inventario-5cah.onrender.com";

  const fetchEquipamentos = async () => {
    try {
      console.log("🚀 === INÍCIO DO FETCH ===");
      console.log("🚀 Fazendo fetch dos equipamentos...");
      const resp = await fetch(`${API_URL}/equipamentos`);
      console.log("🚀 Resposta da API:", resp.status);
      const data = await resp.json();
      console.log("🚀 Dados recebidos:", data);
      console.log("🚀 Tipo dos dados:", typeof data);
      console.log("🚀 É array?", Array.isArray(data));
      console.log("🚀 Length dos dados:", data.length);
      setEquipamentos(data);
      console.log("🚀 setEquipamentos chamado com:", data);
      alert(`🚀 Equipamentos carregados: ${data.length}`);
      console.log("🚀 === FIM DO FETCH ===");
    } catch (error) {
      console.error("❌ Erro ao buscar equipamentos:", error);
      alert("❌ Erro ao buscar equipamentos: " + error);
    }
  };

  useEffect(() => {
    console.log("Componente montado, buscando equipamentos...");
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
      console.log("Enviando dados:", form);
      const resp = await fetch(`${API_URL}/equipamentos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      console.log("Resposta do cadastro:", resp.status);
      if (resp.ok) {
        const data = await resp.json();
        console.log("Equipamento cadastrado:", data);
        setSucesso("Equipamento cadastrado!");
        setForm({ tipo: "", marca: "", modelo: "", tombo: "", status: "disponível", observacoes: "" });
        fetchEquipamentos();
      } else {
        const data = await resp.json();
        console.error("Erro na resposta:", data);
        setErro(data.erro || "Erro ao cadastrar equipamento");
      }
    } catch (err) {
      console.error("Erro na requisição:", err);
      setErro("Erro ao conectar com o servidor");
    } finally {
      setLoading(false);
    }
  };

  // Filtro avançado - simplificado para debug
  const equipamentosFiltrados = equipamentos; // Temporariamente sem filtros

  // Logs mais visíveis
  console.log("🔍 DEBUG - Equipamentos filtrados:", equipamentosFiltrados.length, "de", equipamentos.length);
  console.log("🔍 DEBUG - Equipamentos originais:", equipamentos);
  console.log("🔍 DEBUG - Equipamentos filtrados:", equipamentosFiltrados);

  console.log("🎯 === RENDERIZAÇÃO ===");
  console.log("🎯 Componente renderizando, equipamentos:", equipamentos.length);
  console.log("🎯 Equipamentos no estado:", equipamentos);
  console.log("🎯 Mostrar lista:", mostrarLista);
  console.log("🎯 === FIM RENDERIZAÇÃO ===");
  return (
    <div style={{ maxWidth: 900, margin: "40px auto" }}>
      <h1 style={{ textAlign: 'center', color: '#fff', marginBottom: 24, textShadow: '0 2px 8px #000c', fontSize: 32, fontWeight: 800, letterSpacing: 1 }}>Equipamentos</h1>
             <button onClick={() => { 
         const novoEstado = !mostrarLista;
         setMostrarLista(novoEstado); 
         console.log("Mostrar lista:", novoEstado, "Equipamentos no estado:", equipamentos.length);
         fetchEquipamentos();
       }} style={{ marginBottom: 16, backgroundColor: '#007bff', color: '#fff', padding: '8px 15px', borderRadius: 5, border: 'none', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
         {mostrarLista ? 'Ocultar Equipamentos' : 'Mostrar Equipamentos'}
       </button>
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
                    {mostrarLista && (
         <div>
           {(() => { console.log("Renderizando lista, equipamentos:", equipamentos.length, "filtrados:", equipamentosFiltrados.length); return null; })()}
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
             {equipamentosFiltrados.map((eq, index) => (
               <tr key={eq.id}>
                 <td style={{ color: '#fff' }}>{index + 1}</td>
                 <td style={{ color: '#fff' }}>{eq.tipo}</td>
                 <td style={{ color: '#fff' }}>{eq.marca}</td>
                 <td style={{ color: '#fff' }}>{eq.modelo}</td>
                 <td style={{ color: '#fff' }}>{eq.tombo}</td>
                 <td style={{ color: '#fff' }}>{eq.status}</td>
                 <td style={{ color: '#fff' }}>{eq.observacoes}</td>
                 <td>
                   <button onClick={() => navigate(`/equipamento/${eq.id}`)} style={{ backgroundColor: '#6c757d', color: '#fff', padding: '8px 15px', borderRadius: 5, border: 'none', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(0,0,0,0.2)', transition: 'background-color 0.3s ease, box-shadow 0.3s ease' }}>
                     Ver histórico
                   </button>
                 </td>
               </tr>
             ))}
           </tbody>
         </table>
         </div>
       )}
    </div>
  );
};

export default Equipamentos; 