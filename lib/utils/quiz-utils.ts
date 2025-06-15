import type { IQuiz, IQuizFilters, DifficultyLevel, QuizSortOption } from "@/lib/types/interfaces"

// Pure utility functions following functional programming principles

export const getDifficultyOrder = (difficulty: DifficultyLevel): number => {
  const orderMap: Record<DifficultyLevel, number> = {
    Beginner: 1,
    Intermediate: 2,
    Advanced: 3,
    "All Levels": 0,
  }
  return orderMap[difficulty] ?? 0
}

export const getDifficultyConfig = (difficulty: DifficultyLevel) => {
  const configs = {
    BEGINNER: {
      label: "Beginner",
      color: "bg-green-100 text-green-800 border-green-200",
      description: "Perfect for newcomers",
    },
    INTERMEDIATE: {
      label: "Intermediate",
      color: "bg-yellow-100 text-yellow-800 border-yellow-200",
      description: "For those with some experience",
    },
    ADVANCED: {
      label: "Advanced",
      color: "bg-red-100 text-red-800 border-red-200",
      description: "For experienced learners",
    },
    "All Levels": {
      label: "All Levels",
      color: "bg-blue-100 text-blue-800 border-blue-200",
      description: "Suitable for everyone",
    },
  }
  return configs[difficulty] ?? configs["BEGINNER"]
}

export const getCategoryConfig = (category: string) => {
  const configs: Record<string, { label: string; color: string; icon: string }> = {
    grammar: {
      label: "Grammar",
      color: "bg-blue-100 text-blue-800 border-blue-200",
      icon: "📝",
    },
    vocabulary: {
      label: "Vocabulary",
      color: "bg-purple-100 text-purple-800 border-purple-200",
      icon: "📚",
    },
    pronunciation: {
      label: "Pronunciation",
      color: "bg-pink-100 text-pink-800 border-pink-200",
      icon: "🗣️",
    },
    listening: {
      label: "Listening",
      color: "bg-indigo-100 text-indigo-800 border-indigo-200",
      icon: "👂",
    },
    reading: {
      label: "Reading",
      color: "bg-cyan-100 text-cyan-800 border-cyan-200",
      icon: "📖",
    },
    writing: {
      label: "Writing",
      color: "bg-orange-100 text-orange-800 border-orange-200",
      icon: "✍️",
    },
    speaking: {
      label: "Speaking",
      color: "bg-green-100 text-green-800 border-green-200",
      icon: "💬",
    },
    business: {
      label: "Business English",
      color: "bg-gray-100 text-gray-800 border-gray-200",
      icon: "💼",
    },
    "test-prep": {
      label: "Test Preparation",
      color: "bg-red-100 text-red-800 border-red-200",
      icon: "🎯",
    },
  }
  return configs[category?.toLowerCase()] ?? configs.grammar
}

export const filterQuizzes = (quizzes: IQuiz[], filters: IQuizFilters): IQuiz[] => {
  return quizzes.filter((quiz) => {
    // Early return pattern for better performance
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      const matchesSearch = [
        quiz.title,
        quiz.description,
        quiz.creator,
        ...(quiz.questions?.map((q) => q.category) ?? []),
      ].some((field) => field.toLowerCase().includes(searchTerm))

      if (!matchesSearch) return false
    }

    if (filters.difficulty !== "all" && quiz.difficulty !== filters.difficulty) {
      return false
    }

    if (filters.category !== "all" && quiz.category !== filters.category) {
      return false
    }

    if (filters.status !== "all" && quiz.status !== filters.status) {
      return false
    }

    return true
  })
}

export const sortQuizzes = (quizzes: IQuiz[], sortBy: QuizSortOption): IQuiz[] => {
  const sorted = [...quizzes]

  switch (sortBy) {
    case "newest":
      return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    case "oldest":
      return sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

    case "popular":
      return sorted.sort((a, b) => (b.participants || 0) - (a.participants || 0))

    case "rating":
      return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0))

    case "title":
      return sorted.sort((a, b) => a.title.localeCompare(b.title))

    default:
      return sorted
  }
}

export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes}m`
  }
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
}

export const formatScore = (score: number): string => {
  return `${Math.round(score)}%`
}

export const formatTimeSpent = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
}

export const calculatePassRate = (attempts: number, passed: number): number => {
  return attempts > 0 ? Math.round((passed / attempts) * 100) : 0
}

export const getScoreColor = (score: number): string => {
  if (score >= 90) return "text-green-600"
  if (score >= 80) return "text-blue-600"
  if (score >= 70) return "text-yellow-600"
  return "text-red-600"
}

export const getScoreGrade = (score: number): string => {
  if (score >= 90) return "Outstanding"
  if (score >= 80) return "Excellent"
  if (score >= 70) return "Good"
  if (score >= 60) return "Fair"
  return "Needs Improvement"
}

export const generateQuizSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

export const validateQuizData = (quiz: Partial<IQuiz>): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []

  if (!quiz.title?.trim()) {
    errors.push("Title is required")
  } else if (quiz.title.length < 3) {
    errors.push("Title must be at least 3 characters long")
  } else if (quiz.title.length > 100) {
    errors.push("Title must be less than 100 characters")
  }

  if (!quiz.description?.trim()) {
    errors.push("Description is required")
  } else if (quiz.description.length < 10) {
    errors.push("Description must be at least 10 characters long")
  } else if (quiz.description.length > 500) {
    errors.push("Description must be less than 500 characters")
  }

  if (!quiz.category) {
    errors.push("Category is required")
  }

  if (!quiz.difficulty) {
    errors.push("Difficulty is required")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}
