import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DuplicatePair } from '../types/duplicates';

type State = {
  duplicates: DuplicatePair[];
  selectedPair: DuplicatePair | null;
  addDuplicate: (dup: DuplicatePair) => void;
  removeDuplicate: (pair: DuplicatePair) => void;
  selectPair: (pair: DuplicatePair) => void;
  clearSelection: () => void;
};

export const useDuplicateStore = create<State>()(
  persist(
    (set, get) => ({
      duplicates: [],
      selectedPair: null,

      addDuplicate: (dup) =>
        set((s) => {
          const topics = [...dup.topics].sort() as [string, string];
          const exists = s.duplicates.some(
            (d) => d.topics[0] === topics[0] && d.topics[1] === topics[1]
          );
          return exists
            ? {}
            : {
                duplicates: [
                  ...s.duplicates,
                  { topics, scores: dup.scores },
                ],
              };
        }),

      removeDuplicate: (pair) =>
        set((s) => ({
          duplicates: s.duplicates.filter(
            (x) =>
              x.topics[0] !== pair.topics[0] ||
              x.topics[1] !== pair.topics[1]
          ),
        })),

      selectPair: (pair) => set({ selectedPair: pair }),
      
      clearSelection: () => set({ selectedPair: null }),
    }),
    {
      name: 'duplicate-store', 
    }
  )
);
