"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormModel = void 0;
const database_1 = __importDefault(require("../config/database"));
exports.FormModel = {
    async create(formData) {
        const { empresa, area, data, hora, executadoPor } = formData;
        const [result] = await database_1.default.query("INSERT INTO forms (empresa, area, data, hora, executado_por) VALUES (?, ?, ?, ?, ?)", [empresa, area, data, hora, executadoPor]);
        return result.insertId;
    },
    async getById(id) {
        const [rows] = await database_1.default.query("SELECT * FROM forms WHERE id = ?", [id]);
        if (rows.length === 0) {
            return null;
        }
        const formRow = rows[0];
        return {
            id: formRow.id,
            empresa: formRow.empresa,
            area: formRow.area,
            data: formRow.data,
            hora: formRow.hora,
            executadoPor: formRow.executado_por,
        };
    },
    async update(id, formData) {
        const { empresa, area, data, hora, executadoPor } = formData;
        const [result] = await database_1.default.query("UPDATE forms SET empresa = IFNULL(?, empresa), area = IFNULL(?, area), data = IFNULL(?, data), hora = IFNULL(?, hora), executado_por = IFNULL(?, executado_por) WHERE id = ?", [empresa, area, data, hora, executadoPor, id]);
        return result.affectedRows > 0;
    },
    async delete(id) {
        const [result] = await database_1.default.query("DELETE FROM forms WHERE id = ?", [id]);
        return result.affectedRows > 0;
    },
    async getAll() {
        const [rows] = await database_1.default.query("SELECT * FROM forms");
        return rows.map((row) => ({
            id: row.id,
            empresa: row.empresa,
            area: row.area,
            data: row.data,
            hora: row.hora,
            executadoPor: row.executado_por,
        }));
    },
};
exports.default = exports.FormModel;
