"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Menu,
  X,
  LogOut,
  Settings,
  User as UserIcon,
  Loader2,
  Sparkles,
  Book,
  RocketIcon,
  Home,
  SparkleIcon,
  Microchip,
  Library,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/hooks/use-auth";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { Logo } from "@/components/ui/logo";
import { getInitials } from "@/lib/utils";
import { User } from "@/lib/types/user";
import { ThemeToggle } from "./theme-toggle";

const NAVIGATION_ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/create", label: "Create Quiz", icon: SparkleIcon },
  { href: "/pronunciation-test", label: "Pronunciation Test", icon: Microchip },
  { href: "/library?tab=public", label: "Library", icon: Library },
];

interface UserMenuProps {
  user: User;
  handleLogout: () => Promise<void>;
  router: any;
}

function UserMenu({ user, handleLogout, router }: UserMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-600/20 hover:from-indigo-500/30 hover:to-purple-600/30 transition-all duration-300 shadow-md"
        >
          <Avatar className="h-9 w-9 border border-white/30 shadow-inner">
            <AvatarImage src={user.avatarUrl || ""} alt={user.name || "User"} />
            <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-medium">
              {user.name ? getInitials(user.name) : "U"}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-56 mt-1 bg-gray-900/90 backdrop-blur-md border border-white/15 text-white shadow-xl"
        align="end"
        forceMount
      >
        <div className="flex flex-col space-y-1 p-3">
          <p className="text-sm font-medium text-white/95">{user.name}</p>
          <p className="text-xs text-gray-300">@{user.username}</p>
        </div>
        <DropdownMenuSeparator className="bg-white/15" />
        <DropdownMenuItem
          className="hover:bg-white/15 focus:bg-white/15 cursor-pointer px-3 py-2"
          onClick={() => router.push("/profile")}
        >
          <UserIcon className="mr-2 h-4 w-4 text-purple-300" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="hover:bg-white/15 focus:bg-white/15 cursor-pointer px-3 py-2"
          onClick={() => router.push("/settings")}
        >
          <Settings className="mr-2 h-4 w-4 text-blue-300" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-white/15" />
        <DropdownMenuItem
          className="hover:bg-white/15 focus:bg-white/15 cursor-pointer px-3 py-2"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4 text-red-300" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface DesktopNavProps {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  handleLogout: () => Promise<void>;
  router: any;
}

function DesktopNav({
  isAuthenticated,
  isLoading,
  user,
  handleLogout,
  router,
}: DesktopNavProps) {
  return (
    <nav className="hidden md:flex items-center space-x-2">
      {NAVIGATION_ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="flex items-center space-x-1 text-gray-200 hover:text-white hover:bg-white/10 px-3 py-1.5 rounded-md transition-all duration-200"
        >
          <item.icon className="h-4 w-4 text-gray-300" />
          <span>{item.label}</span>
        </Link>
      ))}

      {isAuthenticated && user ? (
        <UserMenu user={user} handleLogout={handleLogout} router={router} />
      ) : isLoading ? (
        <Button
          variant="ghost"
          className="h-10 w-10 rounded-full bg-white/5"
          disabled
        >
          <Loader2 className="h-5 w-5 animate-spin text-purple-400" />
        </Button>
      ) : (
        <Link href="/auth">
          <Button
            variant="ghost"
            className="bg-white/10 text-white hover:bg-white/20 border border-white/15 shadow-md hover:shadow-lg transition-all duration-200"
          >
            Sign In
          </Button>
        </Link>
      )}
    </nav>
  );
}

interface MobileNavMenuProps {
  isAuthenticated: boolean;
  user: User | null;
  handleLogout: () => Promise<void>;
  onClose: () => void;
}

function MobileNavMenu({
  isAuthenticated,
  user,
  handleLogout,
  onClose,
}: MobileNavMenuProps) {
  return (
    <nav className="md:hidden mt-4 pb-4 border-t border-white/15 pt-4 animate-fade-in">
      <div className="flex flex-col space-y-3 px-1">
        {NAVIGATION_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center space-x-2 text-gray-200 hover:text-white transition-all py-2 px-2 rounded-md hover:bg-white/10"
            onClick={onClose}
          >
            <item.icon className="h-5 w-5 text-gray-300" />
            <span>{item.label}</span>
          </Link>
        ))}

        {isAuthenticated && user ? (
          <div className="pt-2 flex items-center space-x-3 px-2">
            <Avatar className="h-8 w-8 border border-white/30 shadow-md">
              <AvatarImage
                src={user.avatarUrl || ""}
                alt={user.name || "User"}
              />
              <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                {user.name ? getInitials(user.name) : "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-white">
                {user.name}
              </span>
              <Link
                href="/profile"
                className="text-xs text-purple-300 hover:underline"
                onClick={onClose}
              >
                View Profile
              </Link>
            </div>
          </div>
        ) : (
          <Link href="/auth" className="pt-2" onClick={onClose}>
            <Button
              variant="ghost"
              className="w-full bg-white/10 text-white hover:bg-white/20 border border-white/15 shadow-md"
            >
              Sign In
            </Button>
          </Link>
        )}

        {isAuthenticated && (
          <Button
            variant="ghost"
            className="justify-start px-2 hover:bg-white/5 hover:text-red-300 text-gray-200 rounded-md"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </Button>
        )}
      </div>
    </nav>
  );
}

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, isLoading, user, logout } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
      router.push("/");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCloseMenu = () => setIsMenuOpen(false);

  return (
    <header className="glass-navbar sticky top-0 z-50 shadow-sm border-0">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Link href="/" className="flex items-center space-x-2">
              <div className="relative w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-md flex items-center justify-center shadow-md">
                <div className="absolute inset-0 rounded-md bg-gradient-to-br from-pink-400/40 to-purple-500/40 blur-sm"></div>
                <Sparkles className="h-5 w-5 text-white relative z-10" />
              </div>
              <span className="font-bold text-xl text-white tracking-tight">
                OneStudy
              </span>
            </Link>
            </div>

          <DesktopNav
            isAuthenticated={isAuthenticated}
            isLoading={isLoading}
            user={user}
            handleLogout={handleLogout}
            router={router}
          />

          {/* Mobile Menu Toggle */}
          <div className="flex items-center space-x-3 md:hidden">
            <ThemeToggle />
          <Button
            variant="ghost"
            size="sm"
              className="md:hidden text-white hover:bg-white/15 border border-white/10 hover:border-white/20"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <MobileNavMenu
            isAuthenticated={isAuthenticated}
            user={user}
            handleLogout={handleLogout}
            onClose={handleCloseMenu}
          />
        )}
      </div>
    </header>
  );
}
