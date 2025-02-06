"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentationItemModel = void 0;
const database_1 = __importDefault(require("../config/database"));
exports.DocumentationItemModel = {
    async create(item) {
        const [result] = await database_1.default.query("INSERT INTO documentation_items (form_id, standard, description, `condition`, comment, photo, audio, pdf) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [item.formId, item.standard, item.description, item.condition, item.comment, item.photo, item.audio, item.pdf]);
        return result.insertId;
    },
    async getByFormId(formId) {
        const [rows] = await database_1.default.query("SELECT * FROM documentation_items WHERE form_id = ?", [
            formId,
        ]);
        return rows.map((row) => (Object.assign(Object.assign({}, row), { id: row.id, formId: row.form_id })));
    },
    async deleteByFormId(formId) {
        const [result] = await database_1.default.query("DELETE FROM documentation_items WHERE form_id = ?", [formId]);
        return result.affectedRows > 0;
    },
    async update(id, item) {
        const [result] = await database_1.default.query(`UPDATE documentation_items SET 
       form_id = IFNULL(?, form_id),
       standard = IFNULL(?, standard),
       description = IFNULL(?, description),
       \`condition\` = IFNULL(?, \`condition\`),
       comment = IFNULL(?, comment),
       photo = IFNULL(?, photo),
       audio = IFNULL(?, audio),
       pdf = IFNULL(?, pdf)
       WHERE id = ?`, [
            item.formId,
            item.standard,
            item.description,
            item.condition,
            item.comment,
            item.photo,
            item.audio,
            item.pdf,
            id,
        ]);
        return result.affectedRows > 0;
    },
    async getById(id) {
        const [rows] = await database_1.default.query("SELECT * FROM documentation_items WHERE id = ?", [id]);
        if (rows.length === 0)
            return null;
        const row = rows[0];
        return Object.assign(Object.assign({}, row), { id: row.id, formId: row.form_id });
    },
};
exports.default = exports.DocumentationItemModel;
