// Main API service that combines all services
import { authService } from "./auth-service"
import { quizService } from "./quiz-service"
import type {
  IApiResponse,
  IPaginatedResponse,
  IQuiz,
  IQuestion,
  IUser,
  IQuizAttempt,
  IQuizFilters,
  ILoginRequest,
  IRegisterRequest,
  IAuthResponse,
  IQuizAttemptAnswer,
} from "@/lib/types/api-types"

class ApiService {
  // Auth methods
  async login(credentials: ILoginRequest): Promise<IApiResponse<IAuthResponse>> {
    return authService.login(credentials)
  }

  async register(userData: IRegisterRequest): Promise<IApiResponse<IAuthResponse>> {
    return authService.register(userData)
  }

  async logout(): Promise<IApiResponse<void>> {
    return authService.logout()
  }

  async getCurrentUser(): Promise<IApiResponse<IUser>> {
    return authService.getMe()
  }

  isAuthenticated(): boolean {
    return authService.isAuthenticated()
  }

  // Quiz methods
  async getQuizzes(filters?: IQuizFilters): Promise<IApiResponse<IPaginatedResponse<IQuiz>>> {
    return quizService.getQuizzes(filters)
  }

  async getMyQuizzes(filters?: IQuizFilters): Promise<IApiResponse<IPaginatedResponse<IQuiz>>> {
    return quizService.getMyQuizzes(filters)
  }

  async getQuizById(id: string): Promise<IApiResponse<IQuiz>> {
    return quizService.getQuizById(id)
  }

  async createQuiz(quiz: Partial<IQuiz>): Promise<IApiResponse<IQuiz>> {
    return quizService.createQuiz(quiz)
  }

  async updateQuiz(quiz: IQuiz): Promise<IApiResponse<IQuiz>> {
    return quizService.updateQuiz(quiz)
  }

  async deleteQuiz(id: string): Promise<IApiResponse<void>> {
    return quizService.deleteQuiz(id)
  }

  // Quiz attempt methods
  async startQuizAttempt(quizId: string): Promise<IApiResponse<IQuizAttempt>> {
    return quizService.startQuizAttempt(quizId)
  }

  async submitQuizAttemptQuestion(attemptId: string, answer: IQuizAttemptAnswer): Promise<IApiResponse<any>> {
    return quizService.submitQuizAttemptQuestion(attemptId, answer)
  }

  async getQuizAttempt(attemptId: string): Promise<IApiResponse<IQuizAttempt>> {
    return quizService.getQuizAttempt(attemptId)
  }

  async getMyQuizAttempts(): Promise<IApiResponse<IQuizAttempt[]>> {
    return quizService.getMyQuizAttempts()
  }

  // Legacy methods for backward compatibility
  async getQuestions(): Promise<IApiResponse<IQuestion[]>> {
    // This would need to be implemented based on your API
    return {
      success: false,
      error: "Not implemented",
      timestamp: new Date().toISOString(),
    }
  }

  async createQuestion(question: Partial<IQuestion>): Promise<IApiResponse<IQuestion>> {
    // This would need to be implemented based on your API
    return {
      success: false,
      error: "Not implemented",
      timestamp: new Date().toISOString(),
    }
  }

  async getQuizAttempts(quizId: string): Promise<IApiResponse<IQuizAttempt[]>> {
    // This would need to be implemented based on your API
    return {
      success: false,
      error: "Not implemented",
      timestamp: new Date().toISOString(),
    }
  }
}

// Factory function
export const createApiService = (): ApiService => {
  return new ApiService()
}

// Default instance
export const apiService = createApiService()
