"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const equipamentos_1 = __importDefault(require("./routes/equipamentos"));
const agendamentos_1 = __importDefault(require("./routes/agendamentos"));
const usuarios_1 = __importDefault(require("./routes/usuarios"));
const manutencoes_1 = __importDefault(require("./routes/manutencoes"));
const emprestimos_1 = __importDefault(require("./routes/emprestimos"));
console.log("DATABASE_URL:", process.env.DATABASE_URL);
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use("/equipamentos", equipamentos_1.default);
app.use("/agendamentos", agendamentos_1.default);
app.use("/usuarios", usuarios_1.default);
app.use("/manutencoes", manutencoes_1.default);
app.use("/emprestimos", emprestimos_1.default);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
