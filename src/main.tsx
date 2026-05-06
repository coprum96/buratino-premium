import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

const cloudflareAnalyticsToken = import.meta.env.VITE_CLOUDFLARE_ANALYTICS_TOKEN as string | undefined

if (cloudflareAnalyticsToken) {
  const analyticsScript = document.createElement('script')
  analyticsScript.defer = true
  analyticsScript.src = 'https://static.cloudflareinsights.com/beacon.min.js'
  analyticsScript.setAttribute('data-cf-beacon', JSON.stringify({ token: cloudflareAnalyticsToken }))
  document.head.appendChild(analyticsScript)
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

