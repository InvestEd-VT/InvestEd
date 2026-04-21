import winston from 'winston';
import { env } from './env.js';

const { combine, timestamp, json, printf, colorize, errors } = winston.format;

// Human-readable format for development
const devFormat = combine(
  colorize(),
  timestamp({ format: 'HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ timestamp, level, message, stack, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return stack
      ? `${timestamp} ${level}: ${message}\n${stack}`
      : `${timestamp} ${level}: ${message}${metaStr}`;
  })
);

// Structured JSON format for production (CloudWatch, ELK, etc.)
const prodFormat = combine(timestamp({ format: 'ISO' }), errors({ stack: true }), json());

const logger = winston.createLogger({
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  defaultMeta: { service: 'invested-api' },
  format: env.NODE_ENV === 'production' ? prodFormat : devFormat,
  transports: [new winston.transports.Console()],
  // Don't exit on uncaught exceptions — let the process manager handle restarts
  exitOnError: false,
});

// Silence logs during tests
if (env.NODE_ENV === 'test') {
  logger.silent = true;
}

export default logger;
