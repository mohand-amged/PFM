import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth-options";

export const { handlers: { GET, POST }, auth } = NextAuth(authOptions);
