import React, { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import HeroSection from '../components/home/HeroSection'
import WhatYouCanDoSection from '../components/home/WhatYouCanDoSection'
import HowItWorks from '../components/home/HowItWorks'
import RealtimeSection from '../components/home/RealtimeSection'
import AnalyticsPreview from '../components/home/AnalyticsPreview'

export const HomePage = () => {
  const location = useLocation()

  // Smooth scroll to anchor on page load, hash change, or cross-page navigation
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '')
      const el = document.getElementById(id)
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 50)
      }
    }
  }, [location.hash])

  return (
    <div className="w-full animate-fadeIn">
      {/* 2. Hero — Wide 2-column layout with static preview */}
      <HeroSection />

      {/* 3. Core Capabilities / Features (id="features") */}
      <WhatYouCanDoSection />

      {/* 4. How PulsePoll Works (id="how-it-works") */}
      <HowItWorks />

      {/* 5. Real-Time Architecture — Static 7-step flow diagram */}
      <RealtimeSection />

      {/* 6. Analytics Preview — Compact 2-column showcase */}
      <AnalyticsPreview />
    </div>
  )
}

export default HomePage
