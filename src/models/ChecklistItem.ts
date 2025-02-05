import pool from "../config/database"
import type { RowDataPacket, ResultSetHeader } from "mysql2/promise"

export interface ChecklistItem {
  id?: number
  formId: number
  standard: string
  description: string
  condition: string
  fe: string
  nper: string
  photo?: string
  audio?: string
  comment?: string
}

export const ChecklistItemModel = {
  async create(item: Omit<ChecklistItem, "id">): Promise<number> {
    const [result] = await pool.query<ResultSetHeader>(
      "INSERT INTO checklist_items (form_id, standard, description, `condition`, fe, nper, photo, audio, comment) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        item.formId,
        item.standard,
        item.description,
        item.condition,
        item.fe,
        item.nper,
        item.photo,
        item.audio,
        item.comment,
      ],
    )
    return result.insertId
  },

  async getByFormId(formId: number): Promise<ChecklistItem[]> {
    const [rows] = await pool.query<RowDataPacket[]>("SELECT * FROM checklist_items WHERE form_id = ?", [formId])
    return rows as ChecklistItem[]
  },

  async deleteByFormId(formId: number): Promise<void> {
    await pool.query("DELETE FROM checklist_items WHERE form_id = ?", [formId])
  },

  async getById(id: number): Promise<ChecklistItem | null> {
    const [rows] = await pool.query<RowDataPacket[]>("SELECT * FROM checklist_items WHERE id = ?", [id])
    return rows.length > 0 ? (rows[0] as ChecklistItem) : null
  },

  async update(id: number, item: Partial<ChecklistItem>): Promise<boolean> {
    const [result] = await pool.query<ResultSetHeader>(
      "UPDATE checklist_items SET form_id = ?, standard = ?, description = ?, `condition` = ?, fe = ?, nper = ?, photo = ?, audio = ?, comment = ? WHERE id = ?",
      [
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
      ],
    )
    return result.affectedRows > 0
  },

  validate(item: Partial<ChecklistItem>): string[] {
    const errors: string[] = []
    if (!item.formId) errors.push("formId é obrigatório")
    if (!item.standard) errors.push("standard é obrigatório")
    if (!item.description) errors.push("description é obrigatório")
    if (!item.condition) errors.push("condition é obrigatório")
    if (!item.fe) errors.push("fe é obrigatório")
    if (!item.nper) errors.push("nper é obrigatório")
    return errors
  },
}

export default ChecklistItemModel

