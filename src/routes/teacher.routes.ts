import { Router } from 'express';
import { TeacherController } from '../controllers/teacher.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router: Router = Router();

/**
 * @openapi
 * /api/teachers/me/dashboard:
 *   get:
 *     summary: Get teacher dashboard
 *     description: Returns summary metrics, assignments and course statistics for authenticated teacher
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard retrieved successfully
 *       401:
 *         description: Unauthorized, missing token or invalid user payload
 *       403:
 *         description: Forbidden, role is not teacher
 *       500:
 *         description: Internal server error
 */
router.get('/me/dashboard', authenticateToken, TeacherController.getDashboard);

export default router;