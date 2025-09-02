"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { getCurrentUser } from "@/lib/auth-utils";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await getCurrentUser();
        if (user) {
          setIsAuthenticated(true);
        } else {
          router.push("/login");
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return null;
}
