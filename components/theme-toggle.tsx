"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="relative w-12 h-12 rounded-full bg-gradient-to-br from-blue-400/20 to-purple-500/20 dark:from-blue-600/30 dark:to-purple-700/30 border border-white/20 dark:border-white/10 backdrop-blur-sm shadow-[inset_0_2px_4px_rgba(255,255,255,0.3),0_8px_32px_rgba(0,0,0,0.1)] dark:shadow-[inset_0_2px_4px_rgba(255,255,255,0.1),0_8px_32px_rgba(0,0,0,0.3)] hover:shadow-[inset_0_2px_4px_rgba(255,255,255,0.4),0_12px_40px_rgba(0,0,0,0.15)] dark:hover:shadow-[inset_0_2px_4px_rgba(255,255,255,0.15),0_12px_40px_rgba(0,0,0,0.4)] transition-all duration-300"
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-amber-500" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-blue-400" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
