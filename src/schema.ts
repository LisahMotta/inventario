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
  turma: varchar("turma", { length: 100 }), // Turma do agendamento
  turno: varchar("turno", { length: 20 }), // Turno do agendamento
  aula: varchar("aula", { length: 20 }), // Aula do agendamento
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

// Criação da tabela 'equipamentos_inserviveis'
export const equipamentosInserviveis = pgTable("equipamentos_inserviveis", {
  id: serial("id").primaryKey(), // ID auto incremental
  equipamento_id: integer("equipamento_id").notNull(), // FK para equipamentos (opcional)
  tipo: varchar("tipo", { length: 100 }).notNull(), // Tipo do equipamento
  marca: varchar("marca", { length: 100 }).notNull(), // Marca do equipamento
  modelo: varchar("modelo", { length: 100 }).notNull(), // Modelo
  tombo: varchar("tombo", { length: 100 }).notNull().unique(), // Código patrimonial único
  motivo_inservivel: varchar("motivo_inservivel", { length: 200 }).notNull(), // Motivo pelo qual é inservível
  data_baixa: timestamp("data_baixa").notNull(), // Data da baixa do patrimônio
  responsavel_baixa: varchar("responsavel_baixa", { length: 100 }).notNull(), // Quem fez a baixa
  observacoes: text("observacoes"), // Observações adicionais
  criado_em: timestamp("criado_em").defaultNow(), // Data/hora de criação
});
