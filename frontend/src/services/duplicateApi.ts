import axios from "axios";
import type { DuplicatePair, DuplicateData, ConfirmDuplicateRequest } from "../types/duplicates";


const BASE_URL = "http://localhost:8000/api"; 

export const getDuplicates = () =>
  axios.get<DuplicatePair[]>(`${BASE_URL}/duplicates`);

export const confirmDuplicate = (req: ConfirmDuplicateRequest) =>
  axios.post(`${BASE_URL}/confirm-duplicate`, req);

export const getDuplicatesData = (
  topicA: string,
  topicB: string
): Promise<DuplicateData> => {
  return axios
    .get<DuplicateData>(`${BASE_URL}/duplicates/data`, {
      params: { topicA, topicB },
    })
    .then((res) => res.data);
};