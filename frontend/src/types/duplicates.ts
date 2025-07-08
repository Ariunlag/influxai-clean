import type { MqttMessage } from './mqtt';

export interface DuplicatePair {
  topics: [string, string];
  scores: [number, number];
}

export interface DuplicateData {
  data1: MqttMessage[];
  data2: MqttMessage[];
}

export type ConfirmDuplicateRequest =
  | { action: 'keep'; topics: [string, string] }
  | { action: 'delete'; topics: [string] };
