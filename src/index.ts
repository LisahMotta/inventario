import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import path from "path";
import equipamentosRoutes from "./routes/equipamentos";
import agendamentosRoutes from "./routes/agendamentos";
import usuariosRoutes from "./routes/usuarios";
import manutencoesRoutes from "./routes/manutencoes";
import emprestimosRoutes from "./routes/emprestimos";
import equipamentosInserviveisRoutes from "./routes/equipamentosInserviveis";

console.log("DATABASE_URL:", process.env.DATABASE_URL);
console.log("NODE_ENV:", process.env.NODE_ENV);

// Testar conexão com banco de dados
import { db } from "./db";
import { usuarios } from "./schema";

const testDatabaseConnection = async () => {
  try {
    console.log("Testando conexão com banco de dados...");
    const result = await db.select().from(usuarios).limit(1);
    console.log("Conexão com banco OK! Usuários encontrados:", result.length);
  } catch (error) {
    console.error("Erro na conexão com banco:", error);
    const errorMessage = String(error);
    if (errorMessage.includes("relation") && errorMessage.includes("does not exist")) {
      console.log("Tabelas não existem. Criando tabelas...");
      await createTables();
    } else {
      console.error("Verifique se DATABASE_URL está correto");
    }
  }
};

export const createTables = async () => {
  try {
    console.log("Criando tabelas manualmente...");
    const Database = (await import("better-sqlite3")).default;
    const sqlite = new Database("inventario.db");
    
    console.log("Criando tabela usuarios...");
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        email TEXT,
        senha TEXT NOT NULL,
        tipo TEXT NOT NULL,
        criado_em INTEGER DEFAULT (strftime('%s', 'now'))
      );
    `);
    
    console.log("Criando tabela equipamentos...");
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS equipamentos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tipo TEXT NOT NULL,
        marca TEXT NOT NULL,
        modelo TEXT NOT NULL,
        tombo TEXT NOT NULL UNIQUE,
        status TEXT NOT NULL,
        observacoes TEXT,
        criado_em INTEGER DEFAULT (strftime('%s', 'now'))
      );
    `);
    
    console.log("Criando tabela agendamentos...");
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS agendamentos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        equipamento_id INTEGER NOT NULL,
        data_inicio INTEGER NOT NULL,
        data_fim INTEGER NOT NULL,
        status TEXT NOT NULL,
        observacoes TEXT,
        turma TEXT,
        turno TEXT,
        aula TEXT,
        criado_em INTEGER DEFAULT (strftime('%s', 'now'))
      );
    `);
    
    console.log("Criando tabela manutencoes...");
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS manutencoes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        equipamento_id INTEGER NOT NULL,
        data_manutencao INTEGER NOT NULL,
        descricao TEXT NOT NULL,
        responsavel TEXT,
        status TEXT NOT NULL,
        observacoes TEXT,
        criado_em INTEGER DEFAULT (strftime('%s', 'now'))
      );
    `);
    
    console.log("Criando tabela emprestimos...");
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS emprestimos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        equipamento_id INTEGER NOT NULL,
        usuario_id INTEGER NOT NULL,
        data_emprestimo INTEGER NOT NULL,
        data_devolucao INTEGER,
        status TEXT NOT NULL,
        observacoes TEXT,
        criado_em INTEGER DEFAULT (strftime('%s', 'now'))
      );
    `);
    
    console.log("Criando tabela equipamentos_inserviveis...");
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS equipamentos_inserviveis (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        equipamento_id INTEGER,
        tipo TEXT NOT NULL,
        marca TEXT NOT NULL,
        modelo TEXT NOT NULL,
        tombo TEXT NOT NULL UNIQUE,
        motivo_inservivel TEXT NOT NULL,
        data_baixa INTEGER NOT NULL,
        responsavel_baixa TEXT NOT NULL,
        observacoes TEXT,
        criado_em INTEGER DEFAULT (strftime('%s', 'now'))
      );
    `);
    
    sqlite.close();
    console.log("Todas as tabelas criadas com sucesso!");
  } catch (error) {
    console.error("Erro ao criar tabelas:", error);
    throw error;
  }
};

testDatabaseConnection();

const app = express();

// Configurações do Express
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get("/health", async (req, res) => {
  try {
    await db.select().from(usuarios).limit(1);
    res.json({ status: "OK", message: "Database connection successful" });
  } catch (error) {
    console.error("Health check failed:", error);
    res.status(500).json({ status: "ERROR", message: "Database connection failed", error: String(error) });
  }
});

// Initialize database endpoint
app.get("/init-db", async (req, res) => {
  try {
    console.log("Inicializando banco de dados...");
    await createTables();
    res.json({ status: "OK", message: "Database initialized successfully" });
  } catch (error) {
    console.error("Database initialization failed:", error);
    res.status(500).json({ status: "ERROR", message: "Database initialization failed", error: String(error) });
  }
});

// Rotas da API
app.use("/equipamentos", equipamentosRoutes);
app.use("/agendamentos", agendamentosRoutes);
app.use("/usuarios", usuariosRoutes);
app.use("/manutencoes", manutencoesRoutes);
app.use("/emprestimos", emprestimosRoutes);
app.use("/equipamentos-inserviveis", equipamentosInserviveisRoutes);

// Servir arquivos estáticos do frontend
app.use(express.static(path.join(__dirname, "../frontend-manual/dist")));

// Para todas as outras rotas, servir o index.html do React
app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend-manual/dist/index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
