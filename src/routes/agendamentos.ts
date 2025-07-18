import { Router } from "express";
import { db } from "../db";
import { agendamentos } from "../schema";
import { eq } from "drizzle-orm";

const router = Router();

// GET /agendamentos → lista todos
router.get("/", async (req, res) => {
  try {
    const lista = await db.select().from(agendamentos);
    res.json(lista);
  } catch (error) {
    console.error("Erro ao buscar agendamentos:", error);
    res.status(500).json({ erro: "Erro ao buscar agendamentos" });
  }
});

// GET /agendamentos/:id → busca por ID
router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const resultado = await db
      .select()
      .from(agendamentos)
      .where(eq(agendamentos.id, id));

    if (resultado.length === 0) {
      return res.status(404).json({ mensagem: "Agendamento não encontrado" });
    }

    res.json(resultado[0]);
  } catch (error) {
    console.error("Erro ao buscar agendamento por ID:", error);
    res.status(500).json({ erro: "Erro ao buscar agendamento" });
  }
});

// POST /agendamentos → cadastrar novo agendamento
router.post("/", async (req, res) => {
  try {
    const novoAgendamento = await db
      .insert(agendamentos)
      .values(req.body)
      .returning();

    res.status(201).json(novoAgendamento[0]);
  } catch (error) {
    console.error("Erro ao cadastrar agendamento:", error);
    res.status(500).json({ erro: "Erro ao cadastrar agendamento" });
  }
});

// PUT /agendamentos/:id → editar agendamento
router.put("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const atualizado = await db
      .update(agendamentos)
      .set(req.body)
      .where(eq(agendamentos.id, id))
      .returning();

    res.json(atualizado[0]);
  } catch (error) {
    console.error("Erro ao atualizar agendamento:", error);
    res.status(500).json({ erro: "Erro ao atualizar agendamento" });
  }
});

// DELETE /agendamentos/:id → excluir agendamento
router.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(agendamentos).where(eq(agendamentos.id, id));
    res.status(204).send();
  } catch (error) {
    console.error("Erro ao deletar agendamento:", error);
    res.status(500).json({ erro: "Erro ao deletar agendamento" });
  }
});

export default router; 