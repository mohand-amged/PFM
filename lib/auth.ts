import NextAuth from "next-auth";
import { authOptions } from "./auth-options";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    };
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);

export async function getCurrentUser() {
  const session = await auth();
  return session?.user;
}
