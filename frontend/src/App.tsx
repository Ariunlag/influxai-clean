// App.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useMqttWebSocket } from './hooks/useMqttWebSocket'; // ✅ lives in hooks!
import MqttTopicManager from './components/mqtt/MqttManager';
import DuplicateManager from './components/duplicates/DuplicateManager';
import ClassManager from './components/classes/ClassManager'; 
import RealTimeManager from './components/realtime/RealTimeManager';
import RecommendationManager from './components/SuggestedClasses/RecommendationManager';
import './index.css';

export default function App() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ HEALTH CHECK: confirm backend services are ready
  useEffect(() => {
    axios.get('http://localhost:8000/api/health')
      .then(res => {
        const { mqtt_connected, influx_connected } = res.data;
        if (mqtt_connected && influx_connected) {
          console.log('[App] Backend services ready');
          setReady(true);
        } else {
          setError('Services not yet connected');
        }
      })
      .catch(() => {
        setError('Could not reach backend; retrying…');
        setTimeout(() => window.location.reload(), 3000);
      });
  }, []);

  // ✅ MOUNT MQTT SOCKET: only after ready = true
  useMqttWebSocket(ready);

  // ✅ LOADING STATE
  if (!ready) {
    return (
      <div style={{
        background: '#111',
        color: 'gold',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        textAlign: 'center',
      }}>
        {error || 'Waiting for MQTT & InfluxDB connections…'}
      </div>
    );
  }

  // ✅ ALL PANELS — socket is now global and safe
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
        padding: '2rem',
      }}
    >
      {/* MQTT Dashboard */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h3 style={{ textAlign: 'center', color: 'gold' }}>MQTT Dashboard</h3>
        <div style={{ flex: 2, overflowY: 'auto' }}>
          <MqttTopicManager />
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <DuplicateManager />
        </div>
      </div>

      {/* Influx Class Builder */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <h3 style={{ textAlign: 'center', color: 'gold' }}>Influx Class Builder</h3>
        <ClassManager />
      </div>

      {/* Real-Time Dashboard */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <h3 style={{ textAlign: 'center', color: 'gold' }}>Real-Time Dashboard</h3>
        <RealTimeManager />
      </div>

      {/* Recommendation Dashboard */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <h3 style={{ textAlign: 'center', color: 'gold' }}>Recommendation Dashboard</h3>
        <RecommendationManager />
      </div>
    </div>
  );
}
