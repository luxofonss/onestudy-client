"use client";

import { useAuth } from "./use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Loading from "@/app/loading";

export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>
) {
  return function WithAuthComponent(props: P) {
    const { isLoading, isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        router.push("/auth");
      }
    }, [isLoading, isAuthenticated, router]);

    if (isLoading) {
      return <Loading />;
    }

    if (!isAuthenticated) {
      return <Loading />;
    }

    return <WrappedComponent {...props} />;
  };
}
