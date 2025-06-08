import { type NextRequest, NextResponse } from "next/server"
import type { IApiResponse, IPaginatedResponse, IQuiz, IQuizFilters } from "@/lib/types/api-types"

// Mock quiz data
const MOCK_QUIZZES: IQuiz[] = [
  {
    id: "quiz_1",
    title: "English Grammar Basics",
    description: "Test your knowledge of fundamental English grammar rules",
    category: "Grammar",
    difficulty: "Beginner",
    duration: 15,
    questionCount: 10,
    tags: ["grammar", "basics", "english"],
    isPublic: true,
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
    authorId: "user_2",
    author: {
      id: "user_2",
      name: "Jane Smith",
      email: "jane@example.com",
      role: "teacher",
      level: "Advanced",
      points: 2500,
      streak: 15,
      joinedAt: "2024-01-10T09:00:00Z",
      lastLoginAt: "2024-01-20T16:45:00Z",
      isActive: true,
    },
    rating: 4.5,
    attempts: 150,
    passingScore: 70,
    questions: [],
    navigationMode: "free-navigation",
    hasTimer: true,
    timeLimit: 15,
    warningTime: 5,
    allowQuestionPicker: true,
    shuffleQuestions: false,
    shuffleAnswers: true,
    showProgress: true,
    allowPause: true,
    maxAttempts: 3,
  },
  {
    id: "quiz_2",
    title: "Advanced Vocabulary Challenge",
    description: "Expand your vocabulary with challenging words and phrases",
    category: "Vocabulary",
    difficulty: "Advanced",
    duration: 25,
    questionCount: 20,
    tags: ["vocabulary", "advanced", "challenge"],
    isPublic: true,
    createdAt: "2024-01-16T14:30:00Z",
    updatedAt: "2024-01-16T14:30:00Z",
    authorId: "user_2",
    author: {
      id: "user_2",
      name: "Jane Smith",
      email: "jane@example.com",
      role: "teacher",
      level: "Advanced",
      points: 2500,
      streak: 15,
      joinedAt: "2024-01-10T09:00:00Z",
      lastLoginAt: "2024-01-20T16:45:00Z",
      isActive: true,
    },
    rating: 4.8,
    attempts: 89,
    passingScore: 80,
    questions: [],
    navigationMode: "sequential",
    hasTimer: true,
    timeLimit: 25,
    warningTime: 5,
    allowQuestionPicker: false,
    shuffleQuestions: true,
    shuffleAnswers: true,
    showProgress: true,
    allowPause: false,
    maxAttempts: 2,
  },
  {
    id: "quiz_3",
    title: "Business English Essentials",
    description: "Master professional English communication skills",
    category: "Business",
    difficulty: "Intermediate",
    duration: 20,
    questionCount: 15,
    tags: ["business", "professional", "communication"],
    isPublic: true,
    createdAt: "2024-01-17T09:15:00Z",
    updatedAt: "2024-01-17T09:15:00Z",
    authorId: "user_2",
    author: {
      id: "user_2",
      name: "Jane Smith",
      email: "jane@example.com",
      role: "teacher",
      level: "Advanced",
      points: 2500,
      streak: 15,
      joinedAt: "2024-01-10T09:00:00Z",
      lastLoginAt: "2024-01-20T16:45:00Z",
      isActive: true,
    },
    rating: 4.3,
    attempts: 203,
    passingScore: 75,
    questions: [],
    navigationMode: "back-only",
    hasTimer: false,
    timeLimit: 0,
    warningTime: 0,
    allowQuestionPicker: true,
    shuffleQuestions: false,
    shuffleAnswers: false,
    showProgress: true,
    allowPause: true,
    maxAttempts: 5,
  },
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Parse filters
    const filters: IQuizFilters = {
      search: searchParams.get("search") || undefined,
      category: searchParams.get("category") || undefined,
      difficulty: searchParams.get("difficulty") || undefined,
      tags: searchParams.getAll("tags"),
      authorId: searchParams.get("authorId") || undefined,
      isPublic: searchParams.get("isPublic") ? searchParams.get("isPublic") === "true" : undefined,
      page: Number.parseInt(searchParams.get("page") || "1"),
      limit: Number.parseInt(searchParams.get("limit") || "10"),
      sortBy: (searchParams.get("sortBy") as any) || "newest",
      sortOrder: (searchParams.get("sortOrder") as any) || "desc",
    }

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800))

    // Filter quizzes
    let filteredQuizzes = [...MOCK_QUIZZES]

    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filteredQuizzes = filteredQuizzes.filter(
        (quiz) =>
          quiz.title.toLowerCase().includes(searchLower) ||
          quiz.description.toLowerCase().includes(searchLower) ||
          quiz.tags.some((tag) => tag.toLowerCase().includes(searchLower)),
      )
    }

    if (filters.category && filters.category !== "all") {
      filteredQuizzes = filteredQuizzes.filter((quiz) => quiz.category === filters.category)
    }

    if (filters.difficulty && filters.difficulty !== "all") {
      filteredQuizzes = filteredQuizzes.filter((quiz) => quiz.difficulty === filters.difficulty)
    }

    if (filters.isPublic !== undefined) {
      filteredQuizzes = filteredQuizzes.filter((quiz) => quiz.isPublic === filters.isPublic)
    }

    if (filters.authorId) {
      filteredQuizzes = filteredQuizzes.filter((quiz) => quiz.authorId === filters.authorId)
    }

    // Sort quizzes
    filteredQuizzes.sort((a, b) => {
      switch (filters.sortBy) {
        case "title":
          return filters.sortOrder === "asc" ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title)
        case "rating":
          return filters.sortOrder === "asc" ? a.rating - b.rating : b.rating - a.rating
        case "popular":
          return filters.sortOrder === "asc" ? a.attempts - b.attempts : b.attempts - a.attempts
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case "newest":
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
    })

    // Paginate
    const page = filters.page || 1
    const limit = filters.limit || 10
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedQuizzes = filteredQuizzes.slice(startIndex, endIndex)

    const paginatedResponse: IPaginatedResponse<IQuiz> = {
      items: paginatedQuizzes,
      pagination: {
        page,
        limit,
        total: filteredQuizzes.length,
        totalPages: Math.ceil(filteredQuizzes.length / limit),
        hasNext: endIndex < filteredQuizzes.length,
        hasPrev: page > 1,
      },
    }

    const response: IApiResponse<IPaginatedResponse<IQuiz>> = {
      success: true,
      data: paginatedResponse,
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

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader) {
      const response: IApiResponse<null> = {
        success: false,
        error: "Authentication required",
        timestamp: new Date().toISOString(),
      }
      return NextResponse.json(response, { status: 401 })
    }

    const body: Partial<IQuiz> = await request.json()

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Create new quiz
    const newQuiz: IQuiz = {
      id: `quiz_${Date.now()}`,
      title: body.title || "Untitled Quiz",
      description: body.description || "",
      category: body.category || "General",
      difficulty: body.difficulty || "Beginner",
      duration: body.duration || 10,
      questionCount: body.questions?.length || 0,
      tags: body.tags || [],
      isPublic: body.isPublic || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      authorId: "user_1", // Mock current user
      author: {
        id: "user_1",
        name: "John Doe",
        email: "john@example.com",
        role: "student",
        level: "Intermediate",
        points: 1250,
        streak: 7,
        joinedAt: "2024-01-15T10:00:00Z",
        lastLoginAt: "2024-01-20T14:30:00Z",
        isActive: true,
      },
      rating: 0,
      attempts: 0,
      passingScore: body.passingScore || 70,
      questions: body.questions || [],
      navigationMode: body.navigationMode || "free-navigation",
      hasTimer: body.hasTimer || false,
      timeLimit: body.timeLimit || 0,
      warningTime: body.warningTime || 5,
      allowQuestionPicker: body.allowQuestionPicker || true,
      shuffleQuestions: body.shuffleQuestions || false,
      shuffleAnswers: body.shuffleAnswers || false,
      showProgress: body.showProgress || true,
      allowPause: body.allowPause || true,
      maxAttempts: body.maxAttempts || 3,
    }

    const response: IApiResponse<IQuiz> = {
      success: true,
      data: newQuiz,
      message: "Quiz created successfully",
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
