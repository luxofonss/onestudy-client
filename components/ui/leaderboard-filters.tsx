"use client"

import { Filter, Calendar, Globe } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface LeaderboardFiltersProps {
  timeframe: string
  category: string
  region: string
  onTimeframeChange: (value: string) => void
  onCategoryChange: (value: string) => void
  onRegionChange: (value: string) => void
  className?: string
}

export function LeaderboardFilters({
  timeframe,
  category,
  region,
  onTimeframeChange,
  onCategoryChange,
  onRegionChange,
  className = "",
}: LeaderboardFiltersProps) {
  return (
    <div className={`flex flex-wrap gap-4 ${className}`}>
      <Select value={timeframe} onValueChange={onTimeframeChange}>
        <SelectTrigger className="w-48 border-blue-200 focus:border-blue-500 focus:ring-blue-500">
          <Calendar className="h-4 w-4 mr-2" />
          <SelectValue placeholder="Timeframe" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all-time">All Time</SelectItem>
          <SelectItem value="this-month">This Month</SelectItem>
          <SelectItem value="this-week">This Week</SelectItem>
          <SelectItem value="today">Today</SelectItem>
        </SelectContent>
      </Select>

      <Select value={category} onValueChange={onCategoryChange}>
        <SelectTrigger className="w-48 border-blue-200 focus:border-blue-500 focus:ring-blue-500">
          <Filter className="h-4 w-4 mr-2" />
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          <SelectItem value="grammar">Grammar</SelectItem>
          <SelectItem value="vocabulary">Vocabulary</SelectItem>
          <SelectItem value="pronunciation">Pronunciation</SelectItem>
          <SelectItem value="listening">Listening</SelectItem>
          <SelectItem value="reading">Reading</SelectItem>
        </SelectContent>
      </Select>

      <Select value={region} onValueChange={onRegionChange}>
        <SelectTrigger className="w-48 border-blue-200 focus:border-blue-500 focus:ring-blue-500">
          <Globe className="h-4 w-4 mr-2" />
          <SelectValue placeholder="Region" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="global">Global</SelectItem>
          <SelectItem value="north-america">North America</SelectItem>
          <SelectItem value="europe">Europe</SelectItem>
          <SelectItem value="asia">Asia</SelectItem>
          <SelectItem value="south-america">South America</SelectItem>
          <SelectItem value="africa">Africa</SelectItem>
          <SelectItem value="oceania">Oceania</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
