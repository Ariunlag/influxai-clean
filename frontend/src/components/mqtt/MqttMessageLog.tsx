import React from 'react';
import { useMqttStore } from '../../store/useMqttStore';

const MqttMessageLog: React.FC = () => {
  const messages = useMqttStore((s) => s.messages);
  
  return (
    <div style={{
      maxHeight: '80%',
      overflowY: 'auto',
      background: '#111',
      padding: '1rem',
      borderRadius: '6px',
      fontFamily: 'monospace'
    }}>
      

      {messages.length === 0 && (
        <p style={{ color: '#777' }}>No messages yet.</p>
      )}

      <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
        {messages.map((msg, i) => (
          <li key={i} style={{ color: '#eee', fontSize: '0.8 em', marginBottom: '5px' }}>
            <div><b>Topic:</b> {msg.topic}, 
              <b>Field:</b> {msg.fieldName}: {msg.value}, 
              <b>Time:</b> {new Date(msg.timestamp * 1000).toLocaleTimeString()} 
              </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MqttMessageLog;
