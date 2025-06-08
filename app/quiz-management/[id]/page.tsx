"use client"

import { useState } from "react"
import {
  Users,
  TrendingUp,
  Clock,
  Target,
  Edit,
  Save,
  X,
  Eye,
  Calendar,
  Filter,
  Download,
  BarChart3,
  PieChart,
  Activity,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { PageHeader } from "@/components/ui/page-header"
import { StatsGrid } from "@/components/ui/stats-grid"
import { StatsCard } from "@/components/ui/stats-card"
import Link from "next/link"
import { withAuth } from "@/lib/hooks/with-auth"

function QuizManagementPage({ params }: { params: { id: string } }) {
  const [editingScore, setEditingScore] = useState<string | null>(null)
  const [newScore, setNewScore] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [sortBy, setSortBy] = useState("recent")
  const [selectedTimeframe, setSelectedTimeframe] = useState("all-time")

  // Mock quiz data
  const [quizData] = useState({
    id: params.id,
    title: "Advanced English Grammar Assessment",
    description: "Comprehensive test covering advanced grammar concepts",
    creator: "You",
    createdAt: "2024-01-10",
    totalQuestions: 15,
    passingScore: 70,
    timeLimit: "30 minutes",
    category: "Grammar",
    difficulty: "Advanced",
    isPublished: true,
  })

  // Mock user attempts data
  const [userAttempts, setUserAttempts] = useState([
    {
      id: "attempt_1",
      user: {
        name: "Sarah Johnson",
        email: "sarah.j@email.com",
        avatar: "/placeholder.svg",
        country: "USA",
      },
      score: 85,
      totalQuestions: 15,
      correctAnswers: 13,
      timeSpent: "22 min 15 sec",
      completedAt: "2024-01-15 14:30",
      passed: true,
      attemptNumber: 1,
      status: "completed",
      answers: [
        { questionId: 1, userAnswer: "brought", correctAnswer: "brought", isCorrect: true, timeSpent: 45 },
        { questionId: 2, userAnswer: "at", correctAnswer: "at", isCorrect: true, timeSpent: 30 },
        { questionId: 3, userAnswer: "have been", correctAnswer: "have been", isCorrect: true, timeSpent: 60 },
        // ... more answers
      ],
    },
    {
      id: "attempt_2",
      user: {
        name: "Michael Chen",
        email: "m.chen@email.com",
        avatar: "/placeholder.svg",
        country: "Canada",
      },
      score: 72,
      totalQuestions: 15,
      correctAnswers: 11,
      timeSpent: "28 min 45 sec",
      completedAt: "2024-01-15 10:20",
      passed: true,
      attemptNumber: 2,
      status: "completed",
      answers: [],
    },
    {
      id: "attempt_3",
      user: {
        name: "Emma Rodriguez",
        email: "emma.r@email.com",
        avatar: "/placeholder.svg",
        country: "Spain",
      },
      score: 68,
      totalQuestions: 15,
      correctAnswers: 10,
      timeSpent: "25 min 30 sec",
      completedAt: "2024-01-14 16:45",
      passed: false,
      attemptNumber: 1,
      status: "completed",
      answers: [],
    },
    {
      id: "attempt_4",
      user: {
        name: "Alex Thompson",
        email: "alex.t@email.com",
        avatar: "/placeholder.svg",
        country: "UK",
      },
      score: 92,
      totalQuestions: 15,
      correctAnswers: 14,
      timeSpent: "18 min 12 sec",
      completedAt: "2024-01-14 09:15",
      passed: true,
      attemptNumber: 1,
      status: "completed",
      answers: [],
    },
    {
      id: "attempt_5",
      user: {
        name: "Priya Patel",
        email: "priya.p@email.com",
        avatar: "/placeholder.svg",
        country: "India",
      },
      score: 0,
      totalQuestions: 15,
      correctAnswers: 0,
      timeSpent: "5 min 20 sec",
      completedAt: "2024-01-13 11:30",
      passed: false,
      attemptNumber: 1,
      status: "abandoned",
      answers: [],
    },
  ])

  // Analytics data
  const getAnalytics = () => {
    const totalAttempts = userAttempts.length
    const completedAttempts = userAttempts.filter((a) => a.status === "completed").length
    const passedAttempts = userAttempts.filter((a) => a.passed).length
    const averageScore = Math.round(
      userAttempts.filter((a) => a.status === "completed").reduce((sum, a) => sum + a.score, 0) / completedAttempts,
    )
    const averageTime =
      userAttempts
        .filter((a) => a.status === "completed")
        .reduce((total, a) => {
          const [minutes] = a.timeSpent.split(" ")
          return total + Number.parseInt(minutes)
        }, 0) / completedAttempts

    const scoreDistribution = {
      "90-100": userAttempts.filter((a) => a.score >= 90 && a.status === "completed").length,
      "80-89": userAttempts.filter((a) => a.score >= 80 && a.score < 90 && a.status === "completed").length,
      "70-79": userAttempts.filter((a) => a.score >= 70 && a.score < 80 && a.status === "completed").length,
      "60-69": userAttempts.filter((a) => a.score >= 60 && a.score < 70 && a.status === "completed").length,
      "Below 60": userAttempts.filter((a) => a.score < 60 && a.status === "completed").length,
    }

    return {
      totalAttempts,
      completedAttempts,
      passedAttempts,
      averageScore,
      averageTime: Math.round(averageTime),
      passRate: Math.round((passedAttempts / completedAttempts) * 100),
      completionRate: Math.round((completedAttempts / totalAttempts) * 100),
      scoreDistribution,
    }
  }

  const analytics = getAnalytics()

  const handleScoreEdit = (attemptId: string, currentScore: number) => {
    setEditingScore(attemptId)
    setNewScore(currentScore.toString())
  }

  const handleScoreSave = (attemptId: string) => {
    const score = Number.parseInt(newScore)
    if (score >= 0 && score <= 100) {
      setUserAttempts((prev) =>
        prev.map((attempt) =>
          attempt.id === attemptId
            ? {
                ...attempt,
                score,
                passed: score >= quizData.passingScore,
                correctAnswers: Math.round((score / 100) * quizData.totalQuestions),
              }
            : attempt,
        ),
      )
      setEditingScore(null)
      setNewScore("")
    }
  }

  const handleScoreCancel = () => {
    setEditingScore(null)
    setNewScore("")
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600 bg-green-50"
    if (score >= 80) return "text-blue-600 bg-blue-50"
    if (score >= 70) return "text-yellow-600 bg-yellow-50"
    return "text-red-600 bg-red-50"
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "abandoned":
        return "bg-red-100 text-red-800"
      case "in-progress":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredAttempts = userAttempts.filter((attempt) => {
    if (filterStatus === "all") return true
    if (filterStatus === "passed") return attempt.passed
    if (filterStatus === "failed") return !attempt.passed && attempt.status === "completed"
    if (filterStatus === "abandoned") return attempt.status === "abandoned"
    return true
  })

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <PageHeader
        title={`Quiz Management: ${quizData.title}`}
        description="Monitor user performance and manage quiz submissions"
      >
        <div className="flex gap-2">
          <Link href={`/content/${params.id}`}>
            <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
              <Eye className="h-4 w-4 mr-2" />
              Preview Quiz
            </Button>
          </Link>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>
      </PageHeader>

      {/* Quiz Info Card */}
      <Card className="border-blue-100 mb-8">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl mb-2">{quizData.title}</CardTitle>
              <CardDescription className="mb-4">{quizData.description}</CardDescription>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>Created: {quizData.createdAt}</span>
                <span>•</span>
                <span>{quizData.totalQuestions} Questions</span>
                <span>•</span>
                <span>Passing Score: {quizData.passingScore}%</span>
                <span>•</span>
                <span>Time Limit: {quizData.timeLimit}</span>
              </div>
            </div>
            <div className="flex flex-col space-y-2">
              <Badge className="bg-green-100 text-green-800">Published</Badge>
              <Badge variant="outline">{quizData.difficulty}</Badge>
              <Badge variant="outline">{quizData.category}</Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-blue-50">
          <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            Overview
          </TabsTrigger>
          <TabsTrigger value="attempts" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            User Attempts
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            Analytics
          </TabsTrigger>
          <TabsTrigger value="performance" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            Performance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <StatsGrid columns={4}>
            <StatsCard icon={Users} value={analytics.totalAttempts} label="Total Attempts" color="text-blue-600" />
            <StatsCard icon={Target} value={`${analytics.passRate}%`} label="Pass Rate" color="text-green-600" />
            <StatsCard
              icon={TrendingUp}
              value={`${analytics.averageScore}%`}
              label="Average Score"
              color="text-purple-600"
            />
            <StatsCard icon={Clock} value={`${analytics.averageTime}m`} label="Avg. Time" color="text-orange-600" />
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
                {userAttempts.slice(0, 5).map((attempt) => (
                  <div key={attempt.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={attempt.user.avatar || "/placeholder.svg"} alt={attempt.user.name} />
                        <AvatarFallback className="bg-blue-100 text-blue-600">
                          {attempt.user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-gray-900">{attempt.user.name}</p>
                        <p className="text-sm text-gray-500">
                          {attempt.status === "completed" ? "Completed" : "Abandoned"} • {attempt.completedAt}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`px-3 py-1 rounded-lg font-medium ${getScoreColor(attempt.score)}`}>
                        {attempt.score}%
                      </div>
                      <Badge className={getStatusColor(attempt.status)} variant="secondary">
                        {attempt.passed ? "Passed" : attempt.status === "completed" ? "Failed" : "Abandoned"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attempts" className="space-y-6">
          {/* Filters */}
          <div className="flex flex-wrap gap-4 items-center">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48 border-blue-200 focus:border-blue-500 focus:ring-blue-500">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Attempts</SelectItem>
                <SelectItem value="passed">Passed Only</SelectItem>
                <SelectItem value="failed">Failed Only</SelectItem>
                <SelectItem value="abandoned">Abandoned</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48 border-blue-200 focus:border-blue-500 focus:ring-blue-500">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="score-high">Highest Score</SelectItem>
                <SelectItem value="score-low">Lowest Score</SelectItem>
              </SelectContent>
            </Select>

            <div className="text-sm text-gray-600">
              Showing {filteredAttempts.length} of {userAttempts.length} attempts
            </div>
          </div>

          {/* User Attempts Table */}
          <Card className="border-blue-100">
            <CardHeader>
              <CardTitle>User Submissions</CardTitle>
              <CardDescription>Manage and review all quiz attempts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredAttempts.map((attempt) => (
                  <div key={attempt.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={attempt.user.avatar || "/placeholder.svg"} alt={attempt.user.name} />
                          <AvatarFallback className="bg-blue-100 text-blue-600">
                            {attempt.user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-gray-900">{attempt.user.name}</h3>
                          <p className="text-sm text-gray-600">{attempt.user.email}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {attempt.user.country}
                            </Badge>
                            <Badge className={getStatusColor(attempt.status)} variant="secondary">
                              {attempt.status}
                            </Badge>
                            {attempt.attemptNumber > 1 && (
                              <Badge variant="outline" className="text-xs">
                                Attempt #{attempt.attemptNumber}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-right space-y-2">
                        <div className="flex items-center space-x-2">
                          {editingScore === attempt.id ? (
                            <div className="flex items-center space-x-2">
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                value={newScore}
                                onChange={(e) => setNewScore(e.target.value)}
                                className="w-20 h-8 text-center"
                              />
                              <Button size="sm" onClick={() => handleScoreSave(attempt.id)}>
                                <Save className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={handleScoreCancel}>
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <div className={`px-3 py-1 rounded-lg font-bold ${getScoreColor(attempt.score)}`}>
                                {attempt.score}%
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleScoreEdit(attempt.id, attempt.score)}
                                className="border-blue-600 text-blue-600 hover:bg-blue-50"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                        <div className="text-sm text-gray-600">
                          <div>
                            {attempt.correctAnswers}/{attempt.totalQuestions} correct
                          </div>
                          <div>Time: {attempt.timeSpent}</div>
                          <div>Completed: {attempt.completedAt}</div>
                        </div>
                      </div>
                    </div>

                    {/* Detailed View Button */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-blue-600 text-blue-600 hover:bg-blue-50"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Detailed Submission
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>
                              Detailed Submission - {attempt.user.name} (Attempt #{attempt.attemptNumber})
                            </DialogTitle>
                          </DialogHeader>
                          <div className="space-y-6">
                            {/* Submission Summary */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div className="text-center p-4 bg-blue-50 rounded-lg">
                                <div className="text-2xl font-bold text-blue-600">{attempt.score}%</div>
                                <div className="text-sm text-gray-600">Final Score</div>
                              </div>
                              <div className="text-center p-4 bg-green-50 rounded-lg">
                                <div className="text-2xl font-bold text-green-600">{attempt.correctAnswers}</div>
                                <div className="text-sm text-gray-600">Correct Answers</div>
                              </div>
                              <div className="text-center p-4 bg-orange-50 rounded-lg">
                                <div className="text-2xl font-bold text-orange-600">{attempt.timeSpent}</div>
                                <div className="text-sm text-gray-600">Time Spent</div>
                              </div>
                              <div className="text-center p-4 bg-purple-50 rounded-lg">
                                <div className="text-2xl font-bold text-purple-600">
                                  {attempt.passed ? "PASS" : "FAIL"}
                                </div>
                                <div className="text-sm text-gray-600">Result</div>
                              </div>
                            </div>

                            {/* Question-by-Question Breakdown */}
                            <div>
                              <h3 className="font-semibold text-lg mb-4">Question-by-Question Analysis</h3>
                              <div className="space-y-3">
                                {attempt.answers.length > 0 ? (
                                  attempt.answers.map((answer, index) => (
                                    <div
                                      key={answer.questionId}
                                      className={`p-4 rounded-lg border ${
                                        answer.isCorrect ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                                      }`}
                                    >
                                      <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                          <div className="flex items-center space-x-2 mb-2">
                                            <span className="font-medium">Question {answer.questionId}</span>
                                            <Badge
                                              variant={answer.isCorrect ? "default" : "destructive"}
                                              className={answer.isCorrect ? "bg-green-100 text-green-800" : ""}
                                            >
                                              {answer.isCorrect ? "Correct" : "Incorrect"}
                                            </Badge>
                                          </div>
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                            <div>
                                              <span className="font-medium">User Answer:</span>
                                              <div className="mt-1 p-2 bg-white rounded border">
                                                {answer.userAnswer}
                                              </div>
                                            </div>
                                            <div>
                                              <span className="font-medium">Correct Answer:</span>
                                              <div className="mt-1 p-2 bg-white rounded border">
                                                {answer.correctAnswer}
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                        <div className="text-right text-sm text-gray-600">
                                          <div>Time: {answer.timeSpent}s</div>
                                        </div>
                                      </div>
                                    </div>
                                  ))
                                ) : (
                                  <div className="text-center py-8 text-gray-500">
                                    <p>Detailed answer breakdown not available for this submission.</p>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Notes Section */}
                            <div>
                              <Label htmlFor="notes" className="text-sm font-medium">
                                Instructor Notes
                              </Label>
                              <Textarea
                                id="notes"
                                placeholder="Add notes about this submission..."
                                className="mt-2"
                                rows={3}
                              />
                              <Button size="sm" className="mt-2 bg-blue-600 hover:bg-blue-700 text-white">
                                Save Notes
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* Analytics Overview */}
          <StatsGrid columns={4}>
            <StatsCard icon={Users} value={analytics.totalAttempts} label="Total Attempts" color="text-blue-600" />
            <StatsCard
              icon={Target}
              value={`${analytics.completionRate}%`}
              label="Completion Rate"
              color="text-green-600"
            />
            <StatsCard icon={TrendingUp} value={`${analytics.passRate}%`} label="Pass Rate" color="text-purple-600" />
            <StatsCard
              icon={Clock}
              value={`${analytics.averageTime}m`}
              label="Avg. Completion Time"
              color="text-orange-600"
            />
          </StatsGrid>

          {/* Score Distribution */}
          <Card className="border-blue-100">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                Score Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(analytics.scoreDistribution).map(([range, count]) => (
                  <div key={range} className="flex items-center justify-between">
                    <span className="font-medium text-gray-700">{range}%</span>
                    <div className="flex items-center space-x-3 flex-1 ml-4">
                      <Progress value={(count / analytics.completedAttempts) * 100} className="flex-1 h-3" />
                      <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Time-based Analytics */}
          <Card className="border-blue-100">
            <CardHeader>
              <CardTitle className="flex items-center">
                <PieChart className="h-5 w-5 mr-2 text-blue-600" />
                Performance Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">{analytics.passedAttempts}</div>
                  <div className="text-sm text-gray-600">Passed</div>
                  <div className="text-xs text-gray-500">({analytics.passRate}%)</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600 mb-2">
                    {analytics.completedAttempts - analytics.passedAttempts}
                  </div>
                  <div className="text-sm text-gray-600">Failed</div>
                  <div className="text-xs text-gray-500">
                    (
                    {Math.round(
                      ((analytics.completedAttempts - analytics.passedAttempts) / analytics.completedAttempts) * 100,
                    )}
                    %)
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-600 mb-2">
                    {analytics.totalAttempts - analytics.completedAttempts}
                  </div>
                  <div className="text-sm text-gray-600">Abandoned</div>
                  <div className="text-xs text-gray-500">
                    (
                    {Math.round(
                      ((analytics.totalAttempts - analytics.completedAttempts) / analytics.totalAttempts) * 100,
                    )}
                    %)
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          {/* Performance Insights */}
          <Card className="border-blue-100">
            <CardHeader>
              <CardTitle>Performance Insights</CardTitle>
              <CardDescription>Key insights about quiz performance and user behavior</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-800 mb-2">Top Performers</h3>
                    <div className="space-y-2">
                      {userAttempts
                        .filter((a) => a.status === "completed")
                        .sort((a, b) => b.score - a.score)
                        .slice(0, 3)
                        .map((attempt, index) => (
                          <div key={attempt.id} className="flex items-center justify-between">
                            <span className="text-sm text-blue-700">
                              {index + 1}. {attempt.user.name}
                            </span>
                            <span className="font-medium text-blue-800">{attempt.score}%</span>
                          </div>
                        ))}
                    </div>
                  </div>

                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-yellow-800 mb-2">Areas for Improvement</h3>
                    <div className="space-y-2 text-sm text-yellow-700">
                      <div>• {Math.round(100 - analytics.passRate)}% of users need additional support</div>
                      <div>• Average score is {analytics.averageScore}% (Target: 80%+)</div>
                      <div>• {analytics.totalAttempts - analytics.completedAttempts} users abandoned the quiz</div>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-2">Recommendations</h3>
                  <div className="space-y-2 text-sm text-green-700">
                    <div>• Consider adding more practice questions for struggling topics</div>
                    <div>• Review questions where most users struggle</div>
                    <div>• Provide additional resources for users who score below 70%</div>
                    <div>• Consider adjusting time limits based on average completion time</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Question Performance */}
          <Card className="border-blue-100">
            <CardHeader>
              <CardTitle>Question Performance Analysis</CardTitle>
              <CardDescription>See which questions are most challenging for users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { id: 1, text: "Choose the correct past tense form...", correctRate: 85, avgTime: 45 },
                  {
                    id: 2,
                    text: "Complete the sentence with the correct preposition...",
                    correctRate: 72,
                    avgTime: 38,
                  },
                  { id: 3, text: "Identify the grammatical error...", correctRate: 68, avgTime: 52 },
                  { id: 4, text: "Choose the appropriate modal verb...", correctRate: 91, avgTime: 35 },
                  { id: 5, text: "Select the correct conditional form...", correctRate: 58, avgTime: 67 },
                ].map((question) => (
                  <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Question {question.id}</span>
                      <div className="flex items-center space-x-4 text-sm">
                        <span className="text-gray-600">Avg. Time: {question.avgTime}s</span>
                        <span
                          className={`font-medium ${
                            question.correctRate >= 80
                              ? "text-green-600"
                              : question.correctRate >= 60
                                ? "text-yellow-600"
                                : "text-red-600"
                          }`}
                        >
                          {question.correctRate}% correct
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{question.text}</p>
                    <Progress value={question.correctRate} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default withAuth(QuizManagementPage)
