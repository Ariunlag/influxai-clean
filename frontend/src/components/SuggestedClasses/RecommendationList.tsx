import React from 'react'
import { useRecommendationStore } from '../../store/useRecommendationStore'

export default function RecommendationList() {
  const { recommendations, selectRecommendation } = useRecommendationStore()

  if (recommendations.length === 0) {
    return <p style={{ color: '#aaa' }}>No recommendations yet.</p>
  }

  return (
    <div style={{ marginBottom: '24px' }}>
      <h3 style={{ color: 'gold', marginBottom: '8px' }}>Recommended Clusters</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {recommendations.map((rec, idx) => (
          <li
            key={idx}
            onClick={() => {
              console.log('[RecommendationList] Selected:', rec)
              selectRecommendation({ ...rec })
            }}
            style={{
              cursor: 'pointer',
              padding: '10px',
              borderBottom: '0.5px solid #555',
              borderRadius: '4px',
              marginBottom: '4px',
              backgroundColor: '#1c1c1c',
              color: '#eee',
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.backgroundColor = '#333')
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.backgroundColor = '#1c1c1c')
            }
          >
            <div style={{ fontSize: '0.85em' }}>
              <strong>Topics:</strong> {rec.topics.join(', ')}
            </div>
            <div style={{ fontSize: '0.75em', color: '#999' }}>
              <strong>Confidence:</strong> {rec.confidence.toFixed(4)}
            </div>
  
          </li>
        ))}
      </ul>
    </div>
  )
}
