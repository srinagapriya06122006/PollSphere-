import { useState, useEffect, useRef, useCallback } from 'react'

const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8080/api/ws'

/**
 * Custom hook to manage WebSocket connection for a specific live poll with auto-reconnection
 * @param {string} pollId - The ID of the poll room
 * @param {function} onMessage - Callback triggered when live poll updates are received
 */
export const usePollWebSocket = (pollId, onMessage) => {
  const [status, setStatus] = useState('connecting') // 'connecting' | 'connected' | 'disconnected' | 'reconnecting'
  const [error, setError] = useState(null)

  const socketRef = useRef(null)
  const reconnectTimeoutRef = useRef(null)
  const reconnectAttemptsRef = useRef(0)
  const isUnmountedRef = useRef(false)
  const maxReconnectAttempts = 5

  const connect = useCallback(() => {
    if (!pollId || isUnmountedRef.current) return

    // Clean up existing socket if any
    if (socketRef.current) {
      socketRef.current.close()
    }

    const token = localStorage.getItem('token')
    const wsUrl = `${WS_BASE_URL}/polls/${pollId}${token ? `?token=${encodeURIComponent(token)}` : ''}`

    try {
      setStatus(reconnectAttemptsRef.current > 0 ? 'reconnecting' : 'connecting')
      const socket = new WebSocket(wsUrl)
      socketRef.current = socket

      socket.onopen = () => {
        if (isUnmountedRef.current) return
        setStatus('connected')
        setError(null)
        reconnectAttemptsRef.current = 0
      }

      socket.onmessage = (event) => {
        if (isUnmountedRef.current) return
        try {
          const payload = JSON.parse(event.data)
          if (payload.type === 'POLL_UPDATE' && payload.data && onMessage) {
            onMessage(payload.data)
          }
        } catch (err) {
          console.error('[WebSocket] Failed to parse message', err)
        }
      }

      socket.onerror = (err) => {
        if (isUnmountedRef.current) return
        console.warn('[WebSocket] Connection error', err)
        setError('Real-time connection error')
      }

      socket.onclose = (event) => {
        if (isUnmountedRef.current) return
        setStatus('disconnected')

        // Do not auto-reconnect if closed cleanly (code 1000)
        if (event.code !== 1000) {
          if (reconnectAttemptsRef.current < maxReconnectAttempts) {
            // Exponential backoff: 1s, 2s, 4s, 8s...
            const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 10000)
            reconnectAttemptsRef.current += 1
            setStatus('reconnecting')
            reconnectTimeoutRef.current = setTimeout(() => {
              connect()
            }, delay)
          } else {
            setError('Unable to maintain live connection. Retrying manually.')
          }
        }
      }
    } catch (err) {
      if (isUnmountedRef.current) return
      setStatus('disconnected')
      setError('Failed to establish WebSocket connection')
    }
  }, [pollId, onMessage])

  // Manual reconnect trigger
  const manualReconnect = useCallback(() => {
    reconnectAttemptsRef.current = 0
    connect()
  }, [connect])

  useEffect(() => {
    isUnmountedRef.current = false
    connect()

    return () => {
      isUnmountedRef.current = true
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      if (socketRef.current) {
        socketRef.current.close(1000, 'Component unmounted')
      }
    }
  }, [connect])

  return {
    isConnected: status === 'connected',
    status,
    error,
    reconnect: manualReconnect,
  }
}

export default usePollWebSocket
