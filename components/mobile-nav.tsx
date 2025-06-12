"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  PenTool,
  Library,
  User as UserIcon,
  Mic,
} from "lucide-react";
import { cn, getInitials } from "@/lib/utils";
import { useAuth } from "@/lib/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "@/lib/types/user";

interface NavItemProps {
  href: string;
  icon: React.ElementType;
  label: string;
  isActive: boolean;
}

function NavItem({ href, icon: Icon, label, isActive }: NavItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex flex-col items-center py-2 px-3 rounded-lg transition-all duration-200 min-w-[48px]",
        isActive
          ? "text-purple-600 bg-purple-50"
          : "text-gray-600 hover:text-purple-600 hover:bg-purple-50"
      )}
    >
      <Icon className="h-5 w-5 mb-1" />
      <span className="text-xs font-medium">{label}</span>
    </Link>
  );
}

interface ProfileNavItemProps {
  href: string;
  isActive: boolean;
  isAuthenticated: boolean;
  user: User | null;
}

function ProfileNavItem({
  href,
  isActive,
  isAuthenticated,
  user,
}: ProfileNavItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex flex-col items-center py-2 px-3 rounded-lg transition-all duration-200 min-w-[48px]",
        isActive
          ? "text-purple-600 bg-purple-50"
          : "text-gray-600 hover:text-purple-600 hover:bg-purple-50"
      )}
    >
      {isAuthenticated && user ? (
        <>
          <Avatar className="h-5 w-5 mb-1">
            <AvatarImage src={user.avatarUrl || ""} alt={user.name || "User"} />
            <AvatarFallback className="bg-purple-100 text-purple-600 text-xs">
              {user.name ? getInitials(user.name) : "U"}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs font-medium">Profile</span>
        </>
      ) : (
        <>
          <UserIcon className="h-5 w-5 mb-1" />
          <span className="text-xs font-medium">Profile</span>
        </>
      )}
    </Link>
  );
}

export function MobileNav() {
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuth();

  const navItems = [
    { href: "/", icon: BookOpen, label: "Learn" },
    { href: "/create", icon: PenTool, label: "Create" },
    { href: "/library", icon: Library, label: "Content" },
    { href: "/pronunciation-test", icon: Mic, label: "Pronunciation" },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-purple-100 z-50">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => (
          <NavItem
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={item.label}
            isActive={pathname === item.href}
          />
        ))}

        <ProfileNavItem
          href="/profile"
          isActive={pathname === "/profile"}
          isAuthenticated={isAuthenticated}
          user={user}
        />
      </div>
    </nav>
  );
}
