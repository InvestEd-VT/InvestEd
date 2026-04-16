import api from './api';
import type { User } from '../types';

/**
 * Get the current user's profile
 */
export const getProfile = async (): Promise<User> => {
  const response = await api.get<User>('/users/profile');
  return response.data;
};

/**
 * Update user's name (firstName and/or lastName)
 */
export const updateProfile = async (data: {
  firstName?: string;
  lastName?: string;
}): Promise<User> => {
  const response = await api.put<User>('/users/profile', data);
  return response.data;
};

/**
 * Change user's password
 */
export const changePassword = async (data: {
  currentPassword: string;
  newPassword: string;
}): Promise<{ message: string }> => {
  const response = await api.put<{ message: string }>('/users/change-password', data);
  return response.data;
};
