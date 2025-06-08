"use client"

import { useState, useMemo, useCallback } from "react"
import { useDebounce } from "./useDebounce"
import type { Quiz } from "@/lib/types/quiz"

export interface QuizFilters {
  search: string
  difficulty: string
  category: string
  status: string
}

interface UseQuizFiltersProps {
  quizzes: Quiz[]
  initialFilters?: Partial<QuizFilters>
}

export const useQuizFilters = ({ quizzes, initialFilters = {} }: UseQuizFiltersProps) => {
  const [filters, setFilters] = useState<QuizFilters>({
    search: "",
    difficulty: "all",
    category: "all",
    status: "all",
    ...initialFilters,
  })
  const [sortBy, setSortBy] = useState("newest")

  const debouncedSearch = useDebounce(filters.search, 300)

  const filteredQuizzes = useMemo(() => {
    return quizzes.filter((quiz) => {
      const matchesSearch =
        quiz.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        quiz.description.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        quiz.creator.toLowerCase().includes(debouncedSearch.toLowerCase())

      const matchesDifficulty =
        filters.difficulty === "all" || quiz.difficulty.toLowerCase() === filters.difficulty.toLowerCase()

      const matchesCategory =
        filters.category === "all" || quiz.category.toLowerCase() === filters.category.toLowerCase()

      const matchesStatus = filters.status === "all" || quiz.status === filters.status

      return matchesSearch && matchesDifficulty && matchesCategory && matchesStatus
    })
  }, [quizzes, debouncedSearch, filters.difficulty, filters.category, filters.status])

  const updateFilters = useCallback((newFilters: Partial<QuizFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
  }, [])

  const resetFilters = useCallback(() => {
    setFilters({
      search: "",
      difficulty: "all",
      category: "all",
      status: "all",
    })
    setSortBy("newest")
  }, [])

  const stats = useMemo(
    () => ({
      total: quizzes.length,
      filtered: filteredQuizzes.length,
      hasActiveFilters: Object.values(filters).some((value) => value !== "" && value !== "all"),
    }),
    [quizzes.length, filteredQuizzes.length, filters],
  )

  return {
    filters,
    filteredQuizzes,
    sortBy,
    stats,
    updateFilters,
    setSortBy,
    resetFilters,
  }
}
