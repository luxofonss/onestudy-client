"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Eye,
  RotateCcw,
  Trophy,
  Clock,
  Target,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { StatsCard } from "@/components/ui/stats-card";
import { StatsGrid } from "@/components/ui/stats-grid";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
  quizAttempts: QuizAttempt[];
}

export default function AttemptedQuizzesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBy, setFilterBy] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [quizzes, setQuizzes] = useState<QuizWithAttempts[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedQuiz, setExpandedQuiz] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"cards" | "table">("table"); // Default to table view

  useEffect(() => {
    fetchQuizAttempts();
  }, []);

  const fetchQuizAttempts = async () => {
    try {
      setLoading(true);
      // keep this comment for future usage
      const response = await quizService.getMyQuizAttempts();
      // const response = data;
      if (response.data) {
        setQuizzes(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch quiz attempts:", error);
    } finally {
      setLoading(false);
    }
  };

  const getQuizStats = (quiz: QuizWithAttempts) => {
    const attempts = quiz.quizAttempts.filter(
      (attempt) => attempt.completedAt !== null
    );
    const highestScore =
      attempts.length > 0 ? Math.max(...attempts.map((a) => a.score)) : 0;
    const totalAttempts = attempts.length;
    const passedAttempts = attempts.filter((a) => a.passed).length;
    const averageScore =
      attempts.length > 0
        ? attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length
        : 0;

    return {
      highestScore,
      totalAttempts,
      passedAttempts,
      averageScore,
      hasAttempts: attempts.length > 0,
    };
  };

  const getOverallStats = () => {
    const allAttempts = quizzes.flatMap((quiz) =>
      quiz.quizAttempts.filter((attempt) => attempt.completedAt !== null)
    );

    const totalAttempts = allAttempts.length;
    const passedQuizzes = allAttempts.filter((a) => a.passed).length;
    const averageScore =
      totalAttempts > 0
        ? allAttempts.reduce((sum, a) => sum + a.score, 0) / totalAttempts
        : 0;
    const totalQuizzes = quizzes.filter(
      (quiz) => getQuizStats(quiz).hasAttempts
    ).length;

    return {
      totalAttempts,
      totalQuizzes,
      passedQuizzes,
      averageScore: Math.round(averageScore),
      passRate:
        totalAttempts > 0
          ? Math.round((passedQuizzes / totalAttempts) * 100)
          : 0,
    };
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return "text-green-600 bg-green-50 border-green-200";
    if (score >= 80) return "text-blue-600 bg-blue-50 border-blue-200";
    if (score >= 70) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  const getPerformanceBgColor = (score: number) => {
    if (score >= 90) return "bg-green-50";
    if (score >= 80) return "bg-blue-50";
    if (score >= 70) return "bg-yellow-50";
    return "bg-red-50";
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not completed";
    return new Date(dateString).toLocaleDateString();
  };

  const formatTimeSpent = (seconds: number) => {
    if (seconds === 0) return "N/A";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const filteredQuizzes = quizzes.filter((quiz) => {
    const stats = getQuizStats(quiz);

    const matchesSearch =
      quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quiz.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (quiz.category &&
        quiz.category.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesFilter =
      filterBy === "all" ||
      (filterBy === "passed" && stats.passedAttempts > 0) ||
      (filterBy === "failed" &&
        stats.totalAttempts > 0 &&
        stats.passedAttempts === 0) ||
      (filterBy === "retaken" && stats.totalAttempts > 1);

    return matchesSearch && matchesFilter && stats.hasAttempts;
  });

  const stats = getOverallStats();

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-800 rounded w-1/4"></div>
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-800 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 text-gray-100 container mx-auto px-4 py-8 animate-fade-in">
      <PageHeader
        title="My Quiz Attempts"
        description="Track your learning progress and review your quiz performance"
      />

      {/* Overall Stats */}
      <StatsGrid columns={4} className="mb-8">
        <StatsCard
          icon={Trophy}
          value={stats.totalQuizzes}
          label="Quizzes Attempted"
          color="text-blue-400"
        />
        <StatsCard
          icon={Target}
          value={stats.totalAttempts}
          label="Total Attempts"
          color="text-green-400"
        />
        <StatsCard
          icon={TrendingUp}
          value={`${stats.averageScore}%`}
          label="Avg Score"
          color="text-blue-400"
        />
        <StatsCard
          icon={Clock}
          value={`${stats.passRate}%`}
          label="Pass Rate"
          color="text-purple-400"
        />
      </StatsGrid>

      {/* Search and Filter */}
      <div className="mb-8 space-y-4 md:space-y-0 md:flex md:items-center md:gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            placeholder="Search quizzes by title or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-gray-800/40 border-gray-700/30 focus:border-blue-600 focus:ring-blue-600 text-gray-200"
          />
        </div>
        <Select value={filterBy} onValueChange={setFilterBy}>
          <SelectTrigger className="w-full md:w-48 bg-gray-800/40 border-gray-700/30 text-gray-200 focus:border-blue-600 focus:ring-blue-600">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-700 text-gray-200">
            <SelectItem value="all">All Quizzes</SelectItem>
            <SelectItem value="passed">Passed Only</SelectItem>
            <SelectItem value="failed">Failed Only</SelectItem>
            <SelectItem value="retaken">Retaken Quizzes</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            className={`${
              viewMode === "cards" ? "bg-blue-900/30 border-blue-700/40 text-blue-300" : "bg-gray-800/40 border-gray-700/30 text-gray-300 hover:bg-gray-800"
            }`}
            onClick={() => setViewMode("cards")}
          >
            <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-1"
              >
                <rect width="7" height="7" x="3" y="3" rx="1" />
                <rect width="7" height="7" x="14" y="3" rx="1" />
                <rect width="7" height="7" x="14" y="14" rx="1" />
                <rect width="7" height="7" x="3" y="14" rx="1" />
              </svg>
              Cards
            </div>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className={`${
              viewMode === "table" ? "bg-blue-900/30 border-blue-700/40 text-blue-300" : "bg-gray-800/40 border-gray-700/30 text-gray-300 hover:bg-gray-800"
            }`}
            onClick={() => setViewMode("table")}
          >
            <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-1"
              >
                <path d="M3 3h18v18H3z" />
                <path d="M3 9h18" />
                <path d="M3 15h18" />
                <path d="M9 3v18" />
                <path d="M15 3v18" />
              </svg>
              Table
            </div>
          </Button>
        </div>
      </div>

      {/* Quiz Results List */}
      <div className="space-y-4">
        {filteredQuizzes.length === 0 ? (
          <Card className="border-gray-700/30 bg-gray-800/20 backdrop-blur-sm shadow-md">
            <CardContent className="p-8 text-center">
              <Trophy className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-200 mb-2">
                No quiz attempts found
              </h3>
              <p className="text-gray-400 mb-4">
                {searchQuery || filterBy !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "Start taking quizzes to see your results here"}
              </p>
              <Link href="/">
                <Button className="bg-blue-600/80 hover:bg-blue-600 text-white">
                  Browse Quizzes
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : viewMode === "cards" ? (
          // Card View
          filteredQuizzes.map((quiz) => {
            const stats = getQuizStats(quiz);
            const isExpanded = expandedQuiz === quiz.id;

            return (
              <Card
                key={quiz.id}
                className="border-gray-700/30 bg-gray-800/20 backdrop-blur-sm shadow-md hover:border-blue-700/40 transition-all duration-200"
              >
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-100 mb-1">
                            {quiz.title}
                          </h3>
                          <p className="text-sm text-gray-400 mb-2">
                            {quiz.description}
                          </p>
                          <div className="flex items-center space-x-2 mb-3">
                            {quiz.difficulty && (
                              <Badge
                                variant="outline"
                                className="border-gray-700/40 bg-gray-800/40 text-gray-300"
                              >
                                {quiz.difficulty}
                              </Badge>
                            )}
                            {quiz.category && (
                              <Badge
                                variant="outline"
                                className="border-gray-700/40 bg-gray-800/40 text-gray-300"
                              >
                                {quiz.category}
                              </Badge>
                            )}
                            {quiz.tags.map((tag, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="border-blue-700/40 bg-blue-900/20 text-blue-300"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div
                          className={`px-4 py-2 rounded-lg ${
                            stats.highestScore >= 90
                              ? "bg-green-900/40 text-green-300 border border-green-700/40"
                              : stats.highestScore >= 80
                              ? "bg-blue-900/40 text-blue-300 border border-blue-700/40"
                              : stats.highestScore >= 70
                              ? "bg-yellow-900/40 text-yellow-300 border border-yellow-700/40"
                              : "bg-red-900/40 text-red-300 border border-red-700/40"
                          }`}
                        >
                          <div className="text-center">
                            <div className="text-2xl font-bold">
                              {Math.round(stats.highestScore)}%
                            </div>
                            <div className="text-xs">Best Score</div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-400 mb-4">
                        <div className="flex items-center">
                          <Trophy className="h-4 w-4 mr-1 text-blue-400" />
                          {stats.totalAttempts} attempts
                        </div>
                        <div className="flex items-center">
                          <Target className="h-4 w-4 mr-1 text-green-400" />
                          {stats.passedAttempts} passed
                        </div>
                        <div className="flex items-center">
                          <TrendingUp className="h-4 w-4 mr-1 text-yellow-400" />
                          Avg: {Math.round(stats.averageScore)}%
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1 text-purple-400" />
                          Required: {quiz.passingScore}%
                        </div>
                      </div>

                      {/* Collapsible Attempts Details */}
                      <Collapsible
                        open={isExpanded}
                        onOpenChange={() =>
                          setExpandedQuiz(isExpanded ? null : quiz.id)
                        }
                      >
                        <CollapsibleTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="mb-2 text-gray-300 hover:bg-gray-800 hover:text-gray-100"
                          >
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4 mr-1" />
                            ) : (
                              <ChevronDown className="h-4 w-4 mr-1" />
                            )}
                            {isExpanded ? "Hide" : "Show"} All Attempts (
                            {stats.totalAttempts})
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="space-y-2">
                          {quiz.quizAttempts
                            .filter((attempt) => attempt.completedAt !== null)
                            .sort(
                              (a, b) =>
                                new Date(b.completedAt!).getTime() -
                                new Date(a.completedAt!).getTime()
                            )
                            .map((attempt, index) => (
                              <div
                                key={attempt.id}
                                className="bg-gray-800/60 border border-gray-700/30 p-3 rounded-lg"
                              >
                                <div className="flex justify-between items-center">
                                  <div className="flex items-center space-x-4">
                                    <span className="text-sm font-medium text-gray-300">
                                      Attempt #{stats.totalAttempts - index}
                                    </span>
                                    <span
                                      className={`px-2 py-1 rounded text-xs ${
                                        attempt.score >= 90
                                          ? "bg-green-900/40 text-green-300 border border-green-700/40"
                                          : attempt.score >= 80
                                          ? "bg-blue-900/40 text-blue-300 border border-blue-700/40"
                                          : attempt.score >= 70
                                          ? "bg-yellow-900/40 text-yellow-300 border border-yellow-700/40"
                                          : "bg-red-900/40 text-red-300 border border-red-700/40"
                                      }`}
                                    >
                                      {Math.round(attempt.score)}%
                                    </span>
                                    <span className="text-xs text-gray-400">
                                      {attempt.correctAnswers} correct
                                    </span>
                                    <span className="text-xs text-gray-400">
                                      {formatTimeSpent(attempt.timeSpent)}
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <div className="text-xs text-gray-400">
                                      {formatDate(attempt.completedAt)}
                                    </div>
                                    <Link
                                      href={`/quiz/${quiz.id}/attempt/${attempt.id}/result`}
                                    >
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-7 px-2 text-blue-300 hover:bg-blue-900/30 hover:text-blue-200"
                                      >
                                        <FileText className="h-3 w-3 mr-1" />
                                        Details
                                      </Button>
                                    </Link>
                                  </div>
                                </div>
                              </div>
                            ))}
                        </CollapsibleContent>
                      </Collapsible>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 md:ml-6">
                      <Link href={`/quiz/${quiz.id}/attempt`}>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-blue-700/40 bg-blue-900/20 text-blue-300 hover:bg-blue-900/40 w-full sm:w-auto"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View All
                        </Button>
                      </Link>
                      <Link href={`/content/${quiz.id}`}>
                        <Button
                          size="sm"
                          className="bg-blue-600/80 hover:bg-blue-600 text-white w-full sm:w-auto"
                        >
                          <RotateCcw className="h-4 w-4 mr-1" />
                          Retake
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          // Table View
          <div className="overflow-x-auto bg-gray-800/20 backdrop-blur-sm border border-gray-700/30 rounded-lg">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-800/60 border-b border-gray-700/30">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">
                    Quiz
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-300">
                    Questions
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-300">
                    Attempts
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-300">
                    Best Score
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-300">
                    Avg Score
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-300">
                    Pass Rate
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredQuizzes.map((quiz) => {
                  const stats = getQuizStats(quiz);
                  const isExpanded = expandedQuiz === quiz.id;
                  const completedAttempts = quiz.quizAttempts
                    .filter((a) => a.completedAt)
                    .sort(
                      (a, b) =>
                        new Date(b.completedAt!).getTime() -
                        new Date(a.completedAt!).getTime()
                    );

                  return (
                    <>
                      <tr key={quiz.id} className="border-b border-gray-700/30 hover:bg-gray-800/40">
                        <td className="px-4 py-4">
                          <div>
                            <div className="font-medium text-gray-100">
                              {quiz.title}
                            </div>
                            <div className="text-sm text-gray-400 truncate max-w-xs">
                              {quiz.description}
                            </div>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {quiz.tags.slice(0, 3).map((tag, index) => (
                                <Badge
                                  key={index}
                                  variant="outline"
                                  className="text-xs border-blue-700/40 bg-blue-900/20 text-blue-300"
                                >
                                  {tag}
                                </Badge>
                              ))}
                              {quiz.tags.length > 3 && (
                                <Badge variant="outline" className="text-xs border-gray-700/40 bg-gray-800/40 text-gray-300">
                                  +{quiz.tags.length - 3}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center text-gray-300">
                          {quiz.questionCount}
                        </td>
                        <td className="px-4 py-4 text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setExpandedQuiz(isExpanded ? null : quiz.id)
                            }
                            className="text-blue-300 hover:text-blue-200 hover:bg-blue-900/30"
                          >
                            {stats.totalAttempts}
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4 ml-1" />
                            ) : (
                              <ChevronDown className="h-4 w-4 ml-1" />
                            )}
                          </Button>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span
                            className={`px-2 py-1 rounded ${
                              stats.highestScore >= 90
                                ? "bg-green-900/40 text-green-300 border border-green-700/40"
                                : stats.highestScore >= 80
                                ? "bg-blue-900/40 text-blue-300 border border-blue-700/40"
                                : stats.highestScore >= 70
                                ? "bg-yellow-900/40 text-yellow-300 border border-yellow-700/40"
                                : "bg-red-900/40 text-red-300 border border-red-700/40"
                            }`}
                          >
                            {Math.round(stats.highestScore)}%
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center text-gray-300">
                          {Math.round(stats.averageScore)}%
                        </td>
                        <td className="px-4 py-4 text-center text-gray-300">
                          {stats.totalAttempts > 0
                            ? `${Math.round(
                                (stats.passedAttempts / stats.totalAttempts) *
                                  100
                              )}%`
                            : "N/A"}
                        </td>
                        <td className="px-4 py-4 text-right">
                          <div className="flex justify-end space-x-2">
                            <Link href={`/quiz/${quiz.id}/attempt`}>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 px-2 border-blue-700/40 bg-blue-900/20 text-blue-300 hover:bg-blue-900/40"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Link href={`/content/${quiz.id}`}>
                              <Button
                                size="sm"
                                className="bg-blue-600/80 hover:bg-blue-600 text-white h-8 px-2"
                              >
                                <RotateCcw className="h-4 w-4" />
                              </Button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr>
                          <td colSpan={7} className="p-0 border-b border-gray-700/30">
                            <div className="bg-gray-800/60 p-4">
                              <h4 className="text-sm font-medium mb-2 text-gray-300">
                                Attempt History
                              </h4>
                              <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                  <thead>
                                    <tr className="border-b border-gray-700/30">
                                      <th className="px-3 py-2 text-left text-gray-400">
                                        Attempt #
                                      </th>
                                      <th className="px-3 py-2 text-center text-gray-400">
                                        Score
                                      </th>
                                      <th className="px-3 py-2 text-center text-gray-400">
                                        Correct
                                      </th>
                                      <th className="px-3 py-2 text-center text-gray-400">
                                        Time Spent
                                      </th>
                                      <th className="px-3 py-2 text-center text-gray-400">
                                        Date
                                      </th>
                                      <th className="px-3 py-2 text-center text-gray-400">
                                        Status
                                      </th>
                                      <th className="px-3 py-2 text-right text-gray-400">
                                        Actions
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {completedAttempts.map((attempt, index) => (
                                      <tr
                                        key={attempt.id}
                                        className={`border-b border-gray-700/20 ${
                                          attempt.score >= 90
                                            ? "bg-green-900/20"
                                            : attempt.score >= 80
                                            ? "bg-blue-900/20"
                                            : attempt.score >= 70
                                            ? "bg-yellow-900/20"
                                            : "bg-red-900/20"
                                        }`}
                                      >
                                        <td className="px-3 py-2 text-gray-300">
                                          #{stats.totalAttempts - index}
                                        </td>
                                        <td className="px-3 py-2 text-center font-medium">
                                          <span className={`${
                                            attempt.score >= 90
                                              ? "text-green-300"
                                              : attempt.score >= 80
                                              ? "text-blue-300"
                                              : attempt.score >= 70
                                              ? "text-yellow-300"
                                              : "text-red-300"
                                          }`}>
                                            {Math.round(attempt.score)}%
                                          </span>
                                        </td>
                                        <td className="px-3 py-2 text-center text-gray-300">
                                          {attempt.correctAnswers}/
                                          {attempt.totalQuestions ||
                                            quiz.questionCount}
                                        </td>
                                        <td className="px-3 py-2 text-center text-gray-300">
                                          {formatTimeSpent(attempt.timeSpent)}
                                        </td>
                                        <td className="px-3 py-2 text-center text-gray-300">
                                          {formatDate(attempt.completedAt)}
                                        </td>
                                        <td className="px-3 py-2 text-center">
                                          <Badge
                                            variant={
                                              attempt.passed
                                                ? "default"
                                                : "destructive"
                                            }
                                            className={
                                              attempt.passed
                                                ? "bg-green-900/40 text-green-300 border-green-700/40"
                                                : "bg-red-900/40 text-red-300 border-red-700/40"
                                            }
                                          >
                                            {attempt.passed
                                              ? "PASSED"
                                              : "FAILED"}
                                          </Badge>
                                        </td>
                                        <td className="px-3 py-2 text-right">
                                          <Link
                                            href={`/quiz/${quiz.id}/attempt/${attempt.id}/result`}
                                          >
                                            <Button
                                              size="sm"
                                              variant="ghost"
                                              className="h-7 px-2 text-blue-300 hover:bg-blue-900/30 hover:text-blue-200"
                                            >
                                              <FileText className="h-3 w-3 mr-1" />
                                              Details
                                            </Button>
                                          </Link>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary */}
      {filteredQuizzes.length > 0 && (
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-400">
            Showing {filteredQuizzes.length} of{" "}
            {quizzes.filter((q) => getQuizStats(q).hasAttempts).length}{" "}
            attempted quizzes
          </p>
        </div>
      )}
    </div>
  );
}
