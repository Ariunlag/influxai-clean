import React from 'react';
import { unsubscribeTopic } from '../../services/mqttApi';
import { useMqttStore } from '../../store/useMqttStore';

const SubscribedTopicsList: React.FC = () => {
  const topics = useMqttStore((s) => s.topics);
  const removeTopic = useMqttStore((s) => s.removeTopic);

  const handleUnsubscribe = async (topic: string) => {
    try {
      await unsubscribeTopic(topic);
      removeTopic(topic);
    } catch (error) {
      console.error(`Failed to unsubscribe from ${topic}:`, error);
    }
  };

  return (
    <div style={styles.container}>
      <h4 style={styles.header}>Subscribed Topics</h4>
      <div style={styles.list}>
        {topics.map((topic) => (
          <div key={topic} style={styles.topicItem}>
            {topic}
            <button
              onClick={() => handleUnsubscribe(topic)}
              style={styles.unsubscribeButton}
              title="Unsubscribe"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubscribedTopicsList;

const styles = {
  container: {
    marginBottom: '1rem',
  },
  header: {
    color: 'gold',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  topicItem: {
    padding: '3px 12px',
    backgroundColor: '#333',
    color: '#fff',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    fontSize: '1em',
    wordBreak: 'break-all',  
  },
  unsubscribeButton: {
    background: 'none',
    border: 'none',
    color: 'red',
    marginLeft: '8px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
} as const;
