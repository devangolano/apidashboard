import pool from "../config/database"
import type { RowDataPacket, ResultSetHeader } from "mysql2/promise"

export interface FormData {
  empresa: string
  area: string
  data: string
  hora: string
  executadoPor: string
}

export interface Form extends FormData {
  id: number
}

interface FormRow extends RowDataPacket, Omit<Form, "executadoPor"> {
  executado_por: string
}

export const FormModel = {
  async create(formData: FormData): Promise<number> {
    const { empresa, area, data, hora, executadoPor } = formData

    const [result] = await pool.query<ResultSetHeader>(
      "INSERT INTO forms (empresa, area, data, hora, executado_por) VALUES (?, ?, ?, ?, ?)",
      [empresa, area, data, hora, executadoPor],
    )

    return result.insertId
  },

  async getById(id: number): Promise<Form | null> {
    const [rows] = await pool.query<FormRow[]>("SELECT * FROM forms WHERE id = ?", [id])

    if (rows.length === 0) {
      return null
    }

    const formRow = rows[0]
    return {
      id: formRow.id,
      empresa: formRow.empresa,
      area: formRow.area,
      data: formRow.data,
      hora: formRow.hora,
      executadoPor: formRow.executado_por,
    }
  },

  async update(id: number, formData: Partial<FormData>): Promise<boolean> {
    const { empresa, area, data, hora, executadoPor } = formData

    const [result] = await pool.query<ResultSetHeader>(
      "UPDATE forms SET empresa = IFNULL(?, empresa), area = IFNULL(?, area), data = IFNULL(?, data), hora = IFNULL(?, hora), executado_por = IFNULL(?, executado_por) WHERE id = ?",
      [empresa, area, data, hora, executadoPor, id],
    )

    return result.affectedRows > 0
  },

  async delete(id: number): Promise<boolean> {
    const [result] = await pool.query<ResultSetHeader>("DELETE FROM forms WHERE id = ?", [id])
    return result.affectedRows > 0
  },

  async getAll(): Promise<Form[]> {
    const [rows] = await pool.query<FormRow[]>("SELECT * FROM forms")
    return rows.map((row) => ({
      id: row.id,
      empresa: row.empresa,
      area: row.area,
      data: row.data,
      hora: row.hora,
      executadoPor: row.executado_por,
    }))
  },
}

export default FormModel

