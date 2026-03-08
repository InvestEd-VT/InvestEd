import api from "./api";
import type {
  User,
  RegisterRequest,
  LoginRequest,
  AuthResponse,
  RefreshTokenResponse,
} from "../types";

const authService = {
  register: (data: RegisterRequest): Promise<AuthResponse> =>
    api.post("/auth/register", data).then((response) => response.data),

  login: (data: LoginRequest): Promise<AuthResponse> =>
    api.post("/auth/login", data).then((response) => response.data),

  logout: (): Promise<void> =>
    api.post("/auth/logout").then(() => {}),

  refreshToken: (): Promise<RefreshTokenResponse> =>
    api.post("/auth/refresh").then((response) => response.data),

  getMe: (): Promise<User> =>
    api.get("/users/me").then((response) => response.data),
};

export default authService;