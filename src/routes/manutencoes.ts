import { Router } from "express";
import { db } from "../db";
import { manutencoes } from "../schema";
import { eq } from "drizzle-orm";

const router = Router();

// GET /manutencoes → lista todas
router.get("/", async (req, res) => {
  try {
    const lista = await db.select().from(manutencoes);
    res.json(lista);
  } catch (error) {
    res.status(500).json({ erro: "Erro ao buscar manutenções" });
  }
});

// GET /manutencoes/:id → busca por ID
router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const resultado = await db
      .select()
      .from(manutencoes)
      .where(eq(manutencoes.id, id));

    if (resultado.length === 0) {
      return res.status(404).json({ mensagem: "Manutenção não encontrada" });
    }

    res.json(resultado[0]);
  } catch (error) {
    res.status(500).json({ erro: "Erro ao buscar manutenção" });
  }
});

// POST /manutencoes → cadastrar nova manutenção
router.post("/", async (req, res) => {
  try {
    const novaManutencao = await db
      .insert(manutencoes)
      .values(req.body)
      .returning();

    res.status(201).json(novaManutencao[0]);
  } catch (error) {
    res.status(500).json({ erro: "Erro ao cadastrar manutenção" });
  }
});

// PUT /manutencoes/:id → editar manutenção
router.put("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const atualizado = await db
      .update(manutencoes)
      .set(req.body)
      .where(eq(manutencoes.id, id))
      .returning();

    res.json(atualizado[0]);
  } catch (error) {
    res.status(500).json({ erro: "Erro ao atualizar manutenção" });
  }
});

// DELETE /manutencoes/:id → excluir manutenção
router.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(manutencoes).where(eq(manutencoes.id, id));
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ erro: "Erro ao deletar manutenção" });
  }
});

export default router; 