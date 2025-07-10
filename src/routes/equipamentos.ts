import { Router } from "express";
import { db } from "../db";
import { equipamentos } from "../schema";
import { eq } from "drizzle-orm";
import { generateEquipmentQRCode } from "../services/qrcode.service";

const router = Router();

// GET /equipamentos → lista todos
router.get("/", async (req, res) => {
  try {
    const lista = await db.select().from(equipamentos);
    res.json(lista);
  } catch (error) {
    res.status(500).json({ erro: "Erro ao buscar equipamentos" });
  }
});

// Endpoint para retornar o QR Code do equipamento (DEVE VIR ANTES DE /:id)
router.get("/:id/qrcode", async (req, res) => {
  const { id } = req.params;
  try {
    const qr = await generateEquipmentQRCode(id);
    // qr é uma dataURL base64, precisamos extrair o base64
    const base64Data = qr.replace(/^data:image\/png;base64,/, "");
    const img = Buffer.from(base64Data, "base64");
    res.type("image/png");
    res.send(img);
  } catch (e) {
    res.status(500).json({ error: "Erro ao gerar QR Code" });
  }
});

// GET /equipamentos/:id → busca por ID (DEVE VIR DEPOIS DE /:id/qrcode)
router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const resultado = await db
      .select()
      .from(equipamentos)
      .where(eq(equipamentos.id, id));

    if (resultado.length === 0) {
      return res.status(404).json({ mensagem: "Equipamento não encontrado" });
    }

    res.json(resultado[0]);
  } catch (error) {
    res.status(500).json({ erro: "Erro ao buscar equipamento" });
  }
});

// POST /equipamentos → adicionar novo
router.post("/", async (req, res) => {
  try {
    const novoEquipamento = await db
      .insert(equipamentos)
      .values(req.body)
      .returning();

    res.status(201).json(novoEquipamento[0]);
  } catch (error) {
    res.status(500).json({ erro: "Erro ao adicionar equipamento" });
  }
});

// PUT /equipamentos/:id → atualizar equipamento
router.put("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const atualizado = await db
      .update(equipamentos)
      .set(req.body)
      .where(eq(equipamentos.id, id))
      .returning();

    res.json(atualizado[0]);
  } catch (error) {
    res.status(500).json({ erro: "Erro ao atualizar equipamento" });
  }
});

// DELETE /equipamentos/:id → remover equipamento
router.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(equipamentos).where(eq(equipamentos.id, id));
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ erro: "Erro ao deletar equipamento" });
  }
});

export default router;
