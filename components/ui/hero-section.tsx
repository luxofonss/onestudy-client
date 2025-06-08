import type { ReactNode } from "react"

interface HeroSectionProps {
  title: string
  subtitle?: string
  description: string
  children?: ReactNode
  className?: string
}

export function HeroSection({ title, subtitle, description, children, className = "" }: HeroSectionProps) {
  return (
    <section className={`text-center py-12 md:py-20 ${className}`}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
          {title}
          {subtitle && <span className="text-blue-600 block">{subtitle}</span>}
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">{description}</p>
        {children && <div className="flex flex-col sm:flex-row gap-4 justify-center">{children}</div>}
      </div>
    </section>
  )
}
