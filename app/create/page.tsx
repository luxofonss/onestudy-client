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
import {
  Plus,
  BookOpen,
  Users,
  Trophy,
  TrendingUp,
  Sparkles,
  ChevronRight,
  Lightbulb,
  Share2,
  BarChart3,
} from "lucide-react";
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
    <div className="grainy-gradient-bg min-h-screen animate-fade-in">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(65,70,120,0.4),rgba(20,20,50,0.6))] -z-10"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[length:24px_24px] -z-10"></div>
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-purple-600/20 rounded-full filter blur-3xl opacity-30 animate-pulse -z-10"></div>
      <div
        className="absolute -top-32 -right-32 w-96 h-96 bg-blue-600/20 rounded-full filter blur-3xl opacity-30 animate-pulse -z-10"
        style={{ animationDelay: "2s" }}
      ></div>

      <div className="container mx-auto px-4 py-12 md:py-16 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-4 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-xs font-medium border border-white/10 mb-6">
              <Sparkles className="h-3.5 w-3.5 mr-2 text-amber-300" />
              <span className="text-gray-200">Create & Share</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white tracking-tight">
              Create Your Quiz
            </h1>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Design engaging, interactive quizzes to help students master
              English concepts effectively
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-16">
            <div className="card-glass-dark p-5 rounded-xl shadow-lg group hover:translate-y-[-5px] transition-all duration-300">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mb-3 group-hover:bg-blue-500/30 transition-colors">
                  <BookOpen className="h-6 w-6 text-blue-400 group-hover:text-blue-300 transition-colors" />
                </div>
                <div className="text-2xl font-bold text-white mb-1">500+</div>
                <p className="text-sm text-gray-400">Quizzes Created</p>
              </div>
            </div>

            <div className="card-glass-dark p-5 rounded-xl shadow-lg group hover:translate-y-[-5px] transition-all duration-300">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mb-3 group-hover:bg-green-500/30 transition-colors">
                  <Users className="h-6 w-6 text-green-400 group-hover:text-green-300 transition-colors" />
                </div>
                <div className="text-2xl font-bold text-white mb-1">10K+</div>
                <p className="text-sm text-gray-400">Students Engaged</p>
              </div>
            </div>

            <div className="card-glass-dark p-5 rounded-xl shadow-lg group hover:translate-y-[-5px] transition-all duration-300">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center mb-3 group-hover:bg-amber-500/30 transition-colors">
                  <Trophy className="h-6 w-6 text-amber-400 group-hover:text-amber-300 transition-colors" />
                </div>
                <div className="text-2xl font-bold text-white mb-1">95%</div>
                <p className="text-sm text-gray-400">Completion Rate</p>
              </div>
            </div>

            <div className="card-glass-dark p-5 rounded-xl shadow-lg group hover:translate-y-[-5px] transition-all duration-300">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mb-3 group-hover:bg-purple-500/30 transition-colors">
                  <TrendingUp className="h-6 w-6 text-purple-400 group-hover:text-purple-300 transition-colors" />
                </div>
                <div className="text-2xl font-bold text-white mb-1">4.8</div>
                <p className="text-sm text-gray-400">Average Rating</p>
              </div>
            </div>
          </div>

          {/* Create Quiz Card */}
          <div className="card-glass-dark rounded-3xl p-8 md:p-10 shadow-2xl mb-16 relative overflow-hidden">
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-gradient-to-tl from-purple-500/10 to-transparent rounded-full"></div>

            <div className="text-center max-w-2xl mx-auto relative z-10">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                Ready to Create?
              </h2>
              <p className="text-gray-300 mb-8">
                Start by giving your quiz a name and description. You can add
                questions and customize settings in the next step.
              </p>

              <Dialog open={isModalOpen} onOpenChange={handleModalClose}>
                <DialogTrigger asChild>
                  <Button
                    size="lg"
                    className="gradient-button text-lg px-8 py-6 shadow-xl hover:shadow-2xl group hover:scale-105 transition-all duration-300"
                  >
                    <Plus className="mr-2 h-5 w-5" />
                    <span>Create New Quiz</span>
                    <div className="ml-2 bg-white/20 rounded-full w-6 h-6 flex items-center justify-center">
                      <ChevronRight className="h-3 w-3" />
                    </div>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md bg-gray-900/95 border border-white/20 text-white">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">
                      Create Quiz Now
                    </DialogTitle>
                    <DialogDescription className="text-gray-400">
                      Enter a name and description for your quiz. You'll be able
                      to add questions and customize settings in the editor.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateDraft} className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-white">
                        Quiz Name *
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Enter quiz name..."
                        disabled={isLoading}
                        required
                        className="bg-white/10 border-white/20 text-white placeholder:text-gray-500 focus:border-purple-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-white">
                        Description
                      </Label>
                      <Textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Enter quiz description..."
                        disabled={isLoading}
                        rows={3}
                        className="bg-white/10 border-white/20 text-white placeholder:text-gray-500 focus:border-purple-500"
                      />
                    </div>
                    <div className="flex justify-end space-x-2 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleModalClose(false)}
                        disabled={isLoading}
                        className="border-white/20 text-white hover:bg-white/10"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="gradient-button"
                      >
                        {isLoading ? "Creating..." : "Create & Continue"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Features */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-white text-center mb-10">
              Powerful Features
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="card-glass-dark p-6 rounded-xl shadow-lg group hover:translate-y-[-5px] transition-all duration-300">
                <div className="w-14 h-14 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-500/30 transition-colors">
                  <Lightbulb className="h-7 w-7 text-blue-400 group-hover:text-blue-300 transition-colors" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  Easy Question Builder
                </h3>
                <p className="text-gray-300">
                  Create multiple choice, true/false, and open-ended questions
                  with our intuitive editor.
                </p>
              </div>

              <div className="card-glass-dark p-6 rounded-xl shadow-lg group hover:translate-y-[-5px] transition-all duration-300">
                <div className="w-14 h-14 bg-green-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-green-500/30 transition-colors">
                  <Share2 className="h-7 w-7 text-green-400 group-hover:text-green-300 transition-colors" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  Share & Collaborate
                </h3>
                <p className="text-gray-300">
                  Share your quizzes with students, colleagues, or the community
                  for collaborative learning.
                </p>
              </div>

              <div className="card-glass-dark p-6 rounded-xl shadow-lg group hover:translate-y-[-5px] transition-all duration-300">
                <div className="w-14 h-14 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-500/30 transition-colors">
                  <BarChart3 className="h-7 w-7 text-purple-400 group-hover:text-purple-300 transition-colors" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  Track Progress
                </h3>
                <p className="text-gray-300">
                  Monitor performance with detailed analytics and insights on
                  quiz results.
                </p>
              </div>
            </div>
          </div>

          {/* Getting Started */}
          <div className="card-glass-dark rounded-xl p-6 shadow-lg">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-amber-400" />
              </div>
              <h3 className="text-lg font-bold text-white">Getting Started</h3>
            </div>
            <p className="text-gray-300 mb-4">
              Here are some quick tips to help you create effective quizzes:
            </p>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-start space-x-2">
                <div className="min-w-4 pt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400"></div>
                </div>
                <span>
                  Keep questions clear and focused on specific learning
                  objectives
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <div className="min-w-4 pt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400"></div>
                </div>
                <span>
                  Include a variety of question types to maintain engagement
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <div className="min-w-4 pt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400"></div>
                </div>
                <span>
                  Provide helpful feedback for both correct and incorrect
                  answers
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuth(CreatePage);
