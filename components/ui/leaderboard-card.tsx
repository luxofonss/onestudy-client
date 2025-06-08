"use client"

import { Trophy, Medal, Award, Crown } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface LeaderboardEntry {
  rank: number
  user: {
    name: string
    avatar?: string
    country?: string
  }
  score: number
  completionTime: string
  accuracy: number
  attempts: number
  lastAttempt: string
}

interface LeaderboardCardProps {
  entry: LeaderboardEntry
  isCurrentUser?: boolean
  showDetails?: boolean
  className?: string
}

export function LeaderboardCard({
  entry,
  isCurrentUser = false,
  showDetails = true,
  className = "",
}: LeaderboardCardProps) {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />
      default:
        return <Trophy className="h-4 w-4 text-gray-400" />
    }
  }

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white"
      case 2:
        return "bg-gradient-to-r from-gray-300 to-gray-500 text-white"
      case 3:
        return "bg-gradient-to-r from-amber-400 to-amber-600 text-white"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 95) return "text-green-600"
    if (score >= 85) return "text-blue-600"
    if (score >= 75) return "text-yellow-600"
    return "text-gray-600"
  }

  return (
    <Card
      className={`transition-all duration-200 hover:shadow-md ${
        isCurrentUser ? "ring-2 ring-blue-500 bg-blue-50" : "hover:bg-gray-50"
      } ${className}`}
    >
      <CardContent className="p-4">
        <div className="flex items-center space-x-4">
          {/* Rank */}
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${getRankColor(entry.rank)}`}
          >
            {entry.rank <= 3 ? getRankIcon(entry.rank) : `#${entry.rank}`}
          </div>

          {/* User Info */}
          <div className="flex items-center space-x-3 flex-1">
            <Avatar className="w-10 h-10">
              <AvatarImage src={entry.user.avatar || "/placeholder.svg"} alt={entry.user.name} />
              <AvatarFallback className="bg-blue-100 text-blue-600">
                {entry.user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h3 className={`font-semibold ${isCurrentUser ? "text-blue-700" : "text-gray-900"}`}>
                  {entry.user.name}
                  {isCurrentUser && <span className="text-sm text-blue-600 ml-1">(You)</span>}
                </h3>
                {entry.user.country && (
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">{entry.user.country}</span>
                )}
              </div>
              {showDetails && (
                <div className="text-sm text-gray-500 mt-1">
                  {entry.attempts} attempts • Last: {entry.lastAttempt}
                </div>
              )}
            </div>
          </div>

          {/* Score and Stats */}
          <div className="text-right">
            <div className={`text-2xl font-bold ${getScoreColor(entry.score)}`}>{entry.score}%</div>
            {showDetails && (
              <div className="text-sm text-gray-500 space-y-1">
                <div>⏱️ {entry.completionTime}</div>
                <div>🎯 {entry.accuracy}% accuracy</div>
              </div>
            )}
          </div>

          {/* Badges for top performers */}
          {entry.rank <= 3 && (
            <div className="flex flex-col space-y-1">
              {entry.rank === 1 && <Badge className="bg-yellow-100 text-yellow-800 text-xs">Champion</Badge>}
              {entry.rank === 2 && <Badge className="bg-gray-100 text-gray-800 text-xs">Runner-up</Badge>}
              {entry.rank === 3 && <Badge className="bg-amber-100 text-amber-800 text-xs">3rd Place</Badge>}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
