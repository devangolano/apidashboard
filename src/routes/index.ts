import express from 'express'
import * as formController from '../controllers/formController'

const router = express.Router()

router.post("/forms", formController.createForm)
router.get("/forms/:id", formController.getForm)
router.put("/forms/:id", formController.updateForm)
router.delete("/forms/:id", formController.deleteForm)
router.get("/forms", formController.listForms)
router.get("/forms/:id/pdf", formController.downloadFormPDF)

export default router