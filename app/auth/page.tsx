"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/hooks/use-auth";
import { SUCCESS_CODE } from "@/lib/constants";
import { useRedirectAfterLogin } from "@/lib/hooks/use-redirect-after-login";

interface FormData {
  name?: string;
  email?: string;
  username: string;
  password: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  username?: string;
  password?: string;
}

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    username: "",
    password: "",
    name: "",
    email: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, register, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const { redirectPath } = useRedirectAfterLogin();

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Username validation
    if (!formData.username) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    // Registration-specific validation
    if (!isLogin) {
      if (!formData.name?.trim()) {
        newErrors.name = "Name is required";
      }

      if (!formData.email) {
        newErrors.email = "Email is required";
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = "Please enter a valid email address";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        variant: "destructive",
        title: "Input Error",
        description: "Please check the form for errors.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      let result;

      if (isLogin) {
        // Login with username
        result = await login({
          username: formData.username,
          password: formData.password,
        });
      } else {
        // Register
        result = await register({
          name: formData.name!,
          email: formData.email!,
          username: formData.username,
          password: formData.password,
        });
      }

      if (result.meta.code === SUCCESS_CODE) {
        toast({
          title: "Success!",
          description: isLogin
            ? "Welcome back! You have been logged in successfully."
            : "Account created successfully! Welcome to OneStudy.",
        });

        // Redirect to dashboard or home page
        router.push("/");
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description:
            result.error ||
            `${isLogin ? "Login" : "Registration"} failed. Please try again.`,
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Network Error",
        description:
          "Unable to connect to the server. Please check your connection and try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      username: "",
      password: "",
      name: "",
      email: "",
    });
    setErrors({});
  };

  return (
    <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[calc(100vh-200px)]">
      <Card className="w-full max-w-md animate-fade-in border-blue-100">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            {isLogin ? "Welcome Back" : "Join OneStudy"}
          </CardTitle>
          <CardDescription>
            {isLogin
              ? "Sign in to continue your English learning journey"
              : "Start your English learning adventure today"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name || ""}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className={`border-blue-200 focus:border-blue-500 focus:ring-blue-500 ${
                    errors.name ? "border-red-500" : ""
                  }`}
                  disabled={isSubmitting}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name}</p>
                )}
              </div>
            )}

            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={formData.email || ""}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={`border-blue-200 focus:border-blue-500 focus:ring-blue-500 ${
                    errors.email ? "border-red-500" : ""
                  }`}
                  disabled={isSubmitting}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email}</p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder={
                  isLogin ? "Enter your username" : "Choose a username"
                }
                value={formData.username}
                onChange={(e) => handleInputChange("username", e.target.value)}
                className={`border-blue-200 focus:border-blue-500 focus:ring-blue-500 ${
                  errors.username ? "border-red-500" : ""
                }`}
                disabled={isSubmitting}
              />
              {errors.username && (
                <p className="text-sm text-red-500">{errors.username}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                  className={`border-blue-200 focus:border-blue-500 focus:ring-blue-500 pr-10 ${
                    errors.password ? "border-red-500" : ""
                  }`}
                  disabled={isSubmitting}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isSubmitting}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password}</p>
              )}
            </div>

            {isLogin && (
              <div className="text-right">
                <Button
                  variant="link"
                  className="text-blue-600 hover:text-blue-700 p-0 h-auto"
                >
                  Forgot Password?
                </Button>
              </div>
            )}

            <div className="space-y-3">
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white transform hover:scale-105 transition-all duration-200"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isLogin ? "Signing In..." : "Creating Account..."}
                  </>
                ) : isLogin ? (
                  "Sign In"
                ) : (
                  "Create Account"
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full border-blue-600 text-blue-600 hover:bg-blue-50 transform hover:scale-105 transition-all duration-200"
                onClick={toggleMode}
                disabled={isSubmitting}
              >
                {isLogin ? "Create Account" : "Sign In"}
              </Button>
            </div>
          </form>
          {/* KEEP THIS COMMENTED CODE
          <div className="relative">
            <Separator />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="bg-white px-2 text-sm text-gray-500">
                Or continue with
              </span>
            </div>
          </div>
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full hover:bg-gray-50 transform hover:scale-105 transition-all duration-200"
              disabled={isSubmitting}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google
            </Button>

            <Button
              variant="outline"
              className="w-full hover:bg-gray-50 transform hover:scale-105 transition-all duration-200"
              disabled={isSubmitting}
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Facebook
            </Button>
          </div> */}
        </CardContent>
      </Card>
    </div>
  );
}
