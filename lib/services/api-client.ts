import { authService } from "./auth-service"
import type { IApiResponse } from "@/lib/types/api-types"

class ApiClient {
  private baseUrl = process.env.NEXT_PUBLIC_SERVER_URL

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<IApiResponse<T>> {
    try {
      const token = authService.getAccessToken()
      const url = `${this.baseUrl}${endpoint}`

      const config: RequestInit = {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options.headers,
        },
        ...options,
      }

      const response = await fetch(url, config)
      const result: IApiResponse<T> = await response.json()

      // Handle token expiration
      if (response.status === 401 && token) {
        const refreshResult = await authService.refreshToken()
        if (refreshResult.success) {
          // Retry the original request with new token
          const newToken = authService.getAccessToken()
          const retryConfig: RequestInit = {
            ...config,
            headers: {
              ...config.headers,
              Authorization: `Bearer ${newToken}`,
            },
          }
          const retryResponse = await fetch(url, retryConfig)
          return await retryResponse.json()
        } else {
          // Refresh failed, redirect to login
          window.location.href = "/auth"
        }
      }

      return result
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Network error",
        timestamp: new Date().toISOString(),
      }
    }
  }

  async get<T>(endpoint: string): Promise<IApiResponse<T>> {
    return this.request<T>(endpoint, { method: "GET" })
  }

  async post<T>(endpoint: string, data?: any): Promise<IApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T>(endpoint: string, data?: any): Promise<IApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async patch<T>(endpoint: string, data?: any): Promise<IApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T>(endpoint: string): Promise<IApiResponse<T>> {
    return this.request<T>(endpoint, { method: "DELETE" })
  }
}

export const apiClient = new ApiClient()
