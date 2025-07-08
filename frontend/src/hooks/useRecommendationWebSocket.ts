import { useEffect } from 'react'
import { useRecommendationStore } from '../store/useRecommendationStore'

export function useRecommendationWebSocket() {
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8000/ws/recommendation')

    ws.onopen = () => console.log('[WS] Connected to recommendations')

    ws.onmessage = (event) => {
      console.log('[WS] Received:', event.data)

      const payload = JSON.parse(event.data)
      if (payload.type === 'recommendation') {
        useRecommendationStore.getState().addRecommendation({
          topics: payload.topics,
          confidence: payload.confidence,
          reason: payload.reason
        })
      }
    }

    ws.onclose = () => console.log('[WS] Closed')

    return () => ws.close()
  }, [])
}
