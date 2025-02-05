import { RowDataPacket, ResultSetHeader, PoolConnection } from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import pool from '../config/database';

interface User extends RowDataPacket {
  id: number;
  nome: string;
  email: string;
  senha: string;
  cpf: string;
  foto?: string;
  role: 'user' | 'admin';
}

class UserModel {
  async create(userData: Omit<User, 'id'>): Promise<ResultSetHeader> {
    const { nome, email, senha, cpf, foto, role } = userData;
    const hashedPassword = await bcrypt.hash(senha, 10);

    const connection: PoolConnection = await pool.getConnection();
    try {
      const [result] = await connection.execute<ResultSetHeader>(
        'INSERT INTO users (nome, email, senha, cpf, foto, role) VALUES (?, ?, ?, ?, ?, ?)',
        [nome, email, hashedPassword, cpf, foto || null, role || 'user']
      );
      return result;
    } finally {
      connection.release();
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    const connection: PoolConnection = await pool.getConnection();
    try {
      const [rows] = await connection.execute<User[]>(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );
      return rows[0] || null;
    } finally {
      connection.release();
    }
  }

  async findById(id: number): Promise<User | null> {
    const connection: PoolConnection = await pool.getConnection();
    try {
      const [rows] = await connection.execute<User[]>(
        'SELECT id, nome, email, cpf, foto, role FROM users WHERE id = ?',
        [id]
      );
      return rows[0] || null;
    } finally {
      connection.release();
    }
  }

  async findAll(): Promise<User[]> {
    const connection: PoolConnection = await pool.getConnection();
    try {
      const [rows] = await connection.execute<User[]>(
        'SELECT id, nome, email, cpf, foto, role FROM users'
      );
      return rows;
    } finally {
      connection.release();
    }
  }

  async update(id: number, userData: Partial<Omit<User, 'id'>>): Promise<ResultSetHeader> {
    const connection: PoolConnection = await pool.getConnection();
    try {
      const updateFields: string[] = [];
      const updateValues: any[] = [];

      for (const [key, value] of Object.entries(userData)) {
        if (value !== undefined) {
          updateFields.push(`${key} = ?`);
          updateValues.push(key === 'senha' ? await bcrypt.hash(value, 10) : value);
        }
      }

      updateValues.push(id);

      const [result] = await connection.execute<ResultSetHeader>(
        `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
        updateValues
      );
      return result;
    } finally {
      connection.release();
    }
  }

  async delete(id: number): Promise<ResultSetHeader> {
    const connection: PoolConnection = await pool.getConnection();
    try {
      const [result] = await connection.execute<ResultSetHeader>(
        'DELETE FROM users WHERE id = ?',
        [id]
      );
      return result;
    } finally {
      connection.release();
    }
  }

  async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }
}

export default new UserModel();