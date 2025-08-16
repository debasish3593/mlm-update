import { User } from "@shared/schema";

export interface AuthUser extends Omit<User, 'password'> {}

export const getAuthUser = (): AuthUser | null => {
  if (typeof window === 'undefined') return null;
  
  const stored = localStorage.getItem('auth_user');
  return stored ? JSON.parse(stored) : null;
};

export const setAuthUser = (user: AuthUser | null) => {
  if (typeof window === 'undefined') return;
  
  if (user) {
    localStorage.setItem('auth_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('auth_user');
  }
};

export const clearAuth = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('auth_user');
};
