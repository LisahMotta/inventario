"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const schema_1 = require("../schema");
const drizzle_orm_1 = require("drizzle-orm");
const qrcode_service_1 = require("../services/qrcode.service");
const router = (0, express_1.Router)();
// GET /equipamentos → lista todos
router.get("/", async (req, res) => {
    try {
        const lista = await db_1.db.select().from(schema_1.equipamentos);
        res.json(lista);
    }
    catch (error) {
        res.status(500).json({ erro: "Erro ao buscar equipamentos" });
    }
});
// GET /equipamentos/:id → busca por ID
router.get("/:id", async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const resultado = await db_1.db
            .select()
            .from(schema_1.equipamentos)
            .where((0, drizzle_orm_1.eq)(schema_1.equipamentos.id, id));
        if (resultado.length === 0) {
            return res.status(404).json({ mensagem: "Equipamento não encontrado" });
        }
        res.json(resultado[0]);
    }
    catch (error) {
        res.status(500).json({ erro: "Erro ao buscar equipamento" });
    }
});
// POST /equipamentos → adicionar novo
router.post("/", async (req, res) => {
    try {
        const novoEquipamento = await db_1.db
            .insert(schema_1.equipamentos)
            .values(req.body)
            .returning();
        res.status(201).json(novoEquipamento[0]);
    }
    catch (error) {
        res.status(500).json({ erro: "Erro ao adicionar equipamento" });
    }
});
// PUT /equipamentos/:id → atualizar equipamento
router.put("/:id", async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const atualizado = await db_1.db
            .update(schema_1.equipamentos)
            .set(req.body)
            .where((0, drizzle_orm_1.eq)(schema_1.equipamentos.id, id))
            .returning();
        res.json(atualizado[0]);
    }
    catch (error) {
        res.status(500).json({ erro: "Erro ao atualizar equipamento" });
    }
});
// DELETE /equipamentos/:id → remover equipamento
router.delete("/:id", async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        await db_1.db.delete(schema_1.equipamentos).where((0, drizzle_orm_1.eq)(schema_1.equipamentos.id, id));
        res.status(204).send();
    }
    catch (error) {
        res.status(500).json({ erro: "Erro ao deletar equipamento" });
    }
});
// Endpoint para retornar o QR Code do equipamento
router.get("/:id/qrcode", async (req, res) => {
    const { id } = req.params;
    try {
        const qr = await (0, qrcode_service_1.generateEquipmentQRCode)(id);
        // qr é uma dataURL base64, precisamos extrair o base64
        const base64Data = qr.replace(/^data:image\/png;base64,/, "");
        const img = Buffer.from(base64Data, "base64");
        res.type("image/png");
        res.send(img);
    }
    catch (e) {
        res.status(500).json({ error: "Erro ao gerar QR Code" });
    }
});
exports.default = router;
