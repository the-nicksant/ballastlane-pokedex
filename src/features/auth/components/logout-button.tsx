"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authApiService } from "../services/auth-api.service";
import { Button } from "@/components/ui/button";
import { APP_ROUTES } from "@/core/config/constants";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);

    try {
      await authApiService.logout();

      router.push(APP_ROUTES.LOGIN);
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
      router.push(APP_ROUTES.LOGIN);
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleLogout}
      disabled={isLoading}
    >
      <LogOut className="mr-2 h-4 w-4" />
      {isLoading ? "Logging out..." : "Logout"}
    </Button>
  );
}
