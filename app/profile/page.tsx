"use client";

import { useState } from "react";
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

function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [userInfo, setUserInfo] = useState({
    name: "Alex Johnson",
    email: "alex.johnson@email.com",
    bio: "Passionate English learner and educator. I love creating interactive content to help others improve their language skills.",
    location: "San Francisco, CA",
    joinDate: "January 2024",
    avatar: "/placeholder.svg",
  });

  const [editedInfo, setEditedInfo] = useState(userInfo);

  const handleSave = () => {
    setUserInfo(editedInfo);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedInfo(userInfo);
    setIsEditing(false);
  };

  // Mock user stats
  const userStats = {
    totalQuizzes: 47,
    averageScore: 85,
    totalTime: "24h 30m",
    streak: 12,
    contentCreated: 8,
    totalLearners: 1247,
    averageRating: 4.7,
    hoursLearned: 156,
  };

  // Mock quiz history
  const recentQuizzes = [
    {
      id: 1,
      title: "Advanced Grammar Quiz",
      score: 92,
      date: "2024-01-15",
      status: "completed",
      timeSpent: "15 min",
    },
    {
      id: 2,
      title: "Business Vocabulary Test",
      score: 78,
      date: "2024-01-14",
      status: "completed",
      timeSpent: "22 min",
    },
    {
      id: 3,
      title: "Pronunciation Challenge",
      score: 88,
      date: "2024-01-13",
      status: "completed",
      timeSpent: "18 min",
    },
    {
      id: 4,
      title: "Listening Comprehension",
      score: 95,
      date: "2024-01-12",
      status: "completed",
      timeSpent: "25 min",
    },
  ];

  // Mock achievements
  const achievements = [
    {
      id: 1,
      title: "Quiz Master",
      description: "Completed 50+ quizzes",
      icon: Trophy,
      earned: true,
      date: "2024-01-10",
    },
    {
      id: 2,
      title: "Perfect Score",
      description: "Achieved 100% on a quiz",
      icon: Target,
      earned: true,
      date: "2024-01-08",
    },
    {
      id: 3,
      title: "Speed Learner",
      description: "Completed a quiz in under 10 minutes",
      icon: Clock,
      earned: true,
      date: "2024-01-05",
    },
    {
      id: 4,
      title: "Consistent Learner",
      description: "Maintain a 30-day streak",
      icon: Calendar,
      earned: false,
      date: null,
    },
    {
      id: 5,
      title: "Content Creator",
      description: "Create 10+ quizzes",
      icon: BookOpen,
      earned: false,
      date: null,
    },
    {
      id: 6,
      title: "Community Helper",
      description: "Help 100+ learners",
      icon: Users,
      earned: false,
      date: null,
    },
  ];

  // Mock analytics data
  const analyticsData = {
    weeklyProgress: [
      { day: "Mon", quizzes: 3, score: 85 },
      { day: "Tue", quizzes: 2, score: 92 },
      { day: "Wed", quizzes: 4, score: 78 },
      { day: "Thu", quizzes: 1, score: 95 },
      { day: "Fri", quizzes: 3, score: 88 },
      { day: "Sat", quizzes: 2, score: 90 },
      { day: "Sun", quizzes: 1, score: 87 },
    ],
    categoryPerformance: [
      { category: "Grammar", score: 88, quizzes: 15 },
      { category: "Vocabulary", score: 92, quizzes: 12 },
      { category: "Pronunciation", score: 75, quizzes: 8 },
      { category: "Listening", score: 85, quizzes: 10 },
      { category: "Reading", score: 90, quizzes: 2 },
    ],
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 80) return "text-blue-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <PageHeader
        title="My Profile"
        description="Manage your account and track your learning progress"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Info Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Profile Card */}
          <Card className="border-blue-100">
            <CardHeader className="text-center">
              <Avatar className="w-24 h-24 mx-auto mb-4">
                <AvatarImage
                  src={userInfo.avatar || "/placeholder.svg"}
                  alt={userInfo.name}
                />
                <AvatarFallback className="bg-blue-100 text-blue-600 text-2xl">
                  {userInfo.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              {!isEditing ? (
                <div>
                  <CardTitle className="text-2xl mb-2">
                    {userInfo.name}
                  </CardTitle>
                  <CardDescription className="text-base mb-4">
                    {userInfo.bio}
                  </CardDescription>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center justify-center">
                      <Mail className="h-4 w-4 mr-2" />
                      {userInfo.email}
                    </div>
                    <div className="flex items-center justify-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      {userInfo.location}
                    </div>
                    <div className="flex items-center justify-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      Joined {userInfo.joinDate}
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
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={editedInfo.location}
                      onChange={(e) =>
                        setEditedInfo({
                          ...editedInfo,
                          location: e.target.value,
                        })
                      }
                      className="border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={editedInfo.bio}
                      onChange={(e) =>
                        setEditedInfo({ ...editedInfo, bio: e.target.value })
                      }
                      className="border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleSave}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                    <Button onClick={handleCancel} variant="outline">
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
                  {userStats.streak} days
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Quizzes</span>
                <span className="font-semibold">{userStats.totalQuizzes}</span>
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
                <span className="font-semibold">{userStats.totalTime}</span>
              </div>
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
                    {recentQuizzes.slice(0, 3).map((quiz) => (
                      <div
                        key={quiz.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {quiz.title}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {quiz.date} • {quiz.timeSpent}
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
                          <Badge className="bg-green-100 text-green-800">
                            Completed
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
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
                    {recentQuizzes.map((quiz) => (
                      <div
                        key={quiz.id}
                        className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {quiz.title}
                            </h3>
                            <p className="text-sm text-gray-600">
                              Completed on {quiz.date} • Time spent:{" "}
                              {quiz.timeSpent}
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
                            <Badge className="bg-green-100 text-green-800">
                              {quiz.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 text-center">
                    <Link href="/attempted-quizzes">
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                        View Complete History
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              {/* Performance Overview */}
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
                  value={`${userStats.streak}`}
                  label="Current Streak"
                  color="text-orange-600"
                />
                <StatsCard
                  icon={Clock}
                  value={userStats.totalTime}
                  label="Total Time"
                  color="text-purple-600"
                />
              </StatsGrid>

              {/* Category Performance */}
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

              {/* Weekly Progress */}
              <Card className="border-blue-100">
                <CardHeader>
                  <CardTitle>Weekly Progress</CardTitle>
                  <CardDescription>
                    Your quiz activity over the past week
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analyticsData.weeklyProgress.map((day) => (
                      <div
                        key={day.day}
                        className="flex items-center justify-between"
                      >
                        <span className="font-medium text-gray-700 w-12">
                          {day.day}
                        </span>
                        <div className="flex items-center space-x-4 flex-1">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${(day.quizzes / 5) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600 w-16">
                            {day.quizzes} quizzes
                          </span>
                          <span
                            className={`font-medium w-12 ${getScoreColor(
                              day.score
                            )}`}
                          >
                            {day.score}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {achievements.map((achievement) => {
                      const IconComponent = achievement.icon;
                      return (
                        <div
                          key={achievement.id}
                          className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                            achievement.earned
                              ? "border-yellow-200 bg-yellow-50 hover:border-yellow-300"
                              : "border-gray-200 bg-gray-50 opacity-60"
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            <div
                              className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                                achievement.earned
                                  ? "bg-yellow-100"
                                  : "bg-gray-200"
                              }`}
                            >
                              <IconComponent
                                className={`h-6 w-6 ${
                                  achievement.earned
                                    ? "text-yellow-600"
                                    : "text-gray-400"
                                }`}
                              />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <h3
                                  className={`font-semibold ${
                                    achievement.earned
                                      ? "text-gray-900"
                                      : "text-gray-500"
                                  }`}
                                >
                                  {achievement.title}
                                </h3>
                                {achievement.earned && (
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                )}
                              </div>
                              <p
                                className={`text-sm ${
                                  achievement.earned
                                    ? "text-gray-600"
                                    : "text-gray-400"
                                } mb-2`}
                              >
                                {achievement.description}
                              </p>
                              {achievement.earned && achievement.date && (
                                <p className="text-xs text-yellow-600 font-medium">
                                  Earned on {achievement.date}
                                </p>
                              )}
                              {!achievement.earned && (
                                <p className="text-xs text-gray-400">
                                  Not yet earned
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
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
