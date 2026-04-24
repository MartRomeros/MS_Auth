import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

router.post('/login', AuthController.login);
router.get('/validate', authenticateToken, AuthController.validate);

export default router;
