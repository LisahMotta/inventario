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
    console.error("Verifique se as tabelas foram criadas e se DATABASE_URL está correto");
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

// Rotas da API
app.use("/equipamentos", equipamentosRoutes);
app.use("/agendamentos", agendamentosRoutes);
app.use("/usuarios", usuariosRoutes);
app.use("/manutencoes", manutencoesRoutes);
app.use("/emprestimos", emprestimosRoutes);

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
