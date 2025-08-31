// types/auth.ts
export interface User {
  name: string;
  image: string;
  email?: string;
  isAuthenticated: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
}

export interface AuthHookReturn extends AuthState {
  logout: () => void;
  checkAuthStatus: () => void;
}
