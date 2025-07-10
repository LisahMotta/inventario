"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const schema_1 = require("../schema");
const drizzle_orm_1 = require("drizzle-orm");
const router = (0, express_1.Router)();
// GET /emprestimos → lista todos
router.get("/", async (req, res) => {
    try {
        const lista = await db_1.db.select().from(schema_1.emprestimos);
        res.json(lista);
    }
    catch (error) {
        res.status(500).json({ erro: "Erro ao buscar empréstimos" });
    }
});
// POST /emprestimos → registrar novo empréstimo
router.post("/", async (req, res) => {
    try {
        const { equipamento_id, usuario_id, data_emprestimo, observacoes } = req.body;
        const novo = await db_1.db.insert(schema_1.emprestimos).values({
            equipamento_id,
            usuario_id,
            data_emprestimo,
            status: "emprestado",
            observacoes,
        }).returning();
        res.status(201).json(novo[0]);
    }
    catch (error) {
        res.status(500).json({ erro: "Erro ao registrar empréstimo" });
    }
});
// PUT /emprestimos/:id/devolver → registrar devolução
router.put("/:id/devolver", async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { data_devolucao, observacoes } = req.body;
        const devolvido = await db_1.db.update(schema_1.emprestimos)
            .set({ status: "devolvido", data_devolucao, observacoes })
            .where((0, drizzle_orm_1.eq)(schema_1.emprestimos.id, id))
            .returning();
        res.json(devolvido[0]);
    }
    catch (error) {
        res.status(500).json({ erro: "Erro ao registrar devolução" });
    }
});
exports.default = router;
