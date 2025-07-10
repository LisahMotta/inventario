"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const schema_1 = require("../schema");
const drizzle_orm_1 = require("drizzle-orm");
const router = (0, express_1.Router)();
// GET /manutencoes → lista todas
router.get("/", async (req, res) => {
    try {
        const lista = await db_1.db.select().from(schema_1.manutencoes);
        res.json(lista);
    }
    catch (error) {
        res.status(500).json({ erro: "Erro ao buscar manutenções" });
    }
});
// GET /manutencoes/:id → busca por ID
router.get("/:id", async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const resultado = await db_1.db
            .select()
            .from(schema_1.manutencoes)
            .where((0, drizzle_orm_1.eq)(schema_1.manutencoes.id, id));
        if (resultado.length === 0) {
            return res.status(404).json({ mensagem: "Manutenção não encontrada" });
        }
        res.json(resultado[0]);
    }
    catch (error) {
        res.status(500).json({ erro: "Erro ao buscar manutenção" });
    }
});
// POST /manutencoes → cadastrar nova manutenção
router.post("/", async (req, res) => {
    try {
        const novaManutencao = await db_1.db
            .insert(schema_1.manutencoes)
            .values(req.body)
            .returning();
        res.status(201).json(novaManutencao[0]);
    }
    catch (error) {
        res.status(500).json({ erro: "Erro ao cadastrar manutenção" });
    }
});
// PUT /manutencoes/:id → editar manutenção
router.put("/:id", async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const atualizado = await db_1.db
            .update(schema_1.manutencoes)
            .set(req.body)
            .where((0, drizzle_orm_1.eq)(schema_1.manutencoes.id, id))
            .returning();
        res.json(atualizado[0]);
    }
    catch (error) {
        res.status(500).json({ erro: "Erro ao atualizar manutenção" });
    }
});
// DELETE /manutencoes/:id → excluir manutenção
router.delete("/:id", async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        await db_1.db.delete(schema_1.manutencoes).where((0, drizzle_orm_1.eq)(schema_1.manutencoes.id, id));
        res.status(204).send();
    }
    catch (error) {
        res.status(500).json({ erro: "Erro ao deletar manutenção" });
    }
});
exports.default = router;
