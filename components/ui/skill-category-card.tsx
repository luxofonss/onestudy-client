"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface SkillCategoryCardProps {
  name: string
  count: number
  color?: string
  onClick?: () => void
  className?: string
}

export function SkillCategoryCard({
  name,
  count,
  color = "bg-blue-100 text-blue-800",
  onClick,
  className = "",
}: SkillCategoryCardProps) {
  return (
    <Card
      className={`hover:shadow-md transition-all duration-200 border-blue-100 hover:border-blue-300 cursor-pointer ${className}`}
      onClick={onClick}
    >
      <CardContent className="p-4 text-center">
        <h3 className="font-semibold text-gray-900 mb-2">{name}</h3>
        <Badge className={color}>{count} lessons</Badge>
      </CardContent>
    </Card>
  )
}
