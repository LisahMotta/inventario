"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const schema_1 = require("../schema");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const drizzle_orm_1 = require("drizzle-orm");
const router = (0, express_1.Router)();
const JWT_SECRET = process.env.JWT_SECRET || "segredo_super_secreto";
// POST /usuarios → cadastro de novo usuário
router.post("/", async (req, res) => {
    try {
        const { nome, email, senha, tipo } = req.body;
        if (!nome || !senha || !tipo) {
            return res.status(400).json({ erro: "Nome, senha e tipo são obrigatórios" });
        }
        const hash = await bcryptjs_1.default.hash(senha, 10);
        const novoUsuario = await db_1.db
            .insert(schema_1.usuarios)
            .values({ nome, email: email || null, senha: hash, tipo })
            .returning();
        res.status(201).json({ id: novoUsuario[0].id, nome, email: novoUsuario[0].email, tipo });
    }
    catch (error) {
        console.error("Erro detalhado ao cadastrar usuário:", error); // Log detalhado
        res.status(500).json({ erro: "Erro ao cadastrar usuário" });
    }
});
// POST /usuarios/login → autenticação
router.post("/login", async (req, res) => {
    try {
        const { nome, email, senha } = req.body;
        if ((!email && !nome) || !senha) {
            return res.status(400).json({ erro: "Nome ou email e senha são obrigatórios" });
        }
        let resultado;
        if (email) {
            resultado = await db_1.db.select().from(schema_1.usuarios).where((0, drizzle_orm_1.eq)(schema_1.usuarios.email, email));
        }
        else {
            resultado = await db_1.db.select().from(schema_1.usuarios).where((0, drizzle_orm_1.eq)(schema_1.usuarios.nome, nome));
        }
        const usuario = resultado[0];
        if (!usuario) {
            return res.status(401).json({ erro: "Usuário ou senha inválidos" });
        }
        const senhaConfere = await bcryptjs_1.default.compare(senha, usuario.senha);
        if (!senhaConfere) {
            return res.status(401).json({ erro: "Usuário ou senha inválidos" });
        }
        const token = jsonwebtoken_1.default.sign({ id: usuario.id, nome: usuario.nome, email: usuario.email, tipo: usuario.tipo }, JWT_SECRET, { expiresIn: "8h" });
        res.json({ token });
    }
    catch (error) {
        console.error("Erro detalhado ao fazer login:", error);
        res.status(500).json({ erro: "Erro ao fazer login" });
    }
});
exports.default = router;
