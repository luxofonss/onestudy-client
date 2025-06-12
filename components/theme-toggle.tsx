"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="relative w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500/10 to-purple-600/10 dark:from-indigo-500/20 dark:to-purple-600/20 border border-white/10 backdrop-blur-sm hover:from-indigo-500/20 hover:to-purple-600/20 dark:hover:from-indigo-500/30 dark:hover:to-purple-600/30 transition-all duration-300"
      aria-label="Toggle theme"
    >
      <div className="absolute inset-0 rounded-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-600/5 dark:from-indigo-500/10 dark:to-purple-600/10 backdrop-blur-sm"></div>
      </div>
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0 text-amber-500" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100 text-blue-400" />
    </Button>
  );
}
