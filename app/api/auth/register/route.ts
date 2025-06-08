import { type NextRequest, NextResponse } from "next/server"
import type { IApiResponse, IAuthResponse, IRegisterRequest } from "@/lib/types/api-types"

export async function POST(request: NextRequest) {
  try {
    const body: IRegisterRequest = await request.json()
    const { name, email, password } = body

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1200))

    // Basic validation
    if (!name || !email || !password) {
      const response: IApiResponse<null> = {
        success: false,
        error: "All fields are required",
        timestamp: new Date().toISOString(),
      }
      return NextResponse.json(response, { status: 400 })
    }

    if (password.length < 6) {
      const response: IApiResponse<null> = {
        success: false,
        error: "Password must be at least 6 characters",
        timestamp: new Date().toISOString(),
      }
      return NextResponse.json(response, { status: 400 })
    }

    // Check if user already exists (mock check)
    if (email === "existing@example.com") {
      const response: IApiResponse<null> = {
        success: false,
        error: "User with this email already exists",
        timestamp: new Date().toISOString(),
      }
      return NextResponse.json(response, { status: 409 })
    }

    // Create new user
    const newUser = {
      id: `user_${Date.now()}`,
      name,
      email,
      avatar: "/placeholder.svg?height=40&width=40",
      role: "student" as const,
      level: "Beginner",
      points: 0,
      streak: 0,
      joinedAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      isActive: true,
    }

    // Generate mock tokens
    const accessToken = `mock_access_token_${newUser.id}_${Date.now()}`
    const refreshToken = `mock_refresh_token_${newUser.id}_${Date.now()}`

    const authResponse: IAuthResponse = {
      user: newUser,
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: 3600,
      },
    }

    const response: IApiResponse<IAuthResponse> = {
      success: true,
      data: authResponse,
      message: "Registration successful",
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    const response: IApiResponse<null> = {
      success: false,
      error: "Internal server error",
      timestamp: new Date().toISOString(),
    }
    return NextResponse.json(response, { status: 500 })
  }
}
