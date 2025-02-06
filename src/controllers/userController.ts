import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import UserModel, { type User } from "../models/user";
import type { ResultSetHeader } from "mysql2";

interface UserCreateData {
  nome: string;
  email: string;
  senha: string;
  cpf: string;
  celular: string;
  foto?: string;
  role: "admin" | "user";
  notes?: string;
}

interface UserUpdateData {
  nome?: string;
  email?: string;
  senha?: string;
  cpf?: string;
  celular?: string;
  foto?: string;
  role?: "admin" | "user";
  notes?: string;
}

class UserController {
  async create(req: Request, res: Response): Promise<void> {
    try {
      const { nome, email, senha, cpf, celular, role, notes } = req.body;
      const foto = req.file ? req.file.path : undefined;

      if (!nome || !email || !senha || !cpf || !celular) {
        res.status(400).json({ message: "Todos os campos obrigatórios devem ser preenchidos" });
        return;
      }

      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        res.status(400).json({ message: "Email já cadastrado" });
        return;
      }

      const adjustedRole = role === "Administrador" ? "admin" : "user";

      // Hash da senha
      const hashedSenha = await bcrypt.hash(senha, 10);

      const userData: UserCreateData = {
        nome,
        email,
        senha: hashedSenha,
        cpf,
        celular,
        foto,
        role: adjustedRole,
        notes,
      };

      const result = await UserModel.create(userData);
      const insertId = (result as ResultSetHeader).insertId;

      const token = jwt.sign(
        { id: insertId, email: email, role: adjustedRole },
        process.env.JWT_SECRET || "fallback_secret",
        { expiresIn: "1h" },
      );

      res.status(201).json({
        message: "Usuário criado com sucesso",
        userId: insertId,
        token: token,
      });
    } catch (error) {
      console.error("Erro ao criar usuário:", error);
      res.status(500).json({ message: "Erro ao criar usuário" });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      console.log('Requisição de login recebida:', {
        body: req.body,
        headers: req.headers
      });
  
      const { email, senha } = req.body;
  
      if (!email || !senha) {
        console.log('Email ou senha faltando');
        res.status(400).json({ 
          message: "Email e senha são obrigatórios",
          received: { email: !!email, senha: !!senha }
        });
        return;
      }
  
      const user = await UserModel.findByEmail(email);
      
      console.log('Usuário encontrado:', user ? 'Sim' : 'Não');
  
      if (!user) {
        res.status(401).json({ message: "Credenciais inválidas" });
        return;
      }
  
      const isValidPassword = await bcrypt.compare(senha, user.senha);
      
      console.log('Senha válida:', isValidPassword ? 'Sim' : 'Não');
  
      if (!isValidPassword) {
        res.status(401).json({ message: "Credenciais inválidas" });
        return;
      }
  
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET || "fallback_secret",
        { expiresIn: "1h" }
      );
  
      console.log('Token gerado com sucesso');
  
      res.json({
        message: "Login bem-sucedido",
        token,
        user: {
          id: user.id,
          nome: user.nome,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Erro no login:', error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  }

  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const users = await UserModel.findAll();
      res.json(users);
    } catch (error) {
      console.error("Erro ao listar usuários:", error);
      res.status(500).json({ message: "Erro ao listar usuários" });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = await UserModel.findById(Number(id));

      if (!user) {
        res.status(404).json({ message: "Usuário não encontrado" });
        return;
      }

      res.json(user);
    } catch (error) {
      console.error("Erro ao buscar usuário:", error);
      res.status(500).json({ message: "Erro ao buscar usuário" });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { nome, email, senha, cpf, celular, role, notes } = req.body;
      const foto = req.file ? req.file.path : undefined;

      const existingUser = await UserModel.findById(Number(id));
      if (!existingUser) {
        res.status(404).json({ message: "Usuário não encontrado" });
        return;
      }

      if (email && email !== existingUser.email) {
        const userWithNewEmail = await UserModel.findByEmail(email);
        if (userWithNewEmail) {
          res.status(400).json({ message: "Email já está em uso por outro usuário" });
          return;
        }
      }

      const adjustedRole = role === "Administrador" ? "admin" : "user";

      const userData: Partial<Omit<User, "id">> = {
        nome,
        email,
        cpf,
        celular,
        foto,
        role: adjustedRole,
        notes,
      };

      // Se uma nova senha for fornecida, faça o hash
      if (senha) {
        userData.senha = await bcrypt.hash(senha, 10);
      }

      // Remove undefined fields
      Object.keys(userData).forEach(
        (key) => userData[key as keyof typeof userData] === undefined && delete userData[key as keyof typeof userData],
      );

      const result = await UserModel.update(Number(id), userData);

      if (result.affectedRows === 0) {
        res.status(404).json({ message: "Usuário não encontrado ou nenhuma alteração realizada" });
        return;
      }

      const updatedUser = await UserModel.findById(Number(id));
      res.json({ message: "Usuário atualizado com sucesso", user: updatedUser });
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error);
      res.status(500).json({ message: "Erro ao atualizar usuário" });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await UserModel.delete(Number(id));

      const affectedRows = (result as ResultSetHeader).affectedRows;
      if (affectedRows === 0) {
        res.status(404).json({ message: "Usuário não encontrado" });
        return;
      }

      res.json({ message: "Usuário deletado com sucesso" });
    } catch (error) {
      console.error("Erro ao deletar usuário:", error);
      res.status(500).json({ message: "Erro ao deletar usuário" });
    }
  }
}

export default new UserController();
