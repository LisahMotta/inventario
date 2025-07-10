import { Router } from "express";
import { db } from "../db";
import { emprestimos } from "../schema";
import { eq } from "drizzle-orm";

const router = Router();

// GET /emprestimos → lista todos
router.get("/", async (req, res) => {
  try {
    const lista = await db.select().from(emprestimos);
    res.json(lista);
  } catch (error) {
    res.status(500).json({ erro: "Erro ao buscar empréstimos" });
  }
});

// POST /emprestimos → registrar novo empréstimo
router.post("/", async (req, res) => {
  try {
    const { equipamento_id, usuario_id, data_emprestimo, observacoes } = req.body;
    const novo = await db.insert(emprestimos).values({
      equipamento_id,
      usuario_id,
      data_emprestimo,
      status: "emprestado",
      observacoes,
    }).returning();
    res.status(201).json(novo[0]);
  } catch (error) {
    res.status(500).json({ erro: "Erro ao registrar empréstimo" });
  }
});

// PUT /emprestimos/:id/devolver → registrar devolução
router.put("/:id/devolver", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { data_devolucao, observacoes } = req.body;
    const devolvido = await db.update(emprestimos)
      .set({ status: "devolvido", data_devolucao, observacoes })
      .where(eq(emprestimos.id, id))
      .returning();
    res.json(devolvido[0]);
  } catch (error) {
    res.status(500).json({ erro: "Erro ao registrar devolução" });
  }
});

export default router; 