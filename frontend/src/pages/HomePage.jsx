import React from 'react'
import HeroSection from '../components/home/HeroSection'
import WhatYouCanDoSection from '../components/home/WhatYouCanDoSection'
import HowItWorks from '../components/home/HowItWorks'
import RealtimeSection from '../components/home/RealtimeSection'
import AnalyticsPreview from '../components/home/AnalyticsPreview'

export const HomePage = () => {
  return (
    <div className="w-full animate-fadeIn">
      {/* 2. Hero — Wide 2-column layout with static preview */}
      <HeroSection />

      {/* 3. Core Capabilities — Wide 4-column cards */}
      <WhatYouCanDoSection />

      {/* 4. How PulsePoll Works — Wide 3-step process */}
      <HowItWorks />

      {/* 5. Real-Time Architecture — Static 7-step flow diagram */}
      <RealtimeSection />

      {/* 6. Analytics Preview — Compact 2-column showcase */}
      <AnalyticsPreview />
    </div>
  )
}

export default HomePage
