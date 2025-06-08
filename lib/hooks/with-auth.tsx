"use client";

import { useAuth } from "./use-auth";
import Loading from "@/app/loading";

export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>
) {
  return function WithAuthComponent(props: P) {
    const { isLoading } = useAuth();

    if (isLoading) {
      return <Loading />;
    }

    return <WrappedComponent {...props} />;
  };
}
