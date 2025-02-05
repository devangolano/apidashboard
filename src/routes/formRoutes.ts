import type { Request, Response } from "express"
import * as formService from "../services/formService"

export const saveForm = async (req: Request, res: Response) => {
  try {
    const formId = await formService.createForm(req.body)
    res.status(201).json({ message: "Formulário criado com sucesso", formId })
  } catch (error) {
    console.error("Erro ao criar formulário:", error)
    res.status(500).json({ message: "Erro ao criar formulário" })
  }
}

export const getForm = async (req: Request, res: Response) => {
  try {
    const formId = Number.parseInt(req.params.id)
    const form = await formService.getForm(formId)
    if (form) {
      res.json(form)
    } else {
      res.status(404).json({ message: "Formulário não encontrado" })
    }
  } catch (error) {
    console.error("Erro ao buscar formulário:", error)
    res.status(500).json({ message: "Erro ao buscar formulário" })
  }
}

export const updateForm = async (req: Request, res: Response) => {
  try {
    const formId = Number.parseInt(req.params.id)
    await formService.updateForm(formId, req.body)
    res.json({ message: "Formulário atualizado com sucesso" })
  } catch (error) {
    console.error("Erro ao atualizar formulário:", error)
    res.status(500).json({ message: "Erro ao atualizar formulário" })
  }
}

export const deleteForm = async (req: Request, res: Response) => {
  try {
    const formId = Number.parseInt(req.params.id)
    await formService.deleteForm(formId)
    res.json({ message: "Formulário excluído com sucesso" })
  } catch (error) {
    console.error("Erro ao excluir formulário:", error)
    res.status(500).json({ message: "Erro ao excluir formulário" })
  }
}

export const listForms = async (req: Request, res: Response) => {
  try {
    const forms = await formService.listForms()
    res.json(forms)
  } catch (error) {
    console.error("Erro ao listar formulários:", error)
    res.status(500).json({ message: "Erro ao listar formulários" })
  }
}

export const downloadFormPDF = async (req: Request, res: Response) => {
  try {
    const formId = Number.parseInt(req.params.id)
    const pdfBuffer = await formService.generateFormPDF(formId)
    res.setHeader("Content-Type", "application/pdf")
    res.setHeader("Content-Disposition", `attachment; filename=formulario_${formId}.pdf`)
    res.send(pdfBuffer)
  } catch (error) {
    console.error("Erro ao gerar PDF:", error)
    res.status(500).json({ message: "Erro ao gerar PDF" })
  }
}

