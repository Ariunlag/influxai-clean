import React from 'react';
import { useDuplicateStore } from '../../../store/useDuplicateStore';
import { DuplicateList } from './DuplicateList';
import { DuplicateGraph } from './DuplicateGraph';

const DuplicatePanel: React.FC = () => {
  const selectedPair = useDuplicateStore((s) => s.selectedPair);
  const clearSelection = useDuplicateStore((s) => s.clearSelection);

  return (
    <div style={styles.container}>
      
      <div style={styles.sidebar}>
        <h4>Detected duplicate candidates: </h4>
        <DuplicateList />
      </div>
      <div style={styles.content}>
        <h4>Candidates visualization: </h4>
        {selectedPair ? (
          <DuplicateGraph onClose={clearSelection} />
        ) : (
          <div style={{ color: '#bbb' }}>
            Select a duplicate pair to view the time-series graph.
          </div>
        )}
      </div>
    </div>
  );
};

export default DuplicatePanel;

const styles = {
  container: {
    display: 'flex',
    height: '50vh',
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
};
