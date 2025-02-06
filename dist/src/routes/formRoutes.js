"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const formService_1 = require("../services/formService");
const router = express_1.default.Router();
router.post("/", async (req, res) => {
    try {
        const formId = await formService_1.formService.createForm(req.body);
        res.status(201).json({ id: formId });
    }
    catch (error) {
        res.status(500).json({ error: "Erro ao criar formulário" });
    }
});
router.get("/:id", async (req, res) => {
    try {
        const formId = Number.parseInt(req.params.id);
        const form = await formService_1.formService.getForm(formId);
        if (form) {
            res.json(form);
        }
        else {
            res.status(404).json({ error: "Formulário não encontrado" });
        }
    }
    catch (error) {
        res.status(500).json({ error: "Erro ao buscar formulário" });
    }
});
router.put("/:id", async (req, res) => {
    try {
        const formId = Number.parseInt(req.params.id);
        await formService_1.formService.updateForm(formId, req.body);
        res.status(200).json({ message: "Formulário atualizado com sucesso" });
    }
    catch (error) {
        res.status(500).json({ error: "Erro ao atualizar formulário" });
    }
});
router.delete("/:id", async (req, res) => {
    try {
        const formId = Number.parseInt(req.params.id);
        await formService_1.formService.deleteForm(formId);
        res.status(200).json({ message: "Formulário excluído com sucesso" });
    }
    catch (error) {
        res.status(500).json({ error: "Erro ao excluir formulário" });
    }
});
router.get("/", async (req, res) => {
    try {
        const forms = await formService_1.formService.getAllForms();
        res.json(forms);
    }
    catch (error) {
        res.status(500).json({ error: "Erro ao listar formulários" });
    }
});
router.get("/:id/pdf", async (req, res) => {
    try {
        const formId = Number.parseInt(req.params.id);
        const pdfBuffer = await formService_1.formService.generateFormPDF(formId);
        res.contentType("application/pdf");
        res.send(pdfBuffer);
    }
    catch (error) {
        res.status(500).json({ error: "Erro ao gerar PDF do formulário" });
    }
});
exports.default = router;
