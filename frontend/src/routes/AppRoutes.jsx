import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from '../components/layout/Layout'
import ProtectedRoute from '../components/auth/ProtectedRoute'
import Dashboard from '../pages/Dashboard'
import Login from '../pages/Login'
import Register from '../pages/Register'
import CreatePoll from '../pages/CreatePoll'
import PollDetails from '../pages/PollDetails'
import MyPolls from '../pages/MyPolls'
import Profile from '../pages/Profile'
import NotFound from '../pages/NotFound'

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* Public Routes */}
        <Route index element={<Dashboard />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="polls/:id" element={<PollDetails />} />

        {/* Protected Routes */}
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

        {/* 404 Catch-All */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default AppRoutes
