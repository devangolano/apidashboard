import pool from "../config/database"
import type { RowDataPacket, ResultSetHeader } from "mysql2"

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

export const ChecklistItem = {
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
}