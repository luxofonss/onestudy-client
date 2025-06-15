// Core interfaces following PascalCase with I prefix
export interface IUser {
  id: string
  name: string
  email: string
  avatar?: string
  level?: string
  points?: number
  streak?: number
  joinedAt: string
}

export interface IQuestion {
  id: string
  type: QuestionType
  text: string
  options?: IQuestionOption[]
  pronunciationText?: string
  fillInBlanks?: IFillInBlanks
  trueFalseAnswer?: boolean
  audioUrl?: string
  imageUrl?: string
  maxListeningTime?: number
  points: number
  difficulty: DifficultyLevel
  category: string
  createdAt: string
  updatedAt: string
}

export interface IQuestionOption {
  text: string
  isCorrect: boolean
}

export interface IFillInBlanks {
  text: string
  blanks: IBlank[]
}

export interface IBlank {
  position: number
  answer: string
}

export interface IQuiz {
  id: string
  title: string
  description: string
  author: {
    name: string
    email: string
  }
  participants: number
  rating: number
  duration: string
  difficulty: DifficultyLevel
  category: string
  isSaved?: boolean
  isPublic: boolean
  createdAt: string
  status?: QuizStatus
  attempts?: number
  passRate?: number
  questions?: IQuestion[]
  tags?: string[]
  // Enhanced quiz settings
  navigationMode?: NavigationMode
  hasTimer?: boolean
  timeLimit?: number
  warningTime?: number
  allowQuestionPicker?: boolean
  shuffleQuestions?: boolean
  shuffleAnswers?: boolean
  showProgress?: boolean
  allowPause?: boolean
  maxAttempts?: number
  passingScore?: number
}

export interface IQuizAttempt {
  id: string
  quizId: string
  userId: string
  score: number
  totalQuestions: number
  timeSpent: number
  completedAt: string
  answers: Record<string, string | string[]>
}

export interface IQuizFilters {
  search: string
  difficulty: string
  category: string
  tags: string[]
  sortBy: string
}

export interface IQuizStats {
  total: number
  filtered: number
  hasActiveFilters: boolean
}

export interface ILeaderboardEntry {
  rank: number
  user: IUser
  score: number
  completionTime: string
  accuracy: number
  attempts: number
  lastAttempt: string
}

// Type unions
export type QuestionType = "MULTIPLE_CHOICE" | "TRUE_FALSE" | "FILL_IN_THE_BLANK" | "essay" | "PRONUNCIATION" | "listening"

export type DifficultyLevel = "Beginner" | "Intermediate" | "Advanced" | "All Levels"

export type QuizStatus = "published" | "draft"

export type NavigationMode = "sequential" | "back-only" | "free-navigation"

export type QuizSortOption = "newest" | "oldest" | "popular" | "rating" | "title"

// API Response interfaces
export interface IApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface IPaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  hasNext: boolean
  hasPrev: boolean
}

// Form interfaces
export interface IQuizFormData {
  name: string
  description: string
  isPublic: boolean
  navigationMode: NavigationMode
  hasTimer: boolean
  timeLimit: number
  warningTime: number
  allowQuestionPicker: boolean
  shuffleQuestions: boolean
  shuffleAnswers: boolean
  showProgress: boolean
  allowPause: boolean
  maxAttempts: number
  passingScore: number
}

export interface IQuestionFormData {
  type: QuestionType
  text: string
  options?: IQuestionOption[]
  pronunciationText?: string
  fillInBlanks?: IFillInBlanks
  trueFalseAnswer?: boolean
  audioUrl?: string
  imageUrl?: string
  maxListeningTime?: number
  points: number
  difficulty: DifficultyLevel
  category: string
}
