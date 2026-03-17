import prisma from '../config/database.js';
import { AppError } from '../utils/AppError.js';

/**
 * Retrieves the current authenticated user's profile
 * Returns selected user fields excluding sensitive data (passwordHash, refreshToken)
 * Returns 404 if user not found
 */
export const getCurrentUser = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      emailVerified: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  return user;
};
