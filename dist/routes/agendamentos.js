"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const schema_1 = require("../schema");
const drizzle_orm_1 = require("drizzle-orm");
const router = (0, express_1.Router)();
// GET /agendamentos → lista todos
router.get("/", async (req, res) => {
    try {
        const lista = await db_1.db.select().from(schema_1.agendamentos);
        res.json(lista);
    }
    catch (error) {
        res.status(500).json({ erro: "Erro ao buscar agendamentos" });
    }
});
// GET /agendamentos/:id → busca por ID
router.get("/:id", async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const resultado = await db_1.db
            .select()
            .from(schema_1.agendamentos)
            .where((0, drizzle_orm_1.eq)(schema_1.agendamentos.id, id));
        if (resultado.length === 0) {
            return res.status(404).json({ mensagem: "Agendamento não encontrado" });
        }
        res.json(resultado[0]);
    }
    catch (error) {
        res.status(500).json({ erro: "Erro ao buscar agendamento" });
    }
});
// POST /agendamentos → cadastrar novo agendamento
router.post("/", async (req, res) => {
    try {
        const novoAgendamento = await db_1.db
            .insert(schema_1.agendamentos)
            .values(req.body)
            .returning();
        res.status(201).json(novoAgendamento[0]);
    }
    catch (error) {
        res.status(500).json({ erro: "Erro ao cadastrar agendamento" });
    }
});
// PUT /agendamentos/:id → editar agendamento
router.put("/:id", async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const atualizado = await db_1.db
            .update(schema_1.agendamentos)
            .set(req.body)
            .where((0, drizzle_orm_1.eq)(schema_1.agendamentos.id, id))
            .returning();
        res.json(atualizado[0]);
    }
    catch (error) {
        res.status(500).json({ erro: "Erro ao atualizar agendamento" });
    }
});
// DELETE /agendamentos/:id → excluir agendamento
router.delete("/:id", async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        await db_1.db.delete(schema_1.agendamentos).where((0, drizzle_orm_1.eq)(schema_1.agendamentos.id, id));
        res.status(204).send();
    }
    catch (error) {
        res.status(500).json({ erro: "Erro ao deletar agendamento" });
    }
});
exports.default = router;
