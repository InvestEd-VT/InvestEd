import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { listModules, getModule, completeModule } from '../../controllers/education.controller.js';

const router = Router();

router.use(authMiddleware);

// GET  /api/v1/education/modules
router.get('/modules', listModules);

// GET  /api/v1/education/modules/:id
router.get('/modules/:id', getModule);

// POST /api/v1/education/modules/:id/complete
router.post('/modules/:id/complete', completeModule);

export default router;
