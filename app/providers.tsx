"use client";

import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/lib/hooks/use-auth";
import GoogleAnalytics from "@/components/providers/GoogleAnalytics";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <GoogleAnalytics />
        {children}
      </AuthProvider>
    </ThemeProvider>
  );
}
