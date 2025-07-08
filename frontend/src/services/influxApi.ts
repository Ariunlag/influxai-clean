import axios from "axios";
import type { MeasurementList, Class, TimeseriesData, QueryRequest } from "../types/influx";

const BASE_URL = "http://localhost:8000/api";

export const listMeasurements = async (): Promise<MeasurementList> => {
  const response = await axios.get(`${BASE_URL}/measurements`);
  return response.data;
};

export const saveClass = async (classData: Class): Promise<void> => {
  await axios.post(`${BASE_URL}/classes`, classData);
};

export const listClasses = async (): Promise<Class[]> => {
  const response = await axios.get(`${BASE_URL}/classes`);
  return response.data;
};

export const deleteClass = async (className: string): Promise<void> => {
  await axios.delete(`${BASE_URL}/classes/${encodeURIComponent(className)}`);
};

export const queryTimeSeries = async (query: QueryRequest): Promise<TimeseriesData[]> => {
  const response = await axios.post(`${BASE_URL}/query/raw`, query);
  return response.data;
};
