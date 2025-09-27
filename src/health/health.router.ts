import { Router } from "express";

const healthRouter = Router();

interface HealthResponse {
  status: 'OK' | 'ERROR';
  timestamp: string;
  uptime: number;
}

/**
 * @swagger
 * components:
 *   schemas:
 *     HealthResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           enum: [OK, ERROR]
 *         timestamp:
 *           type: string
 *           format: date-time
 *         uptime:
 *           type: number
 *       required:
 *         - status
 *         - timestamp
 *         - uptime
 */

/**
 * @swagger
 * /api/v1/health/healthCheck:
 *   get:
 *     summary: "서버 헬스체크"
 *     tags: [Health]
 *     responses:
 *       "200":
 *         description: "헬스체크 성공"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthResponse'
 *       "503":
 *         description: "서비스 사용 불가"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthResponse'
 */
healthRouter.get("/healthCheck", async (req, res, next) => {
  try {
    const healthData: HealthResponse = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
    
    res.status(200).json(healthData);
  } catch (error) {
    next(error);
  }
});

export { healthRouter };