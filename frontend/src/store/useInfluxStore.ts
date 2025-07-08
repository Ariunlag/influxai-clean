import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as influxApi from '../services/influxApi';
import type { MeasurementList, Class, TimeseriesData } from '../types/influx';

type Aggregation = 'mean' | 'max' | 'min' | 'sum';

interface InfluxStore {
  measurements: string[];
  selectedMeasurements: string[];           // Builder
  activeClassMeasurements: string[];        // Saved class
  activeSuggestionMeasurements: string[];   // Suggested class (optional)

  classes: Class[];
  selectedClass: Class | null;
  selectedSuggestion: { name: string; measurements: string[] } | null;
  classNameInput: string;

  builderTimeseriesData: TimeseriesData[];
  savedClassTimeseriesData: TimeseriesData[];
  suggestedClassTimeseriesData: TimeseriesData[];

  selectedAggregation: Aggregation;
  startTime: string;
  endTime: string;

  getMeasurements: () => Promise<void>;
  addMeasurement: (measurement: string) => Promise<void>;
  removeMeasurement: (measurement: string) => Promise<void>;

  setClassNameInput: (name: string) => void;
  saveClass: () => Promise<void>;
  getClasses: () => Promise<void>;
  setSelectedClass: (cls: Class) => void;
  clearSelectedClass: () => void;
  deleteClass: (name?: string) => Promise<void>;

  setSelectedSuggestion: (s: { name: string; measurements: string[] }) => void;
  clearSelectedSuggestion: () => void;

  setAggregation: (aggregation: Aggregation) => void;
  setTimeRange: (start: string, stop: string) => void;

  fetchTimeseriesData: () => Promise<void>;
  appendRealTimePoint: (topic: string, value: number, timestamp: string) => void;
}

export const useInfluxStore = create<InfluxStore>()(
  persist(
    (set, get) => ({
      measurements: [],
      selectedMeasurements: [],
      activeClassMeasurements: [],
      activeSuggestionMeasurements: [],

      classes: [],
      selectedClass: null,
      selectedSuggestion: null,
      classNameInput: '',

      builderTimeseriesData: [],
      savedClassTimeseriesData: [],
      suggestedClassTimeseriesData: [],

      selectedAggregation: 'mean',
      startTime: '-6h',
      endTime: 'now()',

      getMeasurements: async () => {
        const data: MeasurementList = await influxApi.listMeasurements();
        set({ measurements: data.measurements });
      },

      addMeasurement: async (measurement) => {
        const current = get().selectedMeasurements;
        if (!current.includes(measurement)) {
          set({
            selectedMeasurements: [...current, measurement],
            selectedClass: null,
            selectedSuggestion: null,
            activeClassMeasurements: [],
            activeSuggestionMeasurements: [],
          });
          await get().fetchTimeseriesData();
        }
      },

      removeMeasurement: async (measurement) => {
        set({
          selectedMeasurements: get().selectedMeasurements.filter((m) => m !== measurement),
          selectedClass: null,
          selectedSuggestion: null,
          activeClassMeasurements: [],
          activeSuggestionMeasurements: [],
        });
        await get().fetchTimeseriesData();
      },

      setClassNameInput: (name) => {
        set({ classNameInput: name });
      },

      saveClass: async () => {
        const { classNameInput, selectedMeasurements, classes } = get();
        if (!classNameInput || selectedMeasurements.length === 0) {
          console.warn('Class name or measurements missing');
          return;
        }

        if (classes.some((c) => c.name === classNameInput)) {
          alert(`Class "${classNameInput}" already exists!`);
          return;
        }

        const newClass: Class = { name: classNameInput, measurements: selectedMeasurements };
        await influxApi.saveClass(newClass);

        set({
          classes: [...classes, newClass],
          classNameInput: '',
          selectedMeasurements: [],
          builderTimeseriesData: [],
        });
      },

      getClasses: async () => {
        const data: Class[] = await influxApi.listClasses();
        set({ classes: data });
      },

      setSelectedClass: (cls) => {
        set({
          selectedClass: cls,
          activeClassMeasurements: cls.measurements,
        });
        get().fetchTimeseriesData();
      },

      clearSelectedClass: () => {
        set({
          selectedClass: null,
          activeClassMeasurements: [],
          savedClassTimeseriesData: [],
        });
      },

      deleteClass: async (name) => {
        const target = name || get().selectedClass?.name;
        if (!target) {
          console.warn('No class selected to delete');
          return;
        }

        await influxApi.deleteClass(target);

        set({
          classes: get().classes.filter((c) => c.name !== target),
          selectedClass: null,
          activeClassMeasurements: [],
          savedClassTimeseriesData: [],
        });
      },

      setSelectedSuggestion: (s) => {
        set({
          selectedSuggestion: s,
          activeSuggestionMeasurements: s.measurements,
        });
        get().fetchTimeseriesData();
      },

      clearSelectedSuggestion: () => {
        set({
          selectedSuggestion: null,
          activeSuggestionMeasurements: [],
          suggestedClassTimeseriesData: [],
        });
      },

      setAggregation: (aggregation) => {
        set({ selectedAggregation: aggregation });
      },

      setTimeRange: (startTime, endTime) => {
        set({ startTime, endTime });
      },

      fetchTimeseriesData: async () => {
        const {
          selectedClass,
          selectedSuggestion,
          activeClassMeasurements,
          activeSuggestionMeasurements,
          selectedMeasurements,
          selectedAggregation,
          startTime,
          endTime,
        } = get();

        const slices = [
          { active: !!selectedClass, measurements: activeClassMeasurements, key: 'savedClassTimeseriesData' },
          { active: !!selectedSuggestion, measurements: activeSuggestionMeasurements, key: 'suggestedClassTimeseriesData' },
          { active: !selectedClass && !selectedSuggestion, measurements: selectedMeasurements, key: 'builderTimeseriesData' },
        ];

        for (const { active, measurements, key } of slices) {
          if (active && measurements.length > 0) {
            const data = await influxApi.queryTimeSeries({
              measurements,
              aggregation: selectedAggregation,
              start: startTime,
              stop: endTime,
            });
            set({ [key]: data });
          } else if (active) {
            set({ [key]: [] });
          }
        }
      },

      appendRealTimePoint: (topic, value, timestamp) => {
        const {
          selectedMeasurements,
          activeClassMeasurements,
          activeSuggestionMeasurements,
          builderTimeseriesData,
          savedClassTimeseriesData,
          suggestedClassTimeseriesData,
        } = get();

        const updates: Partial<InfluxStore> = {};

        if (selectedMeasurements.includes(topic)) {
          updates.builderTimeseriesData = builderTimeseriesData.map((ts) =>
            ts.measurement === topic
              ? { ...ts, points: [...ts.points, { value, timestamp }] }
              : ts
          );
        }

        if (activeClassMeasurements.includes(topic)) {
          updates.savedClassTimeseriesData = savedClassTimeseriesData.map((ts) =>
            ts.measurement === topic
              ? { ...ts, points: [...ts.points, { value, timestamp }] }
              : ts
          );
        }

        if (activeSuggestionMeasurements.includes(topic)) {
          updates.suggestedClassTimeseriesData = suggestedClassTimeseriesData.map((ts) =>
            ts.measurement === topic
              ? { ...ts, points: [...ts.points, { value, timestamp }] }
              : ts
          );
        }

        if (Object.keys(updates).length > 0) {
          set(updates);
        }
      },
    }),
    { name: 'influx-storage' }
  )
);
