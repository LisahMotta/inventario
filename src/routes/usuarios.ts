import { Router } from "express";
import { db } from "../db";
import { usuarios } from "../schema";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "segredo_super_secreto";

// POST /usuarios → cadastro de novo usuário
router.post("/", async (req, res) => {
  try {
    const { nome, email, senha, tipo } = req.body;
    if (!nome || !senha || !tipo) {
      return res.status(400).json({ erro: "Nome, senha e tipo são obrigatórios" });
    }
    const hash = await bcrypt.hash(senha, 10);
    const novoUsuario = await db
      .insert(usuarios)
      .values({ nome, email: email || null, senha: hash, tipo })
      .returning();
    res.status(201).json({ id: novoUsuario[0].id, nome, email: novoUsuario[0].email, tipo });
  } catch (error) {
    console.error("Erro detalhado ao cadastrar usuário:", error); // Log detalhado
    res.status(500).json({ erro: "Erro ao cadastrar usuário" });
  }
});

// POST /login → autenticação
router.post("/login", async (req, res) => {
  try {
    const { email, senha } = req.body;
    if (!email || !senha) {
      return res.status(400).json({ erro: "Email e senha são obrigatórios" });
    }
    const resultado = await db.select().from(usuarios).where(eq(usuarios.email, email));
    const usuario = resultado[0];
    if (!usuario) {
      return res.status(401).json({ erro: "Usuário ou senha inválidos" });
    }
    const senhaConfere = await bcrypt.compare(senha, usuario.senha);
    if (!senhaConfere) {
      return res.status(401).json({ erro: "Usuário ou senha inválidos" });
    }
    const token = jwt.sign({ id: usuario.id, nome: usuario.nome, email: usuario.email }, JWT_SECRET, { expiresIn: "8h" });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ erro: "Erro ao fazer login" });
  }
});

export default router; 