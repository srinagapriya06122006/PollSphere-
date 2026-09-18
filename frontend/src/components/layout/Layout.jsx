import React from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'

export const Layout = () => {
  const location = useLocation()
  const isHomePage = location.pathname === '/'

  return (
    <div className="app-layout flex flex-col min-h-screen transition-colors duration-200">
      <Navbar />
      <main className={isHomePage ? 'flex-1 w-full' : 'flex-1 max-w-[1500px] w-full mx-auto px-4 sm:px-8 lg:px-12 py-8'}>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default Layout
