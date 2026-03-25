import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/auth.types.js';
import * as educationService from '../services/education.service.js';

/**
 * GET /api/v1/education/modules
 * Returns all modules ordered by display order, with completion
 * status for the authenticated user.
 */
export const listModules = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.userId!;
    const modules = await educationService.listModules(userId);
    res.json({ modules });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/education/modules/:id
 * Returns a single module with the user's completion status.
 * Responds 404 if the module does not exist.
 */
export const getModule = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.userId!;
    const id = req.params.id as string;
    const mod = await educationService.getModuleById(userId, id);
    res.json({ module: mod });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/education/modules/:id/complete
 * Marks a module as complete for the authenticated user.
 * Has no effect when called on already completed modules.
 */
export const completeModule = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.userId!;
    const id = req.params.id as string;
    const progress = await educationService.markModuleComplete(userId, id);
    res.json({ progress });
  } catch (error) {
    next(error);
  }
};
