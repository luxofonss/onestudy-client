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
  Tag,
  Calendar,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "@/components/ui/card";
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

  // Format the creation date if available
  const formattedDate = quiz.createdAt
    ? new Date(quiz.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <Card className="bg-gray-800/70 border border-gray-700 shadow-md hover:shadow-xl transition-all duration-300 backdrop-blur-sm hover:bg-gray-800/90 group overflow-hidden flex flex-col h-[340px]">
      <CardHeader className="pb-2 relative">
        {showSaveButton && onSave && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSaveClick}
            className="absolute top-2 right-2 h-8 w-8 p-0 bg-gray-900/50 hover:bg-teal-900/50 text-gray-300 hover:text-teal-300 rounded-full"
            aria-label={isSaved ? "Remove from saved" : "Save quiz"}
          >
            {isSaved ? (
              <BookmarkCheck className="h-4 w-4 text-teal-400" />
            ) : (
              <Bookmark className="h-4 w-4" />
            )}
          </Button>
        )}

        <div className="flex flex-col gap-1">
          <h3 className="font-medium text-base text-white line-clamp-2 pr-8 group-hover:text-teal-300 transition-colors min-h-[40px]">
            {quiz.title}
          </h3>
          <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed min-h-[32px]">
            {quiz.description}
          </p>
        </div>
      </CardHeader>

      <CardContent className="pb-2 pt-0 flex-grow flex flex-col">
        <div className="flex flex-wrap gap-1.5 mb-3 max-h-[50px] overflow-hidden">
          <Badge
            className={`text-xs font-normal px-2 py-0.5 ${difficultyConfig.color
              .replace("text-green-700", "text-green-400")
              .replace("text-yellow-700", "text-yellow-300")
              .replace("text-red-700", "text-red-300")}`}
          >
            {difficultyConfig.label}
          </Badge>
          {quiz.category && (
            <Badge className="text-xs font-normal px-2 py-0.5 bg-blue-900/30 text-blue-300 border-blue-700/30">
              {quiz.category}
            </Badge>
          )}
          {quiz.status && (
            <Badge
              className={`text-xs font-normal px-2 py-0.5 ${
                quiz.status === "published"
                  ? "bg-green-900/30 text-green-400 border-green-700/30"
                  : "bg-yellow-900/30 text-yellow-300 border-yellow-700/30"
              }`}
            >
              {quiz.status}
            </Badge>
          )}
          {quiz.tags && quiz.tags.length > 0 && (
            <Badge className="text-xs font-normal px-2 py-0.5 bg-purple-900/30 text-purple-300 border-purple-700/30 flex items-center gap-1">
              <Tag className="h-3 w-3" />
              <span className="truncate max-w-[80px]">{quiz.tags[0]}</span>
              {quiz.tags.length > 1 && <span>+{quiz.tags.length - 1}</span>}
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2 text-xs mb-3">
          <div className="bg-gray-900/50 rounded-md p-2 flex flex-col items-center justify-center h-[50px]">
            <Users className="h-3.5 w-3.5 text-gray-400 mb-1" />
            <span className="font-medium text-gray-300">
              {quiz.participants?.toLocaleString() || 0}
            </span>
          </div>
          <div className="bg-gray-900/50 rounded-md p-2 flex flex-col items-center justify-center h-[50px]">
            <Star className="h-3.5 w-3.5 text-amber-400 mb-1" />
            <span className="font-medium text-gray-300">
              {quiz.rating || "0.0"}
            </span>
          </div>
          <div className="bg-gray-900/50 rounded-md p-2 flex flex-col items-center justify-center h-[50px]">
            <Clock className="h-3.5 w-3.5 text-gray-400 mb-1" />
            <span className="font-medium text-gray-300">
              {quiz.timeLimit || "N/A"} {quiz.timeLimit ? "min" : ""}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-400 mt-auto">
          <div className="flex items-center gap-1.5 min-w-0 max-w-[50%]">
            <Calendar className="h-3.5 w-3.5 text-gray-500 flex-shrink-0" />
            <span className="truncate">{formattedDate || "N/A"}</span>
          </div>
          <div className="flex items-center gap-1.5 min-w-0 max-w-[50%]">
            <User className="h-3.5 w-3.5 text-gray-500 flex-shrink-0" />
            <span className="font-medium text-gray-400 truncate">
              {quiz?.author?.name}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-2 mt-auto">
        {showManageButtons ? (
          <div className="flex gap-1.5 w-full">
            <Button
              size="sm"
              className="flex-1 bg-teal-600 hover:bg-teal-700 text-white text-xs py-1 h-8"
              onClick={handleEditClick}
            >
              <Edit className="h-3.5 w-3.5 mr-1" />
              Edit
            </Button>
            {showAnalyticsButton && (
              <Button
                size="sm"
                variant="outline"
                className="border-blue-600/50 text-blue-400 hover:bg-blue-950/50 text-xs py-1 h-8"
                onClick={handleAnalyticsClick}
              >
                <BarChart3 className="h-3.5 w-3.5 mr-1" />
                Stats
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              className="border-gray-600 text-gray-400 hover:bg-gray-700 text-xs py-1 h-8"
              onClick={handleShareClick}
            >
              <Share className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-red-800/30 text-red-400 hover:bg-red-950/50 hover:text-red-300 text-xs py-1 h-8"
              onClick={handleDeleteClick}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ) : (
          <Button
            className="w-full bg-teal-600 hover:bg-teal-700 text-white transition-all duration-200 h-8 text-sm"
            onClick={handleStartClick}
          >
            <Play className="h-3.5 w-3.5 mr-1.5" />
            Start Quiz
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

// Memoized export for performance optimization
export const QuizCard = memo(QuizCardComponent);
QuizCard.displayName = "QuizCard";
