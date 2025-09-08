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
    // Converter data_baixa de string para Date se necessário e tratar equipamento_id
    const dadosEquipamento = {
      ...req.body,
      data_baixa: req.body.data_baixa ? new Date(req.body.data_baixa) : new Date(),
      equipamento_id: req.body.equipamento_id && req.body.equipamento_id > 0 ? req.body.equipamento_id : null
    };

    const novoEquipamento = await db
      .insert(equipamentosInserviveis)
      .values(dadosEquipamento)
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
    
    // Converter data_baixa de string para Date se necessário e tratar equipamento_id
    const dadosEquipamento = {
      ...req.body,
      data_baixa: req.body.data_baixa ? new Date(req.body.data_baixa) : undefined,
      equipamento_id: req.body.equipamento_id && req.body.equipamento_id > 0 ? req.body.equipamento_id : null
    };

    const atualizado = await db
      .update(equipamentosInserviveis)
      .set(dadosEquipamento)
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
