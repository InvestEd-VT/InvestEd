import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import routes from './routes/index.js';
import { errorMiddleware } from './middleware/error.middleware.js';
import { apiLimiter, authLimiter } from './middleware/rateLimiter.middleware.js';

const app = express();

// Middleware
// helmet provides XSS protection headers including X-XSS-Protection and Content-Security-Policy
app.use(helmet());

// CORS configuration
// In development allows localhost origins, in production restricts to FRONTEND_URL only
const corsOptions = {
  origin:
    env.NODE_ENV === 'production'
      ? env.FRONTEND_URL
      : [env.FRONTEND_URL, 'http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
};
app.use(cors(corsOptions));

if (env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Strict limiter on auth routes to prevent brute force
// General limiter on all API routes
app.use('/api/v1/auth/', authLimiter);
app.use('/api/', apiLimiter);

// Routes
app.use('/', routes);

// Error handling
app.use(errorMiddleware);

export default app;
