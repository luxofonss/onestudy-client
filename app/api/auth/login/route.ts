import { type NextRequest, NextResponse } from "next/server"
import type { IApiResponse, IAuthResponse, ILoginRequest } from "@/lib/types/api-types"

// Mock user database
const MOCK_USERS = [
  {
    id: "user_1",
    name: "John Doe",
    email: "john@example.com",
    password: "password123", // In real app, this would be hashed
    avatar: "/placeholder.svg?height=40&width=40",
    role: "student" as const,
    level: "Intermediate",
    points: 1250,
    streak: 7,
    joinedAt: "2024-01-15T10:00:00Z",
    lastLoginAt: "2024-01-20T14:30:00Z",
    isActive: true,
  },
  {
    id: "user_2",
    name: "Jane Smith",
    email: "jane@example.com",
    password: "password123",
    avatar: "/placeholder.svg?height=40&width=40",
    role: "teacher" as const,
    level: "Advanced",
    points: 2500,
    streak: 15,
    joinedAt: "2024-01-10T09:00:00Z",
    lastLoginAt: "2024-01-20T16:45:00Z",
    isActive: true,
  },
]

export async function POST(request: NextRequest) {
  try {
    const body: ILoginRequest = await request.json()
    const { email, password } = body

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Find user
    const user = MOCK_USERS.find((u) => u.email === email && u.password === password)

    if (!user) {
      const response: IApiResponse<null> = {
        success: false,
        error: "Invalid email or password",
        timestamp: new Date().toISOString(),
      }
      return NextResponse.json(response, { status: 401 })
    }

    // Generate mock tokens
    const accessToken = `mock_access_token_${user.id}_${Date.now()}`
    const refreshToken = `mock_refresh_token_${user.id}_${Date.now()}`

    const authResponse: IAuthResponse = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        level: user.level,
        points: user.points,
        streak: user.streak,
        joinedAt: user.joinedAt,
        lastLoginAt: new Date().toISOString(),
        isActive: user.isActive,
      },
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: 3600, // 1 hour
      },
    }

    const response: IApiResponse<IAuthResponse> = {
      success: true,
      data: authResponse,
      message: "Login successful",
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json(response)
  } catch (error) {
    const response: IApiResponse<null> = {
      success: false,
      error: "Internal server error",
      timestamp: new Date().toISOString(),
    }
    return NextResponse.json(response, { status: 500 })
  }
}
