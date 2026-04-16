import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import routes from './routes/index.js';
import { errorMiddleware } from './middleware/error.middleware.js';
import { apiLimiter, authLimiter } from './middleware/rateLimiter.middleware.js';

const app = express();

// helmet provides XSS protection headers including X-XSS-Protection and Content-Security-Policy
app.use(helmet());

if (env.NODE_ENV === 'production' && !env.FRONTEND_URL) {
  throw new Error('FRONTEND_URL environment variable must be set in production');
}

// CORS configuration
// In development allows localhost origins, in production restricts to FRONTEND_URL only
const allowedOrigins = env.ALLOWED_ORIGINS.split(',').map((o) => o.trim());

const corsOptions = {
  origin: env.NODE_ENV === 'production' ? env.FRONTEND_URL : allowedOrigins,
  credentials: true,
};
app.use(cors(corsOptions));

if (env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint for Docker and Railway
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Auth limiter registered before general limiter so auth routes get the stricter limit
app.use('/api/v1/auth/', authLimiter);
app.use('/api/', apiLimiter);

// Routes
app.use('/', routes);

// Error handling
app.use(errorMiddleware);

export default app;
