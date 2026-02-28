import { Router } from 'express';
import v1Router from './v1/index';

const router = Router();

// Health check endpoint
router.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// API route version v1 being used
router.use('/api/v1', v1Router);
// router.use('/auth', authRoutes);
// router.use('/users', userRoutes);
// router.use('/portfolios', portfolioRoutes);

export default router;
