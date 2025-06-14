"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";

interface ErrorStateProps {
  message: string;
}

export function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center h-[70vh]">
      <div className="w-16 h-16 border-4 border-t-teal-500 border-r-transparent border-b-teal-500 border-l-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-gray-300 text-lg">Loading quiz data...</p>
    </div>
  );
}

export function ErrorState({ message }: ErrorStateProps) {
  const router = useRouter();

  return (
    <div className="max-w-lg mx-auto mt-12 text-center">
      <Card className="bg-gray-800/50 border border-gray-700">
        <CardHeader>
          <CardTitle className="text-2xl text-white">
            Error Loading Quiz
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-300">{message}</p>
          <Button
            onClick={() => router.push("/create")}
            className="gradient-button"
          >
            Back to Create
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export function NotFoundState() {
  const router = useRouter();

  return (
    <div className="max-w-lg mx-auto mt-12 text-center">
      <Card className="bg-gray-800/50 border border-gray-700">
        <CardHeader>
          <CardTitle className="text-2xl text-white">Quiz Not Found</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-300">
            We couldn't find the quiz you're looking for. It may have been
            deleted or you may not have permission to view it.
          </p>
          <Button
            onClick={() => router.push("/create")}
            className="gradient-button"
          >
            Back to Create
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
