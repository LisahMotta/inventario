import React, { useEffect, useState } from "react";
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
    console.log("ESTADO EQUIPAMENTOS MUDOU:", equipamentos);
    console.log("QUANTIDADE NO ESTADO:", equipamentos.length);
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
  const [mostrarLista, setMostrarLista] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroMarca, setFiltroMarca] = useState("");

  const navigate = useNavigate();
  const API_URL = "https://inventario-5cah.onrender.com";

  const fetchEquipamentos = async () => {
    try {
      alert("INICIANDO FETCH");
      console.log("INICIANDO FETCH");
      
      const resp = await fetch(`${API_URL}/equipamentos`);
      console.log("RESPOSTA:", resp.status);
      
      if (!resp.ok) {
        throw new Error(`HTTP error! status: ${resp.status}`);
      }
      
      const data = await resp.json();
      console.log("DADOS RECEBIDOS:", data);
      console.log("QUANTIDADE:", data.length);
      console.log("TIPO:", typeof data);
      console.log("É ARRAY:", Array.isArray(data));
      
      if (Array.isArray(data)) {
        setEquipamentos(data);
        alert(`EQUIPAMENTOS CARREGADOS: ${data.length}`);
      } else {
        alert("ERRO: Dados não são um array!");
        console.error("Dados não são um array:", data);
      }
      
    } catch (error) {
      console.error("ERRO:", error);
      alert("ERRO: " + error);
    }
  };

  useEffect(() => {
    console.log("COMPONENTE MONTADO");
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
      const resp = await fetch(`${API_URL}/equipamentos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      
      if (resp.ok) {
        const data = await resp.json();
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

  const equipamentosFiltrados = equipamentos;

  console.log("RENDERIZANDO - EQUIPAMENTOS:", equipamentos.length);
  console.log("MOSTRAR LISTA:", mostrarLista);

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", backgroundColor: 'rgba(0,0,0,0.8)', padding: 20, borderRadius: 10 }}>
      <h1 style={{ textAlign: 'center', color: '#fff', marginBottom: 24, textShadow: '0 2px 8px #000c', fontSize: 32, fontWeight: 800, letterSpacing: 1 }}>Equipamentos</h1>
      
      {/* DEBUG INFO */}
      <div style={{ color: '#fff', marginBottom: 20, padding: 10, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 5 }}>
        <strong>DEBUG INFO:</strong><br/>
        Equipamentos no estado: {equipamentos.length}<br/>
        Mostrar lista: {mostrarLista ? 'SIM' : 'NÃO'}<br/>
        Dados: {JSON.stringify(equipamentos.slice(0, 2))}
      </div>
      
      <button 
        onClick={() => { 
          const novoEstado = !mostrarLista;
          setMostrarLista(novoEstado); 
          fetchEquipamentos();
        }} 
        style={{ marginBottom: 16, backgroundColor: '#007bff', color: '#fff', padding: '8px 15px', borderRadius: 5, border: 'none', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}
      >
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

      {/* LISTA SIMPLES */}
      <div style={{ color: '#fff', marginBottom: 20 }}>
        <h3>Lista Simples (Debug):</h3>
        {equipamentos.map((eq, index) => (
          <div key={eq.id} style={{ padding: 10, margin: 5, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 5 }}>
            <strong>{index + 1}. {eq.tipo} - {eq.marca} {eq.modelo} ({eq.tombo})</strong>
          </div>
        ))}
      </div>

      {mostrarLista && (
        <div>
          <div style={{ color: '#fff', marginBottom: 10 }}>
            <strong>Total de equipamentos: {equipamentos.length}</strong>
          </div>
          
          {equipamentos.length === 0 ? (
            <div style={{ color: '#fff', textAlign: 'center', padding: 20 }}>
              Nenhum equipamento encontrado
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #fff" }}>
              <thead>
                <tr>
                  <th style={{ color: '#fff', fontWeight: 'bold', border: "1px solid #fff", padding: 8 }}>ID</th>
                  <th style={{ color: '#fff', fontWeight: 'bold', border: "1px solid #fff", padding: 8 }}>Tipo</th>
                  <th style={{ color: '#fff', fontWeight: 'bold', border: "1px solid #fff", padding: 8 }}>Marca</th>
                  <th style={{ color: '#fff', fontWeight: 'bold', border: "1px solid #fff", padding: 8 }}>Modelo</th>
                  <th style={{ color: '#fff', fontWeight: 'bold', border: "1px solid #fff", padding: 8 }}>Tombo</th>
                  <th style={{ color: '#fff', fontWeight: 'bold', border: "1px solid #fff", padding: 8 }}>Status</th>
                  <th style={{ color: '#fff', fontWeight: 'bold', border: "1px solid #fff", padding: 8 }}>Observações</th>
                  <th style={{ color: '#fff', fontWeight: 'bold', border: "1px solid #fff", padding: 8 }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {equipamentosFiltrados.map((eq, index) => (
                  <tr key={eq.id}>
                    <td style={{ color: '#fff', border: "1px solid #fff", padding: 8 }}>{index + 1}</td>
                    <td style={{ color: '#fff', border: "1px solid #fff", padding: 8 }}>{eq.tipo}</td>
                    <td style={{ color: '#fff', border: "1px solid #fff", padding: 8 }}>{eq.marca}</td>
                    <td style={{ color: '#fff', border: "1px solid #fff", padding: 8 }}>{eq.modelo}</td>
                    <td style={{ color: '#fff', border: "1px solid #fff", padding: 8 }}>{eq.tombo}</td>
                    <td style={{ color: '#fff', border: "1px solid #fff", padding: 8 }}>{eq.status}</td>
                    <td style={{ color: '#fff', border: "1px solid #fff", padding: 8 }}>{eq.observacoes}</td>
                    <td style={{ border: "1px solid #fff", padding: 8 }}>
                      <button onClick={() => navigate(`/equipamento/${eq.id}`)} style={{ backgroundColor: '#6c757d', color: '#fff', padding: '8px 15px', borderRadius: 5, border: 'none', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(0,0,0,0.2)', transition: 'background-color 0.3s ease, box-shadow 0.3s ease' }}>
                        Ver histórico
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default Equipamentos;
