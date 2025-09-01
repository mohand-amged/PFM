"use client";

import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";

export function SocialButtons() {
  return (
    <div className="flex flex-col space-y-4 w-full">
      <Button
        variant="outline"
        className="w-full flex items-center gap-2"
        onClick={() => signIn("google")}
      >
        <FcGoogle className="w-5 h-5" />
        Continue with Google
      </Button>
      
      <Button
        variant="outline"
        className="w-full flex items-center gap-2"
        onClick={() => signIn("apple")}
      >
        <FaApple className="w-5 h-5" />
        Continue with Apple
      </Button>
    </div>
  );
}
