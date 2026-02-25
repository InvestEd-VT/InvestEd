import { Router } from 'express';

const router = Router();

// Health check endpoint
router.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// API routes will be added here
// router.use('/auth', authRoutes);
// router.use('/users', userRoutes);
// router.use('/portfolios', portfolioRoutes);

export default router;
