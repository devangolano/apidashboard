import PDFDocument from "pdfkit"
import type { FormData } from "../types"

export const generatePDF = (formData: FormData): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument()
    const buffers: Buffer[] = []

    doc.on("data", buffers.push.bind(buffers))
    doc.on("end", () => {
      const pdfData = Buffer.concat(buffers)
      resolve(pdfData)
    })

    // Add content to the PDF
    doc.fontSize(18).text("Detalhes do Formulário", { align: "center" })
    doc.moveDown()
    doc.fontSize(12).text(`Empresa: ${formData.empresa}`)
    doc.text(`Data: ${formData.data}`)
    doc.text(`Área: ${formData.area}`)
    doc.text(`Executado por: ${formData.executadoPor}`)
    doc.text(`Hora: ${formData.hora}`)

    doc.end()
  })
}

