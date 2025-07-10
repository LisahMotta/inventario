"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emprestimos = exports.usuarios = exports.manutencoes = exports.agendamentos = exports.equipamentos = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
// Criação da tabela 'equipamentos'
exports.equipamentos = (0, pg_core_1.pgTable)("equipamentos", {
    id: (0, pg_core_1.serial)("id").primaryKey(), // ID auto incremental
    tipo: (0, pg_core_1.varchar)("tipo", { length: 100 }).notNull(), // Tipo do equipamento, ex: notebook
    marca: (0, pg_core_1.varchar)("marca", { length: 100 }).notNull(), // Marca do equipamento
    modelo: (0, pg_core_1.varchar)("modelo", { length: 100 }).notNull(), // Modelo
    tombo: (0, pg_core_1.varchar)("tombo", { length: 100 }).notNull().unique(), // Código patrimonial único
    status: (0, pg_core_1.varchar)("status", { length: 50 }).notNull(), // Status: disponível, emprestado, manutenção
    observacoes: (0, pg_core_1.text)("observacoes"), // Campo livre para observações
    criado_em: (0, pg_core_1.timestamp)("criado_em").defaultNow(), // Data/hora de criação
});
// Criação da tabela 'agendamentos'
exports.agendamentos = (0, pg_core_1.pgTable)("agendamentos", {
    id: (0, pg_core_1.serial)("id").primaryKey(), // ID auto incremental
    equipamento_id: (0, pg_core_1.serial)("equipamento_id").notNull(), // FK para equipamentos
    data_inicio: (0, pg_core_1.timestamp)("data_inicio").notNull(), // Início do agendamento
    data_fim: (0, pg_core_1.timestamp)("data_fim").notNull(), // Fim do agendamento
    status: (0, pg_core_1.varchar)("status", { length: 50 }).notNull(), // Status do agendamento
    observacoes: (0, pg_core_1.text)("observacoes"), // Observações
    criado_em: (0, pg_core_1.timestamp)("criado_em").defaultNow(), // Data/hora de criação
});
// Criação da tabela 'manutencoes'
exports.manutencoes = (0, pg_core_1.pgTable)("manutencoes", {
    id: (0, pg_core_1.serial)("id").primaryKey(), // ID auto incremental
    equipamento_id: (0, pg_core_1.serial)("equipamento_id").notNull(), // FK para equipamentos
    data_manutencao: (0, pg_core_1.timestamp)("data_manutencao").notNull(), // Data da manutenção
    descricao: (0, pg_core_1.text)("descricao").notNull(), // Descrição da manutenção
    responsavel: (0, pg_core_1.varchar)("responsavel", { length: 100 }), // Responsável pela manutenção
    status: (0, pg_core_1.varchar)("status", { length: 50 }).notNull(), // Status da manutenção
    observacoes: (0, pg_core_1.text)("observacoes"), // Observações
    criado_em: (0, pg_core_1.timestamp)("criado_em").defaultNow(), // Data/hora de criação
});
// Criação da tabela 'usuarios'
exports.usuarios = (0, pg_core_1.pgTable)("usuarios", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    nome: (0, pg_core_1.varchar)("nome", { length: 100 }).notNull(),
    email: (0, pg_core_1.varchar)("email", { length: 255 }), // Agora opcional
    senha: (0, pg_core_1.varchar)("senha", { length: 255 }).notNull(), // hash da senha
    tipo: (0, pg_core_1.varchar)("tipo", { length: 50 }).notNull(), // tipo do usuário
    criado_em: (0, pg_core_1.timestamp)("criado_em").defaultNow(),
});
// Criação da tabela 'emprestimos'
exports.emprestimos = (0, pg_core_1.pgTable)("emprestimos", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    equipamento_id: (0, pg_core_1.serial)("equipamento_id").notNull(), // FK para equipamentos
    usuario_id: (0, pg_core_1.serial)("usuario_id").notNull(), // FK para usuários
    data_emprestimo: (0, pg_core_1.timestamp)("data_emprestimo").notNull(),
    data_devolucao: (0, pg_core_1.timestamp)("data_devolucao"),
    status: (0, pg_core_1.varchar)("status", { length: 50 }).notNull(), // emprestado, devolvido
    observacoes: (0, pg_core_1.text)("observacoes"),
    criado_em: (0, pg_core_1.timestamp)("criado_em").defaultNow(),
});
