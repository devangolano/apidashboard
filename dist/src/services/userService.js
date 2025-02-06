"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const database_1 = __importDefault(require("../config/database"));
class UserModel {
    async create(userData) {
        const { nome, email, senha, cpf, foto, role } = userData;
        const hashedPassword = await bcryptjs_1.default.hash(senha, 10);
        const connection = await database_1.default.getConnection();
        try {
            const [result] = await connection.execute('INSERT INTO users (nome, email, senha, cpf, foto, role) VALUES (?, ?, ?, ?, ?, ?)', [nome, email, hashedPassword, cpf, foto || null, role || 'user']);
            return result;
        }
        finally {
            connection.release();
        }
    }
    async findByEmail(email) {
        const connection = await database_1.default.getConnection();
        try {
            const [rows] = await connection.execute('SELECT * FROM users WHERE email = ?', [email]);
            return rows[0] || null;
        }
        finally {
            connection.release();
        }
    }
    async findById(id) {
        const connection = await database_1.default.getConnection();
        try {
            const [rows] = await connection.execute('SELECT id, nome, email, cpf, foto, role FROM users WHERE id = ?', [id]);
            return rows[0] || null;
        }
        finally {
            connection.release();
        }
    }
    async findAll() {
        const connection = await database_1.default.getConnection();
        try {
            const [rows] = await connection.execute('SELECT id, nome, email, cpf, foto, role FROM users');
            return rows;
        }
        finally {
            connection.release();
        }
    }
    async update(id, userData) {
        const connection = await database_1.default.getConnection();
        try {
            const updateFields = [];
            const updateValues = [];
            for (const [key, value] of Object.entries(userData)) {
                if (value !== undefined) {
                    updateFields.push(`${key} = ?`);
                    updateValues.push(key === 'senha' ? await bcryptjs_1.default.hash(value, 10) : value);
                }
            }
            updateValues.push(id);
            const [result] = await connection.execute(`UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`, updateValues);
            return result;
        }
        finally {
            connection.release();
        }
    }
    async delete(id) {
        const connection = await database_1.default.getConnection();
        try {
            const [result] = await connection.execute('DELETE FROM users WHERE id = ?', [id]);
            return result;
        }
        finally {
            connection.release();
        }
    }
    async comparePassword(password, hashedPassword) {
        return bcryptjs_1.default.compare(password, hashedPassword);
    }
}
exports.default = new UserModel();
