import { Router } from 'express';
import UserController from '../controllers/userController';
import { authMiddleware, isAdmin } from '../middleware/authMiddleware';
import multer from 'multer';

const router = Router();

// Configuração do multer para upload de arquivos
const upload = multer({ dest: 'uploads/' });

// Rota de registro não deve requerer autenticação
router.post('/register', upload.single('photo'), UserController.create);
router.post('/login', UserController.login);

// Rotas protegidas
router.get('/', authMiddleware, isAdmin, UserController.getAll);
router.get('/:id', authMiddleware, isAdmin, UserController.getById);
router.put('/:id', authMiddleware, isAdmin, UserController.update);
router.delete('/:id', authMiddleware, isAdmin, UserController.delete);

export default router;