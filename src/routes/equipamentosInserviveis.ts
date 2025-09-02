import { Router } from "express";
import { db } from "../db";
import { equipamentosInserviveis } from "../schema";
import { eq } from "drizzle-orm";

const router = Router();

// GET /equipamentos-inserviveis → lista todos
router.get("/", async (req, res) => {
  try {
    const lista = await db.select().from(equipamentosInserviveis);
    res.json(lista);
  } catch (error) {
    console.error("Erro ao buscar equipamentos inservíveis:", error);
    res.status(500).json({ erro: "Erro ao buscar equipamentos inservíveis" });
  }
});

// GET /equipamentos-inserviveis/:id → busca por ID
router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const resultado = await db
      .select()
      .from(equipamentosInserviveis)
      .where(eq(equipamentosInserviveis.id, id));

    if (resultado.length === 0) {
      return res.status(404).json({ mensagem: "Equipamento inservível não encontrado" });
    }

    res.json(resultado[0]);
  } catch (error) {
    console.error("Erro ao buscar equipamento inservível por ID:", error);
    res.status(500).json({ erro: "Erro ao buscar equipamento inservível" });
  }
});

// POST /equipamentos-inserviveis → cadastrar novo equipamento inservível
router.post("/", async (req, res) => {
  try {
    const novoEquipamento = await db
      .insert(equipamentosInserviveis)
      .values(req.body)
      .returning();

    res.status(201).json(novoEquipamento[0]);
  } catch (error) {
    console.error("Erro ao cadastrar equipamento inservível:", error);
    res.status(500).json({ erro: "Erro ao cadastrar equipamento inservível" });
  }
});

// PUT /equipamentos-inserviveis/:id → editar equipamento inservível
router.put("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const atualizado = await db
      .update(equipamentosInserviveis)
      .set(req.body)
      .where(eq(equipamentosInserviveis.id, id))
      .returning();

    if (atualizado.length === 0) {
      return res.status(404).json({ mensagem: "Equipamento inservível não encontrado" });
    }

    res.json(atualizado[0]);
  } catch (error) {
    console.error("Erro ao atualizar equipamento inservível:", error);
    res.status(500).json({ erro: "Erro ao atualizar equipamento inservível" });
  }
});

// DELETE /equipamentos-inserviveis/:id → excluir equipamento inservível
router.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const deletado = await db
      .delete(equipamentosInserviveis)
      .where(eq(equipamentosInserviveis.id, id))
      .returning();

    if (deletado.length === 0) {
      return res.status(404).json({ mensagem: "Equipamento inservível não encontrado" });
    }

    res.status(204).send();
  } catch (error) {
    console.error("Erro ao deletar equipamento inservível:", error);
    res.status(500).json({ erro: "Erro ao deletar equipamento inservível" });
  }
});

export default router;
