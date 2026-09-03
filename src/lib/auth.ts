import { apiRequest, getToken, setToken, clearToken, ApiRequestError } from './apiClient';

const USER_CACHE_KEY = 'destiny-ai:user-cache';

export interface AuthUser {
  id: string;
  email: string;
  nickname: string;
  createdAt: string;
}

interface AuthResponse {
  token: string;
  user: AuthUser;
}

function cacheUser(user: AuthUser | null): void {
  if (user) {
    localStorage.setItem(USER_CACHE_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_CACHE_KEY);
  }
}

/** 새로고침 직후 등, 서버 확인 전 화면에 즉시 보여줄 캐시된 사용자 정보 */
export function getCachedUser(): AuthUser | null {
  try {
    if (!getToken()) return null;
    const raw = localStorage.getItem(USER_CACHE_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export async function register(email: string, password: string): Promise<AuthUser> {
  const data = await apiRequest<AuthResponse>('/api/auth/register', {
    method: 'POST',
    body: { email, password },
  });
  setToken(data.token);
  cacheUser(data.user);
  window.dispatchEvent(new Event('destiny-ai:auth-changed'));
  return data.user;
}

export async function login(email: string, password: string): Promise<AuthUser> {
  const data = await apiRequest<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: { email, password },
  });
  setToken(data.token);
  cacheUser(data.user);
  window.dispatchEvent(new Event('destiny-ai:auth-changed'));
  return data.user;
}

/** 저장된 토큰이 여전히 유효한지 서버에 확인하고 최신 사용자 정보를 반환 */
export async function fetchCurrentUser(): Promise<AuthUser | null> {
  if (!getToken()) return null;
  try {
    const data = await apiRequest<{ user: AuthUser }>('/api/auth/me', { auth: true });
    cacheUser(data.user);
    return data.user;
  } catch (err) {
    if (err instanceof ApiRequestError && err.status === 401) {
      logout();
    }
    return null;
  }
}

export function logout(): void {
  clearToken();
  cacheUser(null);
  window.dispatchEvent(new Event('destiny-ai:auth-changed'));
}

export { ApiRequestError };
