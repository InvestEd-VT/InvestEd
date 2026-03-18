import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/auth.types.js';
import * as userService from '../services/user.service.js';

/**
 * GET /api/v1/users/me
 * Protected route - requires valid JWT via authMiddleware
 * Returns the current authenticated user's profile
 */
export const getMe = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await userService.getCurrentUser(req.userId!);
    res.json(user);
  } catch (error) {
    next(error);
  }
};
