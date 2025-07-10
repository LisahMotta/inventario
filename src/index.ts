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

const app = express();

// Configurações do Express
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
