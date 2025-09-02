// Completely standalone Edge Runtime compatible JWT verification
// This file has ZERO dependencies on Node.js modules

export interface User {
  id: string;
  email: string | null;
  name: string | null;
}

// Simple JWT payload verification without any external dependencies
// This is a basic implementation for middleware use only
export function verifyTokenEdge(token: string): { userId: string } | null {
  try {
    // Split the JWT token
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    // Decode the payload (middle part)
    const payload = parts[1];
    // Add padding if needed
    const paddedPayload = payload + '='.repeat((4 - payload.length % 4) % 4);
    
    // Decode base64
    const decodedPayload = atob(paddedPayload.replace(/-/g, '+').replace(/_/g, '/'));
    const parsedPayload = JSON.parse(decodedPayload);
    
    // Check if token is expired
    if (parsedPayload.exp && parsedPayload.exp < Date.now() / 1000) {
      return null;
    }
    
    return { userId: parsedPayload.userId };
  } catch (error) {
    return null;
  }
}

// Get user data from request headers (set by middleware)
export function getCurrentUserFromHeaders(headers: Headers): User | null {
  const userId = headers.get('x-user-id');
  const userEmail = headers.get('x-user-email');
  const userName = headers.get('x-user-name');
  
  if (!userId) return null;
  
  return {
    id: userId,
    email: userEmail,
    name: userName,
  };
}
