from fastapi import APIRouter, HTTPException
from models.mqtt import TopicRequest
from services.mqtt.client import mqtt_service
from services.mqtt.message_log import message_log
from services.mqtt.topics import clear_topics

router = APIRouter()

@router.post("/subscribe")
async def subscribe_topic(req: TopicRequest):
    print(f"[API] Received subscribe request for topic: {req.topic}")
    mqtt_service.subscribe(req.topic)
    return {"status": "subscribed", "topic": req.topic}

@router.post("/unsubscribe")
async def unsubscribe_topic(req: TopicRequest):
    print(f"[API] Received unsubscribe request for topic: {req.topic}")
    mqtt_service.unsubscribe(req.topic)
    return {"status": "unsubscribed", "topic": req.topic}

@router.get("/messages")
async def get_messages():
    return {"messages": message_log.list()}

@router.post("/unsubscribe/all")
async def unsubscribe_all():
    mqtt_service.clear_all()
    clear_topics()
    return {"status": "cleared"}
