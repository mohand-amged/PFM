import { User } from './auth-service';

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return document.cookie
    .split('; ')
    .find(row => row.startsWith('auth-token='))
    ?.split('=')[1] || null;
}

export async function fetchWithAuth(input: RequestInfo, init?: RequestInit): Promise<Response> {
  const response = await fetch(input, {
    ...init,
    credentials: 'same-origin', // This will include cookies automatically
  });

  if (response.status === 401) {
    // Redirect to login if unauthorized
    window.location.href = `/login?from=${encodeURIComponent(window.location.pathname)}`;
    throw new Error('Unauthorized');
  }

  return response;
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const response = await fetchWithAuth('/api/auth/me');
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch current user:', error);
    return null;
  }
}

export async function login(email: string, password: string): Promise<{ user: User }> {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
    credentials: 'same-origin',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Login failed');
  }

  return response.json();
}

export async function logout(): Promise<void> {
  await fetch('/api/auth/logout', {
    method: 'POST',
    credentials: 'same-origin',
  });
  
  // Force a full page reload to clear any client-side state
  window.location.href = '/login';
}
