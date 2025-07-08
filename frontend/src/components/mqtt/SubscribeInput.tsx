import React, { useState } from 'react';
import { subscribeTopic } from '../../services/mqttApi';
import { useMqttStore } from '../../store/useMqttStore';

const SubscribeInput: React.FC = () => {
  const [topic, setTopic] = useState('');
  const topics = useMqttStore((s) => s.topics);
  const addTopic = useMqttStore((s) => s.addTopic);
  const [alert, setAlert] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!topic.trim()) {
      setAlert('Topic cannot be empty.');
      return;
    }
    if (topics.includes(topic)) {
      setAlert(`Already subscribed to "${topic}".`);
      return;
    }

    try {
      await subscribeTopic(topic);
      addTopic(topic);
      setTopic('');
      setAlert(null);
    } catch {
      setAlert(`Error subscribing to "${topic}".`);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.inputRow}>
        <input
          type="text"
          placeholder="Enter subscription topic.."
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          style={styles.input}
        />
        <button onClick={handleSubmit} style={styles.button} title="Subscribe">
          ✓
        </button>
      </div>

      {alert && <div style={styles.alert}>{alert}</div>}
    </div>
  );
};

export default SubscribeInput;

// ✅ Centralized styles
const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '0.5rem',
  },
  inputRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  input: {
    padding: '8px',
    width: '300px',
    borderRadius: '4px',
    border: '1px solid #444',
    backgroundColor: '#222',
    color: '#fff',
  },
  button: {
    padding: '6px 12px',
    backgroundColor: 'limegreen',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '1.2rem',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  alert: {
    color: 'red',
    marginTop: '4px',
  },
};
