import React from 'react';
import SubscribeInput from './SubscribeInput';
import SubscribedTopicsList from './SubscribedTopicsList';
import MqttMessageLog from './MqttMessageLog';
import { toPadding } from 'chart.js/helpers';

export default function MqttManager() {
  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <div style={styles.sidebarSection}>
          <SubscribeInput />
        </div>
        <div style={styles.topicsList}>
          <SubscribedTopicsList />
        </div>
      </div>
      <div style={styles.content}>
        <h3 style={{ color: 'gold', marginBottom: '0.6rem' }}>Received MQTT Messages</h3>
        <MqttMessageLog />
      </div>
    </div>
  );
}


const styles = {
  container: {
    display: 'flex',
    height: '50vh',
    background: '#111',
    maxWidth: '1500px',
    margin: '0 auto',
    color: '#fff',
  },
  sidebar: {
    width: '400px',
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    borderRight: '1px solid #444',
    background: '#1c1c1c',
  },
  sidebarSection: {
    padding: '1rem',
  },
  topicsList: {
    flex: 1,
    overflowY: 'auto',
    padding: '1rem',
  },
  content: {
    flex: 1,
    overflowY: 'auto',
    background: '#222',
    padding: '1rem',
  },
};


