
export type MeasurementList = {
  measurements: string[];
};

export type Class = {
  name: string;
  measurements: string[];
};

export type TimeseriesPoint = {
  time: string; // ISO 8601
  value: number;
  tags?: Record<string, string>;
};

export type TimeseriesData = {
  measurement: string;
  points: TimeseriesPoint[];
};

export type ClassQueryData = {
  className: string;
  data: TimeseriesData[];
};

export type QueryRequest = {
  measurements: string[];
  aggregation?: "mean" | "max" | "min" | "sum";
  start: string;
  stop: string;
};
