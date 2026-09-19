import React, { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import HeroSection from '../components/home/HeroSection'
import PlatformHighlights from '../components/home/PlatformHighlights'
import TrendingPollsSection from '../components/home/TrendingPollsSection'
import CategoryCardsSection from '../components/home/CategoryCardsSection'
import HowItWorks from '../components/home/HowItWorks'
import RealtimeSection from '../components/home/RealtimeSection'
import AnalyticsPreview from '../components/home/AnalyticsPreview'
import WhatYouCanDoSection from '../components/home/WhatYouCanDoSection'
import SecuritySection from '../components/home/SecuritySection'
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
      {/* 1. Hero Section — Headline, CTAs, Trust Points & Live Product Mockup */}
      <HeroSection />

      {/* 2. Quick Platform Highlights — Compact 4-feature strip */}
      <PlatformHighlights />

      {/* 3. Trending Community Polls — Real public polls before login */}
      <TrendingPollsSection />

      {/* 4. Poll Categories — Technology, Education, Sports, Entertainment, General */}
      <CategoryCardsSection />

      {/* 5. How PollSphere Works — Clean 3-step process (id="how-it-works") */}
      <HowItWorks />

      {/* 6. Real-Time Architecture — Data flow diagram */}
      <RealtimeSection />

      {/* 7. Analytics Preview — Visual charts with Recharts */}
      <AnalyticsPreview />

      {/* 8. Feature Grid — 6 core capabilities (id="features") */}
      <WhatYouCanDoSection />

      {/* 9. Security Section — Secure by Design */}
      <SecuritySection />

      {/* 10. Final Call to Action */}
      <FinalCTASection />
    </div>
  )
}

export default HomePage
