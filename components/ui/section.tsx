import type { ReactNode } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface SectionProps {
  title: string
  children: ReactNode
  viewAllHref?: string
  viewAllText?: string
  className?: string
}

export function Section({ title, children, viewAllHref, viewAllText = "View All", className = "" }: SectionProps) {
  return (
    <section className={className}>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
        {viewAllHref && (
          <Link href={viewAllHref}>
            <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
              {viewAllText}
            </Button>
          </Link>
        )}
      </div>
      {children}
    </section>
  )
}
