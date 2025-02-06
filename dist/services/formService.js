"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.formService = exports.FormService = void 0;
const Form_1 = require("../models/Form");
const ChecklistItem_1 = require("../models/ChecklistItem");
const DocumentationItem_1 = require("../models/DocumentationItem");
const database_1 = __importDefault(require("../config/database"));
const pdfkit_1 = __importDefault(require("pdfkit"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class FormService {
    async createForm(data) {
        const connection = await database_1.default.getConnection();
        try {
            await connection.beginTransaction();
            if (!data.formData || !data.checklistItems || !data.documentationItems) {
                throw new Error("Invalid form data structure");
            }
            const formId = await Form_1.FormModel.create(data.formData);
            for (const item of data.checklistItems) {
                await ChecklistItem_1.ChecklistItemModel.create(Object.assign(Object.assign({}, item), { formId }));
            }
            for (const item of data.documentationItems) {
                await DocumentationItem_1.DocumentationItemModel.create(Object.assign(Object.assign({}, item), { formId }));
            }
            await connection.commit();
            return formId;
        }
        catch (error) {
            await connection.rollback();
            throw error;
        }
        finally {
            connection.release();
        }
    }
    async getFormById(id) {
        return Form_1.FormModel.getById(id);
    }
    async updateForm(id, data) {
        const connection = await database_1.default.getConnection();
        try {
            await connection.beginTransaction();
            await Form_1.FormModel.update(id, data.formData);
            await ChecklistItem_1.ChecklistItemModel.deleteByFormId(id);
            await DocumentationItem_1.DocumentationItemModel.deleteByFormId(id);
            for (const item of data.checklistItems) {
                await ChecklistItem_1.ChecklistItemModel.create(Object.assign(Object.assign({}, item), { formId: id }));
            }
            for (const item of data.documentationItems) {
                await DocumentationItem_1.DocumentationItemModel.create(Object.assign(Object.assign({}, item), { formId: id }));
            }
            await connection.commit();
        }
        catch (error) {
            await connection.rollback();
            throw error;
        }
        finally {
            connection.release();
        }
    }
    async deleteForm(id) {
        const connection = await database_1.default.getConnection();
        try {
            await connection.beginTransaction();
            await ChecklistItem_1.ChecklistItemModel.deleteByFormId(id);
            await DocumentationItem_1.DocumentationItemModel.deleteByFormId(id);
            await Form_1.FormModel.delete(id);
            await connection.commit();
        }
        catch (error) {
            await connection.rollback();
            throw error;
        }
        finally {
            connection.release();
        }
    }
    async getAllForms() {
        return await Form_1.FormModel.getAll();
    }
    async getForm(id) {
        const form = await Form_1.FormModel.getById(id);
        if (!form) {
            throw new Error("Form not found");
        }
        const checklistItems = await ChecklistItem_1.ChecklistItemModel.getByFormId(id);
        const documentationItems = await DocumentationItem_1.DocumentationItemModel.getByFormId(id);
        return { form, checklistItems, documentationItems };
    }
    async generateFormPDF(formId) {
        try {
            const { form, checklistItems, documentationItems } = await this.getForm(formId);
            if (!form) {
                throw new Error("Formulário não encontrado");
            }
            return new Promise((resolve, reject) => {
                const doc = new pdfkit_1.default({
                    size: "A4",
                    layout: "landscape",
                    margin: 30,
                    autoFirstPage: true,
                });
                const buffers = [];
                doc.on("data", buffers.push.bind(buffers));
                doc.on("end", () => {
                    const pdfBuffer = Buffer.concat(buffers);
                    resolve(pdfBuffer);
                });
                const pageWidth = 842; // A4 landscape width
                const pageHeight = 595; // A4 landscape height
                const drawHeader = (title) => {
                    // Título centralizado
                    doc.fontSize(16).text(title, 0, 40, {
                        align: "center",
                        width: pageWidth,
                    });
                    // Informações do formulário
                    doc.fontSize(10);
                    // Primeira linha
                    doc
                        .text("EMPRESA:", 30, 80)
                        .text(form.empresa, 100, 80, { width: 300 })
                        .text("DATA:", 420, 80)
                        .text(new Date(form.data).toLocaleDateString("pt-BR"), 460, 80)
                        .text("HORA:", 680, 80)
                        .text(form.hora, 720, 80);
                    // Segunda linha
                    doc
                        .text("ÁREA:", 30, 100)
                        .text(form.area, 100, 100, { width: 300 })
                        .text("EXECUTADO POR:", 420, 100)
                        .text(form.executadoPor, 520, 100, { width: 290 });
                };
                const drawTableHeader = (y, isChecklist) => {
                    const headers = isChecklist
                        ? ["ITENS DAS NORMAS", "DESCRIÇÃO DO ITEM", "CONDIÇÃO", "FOTO", "FE", "AUDIO", "NPER", "COMENTÁRIO"]
                        : ["ITENS DAS NORMAS", "DESCRIÇÃO DO ITEM", "CONDIÇÃO", "FOTO", "AUDIO", "PDF", "COMENTÁRIO"];
                    const colWidths = isChecklist ? [120, 200, 80, 80, 60, 60, 60, 120] : [120, 200, 80, 80, 60, 60, 180];
                    let x = 30;
                    doc.fontSize(10);
                    headers.forEach((header, i) => {
                        doc.rect(x, y, colWidths[i], 30).stroke();
                        doc.text(header, x + 5, y + 10, {
                            width: colWidths[i] - 10,
                            align: "left",
                        });
                        x += colWidths[i];
                    });
                    return { colWidths, x: 30, y: y + 30 };
                };
                const drawRow = (item, { x, y, colWidths }, isChecklist) => {
                    const rowHeight = 60;
                    doc.fontSize(8);
                    // Desenhar células
                    if (isChecklist) {
                        ;
                        [item.standard, item.description, item.condition, item.fe, item.nper, item.comment].forEach((text, i) => {
                            doc.rect(x, y, colWidths[i], rowHeight).stroke();
                            if (i !== 3 && i !== 5) {
                                // Pular Celtulas de foto e áudio
                                doc.text(text || "", x + 5, y + 5, {
                                    width: colWidths[i] - 10,
                                });
                            }
                            x += colWidths[i];
                        });
                    }
                    else {
                        // Documentation row
                        ;
                        [
                            item.standard,
                            item.description,
                            item.condition,
                            "", // Foto será adicionada separadamente
                            "", // Audio placeholder
                            "", // PDF placeholder
                            item.comment,
                        ].forEach((text, i) => {
                            doc.rect(x, y, colWidths[i], rowHeight).stroke();
                            if (i !== 3 && i !== 4 && i !== 5) {
                                // Pular células de foto, áudio e PDF
                                doc.text(text || "", x + 5, y + 5, {
                                    width: colWidths[i] - 10,
                                });
                            }
                            x += colWidths[i];
                        });
                    }
                    // Adicionar foto se existir
                    if (item.photo) {
                        try {
                            const photoX = x - (isChecklist ? 320 : 380); // Ajustar posição baseado no tipo de tabela
                            const photoY = y + 5;
                            doc.image(Buffer.from(item.photo, "base64"), photoX, photoY, {
                                fit: [50, 50],
                                align: "center",
                                valign: "center",
                            });
                        }
                        catch (error) {
                            console.error("Erro ao adicionar foto:", error);
                        }
                    }
                    return y + rowHeight;
                };
                // Primeira página - Checklist
                drawHeader("CHECK LIST DAS INSTALAÇÕES ELÉTRICAS");
                let pos = drawTableHeader(140, true);
                checklistItems.forEach((item) => {
                    if (pos.y + 60 > pageHeight - 30) {
                        doc.addPage();
                        drawHeader("CHECK LIST DAS INSTALAÇÕES ELÉTRICAS");
                        pos = drawTableHeader(140, true);
                    }
                    pos.y = drawRow(item, pos, true);
                });
                // Segunda página - Documentação
                doc.addPage();
                drawHeader("CHECK LIST PARA VERIFICAÇÃO DA DOCUMENTAÇÃO");
                pos = drawTableHeader(140, false);
                documentationItems.forEach((item) => {
                    if (pos.y + 60 > pageHeight - 30) {
                        doc.addPage();
                        drawHeader("CHECK LIST PARA VERIFICAÇÃO DA DOCUMENTAÇÃO");
                        pos = drawTableHeader(140, false);
                    }
                    pos.y = drawRow(item, pos, false);
                });
                doc.end();
            });
        }
        catch (error) {
            console.error("Erro ao gerar PDF:", error);
            throw new Error("Falha ao gerar o PDF do formulário");
        }
    }
    async savePDFLocally(formId) {
        const pdfBuffer = await this.generateFormPDF(formId);
        const fileName = `form_${formId}_${Date.now()}.pdf`;
        const filePath = path_1.default.join(__dirname, "..", "..", "temp", fileName);
        return new Promise((resolve, reject) => {
            fs_1.default.writeFile(filePath, pdfBuffer, (err) => {
                if (err) {
                    console.error("Erro ao salvar PDF localmente:", err);
                    reject(err);
                }
                else {
                    console.log(`PDF salvo localmente: ${filePath}`);
                    resolve(filePath);
                }
            });
        });
    }
}
exports.FormService = FormService;
exports.formService = new FormService();
exports.default = exports.formService;
