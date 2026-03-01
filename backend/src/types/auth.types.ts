import { Request } from 'express';

// JWT
export interface JwtPayload {
  userId: string;
}

// Augmented request
export interface AuthRequest extends Request {
  userId?: string;
}

// Register
export interface RegisterRequestBody {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

// Login
export interface LoginRequestBody {
  email: string;
  password: string;
}

// Auth responses
export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: Date;
}

export interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}
