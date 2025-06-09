import { SUCCESS_CODE } from "../constants"
import { httpClient } from "./http-client"
import type { IApiResponse, IAuthResponse, ILoginRequest, IRegisterRequest, IUser } from "@/lib/types/api-types"

const AUTH_TOKEN_KEY = "auth_token"
const REFRESH_TOKEN_KEY = "refresh_token"
const USER_KEY = "current_user"

class AuthService {
  // Token management
  getAccessToken(): string | null {
    if (typeof window === "undefined") return null
    return localStorage.getItem(AUTH_TOKEN_KEY)
  }

  getRefreshToken(): string | null {
    if (typeof window === "undefined") return null
    return localStorage.getItem(REFRESH_TOKEN_KEY)
  }

  getCurrentUser(): IUser | null {
    if (typeof window === "undefined") return null
    const userStr = localStorage.getItem(USER_KEY)
    return userStr ? JSON.parse(userStr) : null
  }

  private setTokens(accessToken: string, refreshToken: string): void {
    if (typeof window === "undefined") return
    localStorage.setItem(AUTH_TOKEN_KEY, accessToken)
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
  }

  private setUser(user: IUser): void {
    if (typeof window === "undefined") return
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  }

  private clearAuth(): void {
    if (typeof window === "undefined") return
    localStorage.removeItem(AUTH_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  }

  // API methods
  async login(credentials: ILoginRequest): Promise<IApiResponse<IAuthResponse>> {
    try {
      console.log("START_LOGIN")
      const result = await httpClient.post<IApiResponse<IAuthResponse>>("/pub/auth/login", credentials)
      console.log(result)
      if (result.meta.code === SUCCESS_CODE && result.data) {
        this.setTokens(result.data.accessToken, result.data.refreshToken)
      }

      console.log("END_LOGIN ", result)

      return result
    } catch (error) {
      console.log("failed to login")
      return {
        meta: {
          code: 400,
          message: error instanceof Error ? error.message : "Login failed",
        }
      }
    }
  }

  async register(userData: IRegisterRequest): Promise<IApiResponse<IAuthResponse>> {
    try {
      return httpClient.post<IApiResponse<IAuthResponse>>("/pub/auth/register", userData)

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Registration failed",
        timestamp: new Date().toISOString(),
      }
    }
  }

  async logout() {
    try {
      // const result = await httpClient.post<IApiResponse<void>>("/auth/logout", {}, true)
      this.clearAuth()
      // return result
    } catch (error) {
      this.clearAuth()
      return {
        success: false,
        error: error instanceof Error ? error.message : "Logout failed",
        timestamp: new Date().toISOString(),
      }
    }
  }

  async getMe(): Promise<IApiResponse<IUser>> {
    try {
      const result = await httpClient.get<IApiResponse<IUser>>("/auth/me", true)
      return result
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get user info",
        timestamp: new Date().toISOString(),
      }
    }
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken()
  }
}

export const authService = new AuthService()
