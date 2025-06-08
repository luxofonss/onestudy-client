import type { LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface StatsCardProps {
  icon: LucideIcon
  value: string | number
  label: string
  color?: string
  className?: string
}

export function StatsCard({
  icon: IconComponent,
  value,
  label,
  color = "text-blue-600",
  className = "",
}: StatsCardProps) {
  return (
    <Card className={`border-blue-100 ${className}`}>
      <CardContent className="p-6 text-center">
        <IconComponent className={`h-8 w-8 ${color} mx-auto mb-2`} />
        <p className={`text-2xl font-bold ${color}`}>{value}</p>
        <p className="text-sm text-gray-600">{label}</p>
      </CardContent>
    </Card>
  )
}
