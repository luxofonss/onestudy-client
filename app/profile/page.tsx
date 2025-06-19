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
import type { IUser, IUserStats, IQuizAttempt } from "@/lib/types/api-types";
import { SUCCESS_CODE } from "@/lib/constants";

// Enhanced QuizAttempt interface that includes quiz details
interface EnhancedQuizAttempt extends Omit<IQuizAttempt, 'quiz'> {
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
  status: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: null | string;
  authorId: string;
  author: {
    id: string;
    username: string;
    name: string;
    email: string;
    avatar: string | null;
    joinedAt: string;
    lastLoginAt: string | null;
    isActive: boolean;
    role: string;
  };
  rating: number;
  attempts: number;
  passingScore: number;
  maxAttempts: number;
  hasTimer: boolean;
  timeLimit: number;
  warningTime: number;
  allowQuestionPicker: boolean;
  shuffleQuestions: boolean;
  shuffleAnswers: boolean;
  showProgress: boolean;
  allowPause: boolean;
  navigationMode: string;
  questions: null | any[];
  quizAttempts: IQuizAttempt[];
  savedByUsers: null | any[];
  leaderboardEntries: null | any[];
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
      if (quizResponse.meta?.code === SUCCESS_CODE && quizResponse.data) {
        setQuizHistory(quizResponse.data);
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
    if (score >= 90)
      return "bg-green-900/40 text-green-300 border-green-700/40";
    if (score >= 80) return "bg-blue-900/40 text-blue-300 border-blue-700/40";
    if (score >= 70)
      return "bg-yellow-900/40 text-yellow-300 border-yellow-700/40";
    return "bg-red-900/40 text-red-300 border-red-700/40";
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
  const getRecentQuizzes = (): EnhancedQuizAttempt[] => {
    const allAttempts: EnhancedQuizAttempt[] = [];
    
    quizHistory.forEach((quiz) => {
      if (quiz.quizAttempts && Array.isArray(quiz.quizAttempts)) {
        quiz.quizAttempts.forEach((attempt) => {
          if (attempt.completedAt) {
            // Create a complete attempt object with quiz details
            allAttempts.push({
              ...attempt,
              quiz: {
                id: quiz.id,
                title: quiz.title,
                description: quiz.description,
                category: quiz.category,
                difficulty: quiz.difficulty,
              }
            } as EnhancedQuizAttempt);
          }
        });
      }
    });

    return allAttempts
      .sort(
        (a, b) =>
          new Date(b.completedAt).getTime() -
          new Date(a.completedAt).getTime()
      )
      .slice(0, 4);
  };

  // Calculate analytics data
  const getAnalyticsData = () => {
    // Collect all completed attempts
    const completedAttempts: EnhancedQuizAttempt[] = [];
    
    quizHistory.forEach((quiz) => {
      if (quiz.quizAttempts && Array.isArray(quiz.quizAttempts)) {
        quiz.quizAttempts.forEach((attempt) => {
          if (attempt.completedAt) {
            // Add quiz information to each attempt
            completedAttempts.push({
              ...attempt,
              quiz: {
                id: quiz.id,
                title: quiz.title,
                description: quiz.description,
                category: quiz.category || 'General',
                difficulty: quiz.difficulty,
              }
            } as EnhancedQuizAttempt);
          }
        });
      }
    });

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
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 text-gray-100">
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Profile Info Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* Profile Card */}
            <Card className="border-gray-700/30 bg-gray-800/20 backdrop-blur-sm shadow-md">
              <CardHeader className="text-center py-4 px-4 border-b border-gray-700/20">
                <Avatar className="w-20 h-20 mx-auto mb-3 ring-2 ring-blue-500/40 ring-offset-2 ring-offset-gray-900">
                  <AvatarImage
                    src={user.avatar || "/placeholder.svg"}
                    alt={user.name}
                  />
                  <AvatarFallback className="bg-blue-900/50 text-blue-200 text-xl">
                    {user?.name
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                {!isEditing ? (
                  <div>
                    <CardTitle className="text-xl mb-1 text-gray-100">
                      {user.name}
                    </CardTitle>
                    <CardDescription className=" mb-3 text-gray-400">
                      {user.username} • {user.role}
                    </CardDescription>
                    <div className="space-y-1.5  text-gray-400">
                      <div className="flex items-center justify-center">
                        <Mail className="h-3.5 w-3.5 mr-1.5 text-blue-400" />
                        {user.email}
                      </div>
                      <div className="flex items-center justify-center">
                        <Calendar className="h-3.5 w-3.5 mr-1.5 text-green-400" />
                        Joined {formatDate(user.joinedAt)}
                      </div>
                      <div className="flex items-center justify-center gap-2 mt-2">
                        <Badge
                          variant="outline"
                          className="border-blue-700/40 text-blue-300 bg-blue-900/20 "
                        >
                          {user.role}
                        </Badge>
                        <Badge
                          variant="outline"
                          className="border-green-700/40 text-green-300 bg-green-900/20 "
                        >
                          Level: {user.level}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      onClick={() => setIsEditing(true)}
                      className="mt-3 bg-blue-600/80 hover:bg-blue-600 text-white  h-8"
                    >
                      <Edit className="h-3.5 w-3.5 mr-1.5" />
                      Edit Profile
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="name" className="text-gray-300 ">
                        Name
                      </Label>
                      <Input
                        id="name"
                        value={editedInfo.name}
                        onChange={(e) =>
                          setEditedInfo({ ...editedInfo, name: e.target.value })
                        }
                        className="bg-gray-800/50 border-gray-700/50 text-gray-200  mt-1 h-8"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-gray-300 ">
                        Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={editedInfo.email}
                        onChange={(e) =>
                          setEditedInfo({
                            ...editedInfo,
                            email: e.target.value,
                          })
                        }
                        className="bg-gray-800/50 border-gray-700/50 text-gray-200  mt-1 h-8"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-green-600/80 hover:bg-green-600 text-white  h-8"
                      >
                        {isSaving ? (
                          <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                        ) : (
                          <Save className="h-3.5 w-3.5 mr-1.5" />
                        )}
                        {isSaving ? "Saving..." : "Save"}
                      </Button>
                      <Button
                        onClick={handleCancel}
                        variant="outline"
                        disabled={isSaving}
                        className="border-gray-700 text-gray-300 hover:bg-gray-800  h-8"
                      >
                        <X className="h-3.5 w-3.5 mr-1.5" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </CardHeader>
            </Card>

            {/* Quick Stats */}
            <Card className="border-gray-700/30 bg-gray-800/20 backdrop-blur-sm shadow-md">
              <CardHeader className="py-3 px-4 border-b border-gray-700/20">
                <CardTitle className=" text-gray-100 flex items-center">
                  <Activity className="h-4 w-4 mr-2 text-blue-400" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="py-3 px-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 ">Current Streak</span>
                  <Badge className="bg-orange-900/40 text-orange-300 border-orange-700/40 ">
                    {user.streak} days
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 ">Points</span>
                  <span className="font-medium text-gray-200 ">
                    {user.points}
                  </span>
                </div>
                {userStats && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 ">Total Quizzes</span>
                      <span className="font-medium text-gray-200 ">
                        {userStats.totalQuizzes}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 ">Average Score</span>
                      <Badge className={getScoreColor(userStats.averageScore)}>
                        {userStats.averageScore}%
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 ">Time Spent</span>
                      <span className="font-medium text-gray-200 ">
                        {formatTime(userStats.totalTime)}
                      </span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="quizzes" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4 bg-gray-800/30 p-0.5 rounded-md">
                <TabsTrigger
                  value="overview"
                  className="data-[state=active]:bg-blue-600/80 data-[state=active]:text-white  py-1.5"
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="quizzes"
                  className="data-[state=active]:bg-blue-600/80 data-[state=active]:text-white  py-1.5"
                >
                  Quiz History
                </TabsTrigger>
                <TabsTrigger
                  value="analytics"
                  className="data-[state=active]:bg-blue-600/80 data-[state=active]:text-white  py-1.5"
                >
                  Analytics
                </TabsTrigger>
                <TabsTrigger
                  value="achievements"
                  className="data-[state=active]:bg-blue-600/80 data-[state=active]:text-white  py-1.5"
                >
                  Achievements
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                {/* Overview Stats */}
                {userStats && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Card className="border-gray-700/30 bg-gray-800/20 backdrop-blur-sm shadow-md">
                      <CardContent className="p-3 flex items-center">
                        <div className="bg-blue-900/30 p-2 rounded-full mr-3">
                          <BookOpen className="h-4 w-4 text-blue-400" />
                        </div>
                        <div>
                          <div className=" font-medium text-gray-200">
                            {userStats.contentCreated}
                          </div>
                          <div className=" text-gray-400">Content Created</div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border-gray-700/30 bg-gray-800/20 backdrop-blur-sm shadow-md">
                      <CardContent className="p-3 flex items-center">
                        <div className="bg-green-900/30 p-2 rounded-full mr-3">
                          <Users className="h-4 w-4 text-green-400" />
                        </div>
                        <div>
                          <div className=" font-medium text-gray-200">
                            {userStats.totalLearners.toLocaleString()}
                          </div>
                          <div className=" text-gray-400">Total Learners</div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border-gray-700/30 bg-gray-800/20 backdrop-blur-sm shadow-md">
                      <CardContent className="p-3 flex items-center">
                        <div className="bg-yellow-900/30 p-2 rounded-full mr-3">
                          <Star className="h-4 w-4 text-yellow-400" />
                        </div>
                        <div>
                          <div className=" font-medium text-gray-200">
                            {userStats.averageRating.toFixed(1)}
                          </div>
                          <div className=" text-gray-400">Average Rating</div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border-gray-700/30 bg-gray-800/20 backdrop-blur-sm shadow-md">
                      <CardContent className="p-3 flex items-center">
                        <div className="bg-purple-900/30 p-2 rounded-full mr-3">
                          <Clock className="h-4 w-4 text-purple-400" />
                        </div>
                        <div>
                          <div className=" font-medium text-gray-200">
                            {userStats.hoursLearned}h
                          </div>
                          <div className=" text-gray-400">Hours Learned</div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Recent Activity */}
                <Card className="border-gray-700/30 bg-gray-800/20 backdrop-blur-sm shadow-md">
                  <CardHeader className="py-3 px-4 border-b border-gray-700/20">
                    <CardTitle className=" text-gray-100 flex items-center">
                      <Activity className="h-4 w-4 mr-2 text-blue-400" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="py-3 px-4">
                    <div className="space-y-2">
                      {recentQuizzes.length > 0 ? (
                        recentQuizzes.map((quiz) => (
                          <Link 
                            key={quiz.id} 
                            href={`/quiz/${quiz.quizId}/attempt/${quiz.id}/result`}
                            className="block"
                          >
                            <div
                              className="flex items-center justify-between p-2.5 bg-gray-800/40 rounded-md border border-gray-700/30 hover:bg-gray-800/60 transition-colors cursor-pointer"
                            >
                              <div>
                                <h3 className="font-medium text-gray-200 ">
                                  {quiz.quiz?.title}
                                </h3>
                                <p className=" text-gray-400 mt-0.5">
                                  {formatDate(quiz.completedAt!)} •{" "}
                                  {formatTime(quiz.timeSpent)}
                                </p>
                              </div>
                              <div className="text-right">
                                <div className="text-base font-bold">
                                  <Badge className={getScoreColor(quiz.score)}>
                                    {quiz.score}%
                                  </Badge>
                                </div>
                                <Badge
                                  className={
                                    quiz.passed
                                      ? "bg-green-900/40 text-green-300 border-green-700/40  mt-1"
                                      : "bg-red-900/40 text-red-300 border-red-700/40  mt-1"
                                  }
                                >
                                  {quiz.passed ? "Passed" : "Failed"}
                                </Badge>
                              </div>
                            </div>
                          </Link>
                        ))
                      ) : (
                        <div className="text-center py-6 bg-gray-800/40 rounded-md border border-gray-700/30">
                          <p className="text-gray-400 ">
                            No quiz attempts yet.
                          </p>
                          <Link href="/library?tab=public">
                            <Button className="mt-2 bg-blue-600/80 hover:bg-blue-600 text-white  h-8">
                              Start Your First Quiz
                            </Button>
                          </Link>
                        </div>
                      )}
                    </div>
                    {recentQuizzes.length > 0 && (
                      <div className="mt-3 text-center">
                        <Link href="/attempted-quizzes">
                          <Button
                            variant="outline"
                            className="border-blue-700/40 text-blue-300 hover:bg-blue-900/20  h-8"
                          >
                            View All Quiz History
                          </Button>
                        </Link>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="quizzes" className="space-y-4">
                <Card className="border-gray-700/30 bg-gray-800/20 backdrop-blur-sm shadow-md">
                  <CardHeader className="py-3 px-4 border-b border-gray-700/20">
                    <CardTitle className=" text-gray-100">
                      Quiz History
                    </CardTitle>
                    <CardDescription className=" text-gray-400">
                      Your recent quiz attempts and scores
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="py-3 px-4">
                    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                      {recentQuizzes.length > 0 ? (
                        recentQuizzes.map((quiz) => (
                          <Link 
                            key={quiz.id} 
                            href={`/quiz/${quiz.quizId}/attempt/${quiz.id}/result`}
                            className="block"
                          >
                            <div
                              className="border border-gray-700/30 bg-gray-800/40 rounded-md p-3 hover:bg-gray-800/60 transition-colors cursor-pointer"
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <h3 className="font-medium text-gray-200 ">
                                    {quiz.quiz.title}
                                  </h3>
                                  <p className=" text-gray-400 mt-0.5">
                                    Completed on {formatDate(quiz.completedAt!)} •
                                    Time spent: {formatTime(quiz.timeSpent)}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <div className="text-lg font-bold">
                                    <Badge className={getScoreColor(quiz.score)}>
                                      {quiz.score}%
                                    </Badge>
                                  </div>
                                  <Badge
                                    className={
                                      quiz.passed
                                        ? "bg-green-900/40 text-green-300 border-green-700/40  mt-1"
                                        : "bg-red-900/40 text-red-300 border-red-700/40  mt-1"
                                    }
                                  >
                                    {quiz.passed ? "Passed" : "Failed"}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </Link>
                        ))
                      ) : (
                        <div className="text-center py-6 bg-gray-800/40 rounded-md border border-gray-700/30">
                          <p className="text-gray-400 ">
                            No quiz attempts yet.
                          </p>
                          <Link href="/library?tab=public">
                            <Button className="mt-2 bg-blue-600/80 hover:bg-blue-600 text-white  h-8">
                              Start Your First Quiz
                            </Button>
                          </Link>
                        </div>
                      )}
                    </div>
                    {recentQuizzes.length > 0 && (
                      <div className="mt-4 text-center">
                        <Link href="/attempted-quizzes">
                          <Button className="bg-blue-600/80 hover:bg-blue-600 text-white  h-8">
                            View Complete History
                          </Button>
                        </Link>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analytics" className="space-y-4">
                {/* Performance Overview */}
                {userStats && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Card className="border-gray-700/30 bg-gray-800/20 backdrop-blur-sm shadow-md">
                      <CardContent className="p-3 flex items-center">
                        <div className="bg-blue-900/30 p-2 rounded-full mr-3">
                          <Trophy className="h-4 w-4 text-blue-400" />
                        </div>
                        <div>
                          <div className=" font-medium text-gray-200">
                            {userStats.totalQuizzes}
                          </div>
                          <div className=" text-gray-400">Total Quizzes</div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border-gray-700/30 bg-gray-800/20 backdrop-blur-sm shadow-md">
                      <CardContent className="p-3 flex items-center">
                        <div className="bg-green-900/30 p-2 rounded-full mr-3">
                          <Target className="h-4 w-4 text-green-400" />
                        </div>
                        <div>
                          <div className=" font-medium text-gray-200">
                            {userStats.averageScore}%
                          </div>
                          <div className=" text-gray-400">Average Score</div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border-gray-700/30 bg-gray-800/20 backdrop-blur-sm shadow-md">
                      <CardContent className="p-3 flex items-center">
                        <div className="bg-orange-900/30 p-2 rounded-full mr-3">
                          <TrendingUp className="h-4 w-4 text-orange-400" />
                        </div>
                        <div>
                          <div className=" font-medium text-gray-200">
                            {user.streak}
                          </div>
                          <div className=" text-gray-400">Current Streak</div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border-gray-700/30 bg-gray-800/20 backdrop-blur-sm shadow-md">
                      <CardContent className="p-3 flex items-center">
                        <div className="bg-purple-900/30 p-2 rounded-full mr-3">
                          <Clock className="h-4 w-4 text-purple-400" />
                        </div>
                        <div>
                          <div className=" font-medium text-gray-200">
                            {formatTime(userStats.totalTime)}
                          </div>
                          <div className=" text-gray-400">Total Time</div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Category Performance */}
                {analyticsData.categoryPerformance.length > 0 && (
                  <Card className="border-gray-700/30 bg-gray-800/20 backdrop-blur-sm shadow-md">
                    <CardHeader className="py-3 px-4 border-b border-gray-700/20">
                      <CardTitle className=" text-gray-100 flex items-center">
                        <BarChart3 className="h-4 w-4 mr-2 text-blue-400" />
                        Performance by Category
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="py-3 px-4">
                      <div className="space-y-3">
                        {analyticsData.categoryPerformance.map((category) => (
                          <div key={category.category} className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-gray-300 ">
                                {category.category}
                              </span>
                              <div className="flex items-center space-x-2">
                                <span className=" text-gray-400">
                                  {category.quizzes} quizzes
                                </span>
                                <Badge
                                  className={getScoreColor(category.score)}
                                >
                                  {category.score}%
                                </Badge>
                              </div>
                            </div>
                            <div className="bg-gray-700/30 rounded-full h-1.5 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  category.score >= 80
                                    ? "bg-green-500/70"
                                    : category.score >= 60
                                    ? "bg-yellow-500/70"
                                    : "bg-red-500/70"
                                }`}
                                style={{ width: `${category.score}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="achievements" className="space-y-4">
                <Card className="border-gray-700/30 bg-gray-800/20 backdrop-blur-sm shadow-md">
                  <CardHeader className="py-3 px-4 border-b border-gray-700/20">
                    <CardTitle className=" text-gray-100 flex items-center">
                      <Award className="h-4 w-4 mr-2 text-yellow-400" />
                      Achievements
                    </CardTitle>
                    <CardDescription className=" text-gray-400">
                      Track your learning milestones and accomplishments
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="py-6 px-4">
                    <div className="text-center py-6 bg-gray-800/40 rounded-md border border-gray-700/30">
                      <Award className="h-10 w-10 text-gray-500 mx-auto mb-3" />
                      <h3 className="text-base font-medium text-gray-200 mb-1">
                        Achievements Coming Soon
                      </h3>
                      <p className=" text-gray-400 max-w-md mx-auto">
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
    </div>
  );
}

export default withAuth(ProfilePage);
