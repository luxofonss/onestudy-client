'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { GA_MEASUREMENT_ID, pageview } from '@/lib/utils/analytics'
import Script from 'next/script'
import { ClientSuspense } from './ClientSuspense'

// Inner component that uses useSearchParams
function GoogleAnalyticsInner() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  useEffect(() => {
    if (!GA_MEASUREMENT_ID) {
      console.warn('Google Analytics Measurement ID is not defined')
      return
    }

    // When the route changes, log a pageview
    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '')
    console.log(`Tracking pageview: ${url}`)
    pageview(url)
  }, [pathname, searchParams])

  return null
}

export default function GoogleAnalytics() {
  const handleScriptLoad = () => {
    console.log('Google Analytics script loaded successfully')
  }

  const handleScriptError = () => {
    console.error('Failed to load Google Analytics script')
  }

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        onLoad={handleScriptLoad}
        onError={handleScriptError}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', {
              page_path: window.location.pathname,
              send_page_view: true
            });
            console.log("Google Analytics initialized with ID: " + "${GA_MEASUREMENT_ID}");
          `,
        }}
      />
      <ClientSuspense>
        <GoogleAnalyticsInner />
      </ClientSuspense>
    </>
  )
} 