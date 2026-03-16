import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import routes from './routes/index.js';
import { errorMiddleware } from './middleware/error.middleware.js';

const app = express();

// Middleware
app.use(helmet());
app.use(cors({ origin: env.FRONTEND_URL }));
if (env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/', routes);

// Error handling
app.use(errorMiddleware);

export default app;
