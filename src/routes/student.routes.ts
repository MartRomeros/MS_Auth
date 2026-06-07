import { Router } from 'express';
import { StudentController } from '../controllers/student.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @openapi
 * /api/students/me/dashboard:
 *   get:
 *     summary: Get student dashboard summary
 *     description: Returns summary metrics for the authenticated student dashboard
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
 *                 - promedioGeneral
 *                 - asistenciaGlobal
 *                 - recursosDisponibles
 *                 - mensajesPendientes
 *               properties:
 *                 promedioGeneral:
 *                   type: number
 *                   example: 6.1
 *                 asistenciaGlobal:
 *                   type: number
 *                   example: 94
 *                 recursosDisponibles:
 *                   type: number
 *                   example: 12
 *                 mensajesPendientes:
 *                   type: number
 *                   example: 2
 *       401:
 *         description: Unauthorized, missing token or missing user id in token
 *       403:
 *         description: Forbidden, invalid token or role is not student
 *       404:
 *         description: Student not found
 *       500:
 *         description: Internal server error
 */
router.get('/me/dashboard', authenticateToken, StudentController.getDashboard);

export default router;