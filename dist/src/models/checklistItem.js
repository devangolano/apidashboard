"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChecklistItemModel = void 0;
const database_1 = __importDefault(require("../config/database"));
exports.ChecklistItemModel = {
    async create(item) {
        const [result] = await database_1.default.query("INSERT INTO checklist_items (form_id, standard, description, `condition`, fe, nper, photo, audio, comment) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", [
            item.formId,
            item.standard,
            item.description,
            item.condition,
            item.fe,
            item.nper,
            item.photo,
            item.audio,
            item.comment,
        ]);
        return result.insertId;
    },
    async getByFormId(formId) {
        const [rows] = await database_1.default.query("SELECT * FROM checklist_items WHERE form_id = ?", [formId]);
        return rows;
    },
    async deleteByFormId(formId) {
        await database_1.default.query("DELETE FROM checklist_items WHERE form_id = ?", [formId]);
    },
    async getById(id) {
        const [rows] = await database_1.default.query("SELECT * FROM checklist_items WHERE id = ?", [id]);
        return rows.length > 0 ? rows[0] : null;
    },
    async update(id, item) {
        const [result] = await database_1.default.query("UPDATE checklist_items SET form_id = ?, standard = ?, description = ?, `condition` = ?, fe = ?, nper = ?, photo = ?, audio = ?, comment = ? WHERE id = ?", [
            item.formId,
            item.standard,
            item.description,
            item.condition,
            item.fe,
            item.nper,
            item.photo,
            item.audio,
            item.comment,
            id,
        ]);
        return result.affectedRows > 0;
    },
    validate(item) {
        const errors = [];
        if (!item.formId)
            errors.push("formId é obrigatório");
        if (!item.standard)
            errors.push("standard é obrigatório");
        if (!item.description)
            errors.push("description é obrigatório");
        if (!item.condition)
            errors.push("condition é obrigatório");
        if (!item.fe)
            errors.push("fe é obrigatório");
        if (!item.nper)
            errors.push("nper é obrigatório");
        return errors;
    },
};
exports.default = exports.ChecklistItemModel;
