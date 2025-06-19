// Google Analytics Measurement ID
export const GA_MEASUREMENT_ID = 'G-CGVSXD8Q3S'

// Log page views
export const pageview = (url: string) => {
  if (typeof window === 'undefined') {
    console.log('Window is undefined, skipping pageview tracking')
    return
  }

  if (!window.gtag) {
    console.error('gtag not available, skipping pageview tracking')
    return
  }

  try {
    console.log(`Sending pageview to GA: ${url}`)
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: url,
    })
    console.log('Pageview sent successfully')
  } catch (error) {
    console.error('Error sending pageview:', error)
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
  if (typeof window === 'undefined') {
    console.log('Window is undefined, skipping event tracking')
    return
  }

  if (!window.gtag) {
    console.error('gtag not available, skipping event tracking')
    return
  }

  try {
    console.log(`Sending event to GA: ${action} / ${category} / ${label}`)
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    })
    console.log('Event sent successfully')
  } catch (error) {
    console.error('Error sending event:', error)
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