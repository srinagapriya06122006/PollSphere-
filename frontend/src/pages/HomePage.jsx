import React, { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import HeroSection from '../components/home/HeroSection'
import SocialProofSection from '../components/home/SocialProofSection'
import KeyFeaturesRow from '../components/home/KeyFeaturesRow'
import TrendingPollsSection from '../components/home/TrendingPollsSection'
import CategoryCardsSection from '../components/home/CategoryCardsSection'
import WhatYouCanDoSection from '../components/home/WhatYouCanDoSection'
import HowItWorks from '../components/home/HowItWorks'
import RealtimeSection from '../components/home/RealtimeSection'
import AnalyticsPreview from '../components/home/AnalyticsPreview'
import TestimonialsSection from '../components/home/TestimonialsSection'

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

      {/* 2. Social Proof Section — 10k+ Votes, 500+ Polls, 1.2k+ Users, 99.9% Uptime */}
      <SocialProofSection />

      {/* 3. Showcase Key Features in One Row */}
      <KeyFeaturesRow />

      {/* 4. Trending Community Polls — 3 to 6 real public polls before login */}
      <TrendingPollsSection />

      {/* 5. Poll Categories Cards — Technology, Education, Sports, Entertainment, General */}
      <CategoryCardsSection />

      {/* 6. Core Capabilities / Features (id="features") */}
      <WhatYouCanDoSection />

      {/* 7. How PulsePoll Works (id="how-it-works") */}
      <HowItWorks />

      {/* 8. Real-Time Architecture & Flow Diagram */}
      <RealtimeSection />

      {/* 9. Analytics Preview Showcase */}
      <AnalyticsPreview />

      {/* 10. Testimonials — What Users Say */}
      <TestimonialsSection />
    </div>
  )
}

export default HomePage
