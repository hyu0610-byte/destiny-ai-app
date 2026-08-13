const AUTH_KEY = 'destiny-ai:auth-user';

export interface MockUser {
  email: string;
  nickname: string;
  loggedInAt: string;
}

export function getCurrentUser(): MockUser | null {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? (JSON.parse(raw) as MockUser) : null;
  } catch {
    return null;
  }
}

export function login(email: string): MockUser {
  const nickname = email.split('@')[0] || '게스트';
  const user: MockUser = { email, nickname, loggedInAt: new Date().toISOString() };
  localStorage.setItem(AUTH_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event('destiny-ai:auth-changed'));
  return user;
}

export function logout(): void {
  localStorage.removeItem(AUTH_KEY);
  window.dispatchEvent(new Event('destiny-ai:auth-changed'));
}
