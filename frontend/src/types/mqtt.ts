export interface MqttMessage {
  topic: string;
  value: number | string;
  fieldName: string;
  timestamp: number;
  tags: Record<string, string>;
}