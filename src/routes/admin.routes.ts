import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @openapi
 * /api/admin/me/dashboard:
 *   get:
 *     summary: Get admin dashboard summary
 *     description: Returns global summary metrics for the authenticated admin dashboard
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - cantidadEstudiantes
 *                 - cantidadDocentes
 *                 - porcentajeAsistencia
 *                 - cantidadCursos
 *               properties:
 *                 cantidadEstudiantes:
 *                   type: number
 *                   example: 350
 *                 cantidadDocentes:
 *                   type: number
 *                   example: 28
 *                 porcentajeAsistencia:
 *                   type: number
 *                   example: 92
 *                 cantidadCursos:
 *                   type: number
 *                   example: 14
 *       401:
 *         description: Unauthorized, missing token or missing user id in token
 *       403:
 *         description: Forbidden, invalid token or role is not admin
 *       404:
 *         description: Admin not found
 *       500:
 *         description: Internal server error
 */
router.get('/me/dashboard', authenticateToken, AdminController.getDashboard);

export default router;