import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

import { validate } from '../middlewares/validate.middleware';
import { loginSchema } from '../schemas/auth.schema';

const router = Router();

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Login a user
 *     description: Authenticate user with credentials and return a JWT token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       401:
 *         description: Unauthorized
 */
router.post('/login', validate(loginSchema), AuthController.login);

/**
 * @openapi
 * /api/auth/validate:
 *   get:
 *     summary: Validate JWT token
 *     description: Verify if the provided JWT token is valid and return user data
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token is valid
 *       401:
 *         description: Invalid or missing token
 */
router.get('/validate', authenticateToken, AuthController.validate);

export default router;
