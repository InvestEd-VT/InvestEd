import { body, ValidationChain } from 'express-validator';

export const loginSchema: ValidationChain[] = [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required'),
];
