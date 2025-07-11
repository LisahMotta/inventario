"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTables = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const equipamentos_1 = __importDefault(require("./routes/equipamentos"));
const agendamentos_1 = __importDefault(require("./routes/agendamentos"));
const usuarios_1 = __importDefault(require("./routes/usuarios"));
const manutencoes_1 = __importDefault(require("./routes/manutencoes"));
const emprestimos_1 = __importDefault(require("./routes/emprestimos"));
console.log("DATABASE_URL:", process.env.DATABASE_URL);
console.log("NODE_ENV:", process.env.NODE_ENV);
// Testar conexão com banco de dados
const db_1 = require("./db");
const schema_1 = require("./schema");
const testDatabaseConnection = async () => {
    try {
        console.log("Testando conexão com banco de dados...");
        const result = await db_1.db.select().from(schema_1.usuarios).limit(1);
        console.log("Conexão com banco OK! Usuários encontrados:", result.length);
    }
    catch (error) {
        console.error("Erro na conexão com banco:", error);
        const errorMessage = String(error);
        if (errorMessage.includes("relation") && errorMessage.includes("does not exist")) {
            console.log("Tabelas não existem. Criando tabelas...");
            await (0, exports.createTables)();
        }
        else {
            console.error("Verifique se DATABASE_URL está correto");
        }
    }
};
const createTables = async () => {
    try {
        console.log("Criando tabelas manualmente...");
        const { Pool } = await Promise.resolve().then(() => __importStar(require("pg")));
        const pool = new Pool({
            connectionString: process.env.DATABASE_URL,
        });
        console.log("Criando tabela usuarios...");
        await pool.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        email VARCHAR(255),
        senha VARCHAR(255) NOT NULL,
        tipo VARCHAR(50) NOT NULL,
        criado_em TIMESTAMP DEFAULT NOW()
      );
    `);
        console.log("Criando tabela equipamentos...");
        await pool.query(`
      CREATE TABLE IF NOT EXISTS equipamentos (
        id SERIAL PRIMARY KEY,
        tipo VARCHAR(100) NOT NULL,
        marca VARCHAR(100) NOT NULL,
        modelo VARCHAR(100) NOT NULL,
        tombo VARCHAR(100) NOT NULL UNIQUE,
        status VARCHAR(50) NOT NULL,
        observacoes TEXT,
        criado_em TIMESTAMP DEFAULT NOW()
      );
    `);
        console.log("Criando tabela agendamentos...");
        await pool.query(`
      CREATE TABLE IF NOT EXISTS agendamentos (
        id SERIAL PRIMARY KEY,
        equipamento_id INTEGER NOT NULL,
        data_inicio TIMESTAMP NOT NULL,
        data_fim TIMESTAMP NOT NULL,
        status VARCHAR(50) NOT NULL,
        observacoes TEXT,
        criado_em TIMESTAMP DEFAULT NOW()
      );
    `);
        console.log("Criando tabela manutencoes...");
        await pool.query(`
      CREATE TABLE IF NOT EXISTS manutencoes (
        id SERIAL PRIMARY KEY,
        equipamento_id INTEGER NOT NULL,
        data_manutencao TIMESTAMP NOT NULL,
        descricao TEXT NOT NULL,
        responsavel VARCHAR(100),
        status VARCHAR(50) NOT NULL,
        observacoes TEXT,
        criado_em TIMESTAMP DEFAULT NOW()
      );
    `);
        console.log("Criando tabela emprestimos...");
        await pool.query(`
      CREATE TABLE IF NOT EXISTS emprestimos (
        id SERIAL PRIMARY KEY,
        equipamento_id INTEGER NOT NULL,
        usuario_id INTEGER NOT NULL,
        data_emprestimo TIMESTAMP NOT NULL,
        data_devolucao TIMESTAMP,
        status VARCHAR(50) NOT NULL,
        observacoes TEXT,
        criado_em TIMESTAMP DEFAULT NOW()
      );
    `);
        await pool.end();
        console.log("Todas as tabelas criadas com sucesso!");
    }
    catch (error) {
        console.error("Erro ao criar tabelas:", error);
        throw error;
    }
};
exports.createTables = createTables;
testDatabaseConnection();
const app = (0, express_1.default)();
// Configurações do Express
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Health check endpoint
app.get("/health", async (req, res) => {
    try {
        await db_1.db.select().from(schema_1.usuarios).limit(1);
        res.json({ status: "OK", message: "Database connection successful" });
    }
    catch (error) {
        console.error("Health check failed:", error);
        res.status(500).json({ status: "ERROR", message: "Database connection failed", error: String(error) });
    }
});
// Initialize database endpoint
app.get("/init-db", async (req, res) => {
    try {
        console.log("Inicializando banco de dados...");
        await (0, exports.createTables)();
        res.json({ status: "OK", message: "Database initialized successfully" });
    }
    catch (error) {
        console.error("Database initialization failed:", error);
        res.status(500).json({ status: "ERROR", message: "Database initialization failed", error: String(error) });
    }
});
// Rotas da API
app.use("/equipamentos", equipamentos_1.default);
app.use("/agendamentos", agendamentos_1.default);
app.use("/usuarios", usuarios_1.default);
app.use("/manutencoes", manutencoes_1.default);
app.use("/emprestimos", emprestimos_1.default);
// Servir arquivos estáticos do frontend
app.use(express_1.default.static(path_1.default.join(__dirname, "../frontend-manual/dist")));
// Para todas as outras rotas, servir o index.html do React
app.get("/*", (req, res) => {
    res.sendFile(path_1.default.join(__dirname, "../frontend-manual/dist/index.html"));
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
