import type { QuizDifficulty, QuizCategory, QuizSortOption } from "@/lib/types/quiz"

export const QUIZ_DIFFICULTIES: Array<{ value: QuizDifficulty; label: string; color: string }> = [
  { value: "beginner", label: "Beginner", color: "bg-green-100 text-green-800" },
  { value: "intermediate", label: "Intermediate", color: "bg-yellow-100 text-yellow-800" },
  { value: "advanced", label: "Advanced", color: "bg-red-100 text-red-800" },
]

export const QUIZ_CATEGORIES: Array<{ value: QuizCategory; label: string; icon: string }> = [
  { value: "programming", label: "Programming", icon: "💻" },
  { value: "mathematics", label: "Mathematics", icon: "🔢" },
  { value: "science", label: "Science", icon: "🔬" },
  { value: "history", label: "History", icon: "📚" },
  { value: "language", label: "Language", icon: "🗣️" },
  { value: "business", label: "Business", icon: "💼" },
  { value: "design", label: "Design", icon: "🎨" },
  { value: "other", label: "Other", icon: "📝" },
]

export const QUIZ_SORT_OPTIONS: Array<{ value: QuizSortOption; label: string }> = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "popular", label: "Most Popular" },
  { value: "difficulty-asc", label: "Easiest First" },
  { value: "difficulty-desc", label: "Hardest First" },
  { value: "title-asc", label: "Title A-Z" },
  { value: "title-desc", label: "Title Z-A" },
]

export const DEFAULT_QUIZ_FILTERS = {
  search: "",
  difficulty: "all" as const,
  category: "all" as const,
  status: "all" as const,
}

export const ITEMS_PER_PAGE = 12
export const SEARCH_DEBOUNCE_DELAY = 300
