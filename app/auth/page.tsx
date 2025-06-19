"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, LogIn, UserPlus } from "lucide-react";
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
import { event } from "@/lib/utils/analytics";

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
      
      // Track form validation failure
      event({
        action: 'auth_validation_error',
        category: 'Authentication',
        label: isLogin ? 'Login Form' : 'Registration Form',
      });
      
      return;
    }

    setIsSubmitting(true);

    try {
      let result;

      if (isLogin) {
        // Track login attempt
        event({
          action: 'login_attempt',
          category: 'Authentication',
          label: 'Username Login',
        });
        
        // Login with username
        result = await login({
          username: formData.username,
          password: formData.password,
        });
      } else {
        // Track registration attempt
        event({
          action: 'registration_attempt',
          category: 'Authentication',
          label: 'New User Registration',
        });
        
        // Register
        result = await register({
          name: formData.name!,
          email: formData.email!,
          username: formData.username,
          password: formData.password,
        });
      }

      if (result?.meta?.code === SUCCESS_CODE) {
        // Track successful authentication
        event({
          action: isLogin ? 'login_success' : 'registration_success',
          category: 'Authentication',
          label: formData.username,
        });
        
        toast({
          title: "Success!",
          description: isLogin
            ? "Welcome back! You have been logged in successfully."
            : "Account created successfully! Welcome to OneStudy.",
        });

        // Redirect to dashboard or home page
        router.push("/");
      } else {
        // Track authentication failure
        event({
          action: isLogin ? 'login_failure' : 'registration_failure',
          category: 'Authentication',
          label: result.meta.message || 'Unknown error',
        });
        
        toast({
          variant: "destructive",
          title: "Error",
          description:
            result.meta.message ||
            `${isLogin ? "Login" : "Registration"} failed. Please try again.`,
        });
      }
    } catch (error) {
      console.log("error:: ", error);
      
      // Track network error
      event({
        action: 'auth_network_error',
        category: 'Authentication',
        label: isLogin ? 'Login' : 'Registration',
      });
      
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
    
    // Track auth mode toggle
    event({
      action: 'auth_mode_toggle',
      category: 'Authentication',
      label: isLogin ? 'To Register' : 'To Login',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 to-gray-900 text-gray-100">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(65,70,120,0.15),rgba(20,20,50,0.2))] pointer-events-none"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[length:24px_24px] pointer-events-none"></div>
      
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[calc(100vh-200px)] relative z-10">
        <Card className="w-full max-w-md animate-fade-in border-gray-700/30 bg-gray-800/20 backdrop-blur-sm shadow-xl">
          <CardHeader className="text-center border-b border-gray-700/50 pb-4">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 text-transparent bg-clip-text">
              {isLogin ? "Welcome Back" : "Join OneStudy"}
            </CardTitle>
            <CardDescription className="text-gray-400">
              {isLogin
                ? "Sign in to continue your English learning journey"
                : "Start your English learning adventure today"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-gray-300">Full Name</Label>
                  <div className="relative">
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.name || ""}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      className={`bg-gray-900/70 border-gray-700 text-gray-200 focus:border-blue-500 focus:ring-blue-500 ${
                        errors.name ? "border-red-500" : ""
                      }`}
                      disabled={isSubmitting}
                    />
                  </div>
                  {errors.name && (
                    <p className="text-sm text-red-400">{errors.name}</p>
                  )}
                </div>
              )}

              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-300">Email</Label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email address"
                      value={formData.email || ""}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className={`bg-gray-900/70 border-gray-700 text-gray-200 focus:border-blue-500 focus:ring-blue-500 ${
                        errors.email ? "border-red-500" : ""
                      }`}
                      disabled={isSubmitting}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-red-400">{errors.email}</p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="username" className="text-gray-300">Username</Label>
                <div className="relative">
                  <Input
                    id="username"
                    type="text"
                    placeholder={
                      isLogin ? "Enter your username" : "Choose a username"
                    }
                    value={formData.username}
                    onChange={(e) => handleInputChange("username", e.target.value)}
                    className={`bg-gray-900/70 border-gray-700 text-gray-200 focus:border-blue-500 focus:ring-blue-500 ${
                      errors.username ? "border-red-500" : ""
                    }`}
                    disabled={isSubmitting}
                  />
                </div>
                {errors.username && (
                  <p className="text-sm text-red-400">{errors.username}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-300">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                    className={`bg-gray-900/70 border-gray-700 text-gray-200 focus:border-blue-500 focus:ring-blue-500 pr-10 ${
                      errors.password ? "border-red-500" : ""
                    }`}
                    disabled={isSubmitting}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-gray-400 hover:text-gray-200"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isSubmitting}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-400">{errors.password}</p>
                )}
              </div>

              {isLogin && (
                <div className="text-right">
                  <Button
                    variant="link"
                    className="text-blue-400 hover:text-blue-300 p-0 h-auto"
                  >
                    Forgot Password?
                  </Button>
                </div>
              )}

              <div className="space-y-3 pt-2">
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white transform transition-all duration-200"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isLogin ? "Signing In..." : "Creating Account..."}
                    </>
                  ) : (
                    <>
                      {isLogin ? (
                        <>
                          <LogIn className="mr-2 h-4 w-4" />
                          Sign In
                        </>
                      ) : (
                        <>
                          <UserPlus className="mr-2 h-4 w-4" />
                          Create Account
                        </>
                      )}
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-gray-700 text-gray-300 hover:bg-gray-800/50 transform transition-all duration-200"
                  onClick={toggleMode}
                  disabled={isSubmitting}
                >
                  {isLogin ? "Create Account" : "Sign In"}
                </Button>
              </div>
            </form>
{/*            
        FUTURE 
            <div className="relative">
              <Separator className="bg-gray-700/50" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="bg-gray-800/80 px-2 text-sm text-gray-500">
                  Or continue with
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="border-gray-700 text-gray-300 hover:bg-gray-800/50 transform transition-all duration-200"
                disabled={isSubmitting}
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.66 15.63 16.88 16.79 15.71 17.57V20.34H19.28C21.36 18.42 22.56 15.6 22.56 12.25Z" fill="#4285F4"/>
                  <path d="M12 23C14.97 23 17.46 22.02 19.28 20.34L15.71 17.57C14.73 18.23 13.48 18.63 12 18.63C9.14 18.63 6.71 16.7 5.84 14.1H2.18V16.94C3.99 20.53 7.7 23 12 23Z" fill="#34A853"/>
                  <path d="M5.84 14.09C5.62 13.43 5.49 12.73 5.49 12C5.49 11.27 5.62 10.57 5.84 9.91V7.07H2.18C1.43 8.55 1 10.22 1 12C1 13.78 1.43 15.45 2.18 16.93L5.84 14.09Z" fill="#FBBC05"/>
                  <path d="M12 5.38C13.62 5.38 15.06 5.94 16.21 7.02L19.36 3.87C17.45 2.09 14.97 1 12 1C7.7 1 3.99 3.47 2.18 7.07L5.84 9.91C6.71 7.31 9.14 5.38 12 5.38Z" fill="#EA4335"/>
                </svg>
                Google
              </Button>

              <Button
                variant="outline"
                className="border-gray-700 text-gray-300 hover:bg-gray-800/50 transform transition-all duration-200"
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
    </div>
  );
}
