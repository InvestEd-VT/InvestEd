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

/**
 * GET /api/v1/users/profile
 * Returns full user profile
 */
export const getProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await userService.getCurrentUser(req.userId!);
    res.json(user);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/v1/users/profile
 * Update user's first and last name
 */
export const updateProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { firstName, lastName } = req.body;
    const user = await userService.updateProfile(req.userId!, { firstName, lastName });
    res.json(user);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/v1/users/change-password
 * Change user's password
 */
export const changePassword = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({ error: 'currentPassword and newPassword are required' });
      return;
    }

    if (newPassword.length < 8) {
      res.status(400).json({ error: 'New password must be at least 8 characters' });
      return;
    }

    const result = await userService.changePassword(req.userId!, currentPassword, newPassword);
    res.json(result);
  } catch (error) {
    next(error);
  }
};
