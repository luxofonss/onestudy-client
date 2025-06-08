import type { ReactNode } from "react"

interface StatsGridProps {
  children: ReactNode
  columns?: 2 | 3 | 4 | 5 | 6
  className?: string
}

export function StatsGrid({ children, columns = 4, className = "" }: StatsGridProps) {
  const gridCols = {
    2: "grid-cols-2",
    3: "grid-cols-2 md:grid-cols-3",
    4: "grid-cols-2 md:grid-cols-4",
    5: "grid-cols-2 md:grid-cols-5",
    6: "grid-cols-2 md:grid-cols-3 lg:grid-cols-6",
  }

  return <div className={`grid ${gridCols[columns]} gap-4 ${className}`}>{children}</div>
}
