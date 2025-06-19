import { Sparkles } from "lucide-react";
import Link from "next/link";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "light" | "dark";
  isLink?: boolean;
}

export function Logo({
  className = "",
  size = "md",
  variant = "dark",
  isLink = true,
}: LogoProps) {
  const sizes = {
    sm: {
      container: "w-8 h-8",
      text: "text-base",
      dot: "w-2.5 h-2.5",
      innerDot: "w-1 h-1",
    },
    md: {
      container: "w-10 h-10",
      text: "text-lg",
      dot: "w-3 h-3",
      innerDot: "w-1.5 h-1.5",
    },
    lg: {
      container: "w-12 h-12",
      text: "text-xl",
      dot: "w-3.5 h-3.5",
      innerDot: "w-2 h-2",
    },
  };

  const variants = {
    light: {
      text: "text-white",
      brandName: "text-white",
    },
    dark: {
      text: "text-white",
      brandName: "text-gray-900",
    },
  };

  const sizeClasses = sizes[size];
  const variantClasses = variants[variant];

  const logoContent = (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div
        className={`relative ${sizeClasses.container} bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg`}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl opacity-20 blur-sm"></div>
                <div className="absolute inset-0 rounded-md bg-gradient-to-br from-pink-400/40 to-purple-500/40 blur-sm"></div>
                <Sparkles className="h-5 w-5 text-white relative z-10" />
              </div>
      <span className={`font-bold text-xl ${variantClasses.brandName}`}>
        OneStudy
      </span>
    </div>
  );

  if (isLink) {
    return <Link href="/">{logoContent}</Link>;
  }

  return logoContent;
}
