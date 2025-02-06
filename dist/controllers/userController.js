"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_1 = __importDefault(require("../models/user"));
class UserController {
    async create(req, res) {
        try {
            const { nome, email, senha, cpf, celular, role, notes } = req.body;
            const foto = req.file ? req.file.path : undefined;
            if (!nome || !email || !senha || !cpf || !celular) {
                res.status(400).json({ message: "Todos os campos obrigatórios devem ser preenchidos" });
                return;
            }
            const existingUser = await user_1.default.findByEmail(email);
            if (existingUser) {
                res.status(400).json({ message: "Email já cadastrado" });
                return;
            }
            const adjustedRole = role === "Administrador" ? "admin" : "user";
            const userData = {
                nome,
                email,
                senha,
                cpf,
                celular,
                foto,
                role: adjustedRole,
                notes,
            };
            const result = await user_1.default.create(userData);
            const insertId = result.insertId;
            const token = jsonwebtoken_1.default.sign({ id: insertId, email: email, role: adjustedRole }, process.env.JWT_SECRET || "fallback_secret", { expiresIn: "1h" });
            res.status(201).json({
                message: "Usuário criado com sucesso",
                userId: insertId,
                token: token,
            });
        }
        catch (error) {
            console.error("Erro ao criar usuário:", error);
            res.status(500).json({ message: "Erro ao criar usuário" });
        }
    }
    async login(req, res) {
        try {
            const { email, senha } = req.body;
            const user = await user_1.default.findByEmail(email);
            if (!user) {
                res.status(401).json({ message: "Credenciais inválidas" });
                return;
            }
            const isValidPassword = await user_1.default.comparePassword(senha, user.senha);
            if (!isValidPassword) {
                res.status(401).json({ message: "Credenciais inválidas" });
                return;
            }
            const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET || "fallback_secret", { expiresIn: "1h" });
            res.json({
                message: "Login bem-sucedido",
                token,
                user: {
                    id: user.id,
                    nome: user.nome,
                    email: user.email,
                    role: user.role,
                },
            });
        }
        catch (error) {
            console.error("Erro no login:", error);
            res.status(500).json({ message: "Erro interno do servidor" });
        }
    }
    async getAll(req, res) {
        try {
            const users = await user_1.default.findAll();
            res.json(users);
        }
        catch (error) {
            console.error("Erro ao listar usuários:", error);
            res.status(500).json({ message: "Erro ao listar usuários" });
        }
    }
    async getById(req, res) {
        try {
            const { id } = req.params;
            const user = await user_1.default.findById(Number(id));
            if (!user) {
                res.status(404).json({ message: "Usuário não encontrado" });
                return;
            }
            res.json(user);
        }
        catch (error) {
            console.error("Erro ao buscar usuário:", error);
            res.status(500).json({ message: "Erro ao buscar usuário" });
        }
    }
    async update(req, res) {
        try {
            const { id } = req.params;
            const { nome, email, senha, cpf, celular, role, notes } = req.body;
            const foto = req.file ? req.file.path : undefined;
            const existingUser = await user_1.default.findById(Number(id));
            if (!existingUser) {
                res.status(404).json({ message: "Usuário não encontrado" });
                return;
            }
            if (email && email !== existingUser.email) {
                const userWithNewEmail = await user_1.default.findByEmail(email);
                if (userWithNewEmail) {
                    res.status(400).json({ message: "Email já está em uso por outro usuário" });
                    return;
                }
            }
            const adjustedRole = role === "Administrador" ? "admin" : "user";
            const userData = {
                nome,
                email,
                senha,
                cpf,
                celular,
                foto,
                role: adjustedRole,
                notes,
            };
            // Remove undefined fields
            Object.keys(userData).forEach((key) => userData[key] === undefined && delete userData[key]);
            const result = await user_1.default.update(Number(id), userData);
            if (result.affectedRows === 0) {
                res.status(404).json({ message: "Usuário não encontrado ou nenhuma alteração realizada" });
                return;
            }
            const updatedUser = await user_1.default.findById(Number(id));
            res.json({ message: "Usuário atualizado com sucesso", user: updatedUser });
        }
        catch (error) {
            console.error("Erro ao atualizar usuário:", error);
            res.status(500).json({ message: "Erro ao atualizar usuário" });
        }
    }
    async delete(req, res) {
        try {
            const { id } = req.params;
            const result = await user_1.default.delete(Number(id));
            const affectedRows = result.affectedRows;
            if (affectedRows === 0) {
                res.status(404).json({ message: "Usuário não encontrado" });
                return;
            }
            res.json({ message: "Usuário deletado com sucesso" });
        }
        catch (error) {
            console.error("Erro ao deletar usuário:", error);
            res.status(500).json({ message: "Erro ao deletar usuário" });
        }
    }
}
exports.default = new UserController();
