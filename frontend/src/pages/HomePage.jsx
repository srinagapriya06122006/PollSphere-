import React, { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import HeroSection from '../components/home/HeroSection'
import SocialProofSection from '../components/home/SocialProofSection'
import HowItWorks from '../components/home/HowItWorks'
import RealtimeSection from '../components/home/RealtimeSection'
import WhatYouCanDoSection from '../components/home/WhatYouCanDoSection'
import AnalyticsPreview from '../components/home/AnalyticsPreview'
import FinalCTASection from '../components/home/FinalCTASection'

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
      {/* 1. Hero Section — Headline, CTAs & Live Interactive Poll Preview */}
      <HeroSection />

      {/* 2. Key Stats — Compact Professional Statistics Row */}
      <SocialProofSection />

      {/* 3. How PollSphere Works — Create → Share → Discover */}
      <HowItWorks />

      {/* 4. Real-Time Architecture — Technical Flow Diagram */}
      <RealtimeSection />

      {/* 5. Core Capabilities — Exactly 4 Features */}
      <WhatYouCanDoSection />

      {/* 6. Analytics Preview Showcase — Single Visual Dashboard */}
      <AnalyticsPreview />

      {/* 7. Final Call to Action */}
      <FinalCTASection />
    </div>
  )
}

export default HomePage
