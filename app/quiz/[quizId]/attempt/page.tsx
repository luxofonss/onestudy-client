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
import { event } from "@/lib/utils/analytics";

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
    
    // Track page view with quiz ID
    event({
      action: 'quiz_attempts_page_view',
      category: 'Quiz History',
      label: `Quiz ID: ${quizId}`,
    });
  }, [quizId]);

  const fetchQuizAttempts = async () => {
    try {
      setLoading(true);
      
      // Track attempt to fetch quiz history
      event({
        action: 'quiz_attempts_fetch',
        category: 'Quiz History',
        label: `Quiz ID: ${quizId}`,
      });
      
      const response = await quizService.getMyQuizAttempts();
      if (response.data) {
        const foundQuiz = response.data.find((q) => q.id === quizId);
        setQuiz(foundQuiz || null);
        
        // Track successful fetch with attempt count
        event({
          action: 'quiz_attempts_fetch_success',
          category: 'Quiz History',
          label: `Quiz ID: ${quizId}`,
          value: foundQuiz?.quizAttempts?.length || 0,
        });
        
        // If no quiz found, track that too
        if (!foundQuiz) {
          event({
            action: 'quiz_attempts_not_found',
            category: 'Quiz History',
            label: `Quiz ID: ${quizId}`,
          });
        }
      }
    } catch (error) {
      console.error("Failed to fetch quiz attempts:", error);
      
      // Track fetch error
      event({
        action: 'quiz_attempts_fetch_error',
        category: 'Quiz History',
        label: `Quiz ID: ${quizId}`,
      });
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

  // Add tracking to navigation actions
  const handleViewAttemptDetails = (attemptId: string) => {
    // Track attempt details view
    event({
      action: 'quiz_attempt_details_view',
      category: 'Quiz History',
      label: `Quiz ID: ${quizId}, Attempt ID: ${attemptId}`,
    });
    
    router.push(`/quiz/${quizId}/attempt/${attemptId}/result`);
  };
  
  const handleStartQuiz = () => {
    // Track quiz start from attempts page
    event({
      action: 'quiz_start_from_attempts',
      category: 'Quiz History',
      label: `Quiz ID: ${quizId}`,
    });
    
    router.push(`/content/${quizId}`);
  };
  
  const handleBackToAttempts = () => {
    // Track navigation back to all attempts
    event({
      action: 'back_to_all_attempts',
      category: 'Quiz History',
      label: 'Navigation',
    });
    
    router.push('/attempted-quizzes');
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-800 rounded w-1/4"></div>
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-800 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="border-gray-700/30 bg-gray-800/20 backdrop-blur-sm shadow-md">
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-medium text-gray-200 mb-2">
              Quiz not found
            </h3>
            <p className="text-gray-400 mb-4">
              The quiz you're looking for doesn't exist or you haven't attempted
              it yet.
            </p>
            <Link href="/attempted-quizzes">
              <Button className="bg-blue-600/80 hover:bg-blue-600 text-white">Back to Attempted Quizzes</Button>
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
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 text-gray-100 container mx-auto px-4 py-6 animate-fade-in">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          className="mb-4 text-gray-300 hover:text-gray-100 hover:bg-gray-800/50"
          onClick={handleBackToAttempts}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Attempted Quizzes
        </Button>
        <PageHeader title={quiz.title} description={quiz.description} />
      </div>

      {/* Quiz Info - Compact */}
      <Card className="mb-6 border-gray-700/30 bg-gray-800/20 backdrop-blur-sm shadow-md">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2 mb-3">
            {quiz.difficulty && (
              <Badge variant="outline" className="border-gray-700/40 bg-gray-800/40 text-gray-300">
                {quiz.difficulty}
              </Badge>
            )}
            {quiz.category && (
              <Badge variant="outline" className="border-gray-700/40 bg-gray-800/40 text-gray-300">
                {quiz.category}
              </Badge>
            )}
            {quiz.tags.slice(0, 3).map((tag, index) => (
              <Badge
                key={index}
                variant="outline"
                className="border-blue-700/40 bg-blue-900/20 text-blue-300"
              >
                {tag}
              </Badge>
            ))}
            {quiz.tags.length > 3 && (
              <Badge
                variant="outline"
                className="border-gray-700/40 bg-gray-800/40 text-gray-300"
              >
                +{quiz.tags.length - 3} more
              </Badge>
            )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
            <div className="flex items-center">
              <FileText className="h-4 w-4 text-blue-400 mr-2" />
              <span className="text-gray-400">Questions:</span>
              <span className="ml-1 font-medium text-gray-200">{quiz.questionCount}</span>
            </div>
            <div className="flex items-center">
              <Target className="h-4 w-4 text-green-400 mr-2" />
              <span className="text-gray-400">Pass:</span>
              <span className="ml-1 font-medium text-gray-200">{quiz.passingScore}%</span>
            </div>
            <div className="flex items-center">
              <User className="h-4 w-4 text-purple-400 mr-2" />
              <span className="text-gray-400">Max:</span>
              <span className="ml-1 font-medium text-gray-200">{quiz.maxAttempts}</span>
            </div>
            <div className="flex items-center">
              <Timer className="h-4 w-4 text-yellow-400 mr-2" />
              <span className="text-gray-400">Time:</span>
              <span className="ml-1 font-medium text-gray-200">
                {quiz.hasTimer ? `${quiz.timeLimit}min` : "Unlimited"}
              </span>
            </div>
            <div className="flex items-center">
              <BarChart3 className="h-4 w-4 text-orange-400 mr-2" />
              <span className="text-gray-400">Left:</span>
              <span className="ml-1 font-medium text-gray-200">
                {quiz.maxAttempts - (stats?.totalAttempts || 0)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Compact Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <Card className="border-gray-700/30 bg-gray-800/20 backdrop-blur-sm shadow-md">
            <CardContent className="p-3 text-center">
              <div className="bg-blue-900/30 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2">
                <Trophy className="h-5 w-5 text-blue-400" />
              </div>
              <div className="flex items-center justify-center mb-1">
                <span className="text-lg font-bold text-blue-400">
                  {stats.totalAttempts}
                </span>
              </div>
              <p className="text-xs text-gray-400">Attempts</p>
            </CardContent>
          </Card>
          <Card className="border-gray-700/30 bg-gray-800/20 backdrop-blur-sm shadow-md">
            <CardContent className="p-3 text-center">
              <div className="bg-green-900/30 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2">
                <TrendingUp className="h-5 w-5 text-green-400" />
              </div>
              <div className="flex items-center justify-center mb-1">
                <span className="text-lg font-bold text-green-400">
                  {Math.round(stats.highestScore)}%
                </span>
              </div>
              <p className="text-xs text-gray-400">Best Score</p>
            </CardContent>
          </Card>
          <Card className="border-gray-700/30 bg-gray-800/20 backdrop-blur-sm shadow-md">
            <CardContent className="p-3 text-center">
              <div className="bg-purple-900/30 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2">
                <Target className="h-5 w-5 text-purple-400" />
              </div>
              <div className="flex items-center justify-center mb-1">
                <span className="text-lg font-bold text-purple-400">
                  {Math.round(stats.averageScore)}%
                </span>
              </div>
              <p className="text-xs text-gray-400">Average</p>
            </CardContent>
          </Card>
          <Card className="border-gray-700/30 bg-gray-800/20 backdrop-blur-sm shadow-md">
            <CardContent className="p-3 text-center">
              <div className="bg-orange-900/30 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2">
                <Award className="h-5 w-5 text-orange-400" />
              </div>
              <div className="flex items-center justify-center mb-1">
                <span className="text-lg font-bold text-orange-400">
                  {Math.round(stats.passRate)}%
                </span>
              </div>
              <p className="text-xs text-gray-400">Pass Rate</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content - Attempts List */}
      <Card className="border-gray-700/30 bg-gray-800/20 backdrop-blur-sm shadow-md">
        <CardHeader className="pb-3 border-b border-gray-700/50">
          <CardTitle className="text-lg flex items-center justify-between text-gray-100">
            <span>Attempt History ({completedAttempts.length})</span>
            <Button
              size="sm"
              className="bg-blue-600/80 hover:bg-blue-600 text-white"
              onClick={handleStartQuiz}
            >
              <Play className="h-4 w-4 mr-1" />
              {completedAttempts.length > 0 ? "Retake" : "Start Quiz"}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {completedAttempts.length === 0 ? (
            <div className="p-8 text-center">
              <Trophy className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-200 mb-2">
                No completed attempts
              </h3>
              <p className="text-gray-400 mb-4">
                You haven't completed this quiz yet.
              </p>
              <Button 
                className="bg-blue-600/80 hover:bg-blue-600 text-white"
                onClick={handleStartQuiz}
              >
                Start Quiz
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-gray-700/30">
              {completedAttempts.map((attempt, index) => (
                <div
                  key={attempt.id}
                  className="p-4 hover:bg-gray-800/40 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {/* Attempt Number */}
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-blue-900/30 flex items-center justify-center border border-blue-700/40">
                          <span className="text-sm font-bold text-blue-300">
                            #{getAttemptNumber(attempt, quiz.quizAttempts)}
                          </span>
                        </div>
                      </div>

                      {/* Score and Status */}
                      <div className="flex items-center space-x-3">
                        <div
                          className={`px-3 py-1 rounded-lg ${
                            attempt.score >= 90
                              ? "bg-green-900/40 text-green-300 border border-green-700/40"
                              : attempt.score >= 80
                              ? "bg-blue-900/40 text-blue-300 border border-blue-700/40"
                              : attempt.score >= 70
                              ? "bg-yellow-900/40 text-yellow-300 border border-yellow-700/40"
                              : "bg-red-900/40 text-red-300 border border-red-700/40"
                          }`}
                        >
                          <span className="font-bold text-lg">
                            {Math.round(attempt.score)}%
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {attempt.passed ? (
                            <CheckCircle className="h-5 w-5 text-green-400" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-400" />
                          )}
                          <Badge
                            className={
                              attempt.passed
                                ? "bg-green-900/40 text-green-300 border-green-700/40"
                                : "bg-red-900/40 text-red-300 border-red-700/40"
                            }
                          >
                            {attempt.passed ? "PASSED" : "FAILED"}
                          </Badge>
                        </div>
                      </div>

                      {/* Performance Details */}
                      <div className="hidden md:flex items-center space-x-4 text-sm text-gray-400">
                        <div className="flex items-center">
                          <Target className="h-4 w-4 mr-1 text-green-400" />
                          <span>
                            {attempt.correctAnswers}/{quiz.questionCount}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1 text-blue-400" />
                          <span>{formatTimeSpent(attempt.timeSpent)}</span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1 text-purple-400" />
                          <span>
                            {getTimeSinceAttempt(attempt.completedAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-blue-700/40 bg-blue-900/20 text-blue-300 hover:bg-blue-900/40"
                        onClick={() => handleViewAttemptDetails(attempt.id)}
                      >
                        <FileText className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                    </div>
                  </div>

                  {/* Mobile Details */}
                  <div className="md:hidden mt-3 flex items-center justify-between text-sm text-gray-400">
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
                    <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                      <span>
                        Accuracy:{" "}
                        {Math.round(
                          (attempt.correctAnswers / quiz.questionCount) * 100
                        )}
                        %
                      </span>
                      <span>{formatDate(attempt.completedAt)}</span>
                    </div>
                    <div className="w-full bg-gray-800/60 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          attempt.score >= 90
                            ? "bg-green-500/80"
                            : attempt.score >= 80
                            ? "bg-blue-500/80"
                            : attempt.score >= 70
                            ? "bg-yellow-500/80"
                            : "bg-red-500/80"
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
        <Button 
          className="bg-blue-600/80 hover:bg-blue-600 text-white"
          onClick={handleStartQuiz}
        >
          <Play className="h-4 w-4 mr-2" />
          {completedAttempts.length > 0 ? "Retake Quiz" : "Start Quiz"}
        </Button>
        <Button 
          variant="outline" 
          className="border-gray-700 text-gray-300 hover:bg-gray-800/50"
          onClick={handleBackToAttempts}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to All Attempts
        </Button>
      </div>
    </div>
  );
}
