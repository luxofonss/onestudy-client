"use client"

import { useState } from "react"
import { Crown, Trophy, Users, TrendingUp, Target, Globe } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/ui/page-header"
import { StatsGrid } from "@/components/ui/stats-grid"
import { StatsCard } from "@/components/ui/stats-card"
import { LeaderboardCard } from "@/components/ui/leaderboard-card"
import { LeaderboardFilters } from "@/components/ui/leaderboard-filters"

export default function LeaderboardPage() {
  const [timeframe, setTimeframe] = useState("all-time")
  const [category, setCategory] = useState("all")
  const [region, setRegion] = useState("global")

  // Mock global leaderboard data
  const [globalLeaderboard] = useState([
    {
      rank: 1,
      user: { name: "Emma Rodriguez", avatar: "/placeholder.svg", country: "Spain" },
      score: 98,
      completionTime: "8 min 45 sec",
      accuracy: 98,
      attempts: 15,
      lastAttempt: "2 hours ago",
    },
    {
      rank: 2,
      user: { name: "Alex Johnson", avatar: "/placeholder.svg", country: "USA" },
      score: 96,
      completionTime: "9 min 12 sec",
      accuracy: 96,
      attempts: 23,
      lastAttempt: "1 day ago",
    },
    {
      rank: 3,
      user: { name: "Yuki Tanaka", avatar: "/placeholder.svg", country: "Japan" },
      score: 94,
      completionTime: "10 min 30 sec",
      accuracy: 94,
      attempts: 18,
      lastAttempt: "3 hours ago",
    },
    {
      rank: 4,
      user: { name: "Sarah Chen", avatar: "/placeholder.svg", country: "Canada" },
      score: 92,
      completionTime: "11 min 15 sec",
      accuracy: 92,
      attempts: 31,
      lastAttempt: "5 hours ago",
    },
    {
      rank: 5,
      user: { name: "You", avatar: "/placeholder.svg", country: "USA" },
      score: 89,
      completionTime: "12 min 34 sec",
      accuracy: 89,
      attempts: 27,
      lastAttempt: "1 hour ago",
    },
    {
      rank: 6,
      user: { name: "Marco Silva", avatar: "/placeholder.svg", country: "Brazil" },
      score: 87,
      completionTime: "13 min 22 sec",
      accuracy: 87,
      attempts: 19,
      lastAttempt: "6 hours ago",
    },
    {
      rank: 7,
      user: { name: "Priya Patel", avatar: "/placeholder.svg", country: "India" },
      score: 85,
      completionTime: "14 min 18 sec",
      accuracy: 85,
      attempts: 22,
      lastAttempt: "2 days ago",
    },
    {
      rank: 8,
      user: { name: "Hans Mueller", avatar: "/placeholder.svg", country: "Germany" },
      score: 83,
      completionTime: "15 min 45 sec",
      accuracy: 83,
      attempts: 16,
      lastAttempt: "4 hours ago",
    },
    {
      rank: 9,
      user: { name: "Sophie Martin", avatar: "/placeholder.svg", country: "France" },
      score: 81,
      completionTime: "16 min 12 sec",
      accuracy: 81,
      attempts: 25,
      lastAttempt: "1 day ago",
    },
    {
      rank: 10,
      user: { name: "Ahmed Hassan", avatar: "/placeholder.svg", country: "Egypt" },
      score: 79,
      completionTime: "17 min 30 sec",
      accuracy: 79,
      attempts: 14,
      lastAttempt: "8 hours ago",
    },
  ])

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 text-gray-100 container mx-auto px-4 py-8 animate-fade-in">
      <PageHeader title="Global Leaderboard" description="Compete with English learners from around the world" />

      {/* Hero Section */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <div className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
            <Crown className="h-10 w-10 text-white" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-gray-100 mb-2">Hall of Fame</h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          See how you rank against thousands of English learners worldwide. Complete quizzes to climb the rankings!
        </p>
      </div>

      {/* Personal Stats */}
      <StatsGrid columns={4} className="mb-8">
        <StatsCard
          icon={Trophy}
          value="5th"
          label="Your Global Rank"
          color="text-blue-400"
        />
        <StatsCard
          icon={TrendingUp}
          value="+3"
          label="Rank Change"
          color="text-green-400"
        />
        <StatsCard
          icon={Users}
          value="1,247"
          label="Total Players"
          color="text-purple-400"
        />
        <StatsCard
          icon={Target}
          value="Top 1%"
          label="Percentile"
          color="text-orange-400"
        />
      </StatsGrid>

      {/* Filters */}
      <LeaderboardFilters
        timeframe={timeframe}
        category={category}
        region={region}
        onTimeframeChange={setTimeframe}
        onCategoryChange={setCategory}
        onRegionChange={setRegion}
        className="mb-8"
      />

      {/* Top 3 Podium */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {globalLeaderboard.slice(0, 3).map((entry, index) => (
          <div key={entry.rank} className={`order-${index === 0 ? 2 : index === 1 ? 1 : 3} md:order-${index + 1}`}>
            <LeaderboardCard
              entry={entry}
              isCurrentUser={entry.user.name === "You"}
              showDetails={false}
              className={`transform hover:scale-105 transition-all duration-200 ${
                entry.rank === 1
                  ? "ring-2 ring-yellow-400 bg-gradient-to-br from-yellow-900/50 to-yellow-800/50 border-yellow-700/40"
                  : entry.rank === 2
                    ? "ring-2 ring-gray-400 bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-700/40"
                    : "ring-2 ring-amber-400 bg-gradient-to-br from-amber-900/50 to-amber-800/50 border-amber-700/40"
              }`}
            />
          </div>
        ))}
      </div>

      {/* Full Leaderboard */}
      <Card className="border-gray-700/30 bg-gray-800/20 backdrop-blur-sm shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Globe className="h-5 w-5 mr-2 text-blue-400" />
            Global Rankings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {globalLeaderboard.map((entry) => (
              <LeaderboardCard
                key={entry.rank}
                entry={entry}
                isCurrentUser={entry.user.name === "You"}
                showDetails={true}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Achievement Info */}
      <div className="mt-8 bg-gray-800/40 rounded-2xl p-8 border border-gray-700/30">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-100 mb-4">Climb the Rankings</h3>
          <p className="text-gray-400 max-w-2xl mx-auto mb-6">
            Complete more quizzes, improve your scores, and compete with learners worldwide. Your ranking is based on
            your average score across all completed quizzes.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="bg-gray-800/60 border border-gray-700/30 rounded-lg p-4">
              <Trophy className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
              <h4 className="font-semibold text-gray-100">Complete Quizzes</h4>
              <p className="text-sm text-gray-400">Take more quizzes to improve your ranking</p>
            </div>
            <div className="bg-gray-800/60 border border-gray-700/30 rounded-lg p-4">
              <Target className="h-8 w-8 text-blue-400 mx-auto mb-2" />
              <h4 className="font-semibold text-gray-100">Improve Scores</h4>
              <p className="text-sm text-gray-400">Higher scores boost your position</p>
            </div>
            <div className="bg-gray-800/60 border border-gray-700/30 rounded-lg p-4">
              <Users className="h-8 w-8 text-green-400 mx-auto mb-2" />
              <h4 className="font-semibold text-gray-100">Stay Active</h4>
              <p className="text-sm text-gray-400">Regular practice maintains your rank</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
