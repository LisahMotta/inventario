import { pgTable, serial, integer, varchar, text, timestamp } from "drizzle-orm/pg-core";

// Criação da tabela 'equipamentos'
export const equipamentos = pgTable("equipamentos", {
  id: serial("id").primaryKey(), // ID auto incremental
  tipo: varchar("tipo", { length: 100 }).notNull(), // Tipo do equipamento, ex: notebook
  marca: varchar("marca", { length: 100 }).notNull(), // Marca do equipamento
  modelo: varchar("modelo", { length: 100 }).notNull(), // Modelo
  tombo: varchar("tombo", { length: 100 }).notNull().unique(), // Código patrimonial único
  status: varchar("status", { length: 50 }).notNull(), // Status: disponível, emprestado, manutenção
  observacoes: text("observacoes"), // Campo livre para observações
  criado_em: timestamp("criado_em").defaultNow(), // Data/hora de criação
});

// Criação da tabela 'agendamentos'
export const agendamentos = pgTable("agendamentos", {
  id: serial("id").primaryKey(), // ID auto incremental
  equipamento_id: integer("equipamento_id").notNull(), // FK para equipamentos
  data_inicio: timestamp("data_inicio").notNull(), // Início do agendamento
  data_fim: timestamp("data_fim").notNull(), // Fim do agendamento
  status: varchar("status", { length: 50 }).notNull(), // Status do agendamento
  observacoes: text("observacoes"), // Observações
  criado_em: timestamp("criado_em").defaultNow(), // Data/hora de criação
});

// Criação da tabela 'manutencoes'
export const manutencoes = pgTable("manutencoes", {
  id: serial("id").primaryKey(), // ID auto incremental
  equipamento_id: integer("equipamento_id").notNull(), // FK para equipamentos
  data_manutencao: timestamp("data_manutencao").notNull(), // Data da manutenção
  descricao: text("descricao").notNull(), // Descrição da manutenção
  responsavel: varchar("responsavel", { length: 100 }), // Responsável pela manutenção
  status: varchar("status", { length: 50 }).notNull(), // Status da manutenção
  observacoes: text("observacoes"), // Observações
  criado_em: timestamp("criado_em").defaultNow(), // Data/hora de criação
});

// Criação da tabela 'usuarios'
export const usuarios = pgTable("usuarios", {
  id: serial("id").primaryKey(),
  nome: varchar("nome", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }), // Agora opcional
  senha: varchar("senha", { length: 255 }).notNull(), // hash da senha
  tipo: varchar("tipo", { length: 50 }).notNull(), // tipo do usuário
  criado_em: timestamp("criado_em").defaultNow(),
});

// Criação da tabela 'emprestimos'
export const emprestimos = pgTable("emprestimos", {
  id: serial("id").primaryKey(),
  equipamento_id: integer("equipamento_id").notNull(), // FK para equipamentos
  usuario_id: integer("usuario_id").notNull(), // FK para usuários
  data_emprestimo: timestamp("data_emprestimo").notNull(),
  data_devolucao: timestamp("data_devolucao"),
  status: varchar("status", { length: 50 }).notNull(), // emprestado, devolvido
  observacoes: text("observacoes"),
  criado_em: timestamp("criado_em").defaultNow(),
});
