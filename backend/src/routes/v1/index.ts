import { Router } from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import portfolioRoutes from './portfolio.routes.js';
import stockRoutes from './stock.routes.js';
import optionsRoutes from './options.routes.js';
import tradeRoutes from './trade.routes.js';
import educationRoutes from './education.routes.js';
import notificationRoutes from './notification.routes.js';
import watchlistRoutes from './watchlist.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/portfolio', portfolioRoutes);
router.use('/stocks', stockRoutes);
router.use('/options', optionsRoutes);
router.use('/trade', tradeRoutes);
router.use('/education', educationRoutes);
router.use('/notifications', notificationRoutes);
router.use('/watchlist', watchlistRoutes);

export default router;
