"use client";

import type React from "react";
import { memo } from "react";
import {
  Users,
  Clock,
  Star,
  Play,
  Edit,
  Share,
  Trash2,
  Bookmark,
  BookmarkCheck,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getDifficultyConfig, getCategoryConfig } from "@/lib/utils/quiz-utils";
import type { IQuiz } from "@/lib/types/interfaces";
import { useAuth } from "@/lib/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useLocalStorage } from "@/lib/hooks/use-local-storage";

interface IQuizCardProps {
  quiz: IQuiz;
  showSaveButton?: boolean;
  showManageButtons?: boolean;
  showAnalyticsButton?: boolean;
  onSave?: (quizId: string) => void;
  onEdit?: (quizId: string) => void;
  onDelete?: (quizId: string) => void;
  onShare?: (quizId: string) => void;
  onAnalytics?: (quizId: string) => void;
  isSaved?: boolean;
}

// Pure presentational component
const QuizCardComponent: React.FC<IQuizCardProps> = ({
  quiz,
  showSaveButton = false,
  showManageButtons = false,
  showAnalyticsButton = false,
  onSave,
  onEdit,
  onDelete,
  onShare,
  onAnalytics,
  isSaved = false,
}) => {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [, setRedirectAfterLogin] = useLocalStorage<string | null>(
    "redirectAfterLogin",
    null
  );

  const difficultyConfig = getDifficultyConfig(quiz.difficulty);
  const categoryConfig = getCategoryConfig(quiz?.category);

  const handleSaveClick = () => onSave?.(quiz.id);
  const handleEditClick = () => onEdit?.(quiz.id);
  const handleDeleteClick = () => onDelete?.(quiz.id);
  const handleShareClick = () => onShare?.(quiz.id);
  const handleAnalyticsClick = () => onAnalytics?.(quiz.id);
  const handleStartClick = () => {
    if (isAuthenticated) {
      router.push(`/content/${quiz.id}`);
    } else {
      // Store the quiz ID for redirection after login
      setRedirectAfterLogin(`/content/${quiz.id}`);
      router.push("/auth");
    }
  };

  return (
    <Card className="bg-white border border-gray-200 shadow-md hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg text-gray-900 line-clamp-2">
              {quiz.title}
            </h3>
            <p className="text-sm text-gray-600 mt-1 line-clamp-2 leading-relaxed">
              {quiz.description}
            </p>
          </div>

          {showSaveButton && onSave && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSaveClick}
              className="shrink-0 h-8 w-8 p-0 hover:bg-purple-500/20 hover:text-purple-600"
              aria-label={isSaved ? "Remove from saved" : "Save quiz"}
            >
              {isSaved ? (
                <BookmarkCheck className="h-4 w-4 text-purple-600" />
              ) : (
                <Bookmark className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mt-3">
          <Badge className={`text-xs font-medium ${difficultyConfig.color}`}>
            {difficultyConfig.label}
          </Badge>
          <Badge className={`text-xs font-medium ${categoryConfig.color}`}>
            {categoryConfig.label}
          </Badge>
          {quiz.status && (
            <Badge
              className={`text-xs font-medium ${
                quiz.status === "published"
                  ? "bg-green-500/20 text-green-700 border-green-500/30"
                  : "bg-yellow-500/20 text-yellow-700 border-yellow-500/30"
              }`}
            >
              {quiz.status}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="text-sm text-gray-500 mb-3">
          <span className="font-medium text-gray-900">Created by:</span>{" "}
          {quiz.creator}
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              <span className="font-medium">
                {quiz.participants?.toLocaleString() || 0}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span className="font-medium">{quiz.rating}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              <span className="font-medium">{quiz.duration}</span>
            </div>
          </div>
        </div>

        {showManageButtons ? (
          <div className="flex gap-2">
            <Button
              size="sm"
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
              onClick={handleEditClick}
            >
              <Edit className="h-3.5 w-3.5 mr-1.5" />
              Edit
            </Button>
            {showAnalyticsButton && (
              <Button
                size="sm"
                variant="outline"
                className="border-blue-600 text-blue-600 hover:bg-blue-50"
                onClick={handleAnalyticsClick}
              >
                <BarChart3 className="h-3.5 w-3.5 mr-1.5" />
                Analytics
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
              onClick={handleShareClick}
            >
              <Share className="h-3.5 w-3.5 mr-1.5" />
              Share
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-red-500/30 text-red-600 hover:bg-red-500/20 hover:text-red-700"
              onClick={handleDeleteClick}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ) : (
          <Button
            className="w-full bg-purple-600 hover:bg-purple-700 text-white transition-all duration-200"
            onClick={handleStartClick}
          >
            <Play className="h-3.5 w-3.5 mr-1.5" />
            Start Quiz
          </Button>
        )}

        {/* {quiz.attempts && (
          <div className="flex items-center justify-between text-xs text-gray-500 mt-3 pt-3 border-t border-gray-200">
            <span>{quiz.attempts} attempts</span>
            <span>{quiz.passRate}% pass rate</span>
          </div>
        )} */}
      </CardContent>
    </Card>
  );
};

// Memoized export for performance optimization
export const QuizCard = memo(QuizCardComponent);
QuizCard.displayName = "QuizCard";
