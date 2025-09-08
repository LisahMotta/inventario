import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";

// Criação da tabela 'equipamentos'
export const equipamentos = sqliteTable("equipamentos", {
  id: integer("id").primaryKey({ autoIncrement: true }), // ID auto incremental
  tipo: text("tipo").notNull(), // Tipo do equipamento, ex: notebook
  marca: text("marca").notNull(), // Marca do equipamento
  modelo: text("modelo").notNull(), // Modelo
  tombo: text("tombo").notNull().unique(), // Código patrimonial único
  status: text("status").notNull(), // Status: disponível, emprestado, manutenção
  observacoes: text("observacoes"), // Campo livre para observações
  criado_em: integer("criado_em", { mode: 'timestamp' }).$defaultFn(() => new Date()), // Data/hora de criação
});

// Criação da tabela 'agendamentos'
export const agendamentos = sqliteTable("agendamentos", {
  id: integer("id").primaryKey({ autoIncrement: true }), // ID auto incremental
  equipamento_id: integer("equipamento_id").notNull(), // FK para equipamentos
  data_inicio: integer("data_inicio", { mode: 'timestamp' }).notNull(), // Início do agendamento
  data_fim: integer("data_fim", { mode: 'timestamp' }).notNull(), // Fim do agendamento
  status: text("status").notNull(), // Status: agendado, em_uso, concluido, cancelado
  observacoes: text("observacoes"), // Campo livre para observações
  turma: text("turma"), // Turma que vai usar
  turno: text("turno"), // Turno: manhã, tarde, noite
  aula: text("aula"), // Aula específica
  criado_em: integer("criado_em", { mode: 'timestamp' }).$defaultFn(() => new Date()), // Data/hora de criação
});

// Criação da tabela 'usuarios'
export const usuarios = sqliteTable("usuarios", {
  id: integer("id").primaryKey({ autoIncrement: true }), // ID auto incremental
  nome: text("nome").notNull(), // Nome completo do usuário
  email: text("email"), // Email (opcional)
  senha: text("senha").notNull(), // Senha criptografada
  tipo: text("tipo").notNull(), // Tipo: admin, professor, tecnico
  criado_em: integer("criado_em", { mode: 'timestamp' }).$defaultFn(() => new Date()), // Data/hora de criação
});

// Criação da tabela 'manutencoes'
export const manutencoes = sqliteTable("manutencoes", {
  id: integer("id").primaryKey({ autoIncrement: true }), // ID auto incremental
  equipamento_id: integer("equipamento_id").notNull(), // FK para equipamentos
  data_manutencao: integer("data_manutencao", { mode: 'timestamp' }).notNull(), // Data da manutenção
  descricao: text("descricao").notNull(), // Descrição do problema/serviço
  responsavel: text("responsavel"), // Quem fez a manutenção
  status: text("status").notNull(), // Status: agendada, em_andamento, concluida, cancelada
  observacoes: text("observacoes"), // Campo livre para observações
  criado_em: integer("criado_em", { mode: 'timestamp' }).$defaultFn(() => new Date()), // Data/hora de criação
});

// Criação da tabela 'emprestimos'
export const emprestimos = sqliteTable("emprestimos", {
  id: integer("id").primaryKey({ autoIncrement: true }), // ID auto incremental
  equipamento_id: integer("equipamento_id").notNull(), // FK para equipamentos
  usuario_id: integer("usuario_id").notNull(), // FK para usuarios
  data_emprestimo: integer("data_emprestimo", { mode: 'timestamp' }).notNull(), // Data do empréstimo
  data_devolucao: integer("data_devolucao", { mode: 'timestamp' }), // Data da devolução (null se ainda emprestado)
  status: text("status").notNull(), // Status: ativo, devolvido, atrasado
  observacoes: text("observacoes"), // Campo livre para observações
  criado_em: integer("criado_em", { mode: 'timestamp' }).$defaultFn(() => new Date()), // Data/hora de criação
});

// Criação da tabela 'equipamentos_inserviveis'
export const equipamentosInserviveis = sqliteTable("equipamentos_inserviveis", {
  id: integer("id").primaryKey({ autoIncrement: true }), // ID auto incremental
  equipamento_id: integer("equipamento_id"), // FK para equipamentos (opcional)
  tipo: text("tipo").notNull(), // Tipo do equipamento
  marca: text("marca").notNull(), // Marca do equipamento
  modelo: text("modelo").notNull(), // Modelo
  tombo: text("tombo").notNull().unique(), // Código patrimonial único
  motivo_inservivel: text("motivo_inservivel").notNull(), // Motivo pelo qual é inservível
  data_baixa: integer("data_baixa", { mode: 'timestamp' }).notNull(), // Data da baixa do patrimônio
  responsavel_baixa: text("responsavel_baixa").notNull(), // Quem fez a baixa
  observacoes: text("observacoes"), // Observações adicionais
  criado_em: integer("criado_em", { mode: 'timestamp' }).$defaultFn(() => new Date()), // Data/hora de criação
});