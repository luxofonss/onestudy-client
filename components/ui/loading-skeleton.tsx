"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface LoadingSkeletonProps {
  count?: number;
}

export const LoadingSkeleton = ({ count = 6 }: LoadingSkeletonProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className="bg-white border border-gray-200">
          <CardHeader className="pb-3">
            <div className="space-y-3">
              <div className="h-6 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
              <div className="flex gap-2">
                <div className="h-6 bg-gray-200 rounded animate-pulse w-20" />
                <div className="h-6 bg-gray-200 rounded animate-pulse w-16" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
              <div className="flex gap-4">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-12" />
                <div className="h-4 bg-gray-200 rounded animate-pulse w-12" />
                <div className="h-4 bg-gray-200 rounded animate-pulse w-16" />
              </div>
              <div className="h-10 bg-gray-200 rounded animate-pulse" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
