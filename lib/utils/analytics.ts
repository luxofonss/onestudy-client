// Google Analytics Measurement ID
export const GA_MEASUREMENT_ID = 'G-CGVSXD8Q3S'

// Log page views
export const pageview = (url: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: url,
    })
  }
}

// Log specific events
type EventParams = {
  action: string
  category: string
  label?: string
  value?: number
}

export const event = ({ action, category, label, value }: EventParams) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    })
  }
}

// Common events
export const trackQuizStart = (quizId: string, quizTitle: string) => {
  event({
    action: 'quiz_start',
    category: 'Quiz',
    label: `${quizId}: ${quizTitle}`,
  })
}

export const trackQuizComplete = (quizId: string, score: number) => {
  event({
    action: 'quiz_complete',
    category: 'Quiz',
    label: quizId,
    value: score,
  })
}

export const trackContentView = (contentId: string, contentType: string) => {
  event({
    action: 'content_view',
    category: 'Content',
    label: `${contentType}: ${contentId}`,
  })
}

export const trackSearch = (query: string, resultsCount: number) => {
  event({
    action: 'search',
    category: 'Search',
    label: query,
    value: resultsCount,
  })
} 