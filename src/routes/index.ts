import express from "express"
import path from "path"
import userRoutes from "./userRoutes"
import { FormController } from "../controllers/formController"

const router = express.Router()

// Configuração para servir arquivos estáticos
router.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')))

// Rotas de formulário
router.post("/forms", FormController.createForm)
router.get("/forms/:id", FormController.getForm)
router.put("/forms/:id", FormController.updateForm)
router.delete("/forms/:id", FormController.deleteForm)
router.get("/forms", FormController.listForms)
router.get("/forms/:id/pdf", FormController.generatePDF)

// Rotas de usuário
router.use("/", userRoutes)

export default router