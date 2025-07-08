import axios from 'axios'
import type { RecommendationGroup } from '../types/recommendation'

// ✅ Same style as your influxApi
const BASE_URL = 'http://localhost:8000/api'

/**
 * GET /recommendations
 * Fetch all recommended clusters.
 */
export async function getRecommendations(): Promise<RecommendationGroup[]> {
  const res = await axios.get(`${BASE_URL}/recommendations`)
  return res.data.recommendations
}

/**
 * POST /confirm-recommendation
 * Approve or ignore a recommended cluster.
 */
export async function confirmRecommendation(
  topics: string[],
  action: 'approve' | 'ignore'
): Promise<any> {
  const res = await axios.post(`${BASE_URL}/confirm-recommendation`, {
    topics,
    action,
  })
  return res.data
}

/**
 * POST /recommendations-data
 * Get aligned time series for the selected cluster.
 */
export async function getRecommendationsData(
  topics: string[]
): Promise<
  {
    topic: string
    data: { timestamp: number; value: number; tags: any }[]
  }[]
> {
  const res = await axios.post(`${BASE_URL}/recommendations-data`, {
    topics,
  })
  return res.data
}
