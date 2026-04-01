// TypeScript type definitions

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface Position {
  id: string;
  symbol: string;
  quantity: number;
  avgCost: number;
  positionType: string;
  optionType?: string | null;
  strikePrice?: number | null;
  currentPrice?: number;
  marketValue?: number;
  costBasis?: number;
  unrealizedPnL?: number;
  unrealizedPnLPercent?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface PortfolioResponse {
  id: string;
  name: string;
  cashBalance: number;
  positionsValue: number;
  totalValue: number;
  totalPnL: number;
  totalPnLPercent: number;
  positions: Position[];
  createdAt: string;
  updatedAt: string;
}
