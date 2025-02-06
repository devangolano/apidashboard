"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userRoutes_1 = __importDefault(require("./userRoutes"));
const formController_1 = require("../controllers/formController");
const router = express_1.default.Router();
// Rotas de formulário
router.post("/forms", formController_1.FormController.createForm);
router.get("/forms/:id", formController_1.FormController.getForm);
router.put("/forms/:id", formController_1.FormController.updateForm);
router.delete("/forms/:id", formController_1.FormController.deleteForm);
router.get("/forms", formController_1.FormController.listForms);
router.get("/forms/:id/pdf", formController_1.FormController.generatePDF);
// Rotas de usuário
router.use("/", userRoutes_1.default);
exports.default = router;
