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

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!content) {
    return <div>Quiz not found</div>;
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
    <div className="container mx-auto px-4 py-8 max-w-6xl animate-fade-in">
      <Card className="border-teal-100 mb-8">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center">
              <BookOpen className="h-8 w-8 text-teal-600" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold mb-4">
            {content.title}
          </CardTitle>
          <CardDescription className="text-lg mb-6">
            {content.description}
          </CardDescription>

          <div className="flex items-center justify-center space-x-8 text-sm text-gray-600 mb-8">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              {content.duration}
            </div>
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-2" />
              {content.participants.toLocaleString()} participants
            </div>
            <div className="flex items-center">
              <Star className="h-4 w-4 mr-2 fill-yellow-400 text-yellow-400" />
              {content.rating}
            </div>
          </div>
          <div className="text-center text-sm text-gray-500 mb-6">
            Created by:{" "}
            <span className="font-medium text-gray-700">{content.creator}</span>
          </div>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          {/* Quiz Settings Info */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-2">Quiz Settings</h3>
            <div className="text-sm text-blue-700 space-y-1">
              <p>• Navigation: {getNavigationModeDescription()}</p>
              {content.hasTimer && (
                <p>• Time Limit: {content.timeLimit} minutes</p>
              )}
              {content.allowQuestionPicker && (
                <p>• Question picker available</p>
              )}
              <p>• {content.questions.length} questions total</p>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <Button
              size="lg"
              onClick={handleStart}
              className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-4 text-lg transform hover:scale-105 transition-all duration-200"
            >
              <Play className="h-5 w-5 mr-2" />
              Start{" "}
              {content.navigationMode === "sequential" ? "Sequential " : ""}
              Quiz
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={handleShare}
              className="border-teal-600 text-teal-600 hover:bg-teal-50 px-8 py-4 text-lg"
            >
              <Share2 className="h-5 w-5 mr-2" />
              Share
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
