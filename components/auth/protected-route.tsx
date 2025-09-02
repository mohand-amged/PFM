"use client";

import { useEffect, useState } from "react";
import { getCurrentUser } from "@/lib/auth-utils";

interface User {
  id: string;
  email: string | null;
  name: string | null;
}

interface OptionalAuthProps {
  children: (user: User | null, isLoading: boolean) => React.ReactNode;
}

export function OptionalAuth({ children }: OptionalAuthProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        // Silently handle auth errors - user remains null
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  return <>{children(user, isLoading)}</>;
}

// Keep the old ProtectedRoute for backward compatibility but make it optional
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  return (
    <OptionalAuth>
      {(user, isLoading) => {
        if (isLoading) {
          return (
            <div className="flex min-h-screen items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
            </div>
          );
        }
        // Always render children regardless of auth status
        return <>{children}</>;
      }}
    </OptionalAuth>
  );
}
