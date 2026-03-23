import { Router } from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import portfolioRoutes from './portfolio.routes.js';
import stockRoutes from './stock.routes.js';
import optionsRoutes from './options.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/portfolio', portfolioRoutes);
router.use('/stocks', stockRoutes);
router.use('/options', optionsRoutes);

export default router;
