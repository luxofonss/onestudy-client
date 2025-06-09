// HTTP Client with interceptors and token management
export class HttpClient {
  private baseURL: string
  private defaultHeaders: HeadersInit

  constructor(baseURL = process.env.NEXT_PUBLIC_SERVER_URL) {
    this.baseURL = baseURL
    this.defaultHeaders = {
      "Content-Type": "application/json",
    }
  }

  private getAuthHeaders(): HeadersInit {
    const token = this.getAccessToken()
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  private getAccessToken(): string | null {
    if (typeof window === "undefined") return null
    return localStorage.getItem("auth_token")
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      if (response.status === 401) {
        // Token expired, try to refresh
        const refreshed = await this.refreshToken()
        if (!refreshed) {
          this.clearTokens()
          // throw new Error("Authentication failed")
        }
        // throw new Error("Token refreshed, retry request")
      }
      // throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    return data
  }

  private async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = localStorage.getItem("refresh_token")
      if (!refreshToken) return false

      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: "POST",
        headers: this.defaultHeaders,
        body: JSON.stringify({ refreshToken }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data?.tokens) {
          localStorage.setItem("auth_token", data.data.tokens.accessToken)
          localStorage.setItem("refresh_token", data.data.tokens.refreshToken)
          return true
        }
      }
      return false
    } catch {
      return false
    }
  }

  private clearTokens(): void {
    if (typeof window === "undefined") return
    localStorage.removeItem("auth_token")
    localStorage.removeItem("refresh_token")
    localStorage.removeItem("current_user")
  }

  async request<T>(endpoint: string, options: RequestInit = {}, requireAuth = false, retryCount = 0): Promise<T> {
    const url = `${this.baseURL}${endpoint}`

    // Only set Content-Type if not FormData
    const headers = {
      ...(options.body instanceof FormData ? {} : this.defaultHeaders),
      ...(requireAuth ? this.getAuthHeaders() : {}),
      ...options.headers,
    }

    const config: RequestInit = {
      ...options,
      headers,
    }

    try {
      const response = await fetch(url, config)
      return await this.handleResponse<T>(response)
    } catch (error) {
      // Retry once if token was refreshed
      if (error instanceof Error && error.message.includes("Token refreshed") && retryCount === 0) {
        return this.request<T>(endpoint, options, requireAuth, retryCount + 1)
      }
      throw error
    }
  }

  async get<T>(endpoint: string, requireAuth = false): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" }, requireAuth)
  }

  async post<T>(endpoint: string, data?: any, requireAuth = false): Promise<T> {
    let body: BodyInit | undefined;

    if (data instanceof FormData) {
      body = data;
    } else if (data !== undefined) {
      body = JSON.stringify(data);
    }

    return this.request<T>(
      endpoint,
      {
        method: "POST",
        body: body,
      },
      requireAuth,
    );
  }


  async put<T>(endpoint: string, data?: any, requireAuth = false): Promise<T> {
    return this.request<T>(
      endpoint,
      {
        method: "PUT",
        body: data ? JSON.stringify(data) : undefined,
      },
      requireAuth,
    )
  }

  async delete<T>(endpoint: string, requireAuth = false): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" }, requireAuth)
  }
}

export const httpClient = new HttpClient()
