import { apiClient } from "./api-client"
import type { IApiResponse, IPaginatedResponse, IUser, IUserStats } from "@/lib/types/api-types"

class UserService {
  private endpoint = "/users"

  async getUsers(filters?: {
    search?: string
    role?: string
    isActive?: boolean
    page?: number
    limit?: number
  }): Promise<IApiResponse<IPaginatedResponse<IUser>>> {
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

    return apiClient.get<IPaginatedResponse<IUser>>(url)
  }

  async getUserById(id: string): Promise<IApiResponse<IUser>> {
    return apiClient.get<IUser>(`${this.endpoint}/${id}`)
  }

  async updateUser(id: string, user: Partial<IUser>): Promise<IApiResponse<IUser>> {
    return apiClient.put<IUser>(`${this.endpoint}/${id}`, user)
  }

  async deleteUser(id: string): Promise<IApiResponse<void>> {
    return apiClient.delete<void>(`${this.endpoint}/${id}`)
  }

  async getUserStats(id: string): Promise<IApiResponse<IUserStats>> {
    return apiClient.get<IUserStats>(`${this.endpoint}/${id}/stats`)
  }

  async updateProfile(data: Partial<IUser>): Promise<IApiResponse<IUser>> {
    return apiClient.put<IUser>(`${this.endpoint}/profile`, data)
  }

  async changePassword(data: { currentPassword: string; newPassword: string }): Promise<IApiResponse<void>> {
    return apiClient.post<void>(`${this.endpoint}/change-password`, data)
  }

  async uploadAvatar(file: File): Promise<IApiResponse<{ avatarUrl: string }>> {
    const formData = new FormData()
    formData.append("avatar", file)

    return apiClient.post<{ avatarUrl: string }>(`${this.endpoint}/avatar`, formData)
  }
}

export const userService = new UserService()
