import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../types/auth.types.js';
import * as authService from '../services/auth.service';

/**
 * POST /api/v1/auth/register
 * Public route - no auth required
 * Creates a new user account with .edu email verification
 * Returns 201 on success with confirmation message
 */
export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await authService.register(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/auth/login
 * Public route - no auth required
 * Authenticates user credentials and returns access and refresh tokens
 * Returns 200 on success with tokens and basic user info
 */
export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await authService.login(req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/auth/refresh
 * Public route - refresh token validated in service
 * Issues a new access token using a valid refresh token
 * Returns 200 on success with new access token
 */
export const refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // refresh token pulled from request body
    const result = await authService.refresh(req.body.refreshToken);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/auth/logout
 * Protected route - requires valid JWT via authMiddleware
 * Invalidates the user's refresh token in the database
 * Returns 200 on success with confirmation message
 */
export const logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId } = req as AuthRequest;
    const result = await authService.logout(userId!);
    res.json(result);
  } catch (error) {
    next(error);
  }
};
