// TypeScript type definitions

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  updatedAt: string;
  // Optional server-side flag to indicate the user has already seen the welcome/onboarding screen
  hasSeenWelcome?: boolean;
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
  expirationDate?: string | null;
  contractSymbol?: string | null;
  status?: string;
  currentPrice?: number;
  marketValue?: number;
  costBasis?: number;
  unrealizedPnL?: number;
  unrealizedPnLPercent?: number;
  portfolioId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PnLBySymbol {
  symbol: string;
  realizedPnL: number;
  unrealizedPnL: number;
  totalPnL: number;
}

export interface PortfolioResponse {
  id: string;
  name: string;
  cashBalance: number;
  positionsValue: number;
  totalValue: number;
  totalPnL: number;
  totalPnLPercent: number;
  realizedPnL: number;
  winRate: number | null;
  pnlBySymbol: PnLBySymbol[];
  positions: Position[];
  createdAt: string;
  updatedAt: string;
}

export interface ResendVerificationRequest {
  token: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface Stock {
  symbol: string;
  companyName: string;
  currentPrice: number;
  priceChange: number;
  priceChangePercent: number;
  volume: number;
  marketCap: number;
  high52Week?: number;
  low52Week?: number;
}

export interface StockSearchResult {
  symbol: string;
  companyName: string;
  currentPrice: number;
}

export interface StockChartData {
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// ─── Options ───────────────────────────────────────────────────────────────────

export interface OptionsContract {
  ticker: string;
  contract_type: 'call' | 'put';
  strike_price: number;
  expiration_date: string;
  underlying_ticker: string;
  shares_per_contract: number;
}

export interface OptionsChainResponse {
  calls: OptionsContract[];
  puts: OptionsContract[];
  expirationDates: string[];
}

// ─── Trading ───────────────────────────────────────────────────────────────────

export interface TradeRequest {
  symbol: string;
  contractSymbol: string;
  optionType: 'CALL' | 'PUT';
  strikePrice: number;
  expirationDate: string;
  quantity: number;
  price: number;
}

export interface TradeResponse {
  position: Position;
  transaction: Transaction;
  cashBalance: number;
  isDemo?: boolean;
}

// ─── Portfolio (extended) ──────────────────────────────────────────────────────

export type Portfolio = PortfolioResponse;

export interface Transaction {
  id: string;
  type: 'BUY' | 'SELL' | 'EXERCISE' | 'EXPIRED_WORTHLESS' | 'EXPIRATION';
  symbol: string;
  quantity: number;
  price: number;
  positionType: 'STOCK' | 'OPTION';
  optionType: 'CALL' | 'PUT' | null;
  strikePrice: number | null;
  expirationDate: string | null;
  contractSymbol: string | null;
  portfolioId: string;
  executedAt: string;
  createdAt: string;
}

export interface TransactionsResponse {
  transactions: Transaction[];
  total: number;
  limit: number;
  offset: number;
}

// ─── Notifications ─────────────────────────────────────────────────────────────

export type NotificationType =
  | 'OPTION_EXPIRED'
  | 'OPTION_EXERCISED'
  | 'OPTION_EXPIRING_SOON'
  | 'TRADE_EXECUTED'
  | 'PORTFOLIO_RESET';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  data?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
  total: number;
  unreadCount: number;
  limit: number;
  offset: number;
}
