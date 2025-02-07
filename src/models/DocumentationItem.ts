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
    const errors = this.validate(item)
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(", ")}`)
    }

    try {
      const [result] = await pool.query<ResultSetHeader>(
        "INSERT INTO documentation_items (form_id, standard, description, `condition`, comment, photo, audio, pdf) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [
          item.formId,
          item.standard,
          item.description,
          item.condition,
          item.comment || null,
          item.photo || null,
          item.audio || null,
          item.pdf || null,
        ],
      )
      return result.insertId
    } catch (error) {
      console.error("Error creating documentation item:", error)
      if (error instanceof Error) {
        throw new Error(`Failed to create documentation item: ${error.message}`)
      } else {
        throw new Error("Failed to create documentation item: Unknown error")
      }
    }
  },

  async getByFormId(formId: number): Promise<DocumentationItem[]> {
    try {
      const [rows] = await pool.query<DocumentationItemRow[]>("SELECT * FROM documentation_items WHERE form_id = ?", [
        formId,
      ])
      return rows.map((row) => ({
        ...row,
        id: row.id,
        formId: row.form_id,
      }))
    } catch (error) {
      console.error("Error fetching documentation items by form ID:", error)
      throw new Error("Failed to fetch documentation items")
    }
  },

  async deleteByFormId(formId: number): Promise<boolean> {
    try {
      const [result] = await pool.query<ResultSetHeader>("DELETE FROM documentation_items WHERE form_id = ?", [formId])
      return result.affectedRows > 0
    } catch (error) {
      console.error("Error deleting documentation items by form ID:", error)
      throw new Error("Failed to delete documentation items")
    }
  },

  validate(item: Partial<DocumentationItemData>, isUpdate = false): string[] {
    const errors: string[] = []
    if (!isUpdate) {
      if (!item.formId) errors.push("formId é obrigatório")
      if (!item.standard) errors.push("standard é obrigatório")
      if (!item.description) errors.push("description é obrigatório")
      if (!item.condition) errors.push("condition é obrigatório")
    } else {
      if (item.formId !== undefined && typeof item.formId !== "number") errors.push("formId deve ser um número")
      if (item.standard !== undefined && typeof item.standard !== "string") errors.push("standard deve ser uma string")
      if (item.description !== undefined && typeof item.description !== "string")
        errors.push("description deve ser uma string")
      if (item.condition !== undefined && typeof item.condition !== "string")
        errors.push("condition deve ser uma string")
    }

    // Validação adicional para o tamanho dos campos
    if (item.standard && item.standard.length > 255) errors.push("standard deve ter no máximo 255 caracteres")
    if (item.description && item.description.length > 1000)
      errors.push("description deve ter no máximo 1000 caracteres")
    if (item.condition && item.condition.length > 255) errors.push("condition deve ter no máximo 255 caracteres")
    if (item.comment && item.comment.length > 1000) errors.push("comment deve ter no máximo 1000 caracteres")

    return errors
  },
}

export default DocumentationItemModel

