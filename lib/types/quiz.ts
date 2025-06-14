export interface Quiz {
  id: string
  title: string
  description: string
  creator: string
  participants: number
  rating: number
  duration: string
  difficulty: "Beginner" | "Intermediate" | "Advanced" | "All Levels"
  category: string
  isSaved?: boolean
  isPublic: boolean
  createdAt: string
  status?: "published" | "draft"
  attempts?: number
  passRate?: number
}

export interface Question {
  id: string
  type: "multiple-choice" | "listening" | "fill-blank" | "essay"
  question: string
  options?: string[]
  correctAnswer: string | string[]
  explanation?: string
  points: number
}

export interface QuizAttempt {
  id: string
  quizId: string
  userId: string
  score: number
  totalQuestions: number
  timeSpent: number
  completedAt: string
  answers: Record<string, string | string[]>
}

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  level: string
  points: number
  streak: number
  joinedAt: string
}

export interface QuizFilters {
  search: string
  difficulty: string
  category: string
  status: string
}

export type QuizSortOption = "newest" | "oldest" | "popular" | "rating" | "title"
