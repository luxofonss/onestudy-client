"use client";

import type React from "react";
import { memo, useState } from "react";
import {
  Search,
  Filter,
  SlidersHorizontal,
  X,
  ChevronDown,
  Tag,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DIFFICULTY_LEVELS,
  QUIZ_CATEGORIES,
} from "@/lib/constants/app-constants";
import type { IQuizFilters } from "@/lib/types/interfaces";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ISearchAndFilterProps {
  filters: IQuizFilters;
  onFiltersChange: (filters: IQuizFilters) => void;
  className?: string;
}

// Pure presentational component
const SearchAndFilterComponent: React.FC<ISearchAndFilterProps> = ({
  filters,
  onFiltersChange,
  className = "",
}) => {
  const [showFilters, setShowFilters] = useState(false);

  const handleSearchChange = (search: string) => {
    onFiltersChange({ ...filters, search });
  };

  const handleDifficultyChange = (difficulty: string) => {
    onFiltersChange({ ...filters, difficulty });
  };

  const handleCategoryChange = (category: string) => {
    onFiltersChange({ ...filters, category });
  };

  const clearFilters = () => {
    onFiltersChange({
      ...filters,
      search: "",
      difficulty: "all",
      category: "all",
    });
  };

  const hasActiveFilters =
    filters.search ||
    filters.difficulty !== "all" ||
    filters.category !== "all";

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search quizzes, creators, or topics..."
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="bg-gray-900/50 border-gray-700 text-gray-100 placeholder-gray-500 pl-10 h-10 rounded-lg focus:ring-teal-500 focus:border-teal-500"
          />
          {filters.search && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleSearchChange("")}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 text-gray-400 hover:text-gray-200"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>

        <Button
          variant={showFilters ? "default" : "outline"}
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className={`px-3 h-10 ${
            showFilters
              ? "bg-teal-600 hover:bg-teal-700 text-white border-teal-600"
              : "border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800"
          }`}
        >
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          Filters
          {hasActiveFilters && (
            <Badge className="ml-2 bg-teal-700 text-teal-100 h-5 w-5 p-0 flex items-center justify-center rounded-full text-xs">
              {(filters.difficulty !== "all" ? 1 : 0) +
                (filters.category !== "all" ? 1 : 0) +
                (filters.search ? 1 : 0)}
            </Badge>
          )}
        </Button>
      </div>

      {showFilters && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2 pb-1 px-1 bg-gray-800/50 rounded-lg border border-gray-700 animate-fadeIn">
          <div className="space-y-1.5">
            <div className="flex items-center text-xs text-gray-400 px-1.5">
              <Tag className="h-3.5 w-3.5 mr-1.5" />
              Category
            </div>
            <Select
              value={filters.category}
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger className="w-full h-9 bg-gray-900/50 border-gray-700 text-gray-200 text-sm focus:ring-teal-500 focus:border-teal-500">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700 text-gray-200">
                <SelectItem value="all" className="text-sm">
                  All Categories
                </SelectItem>
                {QUIZ_CATEGORIES.map((category) => (
                  <SelectItem
                    key={category}
                    value={category.toLowerCase()}
                    className="text-sm"
                  >
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center text-xs text-gray-400 px-1.5">
              <Filter className="h-3.5 w-3.5 mr-1.5" />
              Difficulty
            </div>
            <Select
              value={filters.difficulty}
              onValueChange={handleDifficultyChange}
            >
              <SelectTrigger className="w-full h-9 bg-gray-900/50 border-gray-700 text-gray-200 text-sm focus:ring-teal-500 focus:border-teal-500">
                <SelectValue placeholder="All Levels" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700 text-gray-200">
                <SelectItem value="all" className="text-sm">
                  All Levels
                </SelectItem>
                {DIFFICULTY_LEVELS.filter(
                  (level) => level !== "All Levels"
                ).map((level) => (
                  <SelectItem
                    key={level}
                    value={level.toLowerCase()}
                    className="text-sm"
                  >
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end sm:col-span-2 md:col-span-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              disabled={!hasActiveFilters}
              className="h-9 text-sm w-full border border-gray-700 text-gray-400 hover:text-gray-200 hover:bg-gray-800 disabled:opacity-50"
            >
              <X className="h-3.5 w-3.5 mr-1.5" />
              Clear Filters
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

// Memoized export for performance optimization
export const SearchAndFilter = memo(SearchAndFilterComponent);
SearchAndFilter.displayName = "SearchAndFilter";
