import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/auth.types.js';
import * as adminService from '../services/admin.service.js';

export const getStats = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const stats = await adminService.getAdminStats();
    res.json(stats);
  } catch (error) {
    next(error);
  }
};
