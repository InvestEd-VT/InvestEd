import prisma from '../config/database.js';
import { AppError } from '../utils/AppError.js';
import bcrypt from 'bcryptjs';

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

/**
 * Updates user profile (firstName, lastName)
 * INVESTED-261: PUT /api/v1/users/profile
 */
export const updateProfile = async (userId: string, data: { firstName?: string; lastName?: string }) => {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(data.firstName && { firstName: data.firstName }),
      ...(data.lastName && { lastName: data.lastName }),
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      emailVerified: true,
      createdAt: true,
    },
  });

  return user;
};

/**
 * Changes user password
 * INVESTED-262: PUT /api/v1/users/change-password
 */
export const changePassword = async (userId: string, currentPassword: string, newPassword: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError('User not found', 404);

  const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isValid) throw new AppError('Current password is incorrect', 401);

  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(newPassword, salt);

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash, refreshToken: null },
  });

  return { message: 'Password changed successfully' };
};
