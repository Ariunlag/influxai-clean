import React, { useEffect, useState } from 'react'
import { Line } from 'react-chartjs-2'
import { useRecommendationStore } from '../../store/useRecommendationStore'
import { useInfluxStore } from '../../store/useInfluxStore'
import { getRecommendationsData, confirmRecommendation } from '../../services/recommendationApi'
import { createLineChartConfig } from '../../services/lineChartService'
import 'chartjs-adapter-date-fns'

export default function RecommendationGraph() {
  const { selected, removeRecommendation, selectRecommendation } = useRecommendationStore()
  const { setClassNameInput, saveClass } = useInfluxStore()
  const influxSetMeasurements = useInfluxStore(s => s.selectedMeasurements)
  const influxSet = useInfluxStore()

  const [className, setClassName] = useState('')

  const [mergedData, setMergedData] = useState<any[]>([])

  useEffect(() => {
    if (!selected) {
      setMergedData([])
      return
    }

    getRecommendationsData(selected.topics).then((topicSeries) => {
      const timestamps = Array.from(
        new Set(topicSeries.flatMap((s) =>
          s.points.map((pt) => new Date(pt.time).getTime() / 1000)
        ))
      ).sort()

      const merged = timestamps.map((ts) => {
        const row: Record<string, any> = {
          time: new Date(ts * 1000).toISOString(),
        }
        topicSeries.forEach((s) => {
          const point = s.points.find(
            (pt) => new Date(pt.time).getTime() / 1000 === ts
          )
          row[s.measurement] = point ? point.value : null
        })
        return row
      })

      setMergedData(merged)
    })
  }, [selected])

  if (!selected) {
    return <p style={{ color: '#aaa' }}>No recommendation selected.</p>
  }

  if (mergedData.length === 0) {
    return <p style={{ color: '#aaa' }}>Loading or no data.</p>
  }

  const seriesList = selected.topics.map((topic) => ({
    measurement: topic,
    points: mergedData.map((pt) => ({
      time: pt.time,
      value: pt[topic],
    })),
  }))

  const { data: chartData, options } = createLineChartConfig(
    seriesList,
    ['#0af', '#f0f', '#fa0', '#0fa', '#a0f']
  )

  const handleSaveClass = async () => {
    if (!className.trim()) {
      alert('Please enter a name for this class.')
      return
    }

    console.log('[Graph] Saving class with name:', className)

    // ✅ Push name to Zustand
    setClassNameInput(className)

    // ✅ Push topics to Zustand’s selectedMeasurements
    influxSet.selectedMeasurements = selected.topics

    // ✅ Save the class
    await saveClass()

    // ✅ Also confirm on backend
    await confirmRecommendation(selected.topics, 'approve')

    // ✅ Remove from local store
    removeRecommendation(selected.topics)
    selectRecommendation(null)
  }

  const handleIgnore = async () => {
    await confirmRecommendation(selected.topics, 'ignore')
    removeRecommendation(selected.topics)
    selectRecommendation(null)
  }

  return (
    <div style={{ padding: '16px', background: '#1c1c1c', color: '#fff', borderRadius: '8px' }}>
      <div style={{ width: '100%', height: '300px' }}>
        <Line
          key={`${mergedData.length}-${selected.topics.join('-')}`}
          data={chartData}
          options={options}
        />
      </div>

      <div style={{ marginTop: '12px', fontSize: '12px' }}>
        <strong>Confidence:</strong> {selected.confidence.toFixed(4)}
      </div>

      <div style={{ marginTop: '12px' }}>
        <label style={{ display: 'block', marginBottom: '4px' }}>Name for class:</label>
        <input
          type="text"
          value={className}
          onChange={(e) => setClassName(e.target.value)}
          placeholder="Enter class name"
          style={{ width: '100%', padding: '4px', borderRadius: '4px' }}
        />
      </div>

      <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
        <button
          onClick={handleSaveClass}
          style={{
            flex: 1,
            padding: '8px',
            border: '1px solid green',
            color: '#38a169',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          ✅ Save as Class
        </button>

        <button
          onClick={handleIgnore}
          style={{
            flex: 1,
            padding: '8px',
            border: '1px solid red',
            color: '#fff',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          ❌ Ignore
        </button>
      </div>
    </div>
  )
}
