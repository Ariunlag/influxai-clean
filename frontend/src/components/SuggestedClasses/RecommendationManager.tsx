// realtime/SuggestedClasses/index.tsx
import React from 'react';
import RecommendationGraph from './RecommendationGraph';
import RecommendationList from './RecommendationList';
import { useRecommendationWebSocket } from '../../hooks/useRecommendationWebSocket';

export default function RecommendationManager() {
  useRecommendationWebSocket()
  return (
      <div style={styles.container}>
          <div style={styles.sidebar}>
              <h3>Saved Classes</h3>
              <RecommendationList />
          </div>
              
          <div style={styles.content}>
              <h4>Candidates visualization: </h4>
                 
              <RecommendationGraph />
          </div>
      </div>
      
    );
}


const styles = {
  container: {
    display: 'flex',
    height: '60vh',
    maxWidth: '1500px',
    margin: '0 auto',
    backgroundColor: '#111',
    color: '#fff',
    borderRadius: '8px',
    overflow: 'hidden',
  },
  sidebar: {
    width: '400px',    
    padding: '1rem',
    backgroundColor: '#1c1c1c',
    borderRight: '1px solid #444',
    overflowY: 'auto',
  },
  content: {
    flex: 1,
    padding: '1rem',
    backgroundColor: '#222',
  },
}