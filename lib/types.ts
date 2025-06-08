import type { LucideIcon } from "lucide-react"

export interface Lesson {
  id: string | number
  title: string
  description: string
  creator: string
  participants: number
  rating: number
  duration: string
  level: "Beginner" | "Intermediate" | "Advanced" | "All Levels"
  type: string
  icon: LucideIcon
}

export interface SkillCategory {
  name: string
  count: number
  color: string
}

export interface NavigationItem {
  href: string
  label: string
  icon?: LucideIcon
}

export interface User {
  name: string
  email: string
  avatar?: string
  joinDate: string
  bio: string
  stats: {
    contentCreated: number
    totalLearners: number
    averageRating: number
    hoursLearned: number
  }
}

export interface Question {
  id: string
  type: "multiple-choice" | "pronunciation" | "fill-in-the-blank" | "essay" | "listening"
  text: string
  options?: { text: string; isCorrect: boolean }[]
  pronunciationText?: string
  fillInBlanks?: { text: string; blanks: { position: number; answer: string }[] }
  trueFalseAnswer?: boolean
  audioUrl?: string
  imageUrl?: string
  maxListeningTime?: number
  points: number
  difficulty: "beginner" | "intermediate" | "advanced"
  category: string
  tags?: string[]
  createdAt?: string
  usageCount?: number
  rating?: number
}
