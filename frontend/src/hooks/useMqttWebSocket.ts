import { useEffect, useRef } from 'react';
import { useMqttStore } from '../store/useMqttStore';

export function useMqttWebSocket(ready: boolean) {
  const addMessage = useMqttStore((s) => s.addMessage);
  const topics = useMqttStore((s) => s.topics);
  const wsRef = useRef<WebSocket | null>(null);
  const prevTopicsRef = useRef<string[]>([]);

  useEffect(() => {
    if (!ready) return;
    if (wsRef.current) return;

    const ws = new WebSocket('ws://localhost:8000/ws/mqtt');
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('[WebSocket] MQTT connected');

      // ✅ Resubscribe to all topics on reconnect
      topics.forEach((topic) => {
        ws.send(JSON.stringify({ action: 'subscribe', topic }));
        console.log('[WebSocket] Resubscribed to:', topic);
      });
      prevTopicsRef.current = topics;
    };

    ws.onmessage = (event) => {
      addMessage(event.data);
    };

    ws.onclose = () => console.log('[WebSocket] MQTT closed');

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [ready]);

  // ✅ Track topic changes safely
  useEffect(() => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

    const ws = wsRef.current;
    const prevTopics = prevTopicsRef.current;

    const added = topics.filter((t) => !prevTopics.includes(t));
    const removed = prevTopics.filter((t) => !topics.includes(t));

    added.forEach((topic) => {
      ws.send(JSON.stringify({ action: 'subscribe', topic }));
      console.log('[WebSocket] Subscribed to:', topic);
    });

    removed.forEach((topic) => {
      ws.send(JSON.stringify({ action: 'unsubscribe', topic }));
      console.log('[WebSocket] Unsubscribed from:', topic);
    });

    prevTopicsRef.current = topics;
  }, [topics]);
}
