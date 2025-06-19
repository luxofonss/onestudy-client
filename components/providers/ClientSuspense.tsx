"use client";

import { Suspense, ReactNode } from "react";

interface ClientSuspenseProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function ClientSuspense({ children, fallback = null }: ClientSuspenseProps) {
  return <Suspense fallback={fallback}>{children}</Suspense>;
} 