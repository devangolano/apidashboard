"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userModel = exports.UserModel = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const database_1 = __importDefault(require("../config/database"));
class UserModel {
    async create(userData) {
        const { nome, email, senha, cpf, celular, foto, role, notes } = userData;
        const hashedPassword = await bcryptjs_1.default.hash(senha, 10);
        const connection = await database_1.default.getConnection();
        try {
            const [result] = await connection.execute("INSERT INTO users (nome, email, senha, cpf, celular, foto, role, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [nome, email, hashedPassword, cpf, celular, foto || null, role || "user", notes || null]);
            return result;
        }
        finally {
            connection.release();
        }
    }
    async findByEmail(email) {
        const connection = await database_1.default.getConnection();
        try {
            const [rows] = await connection.execute("SELECT * FROM users WHERE email = ?", [email]);
            return rows[0] || null;
        }
        finally {
            connection.release();
        }
    }
    async findById(id) {
        const connection = await database_1.default.getConnection();
        try {
            const [rows] = await connection.execute("SELECT id, nome, email, cpf, celular, foto, role, notes FROM users WHERE id = ?", [id]);
            return rows[0] || null;
        }
        finally {
            connection.release();
        }
    }
    async findAll() {
        const connection = await database_1.default.getConnection();
        try {
            const [rows] = await connection.execute("SELECT id, nome, email, cpf, celular, foto, role, notes FROM users");
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
            // Fetch the existing user data
            const existingUser = await this.findById(id);
            if (!existingUser) {
                throw new Error("User not found");
            }
            // Prepare update fields and values
            for (const [key, value] of Object.entries(userData)) {
                if (value !== undefined) {
                    updateFields.push(`${key} = ?`);
                    if (key === "senha") {
                        updateValues.push(await bcryptjs_1.default.hash(value, 10));
                    }
                    else {
                        updateValues.push(value);
                    }
                }
            }
            // If no fields to update, return early
            if (updateFields.length === 0) {
                return { affectedRows: 0, insertId: 0, warningStatus: 0 };
            }
            updateValues.push(id);
            const [result] = await connection.execute(`UPDATE users SET ${updateFields.join(", ")} WHERE id = ?`, updateValues);
            return result;
        }
        finally {
            connection.release();
        }
    }
    async delete(id) {
        const connection = await database_1.default.getConnection();
        try {
            const [result] = await connection.execute("DELETE FROM users WHERE id = ?", [id]);
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
exports.UserModel = UserModel;
exports.userModel = new UserModel();
exports.default = exports.userModel;
