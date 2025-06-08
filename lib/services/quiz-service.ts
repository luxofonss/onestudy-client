import { httpClient } from "./http-client"
import type {
  IApiResponse,
  IPaginatedResponse,
  IQuiz,
  IQuizFilters,
  IQuizAttempt,
  IQuizAttemptAnswer,
} from "@/lib/types/api-types"

interface IQuizWithAttempts {
  id: string
  title: string
  description: string
  category: string | null
  difficulty: string | null
  duration: number | null
  questionCount: number
  tags: string[]
  status: string | null
  createdAt: string | null
  updatedAt: string | null
  deletedAt: string | null
  authorId: string
  author: null
  rating: number
  attempts: number
  passingScore: number
  navigationMode: string
  hasTimer: boolean
  timeLimit: number
  warningTime: number
  allowQuestionPicker: boolean
  shuffleQuestions: boolean
  shuffleAnswers: boolean
  showProgress: boolean
  allowPause: boolean
  maxAttempts: number
  questions: null
  quizAttempts: IQuizAttempt[]
  savedByUsers: null
  leaderboardEntries: null
}

interface ISavedQuiz {
  userId: string
  quizId: string
  user: {
    id: string
    username: string
    name: string
    email: string
    avatar: string | null
    joinedAt: string
    lastLoginAt: string | null
    isActive: boolean
    role: string
    credentials: null
    createdQuizzes: null
    quizAttempts: null
    savedQuizzes: null
    leaderboardEntries: null
  }
  quiz: null
  savedAt: string
  deletedAt: string | null
}

interface IQuizStats {
  id: string
  title: string
  description: string
  category: string | null
  difficulty: string | null
  duration: number | null
  questionCount: number
  tags: string[]
  status: string | null
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  authorId: string
  author: null
  rating: number
  attempts: number
  passingScore: number
  navigationMode: string
  hasTimer: boolean
  timeLimit: number
  warningTime: number
  allowQuestionPicker: boolean
  shuffleQuestions: boolean
  shuffleAnswers: boolean
  showProgress: boolean
  allowPause: boolean
  maxAttempts: number
  questions: Array<{
    id: string
    quizId: string
    type: string
    text: string
    options: Array<{
      id: string
      isCorrect: boolean
      text: string
    }> | null
    pronunciationText: string | null
    correctBlanks: string | null
    trueFalseAnswer: boolean | null
    audioUrl: string | null
    imageUrl: string | null
    maxListeningTime: number | null
    correctAnswer: string[]
    explanation: string
    points: number
    timeLimit: number | null
    difficulty: string
    category: string
    createdAt: string
    updatedAt: string
    deletedAt: string | null
    quiz: null
  }>
  quizAttempts: Array<{
    id: string
    quizId: string
    userId: string
    quiz: null
    user: {
      id: string
      username: string
      name: string
      email: string
      avatar: string | null
      joinedAt: string
      lastLoginAt: string | null
      isActive: boolean
      role: string
      credentials: null
      createdQuizzes: null
      quizAttempts: null
      savedQuizzes: null
      leaderboardEntries: null
    }
    answers: null
    score: number
    totalQuestions: number | null
    correctAnswers: number
    timeSpent: number
    completedAt: string | null
    passed: boolean
    deletedAt: string | null
    createdAt: string
  }>
  savedByUsers: Array<{
    id: string
    username: string
    name: string
    email: string
    avatar: string | null
    joinedAt: string
    lastLoginAt: string | null
    isActive: boolean
    role: string
    credentials: null
    createdQuizzes: null
    quizAttempts: null
    savedQuizzes: null
    leaderboardEntries: null
  }> | null
  leaderboardEntries: null
}

class QuizService {
  // Quiz CRUD operations
  async getQuizzes(filters?: IQuizFilters): Promise<IApiResponse<IPaginatedResponse<IQuiz>>> {
    try {
      const params = new URLSearchParams()

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "all") {
            if (Array.isArray(value)) {
              value.forEach((v) => params.append(key, v))
            } else {
              params.append(key, String(value))
            }
          }
        })
      }

      const queryString = params.toString()
      const endpoint = `/pub/quizzes${queryString ? `?${queryString}` : ""}`

      return await httpClient.get<IApiResponse<IPaginatedResponse<IQuiz>>>(endpoint)
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch quizzes",
        timestamp: new Date().toISOString(),
      }
    }
  }

  async getMyQuizzes(): Promise<IApiResponse<IPaginatedResponse<IQuiz>>> {
    try {
      return await httpClient.get<IApiResponse<IPaginatedResponse<IQuiz>>>(`/quizzes/my`, true)
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch my quizzes",
        timestamp: new Date().toISOString(),
      }
    }
  }

  async getQuizById(id: string): Promise<IApiResponse<IQuiz>> {
    try {
      return await httpClient.get<IApiResponse<IQuiz>>(`/quizzes/${id}`, true)
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch quiz",
        timestamp: new Date().toISOString(),
      }
    }
  }

  async createQuiz(quiz: Partial<IQuiz>): Promise<IApiResponse<IQuiz>> {
    try {
      return await httpClient.post<IApiResponse<IQuiz>>("/quizzes", quiz, true)
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create quiz",
        timestamp: new Date().toISOString(),
      }
    }
  }

  async updateQuiz(quiz: IQuiz): Promise<IApiResponse<IQuiz>> {
    try {
      return await httpClient.put<IApiResponse<IQuiz>>("/quizzes", quiz, true)
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update quiz",
        timestamp: new Date().toISOString(),
      }
    }
  }

  async deleteQuiz(id: string): Promise<IApiResponse<void>> {
    try {
      return await httpClient.delete<IApiResponse<void>>(`/quizzes/${id}`, true)
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to delete quiz",
        timestamp: new Date().toISOString(),
      }
    }
  }

  // Quiz attempt operations
  async startQuizAttempt(quizId: string): Promise<IApiResponse<IQuizAttempt>> {
    try {
      return await httpClient.post<IApiResponse<IQuizAttempt>>(`/quizzes/${quizId}/attempts`, {}, true)
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to submit quiz attempt",
        timestamp: new Date().toISOString(),
      }
    }
  }

  async submitQuizAttemptQuestion(attemptId: string, answer: IQuizAttemptAnswer): Promise<IApiResponse<any>> {
    try {
      return await httpClient.post<IApiResponse<any>>(`/quizzes/attempts/${attemptId}/submit-question`, answer, true)
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to submit question answer",
        timestamp: new Date().toISOString(),
      }
    }
  }

  async submitQuizComplete(attemptId: string, answer: IQuizAttemptAnswer): Promise<IApiResponse<any>> {
    try {
      return await httpClient.post<IApiResponse<any>>(`/quizzes/attempts/${attemptId}/submit-question`, answer, true)
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to submit question answer",
        timestamp: new Date().toISOString(),
      }
    }
  }

  async completeQuizAttempt(attemptId: string): Promise<IApiResponse<any>> {
    try {
      return await httpClient.post<IApiResponse<any>>(`/quizzes/attempts/${attemptId}/complete`, {}, true)
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to complete quiz attempt",
        timestamp: new Date().toISOString(),
      }
    }
  }

  async getQuizAttempt(attemptId: string): Promise<IApiResponse<IQuizAttempt>> {
    try {
      return await httpClient.get<IApiResponse<IQuizAttempt>>(`/quizzes/attempts/${attemptId}`, true)
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch quiz attempt",
        timestamp: new Date().toISOString(),
      }
    }
  }

  async getMyQuizAttempts(): Promise<IApiResponse<IQuizWithAttempts[]>> {
    try {
      return await httpClient.get<IApiResponse<IQuizWithAttempts[]>>("/quizzes/attempts", true)
    } catch (error) {
      return {
        meta: {
          code: 500000,
          message: error instanceof Error ? error.message : "Failed to fetch my quiz attempts",
          requestId: null,
        },
        data: [],
      }
    }
  }

  // Quiz save operations
  async saveQuiz(quizId: string): Promise<IApiResponse<void>> {
    try {
      return await httpClient.post<IApiResponse<void>>(`/quizzes/${quizId}/save`, {}, true)
    } catch (error) {
      return {
        meta: {
          code: 500000,
          message: error instanceof Error ? error.message : "Failed to save quiz",
          requestId: null,
        },
      }
    }
  }

  async unsaveQuiz(quizId: string): Promise<IApiResponse<void>> {
    try {
      return await httpClient.delete<IApiResponse<void>>(`/quizzes/${quizId}/save`, true)
    } catch (error) {
      return {
        meta: {
          code: 500000,
          message: error instanceof Error ? error.message : "Failed to unsave quiz",
          requestId: null,
        },
      }
    }
  }

  async getQuizSavedUsers(quizId: string): Promise<IApiResponse<ISavedQuiz[]>> {
    try {
      return await httpClient.get<IApiResponse<ISavedQuiz[]>>(`/quizzes/${quizId}/save`, true)
    } catch (error) {
      return {
        meta: {
          code: 500000,
          message: error instanceof Error ? error.message : "Failed to fetch quiz saved users",
          requestId: null,
        },
        data: [],
      }
    }
  }

  async getMySavedQuizzes(): Promise<IApiResponse<IQuiz[]>> {
    try {
      return await httpClient.get<IApiResponse<IQuiz[]>>("/quizzes/save", true)
    } catch (error) {
      return {
        meta: {
          code: 500000,
          message: error instanceof Error ? error.message : "Failed to fetch my saved quizzes",
          requestId: null,
        },
        data: [],
      }
    }
  }

  // New API endpoint for quiz statistics
  async getQuizStats(quizId: string): Promise<IApiResponse<IQuizStats>> {
    try {
      return await httpClient.get<IApiResponse<IQuizStats>>(`/quizzes/${quizId}/stats`, true)
    } catch (error) {
      return {
        meta: {
          code: 500000,
          message: error instanceof Error ? error.message : "Failed to fetch quiz statistics",
          requestId: null,
        },
        data: null,
      }
    }
  }
}

export const quizService = new QuizService()
