import dotenv from "dotenv";
dotenv.config();


import express from "express";
import cors from "cors";
import equipamentosRoutes from "./routes/equipamentos";
import agendamentosRoutes from "./routes/agendamentos";
import usuariosRoutes from "./routes/usuarios";
import manutencoesRoutes from "./routes/manutencoes";
import emprestimosRoutes from "./routes/emprestimos";

console.log("DATABASE_URL:", process.env.DATABASE_URL);

const app = express();
app.use(cors());
app.use(express.json());

app.use("/equipamentos", equipamentosRoutes);
app.use("/agendamentos", agendamentosRoutes);
app.use("/usuarios", usuariosRoutes);
app.use("/manutencoes", manutencoesRoutes);
app.use("/emprestimos", emprestimosRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
