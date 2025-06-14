"use client";

import { useState, useRef, useEffect, use } from "react";
import {
  Play,
  RotateCcw,
  Share2,
  BookOpen,
  Clock,
  Users,
  Star,
  Mic,
  Square,
  Send,
  Timer,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Circle,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { quizService } from "@/lib/services/quiz-service";
import type { IQuiz } from "@/lib/types/interfaces";
import { SUCCESS_CODE } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";

interface QuestionAnswer {
  questionId: number;
  questionType: string;
  answer: string | boolean | Blob | null;
  timeSpent: number;
  timestamp: string;
}

interface QuizAnswers {
  [questionId: number]: QuestionAnswer;
}

interface IQuestion {
  id: string;
  type: string;
  text: string;
  options?: Array<{ id: string; text: string; isCorrect: boolean }>;
  pronunciationText?: string | null;
  correctBlanks?: string[] | null;
  trueFalseAnswer?: boolean | null;
  audioUrl?: string | null;
  imageUrl?: string | null;
  maxListeningTime?: number | null;
  points: number;
  timeLimit?: number | null;
  difficulty: string;
  category: string;
}

interface IQuizContent {
  id: string;
  title: string;
  description: string;
  category: string | null;
  difficulty: string | null;
  duration: number | null;
  questionCount: number;
  status: string | null;
  rating: number;
  attempts: number;
  passingScore: number;
  navigationMode: string;
  hasTimer: boolean;
  timeLimit: number;
  warningTime: number;
  allowQuestionPicker: boolean;
  shuffleQuestions: boolean;
  shuffleAnswers: boolean;
  showProgress: boolean;
  allowPause: boolean;
  maxAttempts: number;
  questions: IQuestion[];
}

type QuestionType =
  | "MULTIPLE_CHOICE"
  | "FILL_BLANK"
  | "TRUE_FALSE"
  | "PRONUNCIATION"
  | "LISTENING";
type DifficultyLevel = "Intermediate" | "Advanced" | "Beginner";
type NavigationMode = "sequential" | "back-only" | "free-navigation";

const mapApiQuestionToState = (question: IQuestion) => {
  const baseQuestion = {
    id: question.id,
    type: question.type.toLowerCase() as QuestionType,
    question: question.text,
    instructions: `Complete this ${question.type
      .toLowerCase()
      .replace("_", " ")} question.`,
    points: question.points,
    difficulty: question.difficulty as DifficultyLevel,
    category: question.category,
  };

  switch (question.type) {
    case "MULTIPLE_CHOICE":
      return {
        ...baseQuestion,
        options: question.options?.map((opt) => opt.text) || [],
        correct: question.options?.find((opt) => opt.isCorrect)?.text || "",
      };
    case "FILL_BLANK":
      return {
        ...baseQuestion,
        fillInText: question.text,
        correct: question.correctBlanks || [],
      };
    case "TRUE_FALSE":
      return {
        ...baseQuestion,
        correct: question.trueFalseAnswer,
      };
    case "PRONUNCIATION":
      return {
        ...baseQuestion,
        pronunciationText: question.pronunciationText || "",
      };
    case "LISTENING":
      return {
        ...baseQuestion,
        audioUrl: question.audioUrl || "",
        options: question.options?.map((opt) => opt.text) || [],
        correct: question.options?.find((opt) => opt.isCorrect)?.text || "",
        maxListeningTime: question.maxListeningTime || 0,
      };
    default:
      return baseQuestion;
  }
};

const mapApiQuizToState = (quiz: IQuizContent): IQuiz => {
  return {
    id: quiz.id,
    title: quiz.title,
    description: quiz.description,
    creator: "Unknown", // TODO: Add author name when available
    participants: quiz.attempts,
    rating: quiz.rating,
    duration: quiz.duration ? `${quiz.duration} min` : "N/A",
    difficulty: (quiz.difficulty || "Intermediate") as DifficultyLevel,
    navigationMode: quiz.navigationMode
      .toLowerCase()
      .replace("_", "-") as NavigationMode,
    hasTimer: quiz.hasTimer,
    timeLimit: quiz.timeLimit,
    allowQuestionPicker: quiz.allowQuestionPicker,
    questions: quiz.questions.map(mapApiQuestionToState),
  };
};

export default function InteractionPage() {
  // Timer state
  const { toast } = useToast();
  const [content, setContent] = useState<IQuiz | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const routeParams = useParams();
  const quizId = routeParams.id as string;

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await quizService.getQuizById(quizId);
        if (response.meta.code === SUCCESS_CODE && response.data) {
          setContent(mapApiQuizToState(response.data));
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load quiz content. Please try again.",
          });
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description:
            "An error occurred while loading the quiz. Please try again.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuiz();
  }, [quizId, toast]);

  const handleStart = async () => {
    try {
      const response = await quizService.startQuizAttempt(quizId);
      if (response.meta.code === SUCCESS_CODE && response.data) {
        router.push(`/quiz/${quizId}/attempt/${response.data.id}`);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to start quiz. Please try again.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          "An error occurred while starting the quiz. Please try again.",
      });
    }
  };

  const getNavigationModeDescription = () => {
    switch (content?.navigationMode) {
      case "sequential":
        return "Questions must be answered in order";
      case "back-only":
        return "You can review previous questions";
      case "free-navigation":
        return "Navigate freely between questions";
      default:
        return "";
    }
  };

  const getDifficultyColor = () => {
    if (!content?.difficulty) return "bg-blue-500";

    switch (content.difficulty.toLowerCase()) {
      case "beginner":
        return "bg-green-500";
      case "intermediate":
        return "bg-blue-500";
      case "advanced":
        return "bg-purple-500";
      default:
        return "bg-blue-500";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-t-blue-500 border-gray-700 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-400">Loading quiz content...</p>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-gray-300">
        <div className="text-center">
          <div className="text-5xl mb-4">😕</div>
          <h2 className="text-2xl font-bold mb-2">Quiz Not Found</h2>
          <p className="mb-6">
            The quiz you're looking for doesn't exist or has been removed.
          </p>
          <Link href="/library">
            <Button
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Return to Library
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleShare = async () => {
    try {
      const url = window.location.href;
      await navigator.clipboard.writeText(url);
      toast({
        title: "Link Copied!",
        description: "Quiz link has been copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 text-gray-100">
      <div className="container mx-auto px-4 py-8 max-w-6xl animate-fade-in">
        <Card className="border-gray-700 bg-gray-800/50 backdrop-blur-sm shadow-xl">
          <CardHeader className="pb-2 relative">
            <div className="absolute -top-10 left-1/2 transform -translate-x-1/2">
              <div className="w-20 h-20 bg-gradient-to-br from-teal-400 to-blue-600 rounded-full flex items-center justify-center shadow-lg border-4 border-gray-800">
                <BookOpen className="h-10 w-10 text-white" />
              </div>
            </div>

            <div className="mt-10 text-center">
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-teal-400 via-blue-500 to-purple-600 text-transparent bg-clip-text">
                {content.title}
              </CardTitle>
              <CardDescription className="text-lg mt-3 text-gray-300">
                {content.description}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Quiz Stats - Grid Layout */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
              <div className="bg-gray-700/50 rounded-lg p-3 border border-gray-600/50 flex flex-col items-center justify-center">
                <div className="flex items-center justify-center mb-1">
                  <Clock className="h-4 w-4 mr-2 text-teal-400" />
                  <span className="text-xs uppercase text-gray-400">
                    Duration
                  </span>
                </div>
                <span className="text-lg font-semibold">
                  {content.duration}
                </span>
              </div>

              <div className="bg-gray-700/50 rounded-lg p-3 border border-gray-600/50 flex flex-col items-center justify-center">
                <div className="flex items-center justify-center mb-1">
                  <Users className="h-4 w-4 mr-2 text-blue-400" />
                  <span className="text-xs uppercase text-gray-400">
                    Participants
                  </span>
                </div>
                <span className="text-lg font-semibold">
                  {content.participants.toLocaleString()}
                </span>
              </div>

              <div className="bg-gray-700/50 rounded-lg p-3 border border-gray-600/50 flex flex-col items-center justify-center">
                <div className="flex items-center justify-center mb-1">
                  <Star className="h-4 w-4 mr-2 text-yellow-400" />
                  <span className="text-xs uppercase text-gray-400">
                    Rating
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="text-lg font-semibold">
                    {content.rating}
                  </span>
                  <div className="flex ml-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 ${
                          i < Math.round(content.rating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-500"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-gray-700/50 rounded-lg p-3 border border-gray-600/50 flex flex-col items-center justify-center">
                <div className="flex items-center justify-center mb-1">
                  <Info className="h-4 w-4 mr-2 text-purple-400" />
                  <span className="text-xs uppercase text-gray-400">
                    Difficulty
                  </span>
                </div>
                <div className="flex items-center">
                  <div
                    className={`w-3 h-3 rounded-full ${getDifficultyColor()} mr-2`}
                  ></div>
                  <span className="text-lg font-semibold">
                    {content.difficulty}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-center text-sm text-gray-400">
              Created by:{" "}
              <span className="font-medium text-gray-300">
                {content.creator}
              </span>
            </div>

            {/* Quiz Settings Info */}
            <div className="bg-gray-900/70 p-4 rounded-lg border border-gray-700/50 backdrop-blur-sm">
              <h3 className="font-semibold text-blue-400 mb-3 flex items-center">
                <Timer className="h-4 w-4 mr-2" />
                Quiz Settings
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="flex items-start">
                  <div className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5 mr-2"></div>
                  <p className="text-gray-300">
                    <span className="text-gray-400">Navigation:</span>{" "}
                    {getNavigationModeDescription()}
                  </p>
                </div>

                {content.hasTimer && (
                  <div className="flex items-start">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 mr-2"></div>
                    <p className="text-gray-300">
                      <span className="text-gray-400">Time Limit:</span>{" "}
                      {content.timeLimit} minutes
                    </p>
                  </div>
                )}

                {content.allowQuestionPicker && (
                  <div className="flex items-start">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 mr-2"></div>
                    <p className="text-gray-300">
                      <span className="text-gray-400">Navigation:</span>{" "}
                      Question picker available
                    </p>
                  </div>
                )}

                <div className="flex items-start">
                  <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-1.5 mr-2"></div>
                  <p className="text-gray-300">
                    <span className="text-gray-400">Questions:</span>{" "}
                    {content.questions.length} total
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-4 justify-center pt-2">
              <Button
                size="lg"
                onClick={handleStart}
                className="bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 text-white px-8 py-4 text-lg shadow-lg shadow-blue-900/20 transform hover:scale-105 transition-all duration-200"
              >
                <Play className="h-5 w-5 mr-2" />
                Start Quiz
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={handleShare}
                className="border-gray-600 text-gray-300 hover:bg-gray-700/50 px-8 py-4 text-lg"
              >
                <Share2 className="h-5 w-5 mr-2" />
                Share
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
