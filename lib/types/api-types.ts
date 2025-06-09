import { Stringifier } from "postcss"

// API Request/Response Types
export interface IApiResponse<T = any> {
  meta: {
    code: number
    message: string
    requestId: string
  }
  data?: T
}

export interface IPaginatedResponse<T> {
  items: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}


export interface ILoginRequest {
  username: string
  password: string
}

export interface IRegisterRequest {
  name: string
  email: string
  password: string
  username: string
}

export interface IAuthResponse {
  accessToken: string
  refreshToken: string
}

export interface IUser {
  id: string
  name: string
  email: string
  username: string
  avatar?: string
  role: "student" | "teacher" | "admin"
  level: string
  points: number
  streak: number
  joinedAt: string
  lastLoginAt: string
  isActive: boolean
}

export interface IQuestionOption {
  text: string
  isCorrect: boolean
}

export interface IQuestion {
  id?: string
  quizId?: string
  type: "MULTIPLE_CHOICE" | "TRUE_FALSE" | "FILL_IN_BLANK" | "ESSAY" | "PRONUNCIATION" | "LISTENING"
  text: string
  options?: IQuestionOption[]
  pronunciationText?: string | null
  fillInBlanks?: string[] | null
  trueFalseAnswer?: boolean | null
  audioUrl?: string | null
  imageUrl?: string | null
  maxListeningTime?: number | null
  correctAnswer: string[]
  explanation?: string | null
  points: number
  timeLimit?: number | null
  difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED"
  category: string
  createdAt?: string
  updatedAt?: string
  quiz?: any
}

export interface IQuiz {
  id?: string
  title: string
  description: string
  category?: string | null
  difficulty?: string | null
  duration?: number | null
  questionCount: number
  tags: string[]
  isPublic: boolean
  createdAt?: string
  updatedAt?: string
  authorId?: string
  author?: IUser | null
  rating: number
  attempts: number
  passingScore: number
  navigationMode: "FREE_NAVIGATION" | "SEQUENTIAL" | "BACK_ONLY"
  hasTimer: boolean
  timeLimit: number
  warningTime: number
  allowQuestionPicker: boolean
  shuffleQuestions: boolean
  shuffleAnswers: boolean
  showProgress: boolean
  allowPause: boolean
  maxAttempts: number
  questions: IQuestion[]
  quizAttempts?: any
  savedByUsers?: any
  leaderboardEntries?: any
}

export interface IQuizAttemptAnswer {
  questionId: string
  selectedAnswers?: {
    id: string
    text: string
    isCorrect: boolean
  }[] | string[]
  fillInBlanksAnswers?: string[]
  answerText?: string | null
  userAnswerTrueFalse?: boolean | null
  timeTaken?: number | null
  audioUrl?: string | null
  wordAnalysis?: {
    word: string
    pronunciation: string
    meaning: string
    example: string
    synonyms: string[]
    antonyms: string[]
  } | null
}

export interface IQuizAttempt {
  id: string
  quizId: string
  userId: string
  score: number
  totalQuestions: number
  correctAnswers: number
  timeSpent: number
  completedAt: string
  answers: IQuizAttemptAnswer[]
  passed: boolean
  quiz: IQuiz
}

export interface IQuizFilters {
  search?: string
  category?: string
  difficulty?: string
  tags?: string[]
  authorId?: string
  isPublic?: boolean
  page?: number
  limit?: number
  sortBy?: "newest" | "oldest" | "popular" | "rating" | "title"
  sortOrder?: "asc" | "desc"
}

export interface IUserStats {
  totalQuizzes: number
  averageScore: number
  totalTime: number
  streak: number
  contentCreated: number
  totalLearners: number
  averageRating: number
  hoursLearned: number
}

export interface ILeaderboardEntry {
  rank: number
  user: IUser
  score: number
  completionTime: number
  accuracy: number
  attempts: number
  lastAttempt: string
}
