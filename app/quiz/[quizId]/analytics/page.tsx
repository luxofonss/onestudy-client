"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Users,
  TrendingUp,
  Clock,
  Award,
  Eye,
  Calendar,
  Filter,
  Search,
  Play,
  Edit,
  Bookmark,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { quizService } from "@/lib/services/quiz-service";
import { SUCCESS_CODE } from "@/lib/constants";

export default function QuizAnalyticsPage() {
  const params = useParams();
  const router = useRouter();
  const quizId = params.quizId as string;

  const [quizStats, setQuizStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [showSavedUsers, setShowSavedUsers] = useState(false);

  // Fetch quiz statistics
  useEffect(() => {
    const fetchQuizStats = async () => {
      setIsLoading(true);
      try {
        const response = await quizService.getQuizStats(quizId);

        if (response.meta?.code === SUCCESS_CODE && response.data) {
          setQuizStats(response.data);
        } else {
          setError(response.meta?.message || "Failed to fetch quiz statistics");
        }
      } catch (error) {
        setError("An error occurred while fetching quiz statistics");
        console.error("Error fetching quiz statistics:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuizStats();
  }, [quizId]);

  // Calculate statistics from quiz data
  const calculateStatistics = useCallback(() => {
    if (!quizStats) return null;

    const attempts = quizStats.quizAttempts || [];
    const totalAttempts = attempts.length;

    if (totalAttempts === 0) {
      return {
        totalAttempts: 0,
        uniqueUsers: 0,
        averageScore: 0,
        passRate: 0,
        averageTimeSpent: 0,
        completionRate: 0,
        savedByCount: quizStats.savedByUsers?.length || 0,
      };
    }

    // Get unique users
    const uniqueUserIds = new Set(attempts.map((attempt) => attempt.userId));
    const uniqueUsers = uniqueUserIds.size;

    // Calculate average score
    const totalScore = attempts.reduce(
      (sum, attempt) => sum + attempt.score,
      0
    );
    const averageScore = totalScore / totalAttempts;

    // Calculate pass rate
    const passedAttempts = attempts.filter((attempt) => attempt.passed).length;
    const passRate = (passedAttempts / totalAttempts) * 100;

    // Calculate average time spent
    const totalTimeSpent = attempts.reduce(
      (sum, attempt) => sum + attempt.timeSpent,
      0
    );
    const averageTimeSpent = totalTimeSpent / totalAttempts;

    // Calculate completion rate
    const completedAttempts = attempts.filter(
      (attempt) => attempt.completedAt
    ).length;
    const completionRate = (completedAttempts / totalAttempts) * 100;

    return {
      totalAttempts,
      uniqueUsers,
      averageScore,
      passRate,
      averageTimeSpent,
      completionRate,
      savedByCount: quizStats.savedByUsers?.length || 0,
    };
  }, [quizStats]);

  const statistics = calculateStatistics();

  const filteredAttempts =
    quizStats?.quizAttempts
      ?.filter((attempt) => {
        const matchesSearch =
          attempt.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          attempt.user.email.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesFilter =
          filterStatus === "all" ||
          (filterStatus === "passed" && attempt.passed) ||
          (filterStatus === "failed" && !attempt.passed);

        return matchesSearch && matchesFilter;
      })
      .sort((a, b) => {
        const aDate = a.createdAt || a.completedAt || "";
        const bDate = b.createdAt || b.completedAt || "";

        switch (sortBy) {
          case "newest":
            return new Date(bDate).getTime() - new Date(aDate).getTime();
          case "oldest":
            return new Date(aDate).getTime() - new Date(bDate).getTime();
          case "highest-score":
            return b.score - a.score;
          case "lowest-score":
            return a.score - b.score;
          default:
            return 0;
        }
      }) || [];

  const formatTime = (seconds: number) => {
    if (!seconds) return "0m";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80)
      return "bg-green-900/50 text-green-300 border-green-700/50";
    if (score >= 60)
      return "bg-yellow-900/50 text-yellow-300 border-yellow-700/50";
    return "bg-red-900/50 text-red-300 border-red-700/50";
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 text-gray-100">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-800 rounded w-1/3"></div>
            <div className="grid grid-cols-6 gap-2">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-800 rounded"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-800 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 text-gray-100">
        <div className="container mx-auto px-4 py-8">
          <Alert
            variant="destructive"
            className="bg-red-900/20 border-red-700/50 text-red-300"
          >
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="mt-4 text-center">
            <Button
              onClick={() => router.back()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!quizStats) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 text-gray-100">
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-xl font-bold text-gray-100 mb-4">
            Quiz not found
          </h1>
          <Button
            onClick={() => router.back()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 text-gray-100">
      <div className="container mx-auto px-4 py-4">
        {/* Compact Header */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="text-gray-300 hover:text-gray-100 hover:bg-gray-800"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => router.push(`/content/${quizId}`)}
                className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
              >
                <Play className="h-4 w-4 mr-2" />
                Preview Quiz
              </Button>
              <Button
                onClick={() => router.push(`/create/${quizId}`)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Quiz
              </Button>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700/50 p-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-gray-100">
                  {quizStats.title}
                </h1>
                <p className="text-sm text-gray-400 mt-1">
                  {quizStats.description}
                </p>
              </div>
              <div className="flex gap-2">
                <Badge
                  variant="outline"
                  className="text-xs border-gray-600 text-gray-300"
                >
                  {quizStats.questionCount} questions
                </Badge>
                <Badge
                  variant="outline"
                  className="text-xs border-gray-600 text-gray-300"
                >
                  {quizStats.difficulty || "Not set"}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Compact Statistics */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-4">
          <Card className="border-gray-700/50 bg-gray-800/30 backdrop-blur-sm shadow-md">
            <CardContent className="p-3 text-center">
              <Users className="h-4 w-4 text-blue-400 mx-auto mb-1" />
              <p className="text-sm font-bold text-blue-400">
                {statistics?.totalAttempts || 0}
              </p>
              <p className="text-xs text-gray-400">Attempts</p>
            </CardContent>
          </Card>

          <Card className="border-gray-700/50 bg-gray-800/30 backdrop-blur-sm shadow-md">
            <CardContent className="p-3 text-center">
              <TrendingUp className="h-4 w-4 text-green-400 mx-auto mb-1" />
              <p className="text-sm font-bold text-green-400">
                {(statistics?.averageScore || 0).toFixed(1)}%
              </p>
              <p className="text-xs text-gray-400">Avg Score</p>
            </CardContent>
          </Card>

          <Card className="border-gray-700/50 bg-gray-800/30 backdrop-blur-sm shadow-md">
            <CardContent className="p-3 text-center">
              <Award className="h-4 w-4 text-purple-400 mx-auto mb-1" />
              <p className="text-sm font-bold text-purple-400">
                {(statistics?.passRate || 0).toFixed(1)}%
              </p>
              <p className="text-xs text-gray-400">Pass Rate</p>
            </CardContent>
          </Card>

          <Card className="border-gray-700/50 bg-gray-800/30 backdrop-blur-sm shadow-md">
            <CardContent className="p-3 text-center">
              <Clock className="h-4 w-4 text-orange-400 mx-auto mb-1" />
              <p className="text-sm font-bold text-orange-400">
                {formatTime(statistics?.averageTimeSpent || 0)}
              </p>
              <p className="text-xs text-gray-400">Avg Time</p>
            </CardContent>
          </Card>

          <Card className="border-gray-700/50 bg-gray-800/30 backdrop-blur-sm shadow-md">
            <CardContent className="p-3 text-center">
              <Users className="h-4 w-4 text-teal-400 mx-auto mb-1" />
              <p className="text-sm font-bold text-teal-400">
                {statistics?.uniqueUsers || 0}
              </p>
              <p className="text-xs text-gray-400">Users</p>
            </CardContent>
          </Card>

          <Card className="border-gray-700/50 bg-gray-800/30 backdrop-blur-sm shadow-md">
            <CardContent className="p-3 text-center">
              <Bookmark className="h-4 w-4 text-pink-400 mx-auto mb-1" />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSavedUsers(true)}
                className="text-sm font-bold text-pink-400 p-0 h-auto hover:bg-transparent"
              >
                {statistics?.savedByCount || 0}
              </Button>
              <p className="text-xs text-gray-400">Saved By</p>
            </CardContent>
          </Card>
        </div>

        {/* Saved Users Dialog */}
        <Dialog open={showSavedUsers} onOpenChange={setShowSavedUsers}>
          <DialogContent className="bg-gray-900 border-gray-700 text-gray-100 shadow-xl">
            <DialogHeader>
              <DialogTitle className="text-gray-100">
                Users who saved this quiz
              </DialogTitle>
            </DialogHeader>
            <div className="max-h-[60vh] overflow-y-auto">
              {quizStats.savedByUsers && quizStats.savedByUsers.length > 0 ? (
                <div className="space-y-2">
                  {quizStats.savedByUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center gap-3 p-2 hover:bg-gray-800 rounded-md"
                    >
                      <Avatar>
                        <AvatarImage src={user.avatar || ""} alt={user.name} />
                        <AvatarFallback className="bg-gray-700 text-gray-300">
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-gray-200">{user.name}</p>
                        <p className="text-sm text-gray-400">{user.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <Bookmark className="h-12 w-12 mx-auto mb-4 text-gray-600" />
                  <p>No users have saved this quiz yet.</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Filters */}
        <Card className="mb-4 border-gray-700/50 bg-gray-800/30 backdrop-blur-sm shadow-md">
          <CardContent className="p-3">
            <div className="flex gap-3 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                <Input
                  placeholder="Search students..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-9 bg-gray-900/50 border-gray-700 text-gray-200 placeholder:text-gray-500"
                />
              </div>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40 h-9 bg-gray-900/50 border-gray-700 text-gray-200">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700 text-gray-200">
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="passed">Passed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40 h-9 bg-gray-900/50 border-gray-700 text-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700 text-gray-200">
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                  <SelectItem value="highest-score">High Score</SelectItem>
                  <SelectItem value="lowest-score">Low Score</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Attempts List - Main Focus */}
        <Card className="border-gray-700/50 bg-gray-800/30 backdrop-blur-sm shadow-lg">
          <CardHeader className="pb-3 border-b border-gray-700/50">
            <CardTitle className="text-lg flex items-center gap-2 text-gray-100">
              <Users className="h-5 w-5" />
              Student Attempts ({filteredAttempts.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-0">
              {filteredAttempts.map((attempt) => (
                <div
                  key={attempt.id}
                  className="border-b border-gray-700/50 last:border-b-0"
                >
                  <div className="p-3 hover:bg-gray-800/50 transition-colors">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={attempt.user.avatar || ""}
                              alt={attempt.user.name}
                            />
                            <AvatarFallback className="bg-gray-700 text-gray-300">
                              {getInitials(attempt.user.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="font-medium text-gray-200">
                            {attempt.user.name}
                          </div>
                          <div className="text-sm text-gray-400">
                            {attempt.user.email}
                          </div>
                          <Badge
                            className={`text-xs ${getScoreColor(
                              attempt.score
                            )}`}
                          >
                            {attempt.score}%
                          </Badge>
                          <Badge
                            variant={attempt.passed ? "default" : "destructive"}
                            className={`text-xs ${
                              attempt.passed
                                ? "bg-green-900/50 text-green-300 border-green-700/50"
                                : "bg-red-900/50 text-red-300 border-red-700/50"
                            }`}
                          >
                            {attempt.passed ? "Passed" : "Failed"}
                          </Badge>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <Award className="h-3 w-3" />
                            {attempt.correctAnswers}/{quizStats.questionCount}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTime(attempt.timeSpent)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(
                              attempt.completedAt || attempt.createdAt
                            )}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            router.push(
                              `/quiz/${quizId}/analytics/attempt/${attempt.id}`
                            )
                          }
                          className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {filteredAttempts.length === 0 && (
                <div className="p-8 text-center text-gray-400">
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-600" />
                  <h3 className="text-lg font-medium mb-2">
                    No attempts found
                  </h3>
                  <p>No students match your search criteria.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
