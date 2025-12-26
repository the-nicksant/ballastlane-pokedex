import type { Metadata } from "next";
import Image from "next/image";
import { LoginForm } from "@/features/auth/components/login-form";

export const metadata: Metadata = {
  title: "Login | Pokédex",
  description: "Login to access the Pokédex application",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-pokemon-red p-4 relative overflow-hidden">
      {/* Pokeball background pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">

        <div className="absolute top-1/3 left-1/3 size-[800px] rotate-12">
          <Image src="/pokeball.svg" alt="" fill className="object-contain" />
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 w-full max-w-md">
        <LoginForm />
      </div>
    </div>
  );
}
