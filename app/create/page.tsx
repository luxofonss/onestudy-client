"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, BookOpen, Users, Trophy, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { quizService } from "@/lib/services/quiz-service";
import { SUCCESS_CODE } from "@/lib/constants";
import { withAuth } from "@/lib/hooks/with-auth";

function CreatePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const router = useRouter();
  const { toast } = useToast();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateDraft = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Quiz name is required",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await quizService.createQuiz({
        title: formData.name.trim(),
        description: formData.description.trim(),
      });

      if (response.meta.code === SUCCESS_CODE && response.data?.id) {
        toast({
          title: "Success",
          description: "Draft quiz created successfully",
        });

        // Navigate to the quiz editor
        router.push(`/create/${response.data.id}`);
      } else {
        throw new Error(response.error || "Failed to create quiz");
      }
    } catch (error) {
      console.error("Error creating draft quiz:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to create quiz. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: "", description: "" });
  };

  const handleModalClose = (open: boolean) => {
    setIsModalOpen(open);
    if (!open) {
      resetForm();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <h1 className="text-3xl font-bold mb-4">Create Your Quiz</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card className="text-center">
            <CardContent className="pt-6">
              <BookOpen className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <div className="text-xl font-bold">500+</div>
              <p className="text-sm text-muted-foreground">Quizzes Created</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <Users className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <div className="text-xl font-bold">10K+</div>
              <p className="text-sm text-muted-foreground">Students Engaged</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <Trophy className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
              <div className="text-xl font-bold">95%</div>
              <p className="text-sm text-muted-foreground">Completion Rate</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <div className="text-xl font-bold">4.8</div>
              <p className="text-sm text-muted-foreground">Average Rating</p>
            </CardContent>
          </Card>
        </div>

        {/* Create Quiz Card */}
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Ready to Create?</CardTitle>
            <CardDescription>
              Start by giving your quiz a name and description. You can add
              questions and customize settings in the next step.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Dialog open={isModalOpen} onOpenChange={handleModalClose}>
              <DialogTrigger asChild>
                <Button size="lg" className="text-lg px-8 py-6">
                  <Plus className="mr-2 h-5 w-5" />
                  Create New Quiz
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Create Quiz Now</DialogTitle>
                  <DialogDescription>
                    Enter a name and description for your quiz. You'll be able
                    to add questions and customize settings in the editor.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateDraft} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Quiz Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter quiz name..."
                      disabled={isLoading}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Enter quiz description..."
                      disabled={isLoading}
                      rows={3}
                    />
                  </div>
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleModalClose(false)}
                      disabled={isLoading}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? "Creating..." : "Create & Continue"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-blue-100 dark:bg-blue-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              Easy Question Builder
            </h3>
            <p className="text-muted-foreground">
              Create multiple choice, true/false, and open-ended questions with
              our intuitive editor.
            </p>
          </div>
          <div className="text-center">
            <div className="bg-green-100 dark:bg-green-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Share & Collaborate</h3>
            <p className="text-muted-foreground">
              Share your quizzes with students, colleagues, or the community for
              collaborative learning.
            </p>
          </div>
          <div className="text-center">
            <div className="bg-purple-100 dark:bg-purple-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Track Progress</h3>
            <p className="text-muted-foreground">
              Monitor performance with detailed analytics and insights on quiz
              results.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuth(CreatePage);
