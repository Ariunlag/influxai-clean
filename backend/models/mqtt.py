from pydantic import BaseModel

class TopicRequest(BaseModel):
    topic: str

class MqttMessage(BaseModel):
    topic: str
    payload: str
    qos: int
    retain: bool
    timestamp: float  