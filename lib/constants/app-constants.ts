// Application constants following UPPER_SNAKE_CASE
export const API_ENDPOINTS = {
  QUIZZES: "/api/quizzes",
  QUESTIONS: "/api/questions",
  USERS: "/api/users",
  ATTEMPTS: "/api/attempts",
  LEADERBOARD: "/api/leaderboard",
} as const

export const QUIZ_SETTINGS = {
  MIN_TIME_LIMIT: 5,
  MAX_TIME_LIMIT: 300,
  MIN_WARNING_TIME: 1,
  DEFAULT_TIME_LIMIT: 30,
  DEFAULT_WARNING_TIME: 5,
  DEFAULT_MAX_ATTEMPTS: 3,
  DEFAULT_PASSING_SCORE: 70,
} as const

export const QUESTION_SETTINGS = {
  MIN_POINTS: 1,
  MAX_POINTS: 10,
  MIN_OPTIONS: 2,
  MAX_OPTIONS: 6,
  MAX_LISTENING_TIME: 180,
  MIN_LISTENING_TIME: 10,
} as const

export const UI_CONSTANTS = {
  DEBOUNCE_DELAY: 300,
  AUTO_SAVE_DELAY: 2000,
  ANIMATION_DURATION: 200,
  SKELETON_COUNT: 6,
} as const

export const DIFFICULTY_LEVELS: DifficultyLevel[] = ["Beginner", "Intermediate", "Advanced", "All Levels"] as const

export const QUESTION_TYPES: QuestionType[] = [
  "multiple-choice",
  "fill-blank",
  "essay",
  "pronunciation",
  "listening",
] as const

export const QUIZ_CATEGORIES = [
  "Grammar",
  "Vocabulary",
  "Pronunciation",
  "Listening",
  "Reading",
  "Writing",
  "Speaking",
  "Business English",
  "Test Preparation",
  "General",
] as const

export const NAVIGATION_MODES: NavigationMode[] = ["sequential", "back-only", "free-navigation"] as const

// Import types
import type { DifficultyLevel, QuestionType, NavigationMode } from "./interfaces"
