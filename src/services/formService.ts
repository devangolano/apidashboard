import type { Form } from "../models/Form"
import { FormModel, type FormData } from "../models/Form"
import { ChecklistItemModel, type ChecklistItem } from "../models/ChecklistItem"
import { DocumentationItemModel, type DocumentationItem } from "../models/DocumentationItem"
import pool from "../config/database"
import PDFDocument from "pdfkit"
import fs from "fs"
import path from "path"

export class FormService {
  async createForm(data: {
    formData: FormData
    checklistItems: Omit<ChecklistItem, "id" | "formId">[]
    documentationItems: Omit<DocumentationItem, "id" | "formId">[]
  }): Promise<number> {
    const connection = await pool.getConnection()

    try {
      await connection.beginTransaction()

      const formId = await FormModel.create(data.formData)

      for (const item of data.checklistItems) {
        await ChecklistItemModel.create({
          ...item,
          formId,
        })
      }

      for (const item of data.documentationItems) {
        console.log("Tentando criar item de documentação:", JSON.stringify(item, null, 2))
        try {
          await DocumentationItemModel.create({
            ...item,
            formId,
          })
        } catch (docError) {
          console.error("Erro ao criar item de documentação:", docError)
          throw docError
        }
      }

      await connection.commit()
      return formId
    } catch (error) {
      await connection.rollback()
      console.error("Erro ao criar formulário:", error)
      if (error instanceof Error) {
        throw new Error(`Falha ao criar formulário: ${error.message}`)
      } else {
        throw new Error("Falha ao criar formulário: Erro desconhecido")
      }
    } finally {
      connection.release()
    }
  }

  async getFormById(id: number): Promise<Form | null> {
    return FormModel.getById(id)
  }

  async updateForm(
    id: number,
    data: {
      formData: Partial<FormData>
      checklistItems: Omit<ChecklistItem, "id" | "formId">[]
      documentationItems: Omit<DocumentationItem, "id" | "formId">[]
    },
  ): Promise<void> {
    const connection = await pool.getConnection()

    try {
      await connection.beginTransaction()

      await FormModel.update(id, data.formData)
      await ChecklistItemModel.deleteByFormId(id)
      await DocumentationItemModel.deleteByFormId(id)

      for (const item of data.checklistItems) {
        await ChecklistItemModel.create({
          ...item,
          formId: id,
        })
      }

      for (const item of data.documentationItems) {
        await DocumentationItemModel.create({
          ...item,
          formId: id,
        })
      }

      await connection.commit()
    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }
  }

  async deleteForm(id: number): Promise<void> {
    const connection = await pool.getConnection()

    try {
      await connection.beginTransaction()

      await ChecklistItemModel.deleteByFormId(id)
      await DocumentationItemModel.deleteByFormId(id)
      await FormModel.delete(id)

      await connection.commit()
    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }
  }

  async getAllForms(): Promise<FormData[]> {
    return await FormModel.getAll()
  }

  async getForm(
    id: number,
  ): Promise<{ form: FormData; checklistItems: ChecklistItem[]; documentationItems: DocumentationItem[] }> {
    const form = await FormModel.getById(id)
    if (!form) {
      throw new Error("Form not found")
    }
    const checklistItems = await ChecklistItemModel.getByFormId(id)
    const documentationItems = await DocumentationItemModel.getByFormId(id)
    return { form, checklistItems, documentationItems }
  }

  async generateFormPDF(formId: number): Promise<Buffer> {
    try {
      const { form, checklistItems, documentationItems } = await this.getForm(formId)
      if (!form) {
        throw new Error("Formulário não encontrado")
      }

      return new Promise((resolve, reject) => {
        const doc = new PDFDocument({
          size: "A4",
          layout: "landscape",
          margin: 30,
          autoFirstPage: true,
        })

        const buffers: Buffer[] = []

        doc.on("data", buffers.push.bind(buffers))
        doc.on("end", () => {
          const pdfBuffer = Buffer.concat(buffers)
          resolve(pdfBuffer)
        })

        const pageWidth = 842 // A4 landscape width
        const pageHeight = 595 // A4 landscape height

        const drawHeader = (title: string) => {
          // Título centralizado
          doc.fontSize(16).text(title, 0, 40, {
            align: "center",
            width: pageWidth,
          })

          // Informações do formulário
          doc.fontSize(10)

          // Primeira linha
          doc
            .text("EMPRESA:", 30, 80)
            .text(form.empresa, 100, 80, { width: 300 })
            .text("DATA:", 420, 80)
            .text(new Date(form.data).toLocaleDateString("pt-BR"), 460, 80)
            .text("HORA:", 680, 80)
            .text(form.hora, 720, 80)

          // Segunda linha
          doc
            .text("ÁREA:", 30, 100)
            .text(form.area, 100, 100, { width: 300 })
            .text("EXECUTADO POR:", 420, 100)
            .text(form.executadoPor, 520, 100, { width: 290 })
        }

        const drawTableHeader = (y: number, isChecklist: boolean) => {
          const headers = isChecklist
            ? ["ITENS DAS NORMAS", "DESCRIÇÃO DO ITEM", "CONDIÇÃO", "FOTO", "FE", "AUDIO", "NPER", "COMENTÁRIO"]
            : ["ITENS DAS NORMAS", "DESCRIÇÃO DO ITEM", "CONDIÇÃO", "FOTO", "AUDIO", "PDF", "COMENTÁRIO"]

          const colWidths = isChecklist ? [120, 200, 80, 80, 60, 60, 60, 120] : [120, 200, 80, 80, 60, 60, 180]

          let x = 30
          doc.fontSize(10)

          headers.forEach((header, i) => {
            doc.rect(x, y, colWidths[i], 30).stroke()
            doc.text(header, x + 5, y + 10, {
              width: colWidths[i] - 10,
              align: "left",
            })
            x += colWidths[i]
          })

          return { colWidths, x: 30, y: y + 30 }
        }

        const drawRow = (item: any, { x, y, colWidths }: any, isChecklist: boolean) => {
          const rowHeight = 60
          doc.fontSize(8)

          // Desenhar células
          if (isChecklist) {
            ;[item.standard, item.description, item.condition, item.fe, item.nper, item.comment].forEach((text, i) => {
              doc.rect(x, y, colWidths[i], rowHeight).stroke()
              if (i !== 3 && i !== 5) {
                // Pular Celtulas de foto e áudio
                doc.text(text || "", x + 5, y + 5, {
                  width: colWidths[i] - 10,
                })
              }
              x += colWidths[i]
            })
          } else {
            // Documentation row
            ;[
              item.standard,
              item.description,
              item.condition,
              "", // Foto será adicionada separadamente
              "", // Audio placeholder
              "", // PDF placeholder
              item.comment,
            ].forEach((text, i) => {
              doc.rect(x, y, colWidths[i], rowHeight).stroke()
              if (i !== 3 && i !== 4 && i !== 5) {
                // Pular células de foto, áudio e PDF
                doc.text(text || "", x + 5, y + 5, {
                  width: colWidths[i] - 10,
                })
              }
              x += colWidths[i]
            })
          }

          // Adicionar foto se existir
          if (item.photo) {
            try {
              const photoX = x - (isChecklist ? 320 : 380) // Ajustar posição baseado no tipo de tabela
              const photoY = y + 5
              doc.image(Buffer.from(item.photo, "base64"), photoX, photoY, {
                fit: [50, 50],
                align: "center",
                valign: "center",
              })
            } catch (error) {
              console.error("Erro ao adicionar foto:", error)
            }
          }

          return y + rowHeight
        }

        // Primeira página - Checklist
        drawHeader("CHECK LIST DAS INSTALAÇÕES ELÉTRICAS")
        let pos = drawTableHeader(140, true)

        checklistItems.forEach((item) => {
          if (pos.y + 60 > pageHeight - 30) {
            doc.addPage()
            drawHeader("CHECK LIST DAS INSTALAÇÕES ELÉTRICAS")
            pos = drawTableHeader(140, true)
          }
          pos.y = drawRow(item, pos, true)
        })

        // Segunda página - Documentação
        doc.addPage()
        drawHeader("CHECK LIST PARA VERIFICAÇÃO DA DOCUMENTAÇÃO")
        pos = drawTableHeader(140, false)

        documentationItems.forEach((item) => {
          if (pos.y + 60 > pageHeight - 30) {
            doc.addPage()
            drawHeader("CHECK LIST PARA VERIFICAÇÃO DA DOCUMENTAÇÃO")
            pos = drawTableHeader(140, false)
          }
          pos.y = drawRow(item, pos, false)
        })

        doc.end()
      })
    } catch (error) {
      console.error("Erro ao gerar PDF:", error)
      throw new Error("Falha ao gerar o PDF do formulário")
    }
  }

  async savePDFLocally(formId: number): Promise<string> {
    const pdfBuffer = await this.generateFormPDF(formId)
    const fileName = `form_${formId}_${Date.now()}.pdf`
    const filePath = path.join(__dirname, "..", "..", "temp", fileName)

    return new Promise((resolve, reject) => {
      fs.writeFile(filePath, pdfBuffer, (err) => {
        if (err) {
          console.error("Erro ao salvar PDF localmente:", err)
          reject(err)
        } else {
          console.log(`PDF salvo localmente: ${filePath}`)
          resolve(filePath)
        }
      })
    })
  }
}

export const formService = new FormService()
export default formService

