import { type NextRequest, NextResponse } from "next/server"
import type { IApiResponse, IUser } from "@/lib/types/api-types"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    const token = authHeader?.replace("Bearer ", "")

    if (!token) {
      const response: IApiResponse<null> = {
        success: false,
        error: "No token provided",
        timestamp: new Date().toISOString(),
      }
      return NextResponse.json(response, { status: 401 })
    }

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    // Extract user ID from token (mock implementation)
    const userId = token.split("_")[3] // Extract from mock token format

    // Mock user data
    const user: IUser = {
      id: userId || "user_1",
      name: "John Doe",
      email: "john@example.com",
      avatar: "/placeholder.svg?height=40&width=40",
      role: "student",
      level: "Intermediate",
      points: 1250,
      streak: 7,
      joinedAt: "2024-01-15T10:00:00Z",
      lastLoginAt: new Date().toISOString(),
      isActive: true,
    }

    const response: IApiResponse<IUser> = {
      success: true,
      data: user,
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
