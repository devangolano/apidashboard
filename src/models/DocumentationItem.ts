import pool from "../config/database"
import type { RowDataPacket, ResultSetHeader } from "mysql2/promise"

export interface DocumentationItemData {
  formId: number
  standard: string
  description: string
  condition: string
  comment?: string
  photo?: string
  audio?: string
  pdf?: string
}

export interface DocumentationItem extends DocumentationItemData {
  id: number
}

interface DocumentationItemRow extends RowDataPacket, Omit<DocumentationItem, "formId"> {
  form_id: number
}

export const DocumentationItemModel = {
  async create(item: DocumentationItemData): Promise<number> {
    const [result] = await pool.query<ResultSetHeader>(
      "INSERT INTO documentation_items (form_id, standard, description, `condition`, comment, photo, audio, pdf) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [item.formId, item.standard, item.description, item.condition, item.comment, item.photo, item.audio, item.pdf],
    )
    return result.insertId
  },

  async getByFormId(formId: number): Promise<DocumentationItem[]> {
    const [rows] = await pool.query<DocumentationItemRow[]>("SELECT * FROM documentation_items WHERE form_id = ?", [
      formId,
    ])
    return rows.map((row) => ({
      ...row,
      id: row.id,
      formId: row.form_id,
    }))
  },

  async deleteByFormId(formId: number): Promise<boolean> {
    const [result] = await pool.query<ResultSetHeader>("DELETE FROM documentation_items WHERE form_id = ?", [formId])
    return result.affectedRows > 0
  },

  async update(id: number, item: Partial<DocumentationItemData>): Promise<boolean> {
    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE documentation_items SET 
       form_id = IFNULL(?, form_id),
       standard = IFNULL(?, standard),
       description = IFNULL(?, description),
       \`condition\` = IFNULL(?, \`condition\`),
       comment = IFNULL(?, comment),
       photo = IFNULL(?, photo),
       audio = IFNULL(?, audio),
       pdf = IFNULL(?, pdf)
       WHERE id = ?`,
      [
        item.formId,
        item.standard,
        item.description,
        item.condition,
        item.comment,
        item.photo,
        item.audio,
        item.pdf,
        id,
      ],
    )
    return result.affectedRows > 0
  },

  async getById(id: number): Promise<DocumentationItem | null> {
    const [rows] = await pool.query<DocumentationItemRow[]>("SELECT * FROM documentation_items WHERE id = ?", [id])
    if (rows.length === 0) return null
    const row = rows[0]
    return {
      ...row,
      id: row.id,
      formId: row.form_id,
    }
  },
}

export default DocumentationItemModel

