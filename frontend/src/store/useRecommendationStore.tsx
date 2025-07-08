// src/store/useRecommendationStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { RecommendationGroup } from '../types/recommendation'

interface RecommendationState {
  recommendations: RecommendationGroup[]
  selected: RecommendationGroup | null
  addRecommendation: (rec: RecommendationGroup) => void
  removeRecommendation: (topics: string[]) => void
  selectRecommendation: (rec: RecommendationGroup) => void
}

export const useRecommendationStore = create<RecommendationState>()(
  persist(
    (set) => ({
      recommendations: [],
      selected: null,

      addRecommendation: (rec) => {
        const sortedNew = JSON.stringify([...rec.topics].sort())

        set((state) => {
          const exists = state.recommendations.some(
            (r) => JSON.stringify([...r.topics].sort()) === sortedNew
          )

          if (exists) {
            console.log('[Zustand] Skipping duplicate recommendation:', rec)
            return {}  
          }

          console.log('[Zustand] Adding recommendation:', rec)
          return {
            recommendations: [...state.recommendations, rec]
          }
        })
      },

      removeRecommendation: (topics) => {
        console.log('[Zustand] Removing recommendation for topics:', topics)
        set((state) => ({
          recommendations: state.recommendations.filter(
            (g) =>
              JSON.stringify([...g.topics].sort()) !==
              JSON.stringify([...topics].sort())
          ),
          selected: null
        }))
      },

      selectRecommendation: (rec) => {
        console.log('[Zustand] Selected recommendation:', rec)
        set(() => ({ selected: rec }))
      }
    }),
    {
      name: 'recommendation-store',
      partialize: (state) => ({
        recommendations: state.recommendations
      })
    }
  )
)
