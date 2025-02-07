import { Router, Express } from 'express';
import UserController from '../controllers/userController';
import { authMiddleware, isAdmin } from '../middleware/authMiddleware';
import multer from 'multer';
import path from 'path';
import express from 'express';

const router = Router();

// Configuração do multer para upload de arquivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
  }
});

const upload = multer({ storage: storage });

// Rotas de usuário
router.post('/login', UserController.login);
router.post('/users', upload.single('foto'), UserController.create);
router.get('/users', authMiddleware, isAdmin, UserController.getAll);
router.get('/users/:id', authMiddleware, isAdmin, UserController.getById);
router.put('/users/:id', authMiddleware, isAdmin, upload.single('foto'), UserController.update);
router.delete('/users/:id', authMiddleware, isAdmin, UserController.delete);

// Função para configurar a rota de arquivos estáticos
export const configureStaticRoute = (app: Express) => {
  app.use('/api/uploads', express.static(path.join(__dirname, '..', 'uploads')));
};

export default router;