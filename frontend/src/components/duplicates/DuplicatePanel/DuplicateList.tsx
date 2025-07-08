// src/components/duplicates/DuplicatePanel/DuplicateList.tsx
import React from 'react';
import { useDuplicateStore } from '../../../store/useDuplicateStore';
// import type { DuplicatePair } from '../../../types/duplicates';

export const DuplicateList: React.FC = () => {
  const duplicates = useDuplicateStore((s) => s.duplicates);
  const selectPair = useDuplicateStore((s) => s.selectPair);

  if (duplicates.length === 0) {
    return <div>No duplicates yet.</div>;
  }

  return (
    <ul style={{ listStyle: 'none', padding: 0 }}>
      {duplicates.map((dup) => (
        <li
          key={dup.topics.join('|')}
          onClick={() => selectPair(dup)}
          style={{ 
            cursor: 'pointer',
             padding: '8px 0', 
             borderBottom: '0.5px solid #ddd' 
            }}
        >
          <div style={{ fontSize: '0.8em', color: 'white' }}>
            <strong>{dup.topics[0]}</strong> ↔ <strong>{dup.topics[1]}</strong>
          </div>
          <div style={{ fontSize: '0.8em', color: '#666' }}>
            ID: {dup.scores[0].toFixed(2)}, Corr: {dup.scores[1].toFixed(2)}
          </div>
        </li>
      ))}
    </ul>
  );
};

export default DuplicateList
