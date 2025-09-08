"use client";

import { useEffect } from "react";
import { geminiService } from "@/services/GeminiService";

export function ApiKeyInitializer({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const setApiKey = async () => {
      await geminiService.saveApiKey("AIzaSyBYmuV-QXvXOknEiKKxp0zscflDtuJK5h4");
    };
    setApiKey();
  }, []);

  return <>{children}</>;
}
