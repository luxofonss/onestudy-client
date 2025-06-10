"use client";

import { useState, useEffect } from "react";
import {
  Mail,
  Calendar,
  MapPin,
  Edit,
  Save,
  X,
  Trophy,
  Target,
  Clock,
  TrendingUp,
  BookOpen,
  Award,
  Star,
  BarChart3,
  Activity,
  Users,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/components/ui/page-header";
import { StatsGrid } from "@/components/ui/stats-grid";
import { StatsCard } from "@/components/ui/stats-card";
import Link from "next/link";
import { withAuth } from "@/lib/hooks/with-auth";
import { userService } from "@/lib/services/user-service";
import { quizService } from "@/lib/services/quiz-service";
import { authService } from "@/lib/services/auth-service";
import { useToast } from "@/hooks/use-toast";
import type { IUser, IUserStats } from "@/lib/types/api-types";
import { SUCCESS_CODE } from "@/lib/constants";

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
  quiz: {
    id: string;
    title: string;
    description: string;
    category: string | null;
    difficulty: string | null;
  };
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

function ProfilePage() {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // User data
  const [user, setUser] = useState<IUser | null>(null);
  const [userStats, setUserStats] = useState<IUserStats | null>(null);
  const [quizHistory, setQuizHistory] = useState<QuizWithAttempts[]>([]);

  // Edit form state
  const [editedInfo, setEditedInfo] = useState({
    name: "",
    email: "",
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setIsLoading(true);

      // Fetch user profile
      const userResponse = await authService.getMe();
      if (userResponse.meta?.code === SUCCESS_CODE && userResponse.data) {
        setUser(userResponse.data);
        setEditedInfo({
          name: userResponse.data.name,
          email: userResponse.data.email,
        });
      }

      // Fetch user stats
      if (userResponse.data?.id) {
        const statsResponse = await userService.getUserStats(
          userResponse.data.id
        );
        if (statsResponse.meta?.code === SUCCESS_CODE && statsResponse.data) {
          setUserStats(statsResponse.data);
        }
      }

      // Fetch quiz history
      const quizResponse = await quizService.getMyQuizAttempts();
      if (quizResponse.data) {
        // TODO
        // setQuizHistory(quizResponse.data);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load profile data. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      setIsSaving(true);
      const response = await userService.updateProfile({
        name: editedInfo.name,
        email: editedInfo.email,
      });

      if (response.meta?.code === SUCCESS_CODE && response.data) {
        setUser(response.data);
        setIsEditing(false);
        toast({
          title: "Profile Updated",
          description: "Your profile has been successfully updated.",
        });
      } else {
        throw new Error(response.meta?.message || "Update failed");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Failed to update profile. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setEditedInfo({
        name: user.name,
        email: user.email,
      });
    }
    setIsEditing(false);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 80) return "text-blue-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  // Get recent quiz attempts from all quizzes
  const getRecentQuizzes = () => {
    const allAttempts: QuizAttempt[] = [];
    quizHistory.forEach((quiz) => {
      quiz.quizAttempts.forEach((attempt) => {
        if (attempt.completedAt) {
          allAttempts.push(attempt);
        }
      });
    });

    return allAttempts
      .sort(
        (a, b) =>
          new Date(b.completedAt!).getTime() -
          new Date(a.completedAt!).getTime()
      )
      .slice(0, 4);
  };

  // Calculate analytics data
  const getAnalyticsData = () => {
    const allAttempts = quizHistory.flatMap((quiz) => quiz.quizAttempts);
    const completedAttempts = allAttempts.filter(
      (attempt) => attempt.completedAt
    );

    // Category performance
    const categoryMap = new Map<
      string,
      { total: number; score: number; count: number }
    >();
    completedAttempts.forEach((attempt) => {
      const category = attempt.quiz?.category || "General";
      const existing = categoryMap.get(category) || {
        total: 0,
        score: 0,
        count: 0,
      };
      categoryMap.set(category, {
        total: existing.total + attempt.score,
        score: existing.score + attempt.score,
        count: existing.count + 1,
      });
    });

    const categoryPerformance = Array.from(categoryMap.entries()).map(
      ([category, data]) => ({
        category,
        score: Math.round(data.total / data.count),
        quizzes: data.count,
      })
    );

    return { categoryPerformance };
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 animate-fade-in">
        <div className="flex justify-center items-center h-64">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading profile...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 animate-fade-in">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Profile Not Found
            </h3>
            <p className="text-gray-600">
              Unable to load your profile information.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const recentQuizzes = getRecentQuizzes();
  const analyticsData = getAnalyticsData();

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Info Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Profile Card */}
          <Card className="border-blue-100">
            <CardHeader className="text-center">
              <Avatar className="w-24 h-24 mx-auto mb-4">
                <AvatarImage
                  src={user.avatar || "/placeholder.svg"}
                  alt={user.name}
                />
                <AvatarFallback className="bg-blue-100 text-blue-600 text-2xl">
                  {user?.name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              {!isEditing ? (
                <div>
                  <CardTitle className="text-2xl mb-2">{user.name}</CardTitle>
                  <CardDescription className="text-base mb-4">
                    {user.username} • {user.role}
                  </CardDescription>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center justify-center">
                      <Mail className="h-4 w-4 mr-2" />
                      {user.email}
                    </div>
                    <div className="flex items-center justify-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      Joined {formatDate(user.joinedAt)}
                    </div>
                    <div className="flex items-center justify-center">
                      <Badge
                        variant="outline"
                        className="border-blue-200 text-blue-700"
                      >
                        {user.role}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-center">
                      <Badge
                        variant="outline"
                        className="border-green-200 text-green-700"
                      >
                        Level: {user.level}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    onClick={() => setIsEditing(true)}
                    className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={editedInfo.name}
                      onChange={(e) =>
                        setEditedInfo({ ...editedInfo, name: e.target.value })
                      }
                      className="border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={editedInfo.email}
                      onChange={(e) =>
                        setEditedInfo({ ...editedInfo, email: e.target.value })
                      }
                      className="border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      {isSaving ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      {isSaving ? "Saving..." : "Save"}
                    </Button>
                    <Button
                      onClick={handleCancel}
                      variant="outline"
                      disabled={isSaving}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </CardHeader>
          </Card>

          {/* Quick Stats */}
          <Card className="border-blue-100">
            <CardHeader>
              <CardTitle className="text-lg">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Current Streak</span>
                <Badge className="bg-orange-100 text-orange-800">
                  {user.streak} days
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Points</span>
                <span className="font-semibold">{user.points}</span>
              </div>
              {userStats && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Total Quizzes</span>
                    <span className="font-semibold">
                      {userStats.totalQuizzes}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Average Score</span>
                    <span
                      className={`font-semibold ${getScoreColor(
                        userStats.averageScore
                      )}`}
                    >
                      {userStats.averageScore}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Time Spent</span>
                    <span className="font-semibold">
                      {formatTime(userStats.totalTime)}
                    </span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-blue-50">
              <TabsTrigger
                value="overview"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="quizzes"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                Quiz History
              </TabsTrigger>
              <TabsTrigger
                value="analytics"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                Analytics
              </TabsTrigger>
              <TabsTrigger
                value="achievements"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                Achievements
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Overview Stats */}
              {userStats && (
                <StatsGrid columns={4}>
                  <StatsCard
                    icon={BookOpen}
                    value={userStats.contentCreated}
                    label="Content Created"
                    color="text-blue-600"
                  />
                  <StatsCard
                    icon={Users}
                    value={userStats.totalLearners.toLocaleString()}
                    label="Total Learners"
                    color="text-green-600"
                  />
                  <StatsCard
                    icon={Star}
                    value={userStats.averageRating.toFixed(1)}
                    label="Average Rating"
                    color="text-yellow-600"
                  />
                  <StatsCard
                    icon={Clock}
                    value={`${userStats.hoursLearned}h`}
                    label="Hours Learned"
                    color="text-purple-600"
                  />
                </StatsGrid>
              )}

              {/* Recent Activity */}
              <Card className="border-blue-100">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="h-5 w-5 mr-2 text-blue-600" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentQuizzes.length > 0 ? (
                      recentQuizzes.map((quiz) => (
                        <div
                          key={quiz.id}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                        >
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {quiz.quiz?.title}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {formatDate(quiz.completedAt!)} •{" "}
                              {formatTime(quiz.timeSpent)}
                            </p>
                          </div>
                          <div className="text-right">
                            <div
                              className={`text-lg font-bold ${getScoreColor(
                                quiz.score
                              )}`}
                            >
                              {quiz.score}%
                            </div>
                            <Badge
                              className={
                                quiz.passed
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }
                            >
                              {quiz.passed ? "Passed" : "Failed"}
                            </Badge>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-500">No quiz attempts yet.</p>
                        <Link href="/quizzes">
                          <Button className="mt-2 bg-blue-600 hover:bg-blue-700 text-white">
                            Start Your First Quiz
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                  {recentQuizzes.length > 0 && (
                    <div className="mt-4 text-center">
                      <Link href="/attempted-quizzes">
                        <Button
                          variant="outline"
                          className="border-blue-600 text-blue-600 hover:bg-blue-50"
                        >
                          View All Quiz History
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="quizzes" className="space-y-6">
              <Card className="border-blue-100">
                <CardHeader>
                  <CardTitle>Quiz History</CardTitle>
                  <CardDescription>
                    Your recent quiz attempts and scores
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentQuizzes.length > 0 ? (
                      recentQuizzes.map((quiz) => (
                        <div
                          key={quiz.id}
                          className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                {quiz.quiz.title}
                              </h3>
                              <p className="text-sm text-gray-600">
                                Completed on {formatDate(quiz.completedAt!)} •
                                Time spent: {formatTime(quiz.timeSpent)}
                              </p>
                            </div>
                            <div className="text-right">
                              <div
                                className={`text-2xl font-bold ${getScoreColor(
                                  quiz.score
                                )}`}
                              >
                                {quiz.score}%
                              </div>
                              <Badge
                                className={
                                  quiz.passed
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }
                              >
                                {quiz.passed ? "Passed" : "Failed"}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-500">No quiz attempts yet.</p>
                        <Link href="/quizzes">
                          <Button className="mt-2 bg-blue-600 hover:bg-blue-700 text-white">
                            Start Your First Quiz
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                  {recentQuizzes.length > 0 && (
                    <div className="mt-6 text-center">
                      <Link href="/attempted-quizzes">
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                          View Complete History
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              {/* Performance Overview */}
              {userStats && (
                <StatsGrid columns={4}>
                  <StatsCard
                    icon={Trophy}
                    value={userStats.totalQuizzes}
                    label="Total Quizzes"
                    color="text-blue-600"
                  />
                  <StatsCard
                    icon={Target}
                    value={`${userStats.averageScore}%`}
                    label="Average Score"
                    color="text-green-600"
                  />
                  <StatsCard
                    icon={TrendingUp}
                    value={`${user.streak}`}
                    label="Current Streak"
                    color="text-orange-600"
                  />
                  <StatsCard
                    icon={Clock}
                    value={formatTime(userStats.totalTime)}
                    label="Total Time"
                    color="text-purple-600"
                  />
                </StatsGrid>
              )}

              {/* Category Performance */}
              {analyticsData.categoryPerformance.length > 0 && (
                <Card className="border-blue-100">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                      Performance by Category
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analyticsData.categoryPerformance.map((category) => (
                        <div key={category.category} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-700">
                              {category.category}
                            </span>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-600">
                                {category.quizzes} quizzes
                              </span>
                              <span
                                className={`font-bold ${getScoreColor(
                                  category.score
                                )}`}
                              >
                                {category.score}%
                              </span>
                            </div>
                          </div>
                          <Progress value={category.score} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="achievements" className="space-y-6">
              <Card className="border-blue-100">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Award className="h-5 w-5 mr-2 text-yellow-600" />
                    Achievements
                  </CardTitle>
                  <CardDescription>
                    Track your learning milestones and accomplishments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Achievements Coming Soon
                    </h3>
                    <p className="text-gray-600">
                      We're working on an achievement system to celebrate your
                      learning milestones.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

export default withAuth(ProfilePage);
