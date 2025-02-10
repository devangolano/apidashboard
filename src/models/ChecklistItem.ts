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
  irregularidades: string
  recomendacoes: string
}

export const ChecklistItemModel = {
  async create(item: Omit<ChecklistItem, "id">): Promise<number> {
    const errors = this.validate(item)
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(", ")}`)
    }

    try {
      const [result] = await pool.query<ResultSetHeader>(
        "INSERT INTO checklist_items (form_id, standard, description, `condition`, fe, nper, photo, audio, irregularidades, recomendacoes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [
          item.formId,
          item.standard,
          item.description,
          item.condition,
          item.fe,
          item.nper,
          item.photo || null,
          item.audio || null,
          item.irregularidades || null,
          item.recomendacoes || null
        ],
      )
      return result.insertId
    } catch (error) {
      console.error("Error creating checklist item:", error)
      throw new Error("Failed to create checklist item")
    }
  },

  async getByFormId(formId: number): Promise<ChecklistItem[]> {
    try {
      const [rows] = await pool.query<RowDataPacket[]>("SELECT * FROM checklist_items WHERE form_id = ?", [formId])
      return rows as ChecklistItem[]
    } catch (error) {
      console.error("Error fetching checklist items by form ID:", error)
      throw new Error("Failed to fetch checklist items")
    }
  },

  async deleteByFormId(formId: number): Promise<void> {
    try {
      await pool.query("DELETE FROM checklist_items WHERE form_id = ?", [formId])
    } catch (error) {
      console.error("Error deleting checklist items by form ID:", error)
      throw new Error("Failed to delete checklist items")
    }
  },

  async getById(id: number): Promise<ChecklistItem | null> {
    try {
      const [rows] = await pool.query<RowDataPacket[]>("SELECT * FROM checklist_items WHERE id = ?", [id])
      return rows.length > 0 ? (rows[0] as ChecklistItem) : null
    } catch (error) {
      console.error("Error fetching checklist item by ID:", error)
      throw new Error("Failed to fetch checklist item")
    }
  },

  async update(id: number, item: Partial<ChecklistItem>): Promise<boolean> {
    const errors = this.validate(item)
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(", ")}`)
    }

    try {
      const [result] = await pool.query<ResultSetHeader>(
        "UPDATE checklist_items SET form_id = ?, standard = ?, description = ?, `condition` = ?, fe = ?, nper = ?, photo = ?, audio = ?, recomendacoes = ?, irregularidades = ? WHERE id = ?",
        [
          item.formId,
          item.standard,
          item.description,
          item.condition,
          item.fe,
          item.nper,
          item.photo || null,
          item.audio || null,
          id,
          item.irregularidades || null,
          item.recomendacoes || null

        ],
      )
      return result.affectedRows > 0
    } catch (error) {
      console.error("Error updating checklist item:", error)
      throw new Error("Failed to update checklist item")
    }
  },

  validate(item: Partial<ChecklistItem>): string[] {
    const errors: string[] = []
    if (!item.formId) errors.push("formId é obrigatório")
    if (!item.standard) errors.push("standard é obrigatório")
    if (!item.description) errors.push("description é obrigatório")
    if (!item.condition) errors.push("condition é obrigatório")
    if (!item.fe) errors.push("fe é obrigatório")
    if (!item.nper) errors.push("nper é obrigatório")
    if (!item.irregularidades) errors.push("irregularidades é obrigatório")
    if (!item.recomendacoes) errors.push("recomendacoes é obrigatório")
    return errors
  },
}

export default ChecklistItemModel

