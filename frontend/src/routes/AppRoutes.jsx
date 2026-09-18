import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from '../components/layout/Layout'
import ProtectedRoute from '../components/auth/ProtectedRoute'
import HomePage from '../pages/HomePage'
import Dashboard from '../pages/Dashboard'
import CommunityPolls from '../pages/CommunityPolls'
import Leaderboard from '../pages/Leaderboard'
import AnalyticsPage from '../pages/AnalyticsPage'
import Login from '../pages/Login'
import Register from '../pages/Register'
import CreatePoll from '../pages/CreatePoll'
import PollDetails from '../pages/PollDetails'
import MyPolls from '../pages/MyPolls'
import Profile from '../pages/Profile'
import AdminDashboard from '../pages/AdminDashboard'
import NotFound from '../pages/NotFound'

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* =======================================================
            PUBLIC ROUTES (Accessible without authentication)
           ======================================================= */}
        <Route index element={<HomePage />} />
        <Route path="explore" element={<CommunityPolls />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="polls/:id" element={<PollDetails />} />

        {/* =======================================================
            STRICTLY PROTECTED ROUTES (Require Valid Login)
           ======================================================= */}
        <Route
          path="dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="analytics"
          element={
            <ProtectedRoute>
              <AnalyticsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="leaderboard"
          element={
            <ProtectedRoute>
              <Leaderboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="create-poll"
          element={
            <ProtectedRoute>
              <CreatePoll />
            </ProtectedRoute>
          }
        />
        <Route
          path="my-polls"
          element={
            <ProtectedRoute>
              <MyPolls />
            </ProtectedRoute>
          }
        />
        <Route
          path="profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* 404 Catch-All */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default AppRoutes
