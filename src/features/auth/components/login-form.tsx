"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { loginSchema, type LoginFormData } from "../schemas/login.schema";
import { authApiService } from "../services/auth-api.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { APP_ROUTES } from "@/core/config/constants";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setError(null);
    setIsLoading(true);

    try {
      const result = await authApiService.login(data);

      if (!result.success) {
        setError(result.error || "Login failed. Please try again.");
        return;
      }

      router.push(APP_ROUTES.HOME);
      router.refresh();
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full bg-white rounded-3xl shadow-2xl overflow-hidden">
      {/* Header with Pokemon branding */}
      <div className="bg-pokemon-red p-8 text-center relative">
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg">
            <Image src="/pokeball.svg" alt="Pokeball" width={40} height={40} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white font-poppins mb-1">
              Pokédex Login
            </h1>
            <p className="text-white/90 text-sm font-poppins">
              Gotta catch &apos;em all!
            </p>
          </div>
        </div>
      </div>

      {/* Form content */}
      <div className="p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-pokemon-text font-poppins font-medium">
              Username
            </Label>
            <Input
              id="username"
              type="text"
              placeholder="ash_ketchum"
              autoComplete="username"
              {...register("username")}
              aria-invalid={!!errors.username}
              className="h-12 border-2 border-gray-200 focus:border-pokemon-red font-poppins"
            />
            {errors.username && (
              <p className="text-sm text-red-600 font-poppins">
                {errors.username.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-pokemon-text font-poppins font-medium">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              {...register("password")}
              aria-invalid={!!errors.password}
              className="h-12 border-2 border-gray-200 focus:border-pokemon-red font-poppins"
            />
            {errors.password && (
              <p className="text-sm text-red-600 font-poppins">
                {errors.password.message}
              </p>
            )}
          </div>

          {error && (
            <div className="p-4 text-sm text-red-700 bg-red-50 rounded-lg border border-red-200 font-poppins">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full h-12 bg-pokemon-red hover:bg-[#B00A24] text-white font-bold font-poppins text-base rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Start Adventure"}
          </Button>
        </form>
      </div>
    </div>
  );
}
