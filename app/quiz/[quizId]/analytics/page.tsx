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
    if (score >= 80) return "text-green-600 bg-green-50";
    if (score >= 60) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
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
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-6 gap-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="mt-4 text-center">
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  if (!quizStats) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-xl font-bold text-gray-900 mb-4">Quiz not found</h1>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-4">
        {/* Compact Header */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => router.push(`/content/${quizId}`)}
              >
                <Play className="h-4 w-4 mr-2" />
                Preview Quiz
              </Button>
              <Button onClick={() => router.push(`/create/${quizId}`)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Quiz
              </Button>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {quizStats.title}
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  {quizStats.description}
                </p>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline" className="text-xs">
                  {quizStats.questionCount} questions
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {quizStats.difficulty || "Not set"}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Compact Statistics */}
        <div className="grid grid-cols-6 gap-2 mb-4">
          <Card className="border-blue-100">
            <CardContent className="p-3 text-center">
              <Users className="h-4 w-4 text-blue-600 mx-auto mb-1" />
              <p className="text-sm font-bold text-blue-600">
                {statistics?.totalAttempts || 0}
              </p>
              <p className="text-xs text-gray-600">Attempts</p>
            </CardContent>
          </Card>

          <Card className="border-green-100">
            <CardContent className="p-3 text-center">
              <TrendingUp className="h-4 w-4 text-green-600 mx-auto mb-1" />
              <p className="text-sm font-bold text-green-600">
                {(statistics?.averageScore || 0).toFixed(1)}%
              </p>
              <p className="text-xs text-gray-600">Avg Score</p>
            </CardContent>
          </Card>

          <Card className="border-purple-100">
            <CardContent className="p-3 text-center">
              <Award className="h-4 w-4 text-purple-600 mx-auto mb-1" />
              <p className="text-sm font-bold text-purple-600">
                {(statistics?.passRate || 0).toFixed(1)}%
              </p>
              <p className="text-xs text-gray-600">Pass Rate</p>
            </CardContent>
          </Card>

          <Card className="border-orange-100">
            <CardContent className="p-3 text-center">
              <Clock className="h-4 w-4 text-orange-600 mx-auto mb-1" />
              <p className="text-sm font-bold text-orange-600">
                {formatTime(statistics?.averageTimeSpent || 0)}
              </p>
              <p className="text-xs text-gray-600">Avg Time</p>
            </CardContent>
          </Card>

          <Card className="border-teal-100">
            <CardContent className="p-3 text-center">
              <Users className="h-4 w-4 text-teal-600 mx-auto mb-1" />
              <p className="text-sm font-bold text-teal-600">
                {statistics?.uniqueUsers || 0}
              </p>
              <p className="text-xs text-gray-600">Users</p>
            </CardContent>
          </Card>

          <Card className="border-pink-100">
            <CardContent className="p-3 text-center">
              <Bookmark className="h-4 w-4 text-pink-600 mx-auto mb-1" />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSavedUsers(true)}
                className="text-sm font-bold text-pink-600 p-0 h-auto"
              >
                {statistics?.savedByCount || 0}
              </Button>
              <p className="text-xs text-gray-600">Saved By</p>
            </CardContent>
          </Card>
        </div>

        {/* Saved Users Dialog */}
        <Dialog open={showSavedUsers} onOpenChange={setShowSavedUsers}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Users who saved this quiz</DialogTitle>
            </DialogHeader>
            <div className="max-h-[60vh] overflow-y-auto">
              {quizStats.savedByUsers && quizStats.savedByUsers.length > 0 ? (
                <div className="space-y-4">
                  {quizStats.savedByUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-md"
                    >
                      <Avatar>
                        <AvatarImage src={user.avatar || ""} alt={user.name} />
                        <AvatarFallback>
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Bookmark className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No users have saved this quiz yet.</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Filters */}
        <Card className="mb-4">
          <CardContent className="p-3">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search students..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-9"
                />
              </div>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40 h-9">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="passed">Passed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40 h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
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
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5" />
              Student Attempts ({filteredAttempts.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-0">
              {filteredAttempts.map((attempt) => (
                <div
                  key={attempt.id}
                  className="border-b border-gray-100 last:border-b-0"
                >
                  <div className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={attempt.user.avatar || ""}
                              alt={attempt.user.name}
                            />
                            <AvatarFallback>
                              {getInitials(attempt.user.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="font-medium text-gray-900">
                            {attempt.user.name}
                          </div>
                          <div className="text-sm text-gray-500">
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
                            className="text-xs"
                          >
                            {attempt.passed ? "Passed" : "Failed"}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-600">
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

                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            router.push(
                              `/quiz/${quizId}/analytics/attempt/${attempt.id}`
                            )
                          }
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
                <div className="p-8 text-center text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
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
