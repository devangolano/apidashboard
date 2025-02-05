import pool  from "../config/database"
import type { RowDataPacket, ResultSetHeader } from "mysql2"

export interface DocumentationItem {
id?: number
formId: number
standard: string
description: string
condition: string
comment?: string
photo?: string
audio?: string
pdf?: string
}

export const DocumentationItem = {
async create(item: Omit<DocumentationItem, "id">): Promise<number> {
  const [result] = await pool.query<ResultSetHeader>(
    "INSERT INTO documentation_items (form_id, standard, description, `condition`, comment, photo, audio, pdf) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    [item.formId, item.standard, item.description, item.condition, item.comment, item.photo, item.audio, item.pdf],
  )
  return result.insertId
},

async getByFormId(formId: number): Promise<DocumentationItem[]> {
  const [rows] = await pool.query<RowDataPacket[]>("SELECT * FROM documentation_items WHERE form_id = ?", [formId])
  return rows as DocumentationItem[]
},

async deleteByFormId(formId: number): Promise<void> {
  await pool.query("DELETE FROM documentation_items WHERE form_id = ?", [formId])
},
}