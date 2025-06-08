"use client"

import { useState, useMemo, useCallback } from "react"
import type { IQuiz, IQuizFilters, IQuizStats } from "@/lib/types/interfaces"

interface IUseQuizFiltersProps {
  quizzes: IQuiz[]
}

interface IUseQuizFiltersReturn {
  filters: IQuizFilters
  filteredQuizzes: IQuiz[]
  sortBy: string
  stats: IQuizStats
  updateFilters: (newFilters: Partial<IQuizFilters>) => void
  setSortBy: (sortBy: string) => void
  resetFilters: () => void
}

const INITIAL_FILTERS: IQuizFilters = {
  search: "",
  category: "",
  difficulty: "",
  tags: [],
  sortBy: "newest",
}

export function useQuizFilters({ quizzes }: IUseQuizFiltersProps): IUseQuizFiltersReturn {
  const [filters, setFilters] = useState<IQuizFilters>(INITIAL_FILTERS)
  const [sortBy, setSortBy] = useState("newest")

  // Filter quizzes based on current filters with proper null checks
  const filteredQuizzes = useMemo(() => {
    if (!Array.isArray(quizzes) || quizzes.length === 0) {
      return []
    }

    let filtered = [...quizzes]

    // Search filter with null checks
    if (filters.search && filters.search.trim()) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter((quiz) => {
        if (!quiz) return false

        const title = quiz.title?.toLowerCase() || ""
        const description = quiz.description?.toLowerCase() || ""
        const creator = quiz.creator?.toLowerCase() || ""

        return title.includes(searchLower) || description.includes(searchLower) || creator.includes(searchLower)
      })
    }

    // Category filter with null checks
    if (filters.category && filters.category.trim()) {
      filtered = filtered.filter((quiz) => quiz?.category === filters.category)
    }

    // Difficulty filter with null checks
    if (filters.difficulty && filters.difficulty.trim()) {
      filtered = filtered.filter((quiz) => quiz?.difficulty === filters.difficulty)
    }

    // Tags filter with null checks
    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter((quiz) => {
        if (!quiz?.tags || !Array.isArray(quiz.tags)) return false
        return filters.tags.some((tag) => quiz.tags.includes(tag))
      })
    }

    // Sort quizzes with null checks
    switch (sortBy) {
      case "newest":
        filtered.sort((a, b) => {
          const dateA = a?.createdAt ? new Date(a.createdAt).getTime() : 0
          const dateB = b?.createdAt ? new Date(b.createdAt).getTime() : 0
          return dateB - dateA
        })
        break
      case "oldest":
        filtered.sort((a, b) => {
          const dateA = a?.createdAt ? new Date(a.createdAt).getTime() : 0
          const dateB = b?.createdAt ? new Date(b.createdAt).getTime() : 0
          return dateA - dateB
        })
        break
      case "title":
        filtered.sort((a, b) => {
          const titleA = a?.title || ""
          const titleB = b?.title || ""
          return titleA.localeCompare(titleB)
        })
        break
      case "difficulty":
        const difficultyOrder = { Beginner: 1, Intermediate: 2, Advanced: 3 }
        filtered.sort((a, b) => {
          const diffA = difficultyOrder[a?.difficulty as keyof typeof difficultyOrder] || 0
          const diffB = difficultyOrder[b?.difficulty as keyof typeof difficultyOrder] || 0
          return diffA - diffB
        })
        break
      case "rating":
        filtered.sort((a, b) => (b?.rating || 0) - (a?.rating || 0))
        break
      case "popular":
        filtered.sort((a, b) => (b?.participants || 0) - (a?.participants || 0))
        break
      default:
        break
    }

    return filtered
  }, [quizzes, filters, sortBy])

  // Calculate stats with null checks
  const stats = useMemo((): IQuizStats => {
    const hasActiveFilters = Boolean(
      (filters.search && filters.search.trim()) ||
        (filters.category && filters.category.trim()) ||
        (filters.difficulty && filters.difficulty.trim()) ||
        (filters.tags && filters.tags.length > 0),
    )

    return {
      total: Array.isArray(quizzes) ? quizzes.length : 0,
      filtered: Array.isArray(filteredQuizzes) ? filteredQuizzes.length : 0,
      hasActiveFilters,
    }
  }, [quizzes, filteredQuizzes, filters])

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<IQuizFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
  }, [])

  // Reset filters
  const resetFilters = useCallback(() => {
    setFilters(INITIAL_FILTERS)
    setSortBy("newest")
  }, [])

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
