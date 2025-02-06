"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = __importDefault(require("../controllers/userController"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const router = (0, express_1.Router)();
// Configuração do multer para upload de arquivos
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path_1.default.extname(file.originalname));
    }
});
const upload = (0, multer_1.default)({ storage: storage });
// Rotas de usuário
router.post('/login', userController_1.default.login);
router.post('/users', upload.single('foto'), userController_1.default.create);
router.get('/users', authMiddleware_1.authMiddleware, authMiddleware_1.isAdmin, userController_1.default.getAll);
router.get('/users/:id', authMiddleware_1.authMiddleware, authMiddleware_1.isAdmin, userController_1.default.getById);
router.put('/users/:id', authMiddleware_1.authMiddleware, authMiddleware_1.isAdmin, upload.single('foto'), userController_1.default.update);
router.delete('/users/:id', authMiddleware_1.authMiddleware, authMiddleware_1.isAdmin, userController_1.default.delete);
exports.default = router;
