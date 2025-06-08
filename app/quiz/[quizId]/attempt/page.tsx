"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Trophy,
  Target,
  TrendingUp,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Play,
  BarChart3,
  User,
  Award,
  Timer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import Link from "next/link";
import { quizService } from "@/lib/services/quiz-service";

interface QuizAttempt {
  id: string;
  quizId: string;
  userId: string;
  score: number;
  totalQuestions: number | null;
  correctAnswers: number;
  timeSpent: number;
  completedAt: string | null;
  passed: boolean;
}

interface QuizWithAttempts {
  id: string;
  title: string;
  description: string;
  category: string | null;
  difficulty: string | null;
  questionCount: number;
  tags: string[];
  passingScore: number;
  maxAttempts: number;
  hasTimer: boolean;
  timeLimit: number;
  quizAttempts: QuizAttempt[];
}

export default function QuizAttemptsPage() {
  const params = useParams();
  const router = useRouter();
  const quizId = params.quizId as string;

  const [quiz, setQuiz] = useState<QuizWithAttempts | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuizAttempts();
  }, [quizId]);

  const fetchQuizAttempts = async () => {
    try {
      setLoading(true);
      const response = await quizService.getMyQuizAttempts();
      if (response.data) {
        const foundQuiz = response.data.find((q) => q.id === quizId);
        setQuiz(foundQuiz || null);
      }
    } catch (error) {
      console.error("Failed to fetch quiz attempts:", error);
    } finally {
      setLoading(false);
    }
  };

  const getQuizStats = () => {
    if (!quiz) return null;

    const attempts = quiz.quizAttempts.filter(
      (attempt) => attempt.completedAt !== null
    );
    const highestScore =
      attempts.length > 0 ? Math.max(...attempts.map((a) => a.score)) : 0;
    const lowestScore =
      attempts.length > 0 ? Math.min(...attempts.map((a) => a.score)) : 0;
    const averageScore =
      attempts.length > 0
        ? attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length
        : 0;
    const passedAttempts = attempts.filter((a) => a.passed).length;

    return {
      totalAttempts: attempts.length,
      highestScore,
      lowestScore,
      averageScore,
      passedAttempts,
      passRate:
        attempts.length > 0 ? (passedAttempts / attempts.length) * 100 : 0,
    };
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return "text-green-600 bg-green-50 border-green-200";
    if (score >= 80) return "text-blue-600 bg-blue-50 border-blue-200";
    if (score >= 70) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 80) return "text-blue-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not completed";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTimeSpent = (seconds: number) => {
    if (seconds === 0) return "N/A";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getAttemptNumber = (
    attempt: QuizAttempt,
    allAttempts: QuizAttempt[]
  ) => {
    const completedAttempts = allAttempts
      .filter((a) => a.completedAt !== null)
      .sort(
        (a, b) =>
          new Date(a.completedAt!).getTime() -
          new Date(b.completedAt!).getTime()
      );

    return completedAttempts.findIndex((a) => a.id === attempt.id) + 1;
  };

  const getTimeSinceAttempt = (dateString: string | null) => {
    if (!dateString) return "N/A";
    const now = new Date();
    const attemptDate = new Date(dateString);
    const diffInHours = Math.floor(
      (now.getTime() - attemptDate.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    const diffInWeeks = Math.floor(diffInDays / 7);
    return `${diffInWeeks}w ago`;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Quiz not found
            </h3>
            <p className="text-gray-500 mb-4">
              The quiz you're looking for doesn't exist or you haven't attempted
              it yet.
            </p>
            <Link href="/attempted-quizzes">
              <Button>Back to Attempted Quizzes</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = getQuizStats();
  const completedAttempts = quiz.quizAttempts
    .filter((attempt) => attempt.completedAt !== null)
    .sort(
      (a, b) =>
        new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime()
    );

  return (
    <div className="container mx-auto px-4 py-6 animate-fade-in">
      <div className="mb-6">
        <Link href="/attempted-quizzes">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Attempted Quizzes
          </Button>
        </Link>
        <PageHeader title={quiz.title} description={quiz.description} />
      </div>

      {/* Quiz Info - Compact */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2 mb-3">
            {quiz.difficulty && (
              <Badge variant="outline">{quiz.difficulty}</Badge>
            )}
            {quiz.category && <Badge variant="outline">{quiz.category}</Badge>}
            {quiz.tags.slice(0, 3).map((tag, index) => (
              <Badge
                key={index}
                variant="outline"
                className="border-blue-300 text-blue-600"
              >
                {tag}
              </Badge>
            ))}
            {quiz.tags.length > 3 && (
              <Badge
                variant="outline"
                className="border-gray-300 text-gray-600"
              >
                +{quiz.tags.length - 3} more
              </Badge>
            )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
            <div className="flex items-center">
              <FileText className="h-4 w-4 text-gray-400 mr-2" />
              <span className="text-gray-500">Questions:</span>
              <span className="ml-1 font-medium">{quiz.questionCount}</span>
            </div>
            <div className="flex items-center">
              <Target className="h-4 w-4 text-gray-400 mr-2" />
              <span className="text-gray-500">Pass:</span>
              <span className="ml-1 font-medium">{quiz.passingScore}%</span>
            </div>
            <div className="flex items-center">
              <User className="h-4 w-4 text-gray-400 mr-2" />
              <span className="text-gray-500">Max:</span>
              <span className="ml-1 font-medium">{quiz.maxAttempts}</span>
            </div>
            <div className="flex items-center">
              <Timer className="h-4 w-4 text-gray-400 mr-2" />
              <span className="text-gray-500">Time:</span>
              <span className="ml-1 font-medium">
                {quiz.hasTimer ? `${quiz.timeLimit}min` : "Unlimited"}
              </span>
            </div>
            <div className="flex items-center">
              <BarChart3 className="h-4 w-4 text-gray-400 mr-2" />
              <span className="text-gray-500">Left:</span>
              <span className="ml-1 font-medium">
                {quiz.maxAttempts - (stats?.totalAttempts || 0)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Compact Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <Card className="border-blue-100">
            <CardContent className="p-3 text-center">
              <div className="flex items-center justify-center mb-1">
                <Trophy className="h-4 w-4 text-blue-600 mr-1" />
                <span className="text-lg font-bold text-blue-600">
                  {stats.totalAttempts}
                </span>
              </div>
              <p className="text-xs text-gray-600">Attempts</p>
            </CardContent>
          </Card>
          <Card className="border-green-100">
            <CardContent className="p-3 text-center">
              <div className="flex items-center justify-center mb-1">
                <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                <span className="text-lg font-bold text-green-600">
                  {Math.round(stats.highestScore)}%
                </span>
              </div>
              <p className="text-xs text-gray-600">Best Score</p>
            </CardContent>
          </Card>
          <Card className="border-purple-100">
            <CardContent className="p-3 text-center">
              <div className="flex items-center justify-center mb-1">
                <Target className="h-4 w-4 text-purple-600 mr-1" />
                <span className="text-lg font-bold text-purple-600">
                  {Math.round(stats.averageScore)}%
                </span>
              </div>
              <p className="text-xs text-gray-600">Average</p>
            </CardContent>
          </Card>
          <Card className="border-orange-100">
            <CardContent className="p-3 text-center">
              <div className="flex items-center justify-center mb-1">
                <Award className="h-4 w-4 text-orange-600 mr-1" />
                <span className="text-lg font-bold text-orange-600">
                  {Math.round(stats.passRate)}%
                </span>
              </div>
              <p className="text-xs text-gray-600">Pass Rate</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content - Attempts List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center justify-between">
            <span>Attempt History ({completedAttempts.length})</span>
            <Link href={`/content/${quiz.id}`}>
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Play className="h-4 w-4 mr-1" />
                {completedAttempts.length > 0 ? "Retake" : "Start Quiz"}
              </Button>
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {completedAttempts.length === 0 ? (
            <div className="p-8 text-center">
              <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No completed attempts
              </h3>
              <p className="text-gray-500 mb-4">
                You haven't completed this quiz yet.
              </p>
              <Link href={`/content/${quiz.id}`}>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  Start Quiz
                </Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {completedAttempts.map((attempt, index) => (
                <div
                  key={attempt.id}
                  className="p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {/* Attempt Number */}
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-sm font-bold text-blue-600">
                            #{getAttemptNumber(attempt, quiz.quizAttempts)}
                          </span>
                        </div>
                      </div>

                      {/* Score and Status */}
                      <div className="flex items-center space-x-3">
                        <div
                          className={`px-3 py-1 rounded-lg border ${getPerformanceColor(
                            attempt.score
                          )}`}
                        >
                          <span className="font-bold text-lg">
                            {Math.round(attempt.score)}%
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {attempt.passed ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600" />
                          )}
                          <Badge
                            variant={attempt.passed ? "default" : "destructive"}
                            className="text-xs"
                          >
                            {attempt.passed ? "PASSED" : "FAILED"}
                          </Badge>
                        </div>
                      </div>

                      {/* Performance Details */}
                      <div className="hidden md:flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Target className="h-4 w-4 mr-1" />
                          <span>
                            {attempt.correctAnswers}/{quiz.questionCount}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>{formatTimeSpent(attempt.timeSpent)}</span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>
                            {getTimeSinceAttempt(attempt.completedAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/quiz/${quiz.id}/attempt/${attempt.id}/result`}
                      >
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-blue-300 text-blue-600 hover:bg-blue-50"
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>

                  {/* Mobile Details */}
                  <div className="md:hidden mt-3 flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center space-x-3">
                      <span>
                        {attempt.correctAnswers}/{quiz.questionCount} correct
                      </span>
                      <span>•</span>
                      <span>{formatTimeSpent(attempt.timeSpent)}</span>
                    </div>
                    <span>{formatDate(attempt.completedAt)}</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                      <span>
                        Accuracy:{" "}
                        {Math.round(
                          (attempt.correctAnswers / quiz.questionCount) * 100
                        )}
                        %
                      </span>
                      <span>{formatDate(attempt.completedAt)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          attempt.score >= 90
                            ? "bg-green-500"
                            : attempt.score >= 80
                            ? "bg-blue-500"
                            : attempt.score >= 70
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }`}
                        style={{
                          width: `${
                            (attempt.correctAnswers / quiz.questionCount) * 100
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="mt-6 flex gap-3 justify-center">
        <Link href={`/content/${quiz.id}`}>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <Play className="h-4 w-4 mr-2" />
            {completedAttempts.length > 0 ? "Retake Quiz" : "Start Quiz"}
          </Button>
        </Link>
        <Link href="/attempted-quizzes">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to All Attempts
          </Button>
        </Link>
      </div>
    </div>
  );
}
