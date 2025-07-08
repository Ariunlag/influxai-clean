import { useEffect } from 'react';
import { useDuplicateStore } from '../store/useDuplicateStore';
import type { DuplicatePair } from '../types/duplicates';

export function useDuplicateWebSocket() {
  const addDuplicate = useDuplicateStore((s) => s.addDuplicate);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8000/ws/duplicates');

    ws.onopen = () => console.log('[WS] connected to /ws/duplicates');

    ws.onmessage = (evt) => {
      try {
        const raw = JSON.parse(evt.data);

        if (
          raw.type === 'dup_candidate' &&
          Array.isArray(raw.topics) &&
          raw.topics.length === 2 &&
          typeof raw.scores?.identity === 'number' &&
          typeof raw.scores?.correlation === 'number'
        ) {
          const topics = [raw.topics[0], raw.topics[1]].sort() as [string, string];
          const scores: [number, number] = [raw.scores.identity, raw.scores.correlation];

          const dup: DuplicatePair = { topics, scores };
          addDuplicate(dup);
        }
      } catch (e) {
        console.error('[WS] /ws/duplicates parse error', e);
      }
    };

    ws.onclose = () => console.log('[WS] /ws/duplicates closed');

    return () => {
      ws.close();
    };
  }, [addDuplicate]);
}
