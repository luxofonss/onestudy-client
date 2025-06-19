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
  color = "text-blue-400",
  className = "",
}: StatsCardProps) {
  return (
    <Card className={`border-gray-700/30 bg-gray-800/20 backdrop-blur-sm shadow-md ${className}`}>
      <CardContent className="p-6 text-center">
        <div className="bg-gray-800/60 rounded-full p-2 w-14 h-14 mx-auto mb-3 flex items-center justify-center">
          <IconComponent className={`h-7 w-7 ${color}`} />
        </div>
        <p className={`text-2xl font-bold ${color}`}>{value}</p>
        <p className="text-sm text-gray-400 mt-1">{label}</p>
      </CardContent>
    </Card>
  )
}
