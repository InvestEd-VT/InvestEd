import api from './api';
import type {
  User,
  RegisterRequest,
  LoginRequest,
  AuthResponse,
  RefreshTokenResponse,
  ResendVerificationRequest,
  ResetPasswordRequest,
} from '../types';

const authService = {
  register: (data: RegisterRequest): Promise<AuthResponse> =>
    api.post('/auth/register', data).then((response) => response.data),

  login: (data: LoginRequest): Promise<AuthResponse> =>
    api.post('/auth/login', data).then((response) => response.data),

  logout: (): Promise<void> => api.post('/auth/logout').then(() => {}),

  refreshToken: (): Promise<RefreshTokenResponse> =>
    api.post('/auth/refresh').then((response) => response.data),

  getMe: (): Promise<User> => api.get('/users/me').then((response) => response.data),

  verifyEmail: (token: string): Promise<{ message: string }> =>
    api.get(`/auth/verify/${token}`).then((response) => response.data),

  resendVerification: (data: ResendVerificationRequest): Promise<{ message: string }> =>
    api.post('/auth/resend-verification', data).then((response) => response.data),

  resetPassword: (data: ResetPasswordRequest): Promise<{ message: string }> =>
    api.post('/auth/reset-password', data).then((response) => response.data),

  // Try to mark welcome as seen for the current user. Not all backends will
  // support this; the call is best-effort and callers should ignore failures.
  setWelcomeSeen: async (): Promise<void> => {
    try {
      // Attempt to PATCH the current user record with a hasSeenWelcome flag.
      // If the backend doesn't support it, this will throw and we silently ignore.
      await api.patch('/users/me', { hasSeenWelcome: true });
    } catch {
      // ignore - backend may not support this endpoint/field
    }
  },
};

export default authService;
