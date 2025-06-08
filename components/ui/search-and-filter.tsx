"use client"

import type React from "react"
import { memo } from "react"
import { Search, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DIFFICULTY_LEVELS, QUIZ_CATEGORIES } from "@/lib/constants/app-constants"
import type { IQuizFilters } from "@/lib/types/interfaces"

interface ISearchAndFilterProps {
  filters: IQuizFilters
  onFiltersChange: (filters: IQuizFilters) => void
  className?: string
}

// Pure presentational component
const SearchAndFilterComponent: React.FC<ISearchAndFilterProps> = ({ filters, onFiltersChange, className = "" }) => {
  const handleSearchChange = (search: string) => {
    onFiltersChange({ ...filters, search })
  }

  const handleDifficultyChange = (difficulty: string) => {
    onFiltersChange({ ...filters, difficulty })
  }

  const handleCategoryChange = (category: string) => {
    onFiltersChange({ ...filters, category })
  }

  return (
    <div className={`flex flex-col sm:flex-row gap-3 ${className}`}>
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search quizzes, creators, or topics..."
          value={filters.search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 pl-10 h-10"
        />
      </div>

      <Select value={filters.difficulty} onValueChange={handleDifficultyChange}>
        <SelectTrigger className="w-full sm:w-48 h-10 bg-white border-gray-200 text-gray-900">
          <Filter className="h-4 w-4 mr-2" />
          <SelectValue placeholder="Difficulty..." />
        </SelectTrigger>
        <SelectContent className="bg-white border-gray-200">
          <SelectItem value="all">All Levels</SelectItem>
          {DIFFICULTY_LEVELS.filter((level) => level !== "All Levels").map((level) => (
            <SelectItem key={level} value={level.toLowerCase()}>
              {level}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.category} onValueChange={handleCategoryChange}>
        <SelectTrigger className="w-full sm:w-48 h-10 bg-white border-gray-200 text-gray-900">
          <SelectValue placeholder="Category..." />
        </SelectTrigger>
        <SelectContent className="bg-white border-gray-200">
          <SelectItem value="all">All Categories</SelectItem>
          {QUIZ_CATEGORIES.map((category) => (
            <SelectItem key={category} value={category.toLowerCase()}>
              {category}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

// Memoized export for performance optimization
export const SearchAndFilter = memo(SearchAndFilterComponent)
SearchAndFilter.displayName = "SearchAndFilter"
