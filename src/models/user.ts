import type { RowDataPacket, ResultSetHeader, PoolConnection } from "mysql2/promise"
import bcrypt from "bcryptjs"
import pool from "../config/database"

export interface User extends RowDataPacket {
  id: number
  nome: string
  email: string
  senha: string
  cpf: string
  celular: string
  foto?: string
  role: "user" | "admin"
  notes?: string
}

export class UserModel {
  async create(userData: Omit<User, "id">): Promise<ResultSetHeader> {
    const { nome, email, senha, cpf, celular, foto, role, notes } = userData
    const hashedPassword = await bcrypt.hash(senha, 10)

    const connection: PoolConnection = await pool.getConnection()
    try {
      const [result] = await connection.execute<ResultSetHeader>(
        "INSERT INTO users (nome, email, senha, cpf, celular, foto, role, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [nome, email, hashedPassword, cpf, celular, foto || null, role || "user", notes || null],
      )
      return result
    } finally {
      connection.release()
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    const connection: PoolConnection = await pool.getConnection()
    try {
      const [rows] = await connection.execute<User[]>("SELECT * FROM users WHERE email = ?", [email])
      return rows[0] || null
    } finally {
      connection.release()
    }
  }

  async findById(id: number): Promise<User | null> {
    const connection: PoolConnection = await pool.getConnection()
    try {
      const [rows] = await connection.execute<User[]>(
        "SELECT id, nome, email, cpf, celular, foto, role, notes FROM users WHERE id = ?",
        [id],
      )
      return rows[0] || null
    } finally {
      connection.release()
    }
  }

  async findAll(): Promise<User[]> {
    const connection: PoolConnection = await pool.getConnection()
    try {
      const [rows] = await connection.execute<User[]>(
        "SELECT id, nome, email, cpf, celular, foto, role, notes FROM users",
      )
      return rows
    } finally {
      connection.release()
    }
  }

  async update(id: number, userData: Partial<Omit<User, "id">>): Promise<ResultSetHeader> {
    const connection: PoolConnection = await pool.getConnection()
    try {
      const updateFields: string[] = []
      const updateValues: any[] = []

      // Fetch the existing user data
      const existingUser = await this.findById(id)
      if (!existingUser) {
        throw new Error("User not found")
      }

      // Prepare update fields and values
      for (const [key, value] of Object.entries(userData)) {
        if (value !== undefined) {
          updateFields.push(`${key} = ?`)
          if (key === "senha") {
            updateValues.push(await bcrypt.hash(value, 10))
          } else {
            updateValues.push(value)
          }
        }
      }

      // If no fields to update, return early
      if (updateFields.length === 0) {
        return { affectedRows: 0, insertId: 0, warningStatus: 0 } as ResultSetHeader
      }

      updateValues.push(id)

      const [result] = await connection.execute<ResultSetHeader>(
        `UPDATE users SET ${updateFields.join(", ")} WHERE id = ?`,
        updateValues,
      )

      return result
    } finally {
      connection.release()
    }
  }

  async delete(id: number): Promise<ResultSetHeader> {
    const connection: PoolConnection = await pool.getConnection()
    try {
      const [result] = await connection.execute<ResultSetHeader>("DELETE FROM users WHERE id = ?", [id])
      return result
    } finally {
      connection.release()
    }
  }

  async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword)
  }
}

export const userModel = new UserModel()
export default userModel

