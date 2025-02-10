import type { Request, Response } from "express"
import { formService } from "../services/formService"
import type { FormData } from "../models/Form"
import type { ChecklistItem } from "../models/ChecklistItem"
import type { DocumentationItem } from "../models/DocumentationItem"

export const FormController = {
  createForm: async (req: Request, res: Response) => {
    try {
      const { formData, checklistItems, documentationItems } = req.body

      // Validate and process formData
      const processedFormData: FormData = {
        empresa: formData.empresa,
        area: formData.area,
        data: formData.data,
        hora: formData.hora,
        executadoPor: formData.executadoPor,
      }

      // Process checklistItems
      const processedChecklistItems: Omit<ChecklistItem, "id" | "formId">[] = checklistItems.map((item: any) => ({
        standard: item.standard,
        description: item.description,
        condition: item.condition,
        fe: item.fe,
        nper: item.nper,
        photo: item.photo || null,
        audio: item.audio || null,
        irregularidades: item.irregularidades || null,
        recomendacoes: item.recomendacoes || null,
      }))

      // Process documentationItems
      const processedDocumentationItems: Omit<DocumentationItem, "id" | "formId">[] = documentationItems.map(
        (item: any) => ({
          standard: item.standard,
          description: item.description,
          condition: item.condition,
          photo: item.photo || null,
          audio: item.audio || null,
          pdf: item.pdf || null,
          recomendacoes: item.recomendacoes || null,
          irregularidades: item.irregularidades || null,
        }),
      )

      const formId = await formService.createForm({
        formData: processedFormData,
        checklistItems: processedChecklistItems,
        documentationItems: processedDocumentationItems,
      })

      res.status(201).json({ id: formId })
    } catch (error) {
      console.error("Error in createForm:", error)
      res.status(500).json({ message: "Erro ao criar formulário", error: (error as Error).message })
    }
  },

  getForm: async (req: Request, res: Response) => {
    try {
      const formId = Number.parseInt(req.params.id)
      const form = await formService.getForm(formId)
      res.json(form)
    } catch (error) {
      console.error("Error in getForm:", error)
      if (error instanceof Error && error.message === "Form not found") {
        res.status(404).json({ message: "Formulário não encontrado", error: error.message })
      } else {
        res.status(500).json({ message: "Erro ao buscar formulário", error: (error as Error).message })
      }
    }
  },

  updateForm: async (req: Request, res: Response) => {
    try {
      const formId = Number.parseInt(req.params.id)
      await formService.updateForm(formId, req.body)
      res.status(200).json({ message: "Formulário atualizado com sucesso" })
    } catch (error) {
      console.error("Error in updateForm:", error)
      res.status(500).json({ message: "Erro ao atualizar formulário", error: (error as Error).message })
    }
  },

  deleteForm: async (req: Request, res: Response) => {
    try {
      const formId = Number.parseInt(req.params.id)
      await formService.deleteForm(formId)
      res.status(200).json({ message: "Formulário excluído com sucesso" })
    } catch (error) {
      console.error("Error in deleteForm:", error)
      res.status(500).json({ message: "Erro ao excluir formulário", error: (error as Error).message })
    }
  },

  listForms: async (req: Request, res: Response) => {
    try {
      const forms = await formService.getAllForms()
      res.json(forms)
    } catch (error) {
      console.error("Error in listForms:", error)
      res.status(500).json({ message: "Erro ao listar formulários", error: (error as Error).message })
    }
  },

  generatePDF: async (req: Request, res: Response) => {
    try {
      const formId = Number.parseInt(req.params.id)
      console.log(`Iniciando geração de PDF para o formulário ${formId}`)

      const pdfBuffer = await formService.generateFormPDF(formId)

      if (!pdfBuffer || pdfBuffer.length === 0) {
        throw new Error("PDF buffer está vazio")
      }

      console.log(`PDF gerado com sucesso. Tamanho do buffer: ${pdfBuffer.length} bytes`)

      res.contentType("application/pdf")
      res.setHeader("Content-Disposition", `attachment; filename=formulario-${formId}.pdf`)
      res.send(pdfBuffer)

      console.log(`PDF enviado com sucesso para o cliente`)
    } catch (error) {
      console.error("Erro detalhado em generatePDF:", error)
      if (error instanceof Error) {
        res.status(500).json({
          message: "Erro ao gerar PDF",
          error: error.message,
          stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
        })
      } else {
        res.status(500).json({ message: "Erro desconhecido ao gerar PDF" })
      }
    }
  },
}

