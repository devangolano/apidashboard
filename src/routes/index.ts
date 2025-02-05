import userRoutes from './userRoutes';
import express from 'express';
import * as formController from '../controllers/formController';

const router = express.Router();

// Form routes
router.post("/forms", formController.createForm)
router.get("/forms/:id", formController.getForm)
router.put("/forms/:id", formController.updateForm)
router.delete("/forms/:id", formController.deleteForm)
router.get("/forms", formController.listForms)
router.get("/forms/:id/pdf", formController.downloadFormPDF)

// User routes
// Instead of nesting, we'll define them at the same level
router.use('/', userRoutes);

export default router;