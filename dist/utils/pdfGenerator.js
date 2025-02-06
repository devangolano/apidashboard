"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePDF = void 0;
const pdfkit_1 = __importDefault(require("pdfkit"));
const generatePDF = (formData) => {
    return new Promise((resolve, reject) => {
        const doc = new pdfkit_1.default();
        const buffers = [];
        doc.on("data", buffers.push.bind(buffers));
        doc.on("end", () => {
            const pdfData = Buffer.concat(buffers);
            resolve(pdfData);
        });
        // Add content to the PDF
        doc.fontSize(18).text("Detalhes do Formulário", { align: "center" });
        doc.moveDown();
        doc.fontSize(12).text(`Empresa: ${formData.empresa}`);
        doc.text(`Data: ${formData.data}`);
        doc.text(`Área: ${formData.area}`);
        doc.text(`Executado por: ${formData.executadoPor}`);
        doc.text(`Hora: ${formData.hora}`);
        doc.end();
    });
};
exports.generatePDF = generatePDF;
