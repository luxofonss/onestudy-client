import { apiClient } from "./api-client"
import type { IApiResponse, IPaginatedResponse, IQuestion } from "@/lib/types/api-types"

class QuestionService {
  private endpoint = "/questions"

  async getQuestions(filters?: {
    search?: string
    category?: string
    difficulty?: string
    type?: string
    page?: number
    limit?: number
  }): Promise<IApiResponse<IPaginatedResponse<IQuestion>>> {
    const params = new URLSearchParams()

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, String(value))
        }
      })
    }

    const queryString = params.toString()
    const url = `${this.endpoint}${queryString ? `?${queryString}` : ""}`

    return apiClient.get<IPaginatedResponse<IQuestion>>(url)
  }

  async getQuestionById(id: string): Promise<IApiResponse<IQuestion>> {
    return apiClient.get<IQuestion>(`${this.endpoint}/${id}`)
  }

  async createQuestion(question: Partial<IQuestion>): Promise<IApiResponse<IQuestion>> {
    return apiClient.post<IQuestion>(this.endpoint, question)
  }

  async updateQuestion(id: string, question: Partial<IQuestion>): Promise<IApiResponse<IQuestion>> {
    return apiClient.put<IQuestion>(`${this.endpoint}/${id}`, question)
  }

  async deleteQuestion(id: string): Promise<IApiResponse<void>> {
    return apiClient.delete<void>(`${this.endpoint}/${id}`)
  }

  async getQuestionsByQuiz(quizId: string): Promise<IApiResponse<IQuestion[]>> {
    return apiClient.get<IQuestion[]>(`/quizzes/${quizId}/questions`)
  }

  async addQuestionToQuiz(quizId: string, questionId: string): Promise<IApiResponse<void>> {
    return apiClient.post<void>(`/quizzes/${quizId}/questions/${questionId}`)
  }

  async removeQuestionFromQuiz(quizId: string, questionId: string): Promise<IApiResponse<void>> {
    return apiClient.delete<void>(`/quizzes/${quizId}/questions/${questionId}`)
  }
}

export const questionService = new QuestionService()
