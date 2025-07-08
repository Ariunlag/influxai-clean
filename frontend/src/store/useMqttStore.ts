import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { MqttMessage } from '../types/mqtt';

interface MqttState {
  topics: string[];
  messages: MqttMessage[];

  addTopic: (topic: string) => void;
  addMessage: (raw: string) => void;
  removeTopic: (topic: string) => void;
  clear: () => void;
}

export const useMqttStore = create<MqttState>()(
  persist(
    (set, get) => ({
      topics: [],
      messages: [],

      addTopic: (topic) => {
        console.log('[Store] Adding topic:', topic);
        const { topics } = get();
        if (!topics.includes(topic)) {
          set({ topics: [...topics, topic] });
        }
      },

      removeTopic: (topic) => {
        console.log('[Store] Removing topic:', topic);
        const { topics } = get();
        set({ topics: topics.filter((t) => t !== topic) });
      },

      addMessage: (raw: string) => {
        try {
          const parsed = JSON.parse(raw);

          const topic = parsed.topic;
          const payload = parsed.data;

          const fields = payload.fields || {};
          const fieldName = Object.keys(fields)[0] || 'unknown';
          const value = fields[fieldName];
          const timestamp = payload.timestamp || Date.now();
          const tags = payload.tags || {};

          const { messages } = get();

          const message: MqttMessage = {
            topic,
            value,
            fieldName,
            timestamp,
            tags,
          };

          set({
            messages: [message, ...messages].slice(0, 500),
          });
        } catch (error) {
          console.error('[Store] Failed to parse MQTT message:', raw, error);
        }
      },

      clear: () => {
        set({
          topics: [],
          messages: [],
        });
      },
    }),
    {
      name: 'mqtt-store',
    }
  )
);
